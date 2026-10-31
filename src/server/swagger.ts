import swaggerUi from 'swagger-ui-express';
import { Router } from 'express';

export const swaggerRouter = Router();

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'EasyWay REST API — Discover India Your Way',
    version: '1.0.0',
    description: 'RESTful API for India tourism discovery, destinations, attractions, hotels, guides, trips, preferences, and reviews.',
    contact: {
      name: 'EasyWay Engineering Team',
      email: 'support@easyway.in',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'Current Environment API Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['USER', 'GUIDE', 'ADMIN'] },
        },
      },
      Destination: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          state: { type: 'string' },
          region: { type: 'string' },
          description: { type: 'string' },
          imageUrl: { type: 'string' },
          categories: { type: 'string' },
          latitude: { type: 'number' },
          longitude: { type: 'number' },
        },
      },
      Attraction: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          destinationId: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          imageUrl: { type: 'string' },
        },
      },
      Hotel: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          accommodationType: { type: 'string' },
          address: { type: 'string' },
          amenities: { type: 'string' },
        },
      },
      Guide: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          biography: { type: 'string' },
          languages: { type: 'string' },
          specializations: { type: 'string' },
          serviceRegions: { type: 'string' },
        },
      },
      Trip: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register new traveler user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string', minLength: 6 },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Registration successful' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Log in with email and password',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Login successful' } },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Get current authenticated user profile',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'User profile returned' } },
      },
    },
    '/destinations': {
      get: {
        summary: 'List destinations with filtering and pagination',
        tags: ['Destinations'],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'region', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'List of destinations' } },
      },
      post: {
        summary: 'Create destination (Admin only)',
        tags: ['Destinations'],
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Created' } },
      },
    },
    '/destinations/{slug}': {
      get: {
        summary: 'Get destination details by slug',
        tags: ['Destinations'],
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Destination details with attractions and hotels' } },
      },
    },
    '/attractions': {
      get: {
        summary: 'List attractions',
        tags: ['Attractions'],
        responses: { 200: { description: 'List of attractions' } },
      },
    },
    '/attractions/{slug}': {
      get: {
        summary: 'Get attraction details by slug',
        tags: ['Attractions'],
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Attraction details' } },
      },
    },
    '/hotels': {
      get: {
        summary: 'Discover hotels & accommodation',
        tags: ['Hotels'],
        responses: { 200: { description: 'List of hotels' } },
      },
    },
    '/hotels/{slug}': {
      get: {
        summary: 'Get hotel details by slug',
        tags: ['Hotels'],
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Hotel details' } },
      },
    },
    '/guides': {
      get: {
        summary: 'Find certified local travel guides',
        tags: ['Guides'],
        responses: { 200: { description: 'List of guides' } },
      },
    },
    '/guides/{id}': {
      get: {
        summary: 'Get guide profile and reviews',
        tags: ['Guides'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Guide details' } },
      },
    },
    '/preferences': {
      get: {
        summary: 'Get travel preferences',
        tags: ['Preferences'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'User preferences' } },
      },
      put: {
        summary: 'Save travel preferences',
        tags: ['Preferences'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Preferences saved' } },
      },
    },
    '/favorites': {
      get: {
        summary: 'Get saved user favorites',
        tags: ['Favorites'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'User favorites' } },
      },
      post: {
        summary: 'Toggle favorite item',
        tags: ['Favorites'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Favorite toggled' } },
      },
    },
    '/trips': {
      get: {
        summary: 'List user trips',
        tags: ['Trips'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'List of trips' } },
      },
      post: {
        summary: 'Create trip',
        tags: ['Trips'],
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Trip created' } },
      },
    },
    '/trips/{id}': {
      get: {
        summary: 'Get trip with full day-by-day itinerary',
        tags: ['Trips'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Trip details' } },
      },
    },
    '/inquiries': {
      post: {
        summary: 'Send hotel or guide inquiry',
        tags: ['Inquiries'],
        responses: { 201: { description: 'Inquiry received' } },
      },
    },
    '/search': {
      get: {
        summary: 'Global multi-entity search',
        tags: ['Search'],
        parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Grouped search results' } },
      },
    },
    '/recommendations': {
      get: {
        summary: 'Get personalized or popular recommendations',
        tags: ['Search'],
        responses: { 200: { description: 'Curated destinations with match reasoning' } },
      },
    },
    '/admin/dashboard': {
      get: {
        summary: 'Admin dashboard overview statistics',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Metrics summary' } },
      },
    },
  },
};

swaggerRouter.use('/', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
  customSiteTitle: 'EasyWay API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
}));
