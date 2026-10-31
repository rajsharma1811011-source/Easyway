import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

import { authRouter } from './src/server/routes/authRoutes.ts';
import { destinationRouter } from './src/server/routes/destinationRoutes.ts';
import { attractionRouter } from './src/server/routes/attractionRoutes.ts';
import { hotelRouter } from './src/server/routes/hotelRoutes.ts';
import { guideRouter } from './src/server/routes/guideRoutes.ts';
import { preferenceRouter } from './src/server/routes/preferenceRoutes.ts';
import { favoriteRouter } from './src/server/routes/favoriteRoutes.ts';
import { tripRouter } from './src/server/routes/tripRoutes.ts';
import { reviewRouter } from './src/server/routes/reviewRoutes.ts';
import { inquiryRouter } from './src/server/routes/inquiryRoutes.ts';
import { searchRouter } from './src/server/routes/searchRoutes.ts';
import { adminRouter } from './src/server/routes/adminRoutes.ts';
import { swaggerRouter } from './src/server/swagger.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for Vite dev server and external OpenStreetMap tile layers
    crossOriginEmbedderPolicy: false,
  })
);

// CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting for auth and sensitive APIs
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// API Documentation
app.use('/api/docs', swaggerRouter);

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/destinations', destinationRouter);
app.use('/api/attractions', attractionRouter);
app.use('/api/hotels', hotelRouter);
app.use('/api/guides', guideRouter);
app.use('/api/preferences', preferenceRouter);
app.use('/api/favorites', favoriteRouter);
app.use('/api/trips', tripRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/inquiries', inquiryRouter);
app.use('/api', searchRouter);
app.use('/api/admin', adminRouter);

// Global API error handler
app.use('/api', (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

async function startServer() {
  if (!isProduction) {
    // Development mode with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve dist folder
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 EasyWay Server running on http://0.0.0.0:${PORT}`);
    console.log(`📖 API Documentation available at http://0.0.0.0:${PORT}/api/docs`);
  });
}

if (!process.env.VITEST && process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
