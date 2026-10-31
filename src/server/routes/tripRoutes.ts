import { Router, Response } from 'express';
import { prisma } from '../db.ts';
import { tripSchema, tripItemSchema } from '../validators/schemas.ts';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.ts';

export const tripRouter = Router();

// GET all trips for the authenticated user
tripRouter.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { items: true } },
        items: {
          take: 3,
          include: {
            destination: { select: { name: true, imageUrl: true } },
            attraction: { select: { name: true, imageUrl: true } },
          },
        },
      },
    });

    return res.json({ success: true, data: trips });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch trips' });
  }
});

// POST create a trip
tripRouter.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = tripSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parse.error.flatten().fieldErrors });
    }

    const trip = await prisma.trip.create({
      data: {
        ...parse.data,
        userId: req.user!.userId,
      },
    });

    return res.status(201).json({ success: true, message: 'Trip created successfully', data: trip });
  } catch (error) {
    console.error('Error creating trip:', error);
    return res.status(500).json({ success: false, error: 'Failed to create trip' });
  }
});

// GET single trip by ID with full itinerary
tripRouter.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: [{ dayNumber: 'asc' }, { sortOrder: 'asc' }],
          include: {
            destination: true,
            attraction: true,
          },
        },
      },
    });

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    if (trip.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Unauthorized to view this trip' });
    }

    return res.json({ success: true, data: trip });
  } catch (error) {
    console.error('Error fetching trip details:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch trip details' });
  }
});

// PATCH update trip metadata
tripRouter.patch('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const trip = await prisma.trip.findUnique({ where: { id } });

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    if (trip.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Unauthorized to edit this trip' });
    }

    const parse = tripSchema.partial().safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parse.error.flatten().fieldErrors });
    }

    const updated = await prisma.trip.update({
      where: { id },
      data: parse.data,
    });

    return res.json({ success: true, message: 'Trip updated', data: updated });
  } catch (error) {
    console.error('Error updating trip:', error);
    return res.status(500).json({ success: false, error: 'Failed to update trip' });
  }
});

// DELETE trip
tripRouter.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const trip = await prisma.trip.findUnique({ where: { id } });

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    if (trip.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete this trip' });
    }

    await prisma.trip.delete({ where: { id } });
    return res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete trip' });
  }
});

// POST add item to itinerary
tripRouter.post('/:id/items', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const trip = await prisma.trip.findUnique({ where: { id } });

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    if (trip.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Unauthorized to modify this trip' });
    }

    const parse = tripItemSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parse.error.flatten().fieldErrors });
    }

    const item = await prisma.tripItem.create({
      data: {
        tripId: id,
        ...parse.data,
      },
      include: {
        destination: true,
        attraction: true,
      },
    });

    return res.status(201).json({ success: true, message: 'Itinerary item added', data: item });
  } catch (error) {
    console.error('Error adding itinerary item:', error);
    return res.status(500).json({ success: false, error: 'Failed to add itinerary item' });
  }
});

// PATCH update itinerary item
tripRouter.patch('/:id/items/:itemId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, itemId } = req.params;
    const trip = await prisma.trip.findUnique({ where: { id } });

    if (!trip || (trip.userId !== req.user!.userId && req.user!.role !== 'ADMIN')) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const parse = tripItemSchema.partial().safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, error: 'Validation failed' });
    }

    const updated = await prisma.tripItem.update({
      where: { id: itemId },
      data: parse.data,
      include: {
        destination: true,
        attraction: true,
      },
    });

    return res.json({ success: true, message: 'Itinerary item updated', data: updated });
  } catch (error) {
    console.error('Error updating itinerary item:', error);
    return res.status(500).json({ success: false, error: 'Failed to update itinerary item' });
  }
});

// DELETE itinerary item
tripRouter.delete('/:id/items/:itemId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, itemId } = req.params;
    const trip = await prisma.trip.findUnique({ where: { id } });

    if (!trip || (trip.userId !== req.user!.userId && req.user!.role !== 'ADMIN')) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    await prisma.tripItem.delete({ where: { id: itemId } });
    return res.json({ success: true, message: 'Itinerary item removed' });
  } catch (error) {
    console.error('Error deleting itinerary item:', error);
    return res.status(500).json({ success: false, error: 'Failed to remove itinerary item' });
  }
});
