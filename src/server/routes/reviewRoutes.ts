import { Router, Request, Response } from 'express';
import { prisma } from '../db.ts';
import { reviewSchema } from '../validators/schemas.ts';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.ts';

export const reviewRouter = Router();

// GET reviews
reviewRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { destinationId, attractionId, hotelId, guideId, status = 'APPROVED' } = req.query as Record<string, string>;

    const where: any = {};
    if (status !== 'ALL') {
      where.moderationStatus = status;
    }
    if (destinationId) where.destinationId = destinationId;
    if (attractionId) where.attractionId = attractionId;
    if (hotelId) where.hotelId = hotelId;
    if (guideId) where.guideId = guideId;

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true } },
        destination: { select: { id: true, name: true, slug: true } },
        attraction: { select: { id: true, name: true, slug: true } },
        hotel: { select: { id: true, name: true, slug: true } },
        guide: { select: { id: true, name: true } },
      },
    });

    return res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
});

// POST submit review
reviewRouter.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = reviewSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parse.error.flatten().fieldErrors });
    }

    const { destinationId, attractionId, hotelId, guideId, rating, comment } = parse.data;

    if (!destinationId && !attractionId && !hotelId && !guideId) {
      return res.status(400).json({ success: false, error: 'Review must target a destination, attraction, hotel, or guide' });
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user!.userId,
        destinationId: destinationId || null,
        attractionId: attractionId || null,
        hotelId: hotelId || null,
        guideId: guideId || null,
        rating,
        comment,
        moderationStatus: 'APPROVED', // Default approved for responsive demo
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return res.status(201).json({ success: true, message: 'Review submitted successfully', data: review });
  } catch (error) {
    console.error('Error submitting review:', error);
    return res.status(500).json({ success: false, error: 'Failed to submit review' });
  }
});

// PATCH review (moderation or edit)
reviewRouter.patch('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    const isAdmin = req.user!.role === 'ADMIN';
    const isOwner = review.userId === req.user!.userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, error: 'Unauthorized to edit this review' });
    }

    const updateData: any = {};
    if (req.body.rating && isOwner) updateData.rating = req.body.rating;
    if (req.body.comment && isOwner) updateData.comment = req.body.comment;
    if (req.body.moderationStatus && isAdmin) updateData.moderationStatus = req.body.moderationStatus;

    const updated = await prisma.review.update({
      where: { id },
      data: updateData,
    });

    return res.json({ success: true, message: 'Review updated', data: updated });
  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({ success: false, error: 'Failed to update review' });
  }
});

// DELETE review
reviewRouter.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    if (review.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete this review' });
    }

    await prisma.review.delete({ where: { id } });
    return res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete review' });
  }
});
