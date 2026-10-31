import { Router, Response } from 'express';
import { prisma } from '../db.ts';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.ts';

export const adminRouter = Router();

// Protect all admin endpoints
adminRouter.use(authenticateToken, requireRole(['ADMIN']));

// GET Admin Dashboard metrics & overview
adminRouter.get('/dashboard', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      totalUsers,
      totalDestinations,
      totalAttractions,
      totalHotels,
      totalGuides,
      totalReviews,
      totalInquiries,
      recentUsers,
      recentInquiries,
      recentReviews,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.destination.count(),
      prisma.attraction.count(),
      prisma.hotel.count(),
      prisma.guide.count(),
      prisma.review.count(),
      prisma.inquiry.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.inquiry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          destination: { select: { name: true } },
        },
      }),
    ]);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalDestinations,
        totalAttractions,
        totalHotels,
        totalGuides,
        totalReviews,
        totalInquiries,
      },
      recent: {
        users: recentUsers,
        inquiries: recentInquiries,
        reviews: recentReviews,
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(500).json({ success: false, error: 'Failed to load dashboard metrics' });
  }
});

// GET users
adminRouter.get('/users', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { trips: true, favorites: true, reviews: true },
        },
      },
    });

    return res.json({ success: true, data: users });
  } catch (error) {
    console.error('Admin users error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// PATCH update user role
adminRouter.patch('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['USER', 'GUIDE', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid user role' });
    }

    // Prevent removing admin role from oneself if alone
    if (req.user!.userId === id && role !== 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, error: 'Cannot demote the sole system administrator' });
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return res.json({ success: true, message: 'User role updated', data: updated });
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ success: false, error: 'Failed to update user role' });
  }
});
