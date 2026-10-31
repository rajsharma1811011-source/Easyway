import { Router, Response } from 'express';
import { prisma } from '../db.ts';
import { travelPreferenceSchema } from '../validators/schemas.ts';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.ts';

export const preferenceRouter = Router();

// GET preferences for authenticated user
preferenceRouter.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const preferences = await prisma.travelPreference.findUnique({
      where: { userId: req.user!.userId },
    });
    return res.json({ success: true, data: preferences });
  } catch (error) {
    console.error('Error fetching travel preferences:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch preferences' });
  }
});

// PUT / UPDATE travel preferences
preferenceRouter.put('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = travelPreferenceSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parse.error.flatten().fieldErrors });
    }

    const {
      preferredCategories,
      preferredRegions,
      budgetRange,
      travelGroupType,
      preferredActivities,
      accommodationPreferences,
      preferredDuration,
    } = parse.data;

    const updated = await prisma.travelPreference.upsert({
      where: { userId: req.user!.userId },
      update: {
        preferredCategories,
        preferredRegions,
        budgetRange,
        travelGroupType,
        preferredActivities,
        accommodationPreferences,
        preferredDuration,
      },
      create: {
        userId: req.user!.userId,
        preferredCategories,
        preferredRegions,
        budgetRange,
        travelGroupType,
        preferredActivities,
        accommodationPreferences,
        preferredDuration,
      },
    });

    return res.json({ success: true, message: 'Travel preferences saved successfully', data: updated });
  } catch (error) {
    console.error('Error saving travel preferences:', error);
    return res.status(500).json({ success: false, error: 'Failed to save travel preferences' });
  }
});
