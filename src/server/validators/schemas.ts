import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const destinationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  state: z.string().min(2, 'State is required'),
  region: z.enum(['North', 'South', 'East', 'West', 'North-East', 'Central']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  imageUrl: z.string().url('Must be a valid image URL'),
  categories: z.string().min(2, 'At least one category is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  bestTimeToVisit: z.string().optional(),
  popularityScore: z.number().min(0).max(5).optional(),
  isPublished: z.boolean().optional(),
});

export const attractionSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  destinationId: z.string().min(1, 'Destination is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(2, 'Category is required'),
  imageUrl: z.string().url('Must be a valid image URL'),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  estimatedVisitDuration: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export const hotelSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  destinationId: z.string().min(1, 'Destination is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  accommodationType: z.string().min(2, 'Accommodation type is required'),
  imageUrl: z.string().url('Must be a valid image URL'),
  address: z.string().min(5, 'Address is required'),
  amenities: z.string().min(2, 'Amenities are required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  contactInformation: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export const guideSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  biography: z.string().min(10, 'Biography must be at least 10 characters'),
  languages: z.string().min(2, 'Languages are required'),
  specializations: z.string().min(2, 'Specializations are required'),
  serviceRegions: z.string().min(2, 'Service regions are required'),
  profileImageUrl: z.string().url('Must be a valid image URL'),
  experienceYears: z.number().int().min(0).max(60).optional(),
  isPublished: z.boolean().optional(),
});

export const travelPreferenceSchema = z.object({
  preferredCategories: z.string().min(1, 'Categories required'),
  preferredRegions: z.string().min(1, 'Regions required'),
  budgetRange: z.string().min(1, 'Budget range required'),
  travelGroupType: z.string().min(1, 'Group type required'),
  preferredActivities: z.string().min(1, 'Activities required'),
  accommodationPreferences: z.string().min(1, 'Accommodation preference required'),
  preferredDuration: z.string().min(1, 'Duration required'),
});

export const reviewSchema = z.object({
  destinationId: z.string().optional().nullable(),
  attractionId: z.string().optional().nullable(),
  hotelId: z.string().optional().nullable(),
  guideId: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5, 'Comment must be at least 5 characters').max(1000),
});

export const favoriteSchema = z.object({
  destinationId: z.string().optional().nullable(),
  attractionId: z.string().optional().nullable(),
  hotelId: z.string().optional().nullable(),
  guideId: z.string().optional().nullable(),
});

export const tripSchema = z.object({
  name: z.string().min(2, 'Trip name is required').max(100),
  description: z.string().max(500).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export const tripItemSchema = z.object({
  destinationId: z.string().optional().nullable(),
  attractionId: z.string().optional().nullable(),
  dayNumber: z.number().int().min(1).default(1),
  sortOrder: z.number().int().default(0),
  notes: z.string().max(500).optional().nullable(),
});

export const inquirySchema = z.object({
  recipientType: z.enum(['HOTEL', 'GUIDE', 'GENERAL']),
  recipientId: z.string().optional().nullable(),
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  travelDate: z.string().optional().nullable(),
});
