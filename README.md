# EasyWay — Discover India Your Way

**EasyWay** is a complete, modern, responsive full-stack India tourism discovery and trip-planning web platform. It helps domestic and international travelers explore destinations across India, discover UNESCO monuments, find heritage hotels and local certified guides, plan multi-day itineraries, navigate via interactive maps, save favorites, and receive personalized travel recommendations.

---

## 🌟 Key Features

1. **Destinations Directory (`/destinations`, `/destinations/:slug`)**
   - 16+ curated Indian destinations (Agra, Jaipur, Udaipur, Varanasi, Kerala, Goa, Delhi, Mumbai, Darjeeling, Shimla, Manali, Hampi, Mysuru, Rishikesh, Shillong, Andaman Islands).
   - Rich filtering by State, Region (North, South, East, West, North-East, Central), Travel Theme, and Sort orders.
   - Comprehensive destination detail pages with best times to visit, duration, attractions, hotels, guides, and reviews.

2. **Tourist Attractions & Landmarks (`/attractions`, `/attractions/:slug`)**
   - 23+ seeded heritage monuments, palaces, forts, temples, lakes, and nature spots.
   - Address, exact GPS coordinates, estimated visit duration, and historical descriptions.
   - Add directly to daily trip itineraries.

3. **Hotels & Heritage Haveli Discovery (`/hotels`, `/hotels/:slug`)**
   - Luxury Palaces, Heritage Havelis, Boutique Eco Resorts, and Mountain retreats.
   - Amenities breakdown, photos, verified addresses.
   - Direct tourist inquiry form to connect travelers with hosts without fake price markups.

4. **Certified Local Travel Guides (`/guides`, `/guides/:id`)**
   - Verified cultural historians, naturalists, and multilingual tour captains.
   - Experience years, spoken languages (English, Hindi, French, Spanish, German, Japanese), and regional specialties.
   - Direct guide inquiry modal.

5. **Interactive Geographic Map (`/map`)**
   - Full-featured Leaflet and OpenStreetMap integration.
   - Categorized custom markers for Destinations, Attractions, Hotels, and Guides.
   - Interactive popups with thumbnail previews and one-click detail navigation.
   - Graceful geolocation locator for user's position in India.

6. **Rule-Based Personalized Recommendations (`/preferences`)**
   - Saved travel preferences: Travel categories, budget style, group type, activities, duration.
   - Transparent rule-based match scores with clear explanations (e.g. *"Recommended because you enjoy Heritage & Forts in the West region"*).

7. **Trip Planner & Multi-Day Itinerary (`/trips`, `/trips/:id`)**
   - Create, edit, and organize trips by day (Day 1, Day 2, etc.).
   - Add destinations and attractions, reorder stops with persisted sort order, and add personalized notes.
   - Geographic route map displaying all itinerary stops.

8. **Saved Favorites (`/favorites`)**
   - Persisted favorites for destinations, attractions, hotels, and guides.

9. **Security, Authentication & Role-Based Authorization**
   - JWT-based authentication with bcryptjs password hashing.
   - Role-Based Access Control (`USER`, `GUIDE`, `ADMIN`).
   - Rate limiting, Helmet security headers, CORS protection, Zod input validation.

10. **Admin Dashboard (`/admin`)**
    - Metrics summary (destinations, attractions, hotels, guides, users, reviews, inquiries).
    - Management CRUD for destinations, attractions, hotels, guides.
    - Review moderation (Approve / Reject).
    - Inquiry status tracker (`PENDING`, `CONTACTED`, `RESOLVED`, `ARCHIVED`).
    - User account role assignments.

11. **Interactive OpenAPI / Swagger Documentation (`/api/docs`)**
    - Full Swagger UI documentation for all RESTful endpoints.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite, React Router, Tailwind CSS v4, Lucide React, TanStack Query, Leaflet, React Leaflet.
- **Backend:** Node.js, Express.js, TypeScript (`tsx`), Zod, JWT (`jsonwebtoken`), bcryptjs, Helmet, CORS, express-rate-limit, Swagger UI.
- **Database & ORM:** Prisma ORM v6.
  - Development / Container: SQLite (`dev.db`, zero-configuration, persistent).
  - Production: PostgreSQL compatible (`prisma/schema.postgres.prisma`).
- **Testing:** Vitest, Supertest.

---

## 📁 Project Structure

```text
easyway/
├── prisma/
│   ├── schema.prisma             # SQLite development schema
│   ├── schema.postgres.prisma    # PostgreSQL production schema
│   └── seed.ts                   # Realistic seed data script
├── src/
│   ├── components/
│   │   ├── common/               # GlobalSearchModal, InquiryModal, AddToTripModal
│   │   ├── layout/               # Navbar, Footer
│   │   └── maps/                 # IndiaMap Leaflet interactive component
│   ├── context/
│   │   └── AuthContext.tsx       # Authentication state management
│   ├── pages/                    # HomePage, Destinations, Attractions, Hotels, Guides, Map, Trips, Admin...
│   ├── server/
│   │   ├── middleware/           # auth.ts (JWT, roles, optionalAuth)
│   │   ├── routes/               # Modular REST endpoints
│   │   ├── validators/           # Zod validation schemas
│   │   ├── db.ts                 # Prisma singleton client
│   │   └── swagger.ts            # OpenAPI 3.0 router
│   ├── services/
│   │   └── api.ts                # Fetch client with token management
│   ├── types/                    # Shared TypeScript interfaces
│   ├── App.tsx                   # Main routes and providers
│   ├── index.css                 # Design tokens and Tailwind styling
│   └── main.tsx                  # React DOM mount point
├── tests/
│   └── api.test.ts               # Automated API integration tests
├── .env.example                  # Environment configuration template
├── metadata.json                 # AI Studio app metadata
├── package.json
├── server.ts                     # Full-stack server entry point
├── vite.config.ts
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 20
- npm >= 10

### 2. Installation
```bash
# Clone the repository and install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` configuration:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET=easyway_super_secure_jwt_secret_key_tourism_india_2026_discover
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### 4. Database Setup & Seeding
```bash
# Push schema and generate Prisma client
npx prisma generate
npx prisma db push

# Seed 16 destinations, 23 attractions, 14 hotels, 8 guides, demo users & trips
npx tsx prisma/seed.ts
```

### 5. Running the Application
```bash
npm run dev
```
The server will start on `http://localhost:3000` with the Vite dev server mounted and all `/api` routes active.

### 6. Pre-seeded Demo Accounts
You can log in directly using the pre-seeded demo accounts:
- **Traveler:** `traveler@easyway.in` / `EasyWay@2026`
- **Tour Guide:** `vikram@easyway.in` / `EasyWay@2026`
- **Administrator:** `admin@easyway.in` / `EasyWay@2026`

---

## 🧪 Running Automated Tests

Run the Vitest test suite:
```bash
npm test
```
The test suite covers:
- Authentication & login failure modes
- Duplicate email prevention
- Token verification via `/api/auth/me`
- Destination & attraction listing and filtering
- Multi-entity global search
- Personalized recommendations engine
- Trip creation, itinerary adding, and deletion
- Tourist inquiry submissions
- Role-based authorization & admin panel protection

---

## 📖 API Documentation

Interactive Swagger API documentation is available at:
`http://localhost:3000/api/docs`

---

## 🚢 Production Deployment

### Building for Production
```bash
npm run build
```

### Running in Production
```bash
NODE_ENV=production npm start
```

### Deploying with PostgreSQL
1. Set `DATABASE_URL` in your production environment variables to your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/easyway?schema=public"
   ```
2. Replace `prisma/schema.prisma` with `prisma/schema.postgres.prisma` or change the provider from `"sqlite"` to `"postgresql"`.
3. Run `npx prisma db push` and `npx tsx prisma/seed.ts`.
