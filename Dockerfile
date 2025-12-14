FROM node:20-alpine

WORKDIR /app

# Backend deps
COPY backend/package*.json backend/
RUN cd backend && npm install

# Frontend deps
COPY package*.json ./
RUN npm install

# Copy all source
COPY . .

# Build frontend (outputs /app/dist)
RUN npm run build

# Ensure uploads dir
RUN mkdir -p backend/uploads

EXPOSE 3001

CMD ["node", "backend/src/index.js"]
