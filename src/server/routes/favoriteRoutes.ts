import { Router, Response } from 'express';
import { prisma } from '../db.ts';
import { favoriteSchema } from '../validators/schemas.ts';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.ts';

export const favoriteRouter = Router();

// GET all favorites of the current logged-in user
favoriteRouter.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.userId },
      include: {
        destination: true,
        attraction: {
          include: { destination: { select: { id: true, name: true, slug: true } } },
        },
        hotel: {
          include: { destination: { select: { id: true, name: true, slug: true } } },
        },
        guide: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch favorites' });
  }
});

// POST toggle/add favorite
favoriteRouter.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = favoriteSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, error: 'Invalid favorite target payload' });
    }

    const { destinationId, attractionId, hotelId, guideId } = parse.data;

    if (!destinationId && !attractionId && !hotelId && !guideId) {
      return res.status(400).json({ success: false, error: 'A target entity must be specified' });
    }

    // Check if already favorited
    const existing = await prisma.favorite.findFirst({
      where: {
        userId: req.user!.userId,
        destinationId: destinationId || null,
        attractionId: attractionId || null,
        hotelId: hotelId || null,
        guideId: guideId || null,
      },
    });

    if (existing) {
      // If already favorited, remove it (toggle behavior)
      await prisma.favorite.delete({ where: { id: existing.id } });
      return res.json({ success: true, message: 'Removed from favorites', action: 'removed', id: existing.id });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user!.userId,
        destinationId: destinationId || null,
        attractionId: attractionId || null,
        hotelId: hotelId || null,
        guideId: guideId || null,
      },
      include: {
        destination: true,
        attraction: true,
        hotel: true,
        guide: true,
      },
    });

    return res.status(201).json({ success: true, message: 'Added to favorites', action: 'added', data: favorite });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return res.status(500).json({ success: false, error: 'Failed to update favorite' });
  }
});

// DELETE specific favorite by ID
favoriteRouter.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const favorite = await prisma.favorite.findUnique({ where: { id } });

    if (!favorite) {
      return res.status(404).json({ success: false, error: 'Favorite not found' });
    }

    if (favorite.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Unauthorized: You do not own this favorite' });
    }

    await prisma.favorite.delete({ where: { id } });
    return res.json({ success: true, message: 'Favorite removed' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return res.status(500).json({ success: false, error: 'Failed to remove favorite' });
  }
});
