import { Router, Request, Response } from 'express';
import { prisma } from '../db.ts';
import { destinationSchema } from '../validators/schemas.ts';
import { authenticateToken, requireRole } from '../middleware/auth.ts';

export const destinationRouter = Router();

// GET all destinations with filters, search & pagination
destinationRouter.get('/', async (req: Request, res: Response) => {
  try {
    const {
      search,
      region,
      state,
      category,
      sort = 'popularity',
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
        { state: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (region && region !== 'all') {
      where.region = region;
    }

    if (state && state !== 'all') {
      where.state = state;
    }

    if (category && category !== 'all') {
      where.categories = { contains: category };
    }

    let orderBy: any = { popularityScore: 'desc' };
    if (sort === 'name') {
      orderBy = { name: 'asc' };
    } else if (sort === 'recent') {
      orderBy = { createdAt: 'desc' };
    }

    const [total, destinations] = await Promise.all([
      prisma.destination.count({ where }),
      prisma.destination.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          _count: {
            select: { attractions: true, hotels: true, reviews: true },
          },
        },
      }),
    ]);

    return res.json({
      success: true,
      data: destinations,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch destinations' });
  }
});

// GET single destination by slug
destinationRouter.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const destination = await prisma.destination.findUnique({
      where: { slug },
      include: {
        attractions: {
          where: { isPublished: true },
        },
        hotels: {
          where: { isPublished: true },
        },
        reviews: {
          where: { moderationStatus: 'APPROVED' },
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!destination) {
      return res.status(404).json({ success: false, error: 'Destination not found' });
    }

    // Find related destinations in same region or state
    const related = await prisma.destination.findMany({
      where: {
        id: { not: destination.id },
        region: destination.region,
        isPublished: true,
      },
      take: 4,
    });

    // Also find guides that service this destination's region or state
    const relatedGuides = await prisma.guide.findMany({
      where: {
        isPublished: true,
        OR: [
          { serviceRegions: { contains: destination.region } },
          { serviceRegions: { contains: destination.state } },
          { serviceRegions: { contains: destination.name } },
        ],
      },
      take: 4,
    });

    return res.json({
      success: true,
      data: {
        ...destination,
        relatedDestinations: related,
        relatedGuides,
      },
    });
  } catch (error) {
    console.error('Error fetching destination by slug:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch destination details' });
  }
});

// Admin: Create destination
destinationRouter.post('/', authenticateToken, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const parse = destinationSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parse.error.flatten().fieldErrors });
    }

    const destination = await prisma.destination.create({
      data: parse.data,
    });

    return res.status(201).json({ success: true, message: 'Destination created', data: destination });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, error: 'Destination with this slug already exists' });
    }
    console.error('Error creating destination:', error);
    return res.status(500).json({ success: false, error: 'Failed to create destination' });
  }
});

// Admin: Update destination
destinationRouter.patch('/:id', authenticateToken, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parse = destinationSchema.partial().safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parse.error.flatten().fieldErrors });
    }

    const updated = await prisma.destination.update({
      where: { id },
      data: parse.data,
    });

    return res.json({ success: true, message: 'Destination updated', data: updated });
  } catch (error) {
    console.error('Error updating destination:', error);
    return res.status(500).json({ success: false, error: 'Failed to update destination' });
  }
});

// Admin: Delete destination
destinationRouter.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.destination.delete({ where: { id } });
    return res.json({ success: true, message: 'Destination deleted' });
  } catch (error) {
    console.error('Error deleting destination:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete destination' });
  }
});
