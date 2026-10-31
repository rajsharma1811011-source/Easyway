import { Router, Request, Response } from 'express';
import { prisma } from '../db.ts';
import { hotelSchema } from '../validators/schemas.ts';
import { authenticateToken, requireRole } from '../middleware/auth.ts';

export const hotelRouter = Router();

// GET hotels with filters
hotelRouter.get('/', async (req: Request, res: Response) => {
  try {
    const {
      search,
      destinationId,
      type,
      amenity,
      page = '1',
      limit = '12',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const where: any = { isPublished: true };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } },
      ];
    }

    if (destinationId && destinationId !== 'all') {
      where.destinationId = destinationId;
    }

    if (type && type !== 'all') {
      where.accommodationType = { contains: type };
    }

    if (amenity && amenity !== 'all') {
      where.amenities = { contains: amenity };
    }

    const [total, hotels] = await Promise.all([
      prisma.hotel.count({ where }),
      prisma.hotel.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limitNum,
        include: {
          destination: {
            select: { id: true, name: true, slug: true, state: true, region: true },
          },
        },
      }),
    ]);

    return res.json({
      success: true,
      data: hotels,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch hotels' });
  }
});

// GET single hotel by slug
hotelRouter.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const hotel = await prisma.hotel.findUnique({
      where: { slug },
      include: {
        destination: true,
        reviews: {
          where: { moderationStatus: 'APPROVED' },
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!hotel) {
      return res.status(404).json({ success: false, error: 'Hotel not found' });
    }

    // Nearby hotels in same destination
    const related = await prisma.hotel.findMany({
      where: {
        destinationId: hotel.destinationId,
        id: { not: hotel.id },
        isPublished: true,
      },
      take: 3,
    });

    return res.json({
      success: true,
      data: {
        ...hotel,
        relatedHotels: related,
      },
    });
  } catch (error) {
    console.error('Error fetching hotel by slug:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch hotel details' });
  }
});

// Admin: Create
hotelRouter.post('/', authenticateToken, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const parse = hotelSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parse.error.flatten().fieldErrors });
    }

    const hotel = await prisma.hotel.create({ data: parse.data });
    return res.status(201).json({ success: true, message: 'Hotel created', data: hotel });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, error: 'Hotel with this slug already exists' });
    }
    console.error('Error creating hotel:', error);
    return res.status(500).json({ success: false, error: 'Failed to create hotel' });
  }
});

// Admin: Update
hotelRouter.patch('/:id', authenticateToken, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parse = hotelSchema.partial().safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parse.error.flatten().fieldErrors });
    }

    const updated = await prisma.hotel.update({
      where: { id },
      data: parse.data,
    });
    return res.json({ success: true, message: 'Hotel updated', data: updated });
  } catch (error) {
    console.error('Error updating hotel:', error);
    return res.status(500).json({ success: false, error: 'Failed to update hotel' });
  }
});

// Admin: Delete
hotelRouter.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.hotel.delete({ where: { id } });
    return res.json({ success: true, message: 'Hotel deleted' });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete hotel' });
  }
});
