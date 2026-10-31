import { Router, Response } from 'express';
import { prisma } from '../db.ts';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.ts';

export const searchRouter = Router();

// GET global grouped search
searchRouter.get('/search', async (req, res: Response) => {
  try {
    const q = ((req.query.q as string) || '').trim();
    if (!q) {
      return res.json({
        success: true,
        data: {
          destinations: [],
          attractions: [],
          hotels: [],
          guides: [],
        },
      });
    }

    const [destinations, attractions, hotels, guides] = await Promise.all([
      prisma.destination.findMany({
        where: {
          isPublished: true,
          OR: [
            { name: { contains: q } },
            { state: { contains: q } },
            { region: { contains: q } },
            { description: { contains: q } },
            { categories: { contains: q } },
          ],
        },
        take: 5,
      }),
      prisma.attraction.findMany({
        where: {
          isPublished: true,
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
            { category: { contains: q } },
            { address: { contains: q } },
          ],
        },
        include: { destination: { select: { name: true, slug: true } } },
        take: 5,
      }),
      prisma.hotel.findMany({
        where: {
          isPublished: true,
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
            { accommodationType: { contains: q } },
            { address: { contains: q } },
          ],
        },
        include: { destination: { select: { name: true, slug: true } } },
        take: 5,
      }),
      prisma.guide.findMany({
        where: {
          isPublished: true,
          OR: [
            { name: { contains: q } },
            { specializations: { contains: q } },
            { serviceRegions: { contains: q } },
            { languages: { contains: q } },
          ],
        },
        take: 5,
      }),
    ]);

    return res.json({
      success: true,
      data: {
        destinations,
        attractions,
        hotels,
        guides,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ success: false, error: 'Search failed' });
  }
});

// GET personalized recommendations
searchRouter.get('/recommendations', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let preferences: any = null;

    if (req.user) {
      preferences = await prisma.travelPreference.findUnique({
        where: { userId: req.user.userId },
      });
    }

    const allDestinations = await prisma.destination.findMany({
      where: { isPublished: true },
    });

    if (!preferences) {
      // Return popular curated recommendations for anonymous users
      const popular = allDestinations
        .sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0))
        .slice(0, 6)
        .map((d) => ({
          ...d,
          recommendationReason: 'Popular among travelers exploring India for the first time.',
          matchScore: 90,
        }));

      return res.json({
        success: true,
        isPersonalized: false,
        data: popular,
      });
    }

    // Rule-based matching
    const preferredCats = preferences.preferredCategories
      .toLowerCase()
      .split(',')
      .map((c: string) => c.trim())
      .filter(Boolean);

    const preferredRegs = preferences.preferredRegions
      .toLowerCase()
      .split(',')
      .map((r: string) => r.trim())
      .filter(Boolean);

    const scored = allDestinations.map((dest) => {
      let score = 50;
      const matchedCats: string[] = [];
      const matchedRegs: string[] = [];

      const destCategories = dest.categories.toLowerCase();
      for (const cat of preferredCats) {
        if (destCategories.includes(cat)) {
          score += 25;
          matchedCats.push(cat);
        }
      }

      const destRegion = dest.region.toLowerCase();
      for (const reg of preferredRegs) {
        if (destRegion.includes(reg)) {
          score += 20;
          matchedRegs.push(dest.region);
        }
      }

      score += (dest.popularityScore || 4.5) * 2;

      let reason = 'Curated match for your travel style.';
      if (matchedCats.length > 0 && matchedRegs.length > 0) {
        reason = `Recommended because you enjoy ${matchedCats.join(' & ')} travel in the ${matchedRegs[0]} region.`;
      } else if (matchedCats.length > 0) {
        reason = `Recommended because you enjoy ${matchedCats.join(' and ')} experiences.`;
      } else if (matchedRegs.length > 0) {
        reason = `Matches your preference for visiting ${matchedRegs.join(', ')} India.`;
      }

      return {
        ...dest,
        recommendationReason: reason,
        matchScore: Math.min(100, Math.round(score)),
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);

    return res.json({
      success: true,
      isPersonalized: true,
      preferences,
      data: scored.slice(0, 8),
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate recommendations' });
  }
});
