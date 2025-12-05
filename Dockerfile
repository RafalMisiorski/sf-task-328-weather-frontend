# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install ALL dependencies (including devDependencies for build)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL:-https://sf-task-328-seamless-production.up.railway.app}
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config as template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Default PORT for Railway
ENV PORT=80

# Expose dynamic port
EXPOSE ${PORT}

# Use nginx entrypoint that does envsubst on templates
CMD ["nginx", "-g", "daemon off;"]