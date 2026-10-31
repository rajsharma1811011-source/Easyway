import { Router, Response } from 'express';
import { prisma } from '../db.ts';
import { inquirySchema } from '../validators/schemas.ts';
import { authenticateToken, optionalAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.ts';

export const inquiryRouter = Router();

// POST submit inquiry (guest or authenticated)
inquiryRouter.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = inquirySchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parse.error.flatten().fieldErrors });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        ...parse.data,
        userId: req.user ? req.user.userId : null,
        status: 'PENDING',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Inquiry received. A representative will contact you soon.',
      data: inquiry,
    });
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    return res.status(500).json({ success: false, error: 'Failed to submit inquiry' });
  }
});

// GET all inquiries (Admin & Guides)
inquiryRouter.get('/', authenticateToken, requireRole(['ADMIN', 'GUIDE']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, type } = req.query as Record<string, string>;
    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (type && type !== 'ALL') where.recipientType = type;

    // If guide, only show inquiries for them
    if (req.user!.role === 'GUIDE') {
      const guideProfile = await prisma.guide.findUnique({
        where: { userId: req.user!.userId },
      });
      if (guideProfile) {
        where.recipientType = 'GUIDE';
        where.recipientId = guideProfile.id;
      }
    }

    const inquiries = await prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: inquiries });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch inquiries' });
  }
});

// PATCH inquiry status (Admin & Guides)
inquiryRouter.patch('/:id', authenticateToken, requireRole(['ADMIN', 'GUIDE']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'CONTACTED', 'RESOLVED', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }

    const updated = await prisma.inquiry.update({
      where: { id },
      data: { status },
    });

    return res.json({ success: true, message: 'Inquiry status updated', data: updated });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    return res.status(500).json({ success: false, error: 'Failed to update inquiry' });
  }
});
