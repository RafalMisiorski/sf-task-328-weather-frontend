# Build and serve with Node.js
FROM node:18-alpine

WORKDIR /app

# Install ALL dependencies (including devDependencies for build)
COPY package*.json ./
RUN npm ci

# Install serve for static file serving
RUN npm install -g serve

# Copy source and build
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL:-https://sf-task-328-seamless-production.up.railway.app}
RUN npm run build

# Railway will set PORT env var
ENV PORT=3000
EXPOSE 3000

# Serve the built files
CMD ["sh", "-c", "serve -s dist -l $PORT"]
