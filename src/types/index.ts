export type UserRole = 'USER' | 'GUIDE' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  preferences?: TravelPreference | null;
}

export interface TravelPreference {
  id: string;
  userId: string;
  preferredCategories: string;
  preferredRegions: string;
  budgetRange: string;
  travelGroupType: string;
  preferredActivities: string;
  accommodationPreferences: string;
  preferredDuration: string;
  createdAt: string;
  updatedAt: string;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  state: string;
  region: string;
  description: string;
  imageUrl: string;
  categories: string;
  latitude: number;
  longitude: number;
  bestTimeToVisit?: string | null;
  popularityScore?: number | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    attractions: number;
    hotels: number;
    reviews: number;
  };
  attractions?: Attraction[];
  hotels?: Hotel[];
  reviews?: Review[];
  relatedDestinations?: Destination[];
  relatedGuides?: Guide[];
  recommendationReason?: string;
  matchScore?: number;
}

export interface Attraction {
  id: string;
  name: string;
  slug: string;
  destinationId: string;
  destination?: Destination;
  description: string;
  category: string;
  imageUrl: string;
  address?: string | null;
  latitude: number;
  longitude: number;
  estimatedVisitDuration?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  reviews?: Review[];
  relatedAttractions?: Attraction[];
}

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  destinationId: string;
  destination?: Destination;
  description: string;
  accommodationType: string;
  imageUrl: string;
  address: string;
  amenities: string;
  latitude: number;
  longitude: number;
  contactInformation?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  reviews?: Review[];
  relatedHotels?: Hotel[];
}

export interface Guide {
  id: string;
  userId?: string | null;
  name: string;
  biography: string;
  languages: string;
  specializations: string;
  serviceRegions: string;
  profileImageUrl: string;
  experienceYears?: number | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  averageRating?: number;
  reviewsCount?: number;
  reviews?: Review[];
  relatedDestinations?: Destination[];
}

export interface Review {
  id: string;
  userId: string;
  user: { id: string; name: string };
  destinationId?: string | null;
  destination?: { id: string; name: string; slug: string };
  attractionId?: string | null;
  attraction?: { id: string; name: string; slug: string };
  hotelId?: string | null;
  hotel?: { id: string; name: string; slug: string };
  guideId?: string | null;
  guide?: { id: string; name: string };
  rating: number;
  comment: string;
  moderationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  destinationId?: string | null;
  destination?: Destination | null;
  attractionId?: string | null;
  attraction?: Attraction | null;
  hotelId?: string | null;
  hotel?: Hotel | null;
  guideId?: string | null;
  guide?: Guide | null;
  createdAt: string;
}

export interface Trip {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: TripItem[];
  _count?: {
    items: number;
  };
}

export interface TripItem {
  id: string;
  tripId: string;
  destinationId?: string | null;
  destination?: Destination | null;
  attractionId?: string | null;
  attraction?: Attraction | null;
  dayNumber: number;
  sortOrder: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Inquiry {
  id: string;
  userId?: string | null;
  recipientType: 'HOTEL' | 'GUIDE' | 'GENERAL';
  recipientId?: string | null;
  name: string;
  email: string;
  message: string;
  travelDate?: string | null;
  status: 'PENDING' | 'CONTACTED' | 'RESOLVED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
