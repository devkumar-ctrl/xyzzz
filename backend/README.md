# Backend - Dumka Academy Desk

This directory contains the Express API backend for the Dumka Academy Desk, which provides routes and business logic for coaches, players, and scouts.

## Overview

- **Node.js** with **Express** framework
- **MongoDB** for database
- **Authentication** and session management
- **Role-based access control** (Coach, Player, Scout)

## Deployment

### Prerequisites

- Signup on a hosting platform like Render, Heroku, or Fly.io to host your Node.js app.

### Steps

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd backend
   ```
   
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   - Ensure you have MongoDB Atlas or similar.
   - Create a `.env.local` file with:
     - `MONGODB_URI`: MongoDB connection string.
     - `AUTH_SECRET`: Random secret for session signing.
     - `MONGODB_DB` (optional, default to `dumka_academy`)
     - `PORT` (optional, default to `4000`)
   
4. **Deploy**:
   - Push to your hosting service using CLI tools or via their web interface.
   - Ensure the environment variables are set in the service's config.
   
5. **Testing**:
   - Verify API endpoints are working and reachable from the frontend.

## Development

- **Local Development**:
  ```bash
  npm run dev
  ```
  starts the Express server on `localhost:4000`.
  
- **Build and Start**:
  ```bash
  npm run build && npm start
  ```

## API Documentation

Refer to the API folder for detailed documents on available endpoints.

## Support

For issues and feature requests, raise a Github issue or reach out directly to the developer community.
