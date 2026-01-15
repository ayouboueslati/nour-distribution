# Nour Distribution - Frontend Application

A robust, modern web interface for the Nour Distribution management platform, built with Next.js 16, React 19, and Tailwind CSS. This application serves two primary roles: a public product storefront and a comprehensive administration dashboard for sales, orders, and inventory management.

## Key Features

- **Public Storefront**: Browse products and view detailed information.
- **Admin Dashboard**: Secure administrative interface for business operations.
- **Sales Management**: Complete lifecycle handling for:
  - Quotes (Devis)
  - Invoices (Factures)
  - Credit Notes (Avoirs)
- **Order Processing**: Workflow for managing customer orders from placement to fulfillment.
- **Product Management**: Tools for inventory tracking and catalog updates.
- **Responsive Design**: Fully responsive UI built with Tailwind CSS v4.

## Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## Prerequisites

Ensure you have the following installed on your local machine:

- **Node.js**: v18.17.0 or higher
- **npm**: v9.0.0 or higher (or equivalent package manager like yarn/pnpm/bun)
- **Backend Service**: Ensure the API backend is running (default: `http://localhost:8000`)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd nour-distribution/frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Copy the example environment file to create your local configuration.
    ```bash
    cp .env.example .env.local
    ```
    
    Open `.env.local` and configure the API URLs if necessary:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
    NEXT_PUBLIC_STATIC_URL=http://localhost:8000/static/
    NEXT_PUBLIC_ENVIRONMENT=development
    ```

## Running the Application

### Development Mode
To start the development server with hot-reload:

```bash
npm run dev
```
Access the application at [http://localhost:3000](http://localhost:3000).

### Production Build
To create an optimized production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

### Linting
To check code quality and fix linting issues:

```bash
npm run lint
```

## Project Structure

- `src/app/(public)`: Public-facing routes (Storefront).
- `src/app/(admin)`: Protected administrative routes.
- `src/components`: Reusable UI components.
- `src/lib`: Utility functions and checking logic.
- `src/hooks`: Custom React hooks.
- `src/context`: React Context providers.
