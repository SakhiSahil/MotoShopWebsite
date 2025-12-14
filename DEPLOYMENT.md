# Combined Frontend + Backend Deployment Guide

## Local Development

### Frontend (in root folder):
```bash
npm install
npm run dev
```

### Backend (in backend folder):
```bash
cd backend
npm install
npm run init-db  # First time only
npm run dev
```

## Environment Variables

### Frontend (.env in root):
```
VITE_API_URL=http://localhost:3001/api
```

### Backend (backend/.env):
```
PORT=3001
JWT_SECRET=your-secret-key
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

## Production Deployment (Fly.io)

### 1. Install Fly CLI
```bash
# macOS
brew install flyctl

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Linux
curl -L https://fly.io/install.sh | sh
```

### 2. Login & Initialize
```bash
fly auth login
fly launch --no-deploy
```

### 3. Create Persistent Volume
```bash
fly volumes create data_volume --region fra --size 1
```

### 4. Set Secrets
```bash
# Generate a secure JWT secret
fly secrets set JWT_SECRET=$(openssl rand -hex 64)
```

### 5. Deploy
```bash
fly deploy
```

### 6. Initialize Database
```bash
fly ssh console -C "cd /app/backend && node src/init-db.js"
```

### 7. Access Your App
```bash
fly open
```

## File Structure After Deploy
```
/app
├── dist/              # Frontend build (served by Express)
├── backend/
│   ├── src/
│   └── node_modules/
└── /data              # Persistent volume
    ├── motoshop.db    # SQLite database
    └── uploads/       # Uploaded images
```

## Important Notes

1. **Single Command**: In production, only the backend runs and serves both API and frontend
2. **Persistent Data**: Database and uploads survive redeploys
3. **Auto-SSL**: Fly.io provides free SSL certificates
4. **Scaling**: SQLite works best with single instance (configured in fly.toml)

## Updating Frontend API URL

After first deploy, update `.env` for production:
```
VITE_API_URL=https://your-app-name.fly.dev/api
```

Then rebuild and deploy:
```bash
fly deploy
```
