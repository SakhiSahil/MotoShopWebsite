# Moto Shop Backend

Backend API for Moto Shop Afghanistan - Built with Express.js and SQLite.

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Installation

```bash
cd backend
npm install
```

## Initialize Database

Run this command once to create the database and default admin user:

```bash
npm run init-db
```

This will create:
- SQLite database at `backend/data/motoshop.db`
- Default admin user (username: `admin`, password: `admin123`)
- Default settings and sample data

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/change-password` - Change admin password (requires auth)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (requires auth)
- `PUT /api/products/:id` - Update product (requires auth)
- `DELETE /api/products/:id` - Delete product (requires auth)

### Settings
- `GET /api/settings` - Get all settings
- `GET /api/settings/stats` - Get stats
- `PUT /api/settings/:key` - Update setting (requires auth)
- `PUT /api/settings` - Update multiple settings (requires auth)
- `POST /api/settings/stats` - Create stat (requires auth)
- `PUT /api/settings/stats/:id` - Update stat (requires auth)
- `DELETE /api/settings/stats/:id` - Delete stat (requires auth)

### Brands
- `GET /api/brands` - Get active brands
- `GET /api/brands/all` - Get all brands (requires auth)
- `POST /api/brands` - Create brand (requires auth)
- `PUT /api/brands/:id` - Update brand (requires auth)
- `DELETE /api/brands/:id` - Delete brand (requires auth)

### Slides (Hero Carousel)
- `GET /api/slides` - Get active slides
- `GET /api/slides/all` - Get all slides (requires auth)
- `POST /api/slides` - Create slide (requires auth)
- `PUT /api/slides/:id` - Update slide (requires auth)
- `DELETE /api/slides/:id` - Delete slide (requires auth)

### Pages
- `GET /api/pages` - Get all pages
- `GET /api/pages/:id` - Get single page
- `PUT /api/pages/:id` - Create/update page (requires auth)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | Server port |
| JWT_SECRET | (default key) | Secret for JWT tokens (change in production!) |

## File Uploads

Uploaded files are stored in `backend/uploads/` and accessible at `/uploads/filename`

## Security Notes

⚠️ **Important for Production:**
1. Change the JWT_SECRET in production
2. Change the default admin password
3. Use HTTPS
4. Set proper CORS origins
