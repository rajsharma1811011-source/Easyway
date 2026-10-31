import { Router, Request, Response } from 'express';
import { prisma } from '../db.ts';
import { attractionSchema } from '../validators/schemas.ts';
import { authenticateToken, requireRole } from '../middleware/auth.ts';

export const attractionRouter = Router();

// GET attractions
attractionRouter.get('/', async (req: Request, res: Response) => {
  try {
    const {
      search,
      destinationId,
      category,
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
        { category: { contains: search } },
      ];
    }

    if (destinationId && destinationId !== 'all') {
      where.destinationId = destinationId;
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    const [total, attractions] = await Promise.all([
      prisma.attraction.count({ where }),
      prisma.attraction.findMany({
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
      data: attractions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching attractions:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch attractions' });
  }
});

// GET single attraction by slug
attractionRouter.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const attraction = await prisma.attraction.findUnique({
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

    if (!attraction) {
      return res.status(404).json({ success: false, error: 'Attraction not found' });
    }

    // Related attractions in the same destination
    const related = await prisma.attraction.findMany({
      where: {
        destinationId: attraction.destinationId,
        id: { not: attraction.id },
        isPublished: true,
      },
      take: 4,
    });

    return res.json({
      success: true,
      data: {
        ...attraction,
        relatedAttractions: related,
      },
    });
  } catch (error) {
    console.error('Error fetching attraction by slug:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch attraction details' });
  }
});

// Admin: Create
attractionRouter.post('/', authenticateToken, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const parse = attractionSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parse.error.flatten().fieldErrors });
    }

    const attraction = await prisma.attraction.create({ data: parse.data });
    return res.status(201).json({ success: true, message: 'Attraction created', data: attraction });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, error: 'Attraction with this slug already exists' });
    }
    console.error('Error creating attraction:', error);
    return res.status(500).json({ success: false, error: 'Failed to create attraction' });
  }
});

// Admin: Update
attractionRouter.patch('/:id', authenticateToken, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parse = attractionSchema.partial().safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parse.error.flatten().fieldErrors });
    }

    const updated = await prisma.attraction.update({
      where: { id },
      data: parse.data,
    });
    return res.json({ success: true, message: 'Attraction updated', data: updated });
  } catch (error) {
    console.error('Error updating attraction:', error);
    return res.status(500).json({ success: false, error: 'Failed to update attraction' });
  }
});

// Admin: Delete
attractionRouter.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.attraction.delete({ where: { id } });
    return res.json({ success: true, message: 'Attraction deleted' });
  } catch (error) {
    console.error('Error deleting attraction:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete attraction' });
  }
});
