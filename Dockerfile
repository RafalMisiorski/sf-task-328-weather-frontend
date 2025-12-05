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

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create startup script that substitutes PORT
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'PORT=${PORT:-80}' >> /start.sh && \
    echo 'sed -i "s/listen 80;/listen $PORT;/g" /etc/nginx/conf.d/default.conf' >> /start.sh && \
    echo 'echo "Starting nginx on port $PORT"' >> /start.sh && \
    echo 'exec nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

# Railway will set PORT env var
EXPOSE 80

CMD ["/start.sh"]