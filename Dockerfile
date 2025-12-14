FROM node:20-alpine

WORKDIR /app

# ---------- Backend deps ----------
COPY backend/package*.json backend/
RUN cd backend && npm install

# ---------- Frontend deps ----------
COPY package*.json ./
RUN npm install

# ---------- Copy all source ----------
COPY . .

# ---------- Build frontend ----------
RUN npm run build

# ---------- Create uploads dir ----------
RUN mkdir -p backend/uploads

# ---------- Expose port ----------
EXPOSE 3001

# ---------- Start server ----------
CMD ["node", "backend/src/index.js"]
