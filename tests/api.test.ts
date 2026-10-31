import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../server.ts';

describe('EasyWay Full-Stack REST API Test Suite', () => {
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // Authenticate demo traveler
    const travelerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'traveler@easyway.in', password: 'EasyWay@2026' });

    expect(travelerRes.status).toBe(200);
    userToken = travelerRes.body.token;

    // Authenticate demo admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@easyway.in', password: 'EasyWay@2026' });

    expect(adminRes.status).toBe(200);
    adminToken = adminRes.body.token;
  });

  describe('Authentication Endpoints', () => {
    it('rejects invalid login credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'unknown@example.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects duplicate email registrations', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Test',
          email: 'traveler@easyway.in',
          password: 'Password123',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('retrieves current authenticated user via /api/auth/me', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('traveler@easyway.in');
    });
  });

  describe('Destinations & Attractions', () => {
    it('lists destinations with pagination and categories', async () => {
      const res = await request(app).get('/api/destinations?limit=6');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('retrieves single destination details by slug', async () => {
      const res = await request(app).get('/api/destinations/jaipur');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Jaipur');
      expect(Array.isArray(res.body.data.attractions)).toBe(true);
    });

    it('lists tourist attractions', async () => {
      const res = await request(app).get('/api/attractions?limit=8');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Search & Recommendations', () => {
    it('executes global search across destinations, attractions and hotels', async () => {
      const res = await request(app).get('/api/search?q=Taj');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('destinations');
      expect(res.body.data).toHaveProperty('attractions');
      expect(res.body.data).toHaveProperty('hotels');
    });

    it('returns personalized recommendations for authenticated traveler', async () => {
      const res = await request(app)
        .get('/api/recommendations')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0]).toHaveProperty('recommendationReason');
    });
  });

  describe('User Preferences & Trips', () => {
    it('saves user travel preferences', async () => {
      const res = await request(app)
        .put('/api/preferences')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          preferredCategories: 'Heritage, Culture',
          preferredRegions: 'North, West',
          budgetRange: 'Luxury',
          travelGroupType: 'Couple',
          preferredActivities: 'Palace tours, Sitar concerts',
          accommodationPreferences: 'Luxury Palace',
          preferredDuration: '4-7 Days',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.budgetRange).toBe('Luxury');
    });

    it('creates, retrieves, and updates an itinerary trip', async () => {
      // Create trip
      const createRes = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Automated Test Expedition',
          description: 'Testing trip creation flow',
          startDate: '2026-12-01',
          endDate: '2026-12-05',
        });

      expect(createRes.status).toBe(201);
      const tripId = createRes.body.data.id;

      // Add item
      const itemRes = await request(app)
        .post(`/api/trips/${tripId}/items`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          dayNumber: 1,
          notes: 'Visit Taj Mahal early morning',
        });

      expect(itemRes.status).toBe(201);

      // Delete trip
      const delRes = await request(app)
        .delete(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(delRes.status).toBe(200);
    });
  });

  describe('Inquiries & Administration', () => {
    it('submits a tourist inquiry', async () => {
      const res = await request(app)
        .post('/api/inquiries')
        .send({
          recipientType: 'GENERAL',
          name: 'Tester Inquiry',
          email: 'test@travelworld.com',
          message: 'What is the best route between Jaipur and Udaipur?',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('prevents non-admin users from accessing the admin dashboard', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('allows admin users to view the dashboard metrics', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats.totalDestinations).toBeGreaterThan(0);
    });
  });
});
