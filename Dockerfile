# Stage 1: Build the React Frontend
FROM node:20-slim as frontend-builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY web-admin/package*.json ./web-admin/
RUN rm -f package-lock.json && npm install

# Copy frontend source and build
COPY web-admin/ ./web-admin/
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
RUN npm run build --workspace=web-admin

# Stage 2: Build the FastAPI Backend
FROM python:3.11-slim
WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ /app/

# Copy the built React app from Stage 1 into a 'static' directory
COPY --from=frontend-builder /app/web-admin/dist /app/static

# Expose port and run the server
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
