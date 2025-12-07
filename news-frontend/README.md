# Next.js Frontend

This is the frontend for the News Platform, built with Next.js, React, and TypeScript.

## Features

- Responsive UI with Tailwind CSS
- User authentication flows (register, login, logout)
- Email verification
- Password reset
- Article browsing and reading
- Bookmark management
- Reading history
- User profiles
- Category navigation
- Search functionality
- Trending articles section
- Mobile-friendly design

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

### With Docker (Recommended)

```bash
# From the root directory
docker-compose up --build
```

### Manual Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (copy .env.example to .env.local and modify as needed):
   ```bash
   cp .env.example .env.local
   # Edit .env.local file with your settings
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (e.g., http://localhost:8000)

## Project Structure

```
app/                 # App router pages
  ├── article/       # Article pages
  ├── bookmarks/     # Bookmarks page
  ├── categories/    # Categories pages
  ├── create-article/# Create article page
  ├── edit-article/  # Edit article page
  ├── history/       # Reading history page
  ├── login/         # Login page
  ├── my-articles/   # User's articles page
  ├── profile/       # Profile page
  ├── register/      # Registration page
  ├── search/        # Search page
  ├── trending/      # Trending articles page
  ├── verify-email/  # Email verification page
  └── ...            # Other pages

components/          # Reusable components
  ├── ArticleCard/   # Article display component
  ├── CategoryBar/   # Category navigation bar
  ├── MobileSearchBar/# Mobile search component
  ├── Navbar/        # Main navigation bar
  ├── SearchBar/     # Desktop search component
  └── ...            # Other components

contexts/            # React contexts
  └── AuthContext/   # Authentication context

lib/                 # Utility functions
  └── api.ts         # API client configuration

public/              # Static assets
styles/              # Global styles
```

## Development

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
npm run build
npm start
```

### Code Quality

```bash
# Run linter
npm run lint

# Run linter with auto-fix
npm run lint:fix
```

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about Tailwind CSS features.

## Common Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run linter with auto-fix
npm run lint:fix

# Run TypeScript compiler
npm run type-check
```