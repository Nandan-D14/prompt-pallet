# Prompt Palette

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Overview

Prompt Palette is a web application for managing and showcasing AI-generated images. It features user authentication, an admin panel for uploading images, a gallery for browsing images, and the ability for users to save their favorite images.

## Database and Error Handling Improvements

### Database Connection Management

The project now includes a robust database connection management system with the following features:

- **Connection Pooling**: Efficient reuse of database connections to reduce overhead
- **Error Handling**: Comprehensive error handling for database operations
- **Repository Pattern**: Structured data access through repository classes
- **Transaction Support**: Safe transaction handling for complex operations

### Error Handling

A standardized error handling system has been implemented with:

- **Consistent Error Responses**: Standardized error format across the application
- **Error Logging**: Detailed error logging with context information
- **Error Types**: Categorized errors for better debugging and user feedback
- **API Error Handling**: Proper HTTP status codes and error messages for API endpoints

## Project Structure

```
/app
  /(auth)         # Authentication routes
  /(root)         # Main application routes
  /api            # API endpoints
/components       # React components
/firebase         # Firebase configuration
/lib
  /actions        # Server actions
  /db             # Database utilities and repositories
  /utils          # Utility functions
/types            # TypeScript type definitions
```

## Authentication

The application uses Firebase Authentication with the following improvements:

- **Session Management**: Secure session cookies for authentication
- **Role-Based Access**: Admin-only routes and functionality
- **Error Handling**: Improved error handling for authentication operations
- **Middleware**: Authentication middleware for protected routes

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
