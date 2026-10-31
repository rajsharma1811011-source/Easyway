import { Router, Request, Response } from 'express';
import { prisma } from '../db.ts';
import { guideSchema } from '../validators/schemas.ts';
import { authenticateToken, requireRole } from '../middleware/auth.ts';

export const guideRouter = Router();

// GET all guides
guideRouter.get('/', async (req: Request, res: Response) => {
  try {
    const {
      search,
      region,
      language,
      specialization,
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
        { biography: { contains: search } },
        { specializations: { contains: search } },
      ];
    }

    if (region && region !== 'all') {
      where.serviceRegions = { contains: region };
    }

    if (language && language !== 'all') {
      where.languages = { contains: language };
    }

    if (specialization && specialization !== 'all') {
      where.specializations = { contains: specialization };
    }

    const [total, guides] = await Promise.all([
      prisma.guide.count({ where }),
      prisma.guide.findMany({
        where,
        orderBy: { experienceYears: 'desc' },
        skip,
        take: limitNum,
        include: {
          reviews: {
            where: { moderationStatus: 'APPROVED' },
            select: { rating: true },
          },
        },
      }),
    ]);

    // calculate average rating per guide
    const guidesWithRatings = guides.map((g) => {
      const avg = g.reviews.length
        ? (g.reviews.reduce((sum, r) => sum + r.rating, 0) / g.reviews.length).toFixed(1)
        : '4.8';
      return {
        ...g,
        averageRating: parseFloat(avg),
        reviewsCount: g.reviews.length,
      };
    });

    return res.json({
      success: true,
      data: guidesWithRatings,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching guides:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch guides' });
  }
});

// GET guide by ID
guideRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const guide = await prisma.guide.findUnique({
      where: { id },
      include: {
        reviews: {
          where: { moderationStatus: 'APPROVED' },
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!guide) {
      return res.status(404).json({ success: false, error: 'Guide not found' });
    }

    // Find suggested destinations in guide's service region
    const relatedDestinations = await prisma.destination.findMany({
      where: {
        isPublished: true,
        OR: guide.serviceRegions.split(',').map((r) => ({
          OR: [
            { region: { contains: r.trim() } },
            { state: { contains: r.trim() } },
            { name: { contains: r.trim() } },
          ],
        })),
      },
      take: 4,
    });

    return res.json({
      success: true,
      data: {
        ...guide,
        relatedDestinations,
      },
    });
  } catch (error) {
    console.error('Error fetching guide by ID:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch guide' });
  }
});

// Admin: Create Guide
guideRouter.post('/', authenticateToken, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const parse = guideSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parse.error.flatten().fieldErrors });
    }

    const guide = await prisma.guide.create({ data: parse.data });
    return res.status(201).json({ success: true, message: 'Guide created', data: guide });
  } catch (error) {
    console.error('Error creating guide:', error);
    return res.status(500).json({ success: false, error: 'Failed to create guide' });
  }
});

// Admin: Update Guide
guideRouter.patch('/:id', authenticateToken, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parse = guideSchema.partial().safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parse.error.flatten().fieldErrors });
    }

    const updated = await prisma.guide.update({
      where: { id },
      data: parse.data,
    });
    return res.json({ success: true, message: 'Guide updated', data: updated });
  } catch (error) {
    console.error('Error updating guide:', error);
    return res.status(500).json({ success: false, error: 'Failed to update guide' });
  }
});

// Admin: Delete Guide
guideRouter.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.guide.delete({ where: { id } });
    return res.json({ success: true, message: 'Guide deleted' });
  } catch (error) {
    console.error('Error deleting guide:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete guide' });
  }
});
