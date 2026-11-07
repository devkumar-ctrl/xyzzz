# Frontend - Dumka Academy Desk

This directory contains the Next.js-based frontend for the Dumka Academy Desk, which is designed for coaches, players, and scouts.

## Structure

- **React 19, Next.js 16.4.5**
- **Tailwind CSS 4** for styling
- **API**: Accesses Express API backend

## Vercel Deployment

### Prerequisites

- Sign up at Vercel if you haven't yet.
- Install the Vercel CLI if you intend to deploy from command line.

### Steps

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set Environment Variables**:
   - Create a `.env.local` file or set the variables in Vercel's dashboard.
   - Required variable: `BACKEND_URL` pointing to the deployed backend API.

4. **Deploy**:
   - **From CLI**:
     ```bash
     vercel
     ```
   - **From Dashboard**:
     - Import your GitHub repo.
     - Configure with environment variables.
     - Deploy the master branch.

5. **Testing and Verification**:
   - Ensure the frontend communicates with your backend by verifying UI and API requests.

## Development

- **Local Development**:
  ```bash
  npm run dev
  ```
  this starts the Next.js server on `localhost:3000`.

- **Build**:
  ```bash
  npm run build
  ```
  generates optimized production output.

- **Lint**:
  ```bash
  npm run lint
  ```
  ensures code adheres to linting rules.

## Support

For any issues, please file a ticket or contact the developers.