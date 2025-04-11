# NachoSales Management System

![NachoSales Dashboard](https://github.com/user-attachments/assets/0486f3b5-c675-436b-b0b4-c327c1fde273)

A comprehensive analytics dashboard built with Next.js 15 for tracking and visualizing sales data, customer behavior, and product performance.

## Features

- **Sales Overview**: Track total sales, customer counts, and item sales with real-time metrics.
- **Time-based Analysis**: Navigate through different time periods with the interactive date selector.
- **Visual Data Representation**: Analyze trends with interactive charts and graphs.
- **Customer Insights**: Drill down into customer purchase history and spending patterns.
- **Product Performance**: Identify top-selling products and track inventory movement.
- **Responsive Design**: Fully responsive layout that works on desktop, tablet, and mobile devices.

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **UI/Styling**: Tailwind CSS
- **Data Visualization**: Recharts
- **Backend**: Fastify API with TypeScript
- **Database**: PostgreSQL
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- PostgreSQL 14 or later
- npm or yarn

### Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/cheskapg/nacho-management-sys.git
    ```

2. **Install dependencies**:

    Using npm:

    ```bash
    npm install
    ```

    Or using yarn:

    ```bash
    yarn install
    ```

3. **Set up environment variables**:

    Create a `.env.local` file in the project root with the following variables:

    ```env
    DATABASE_URL=postgresql://username:password@localhost:5432/sales_dashboard
    NEXT_PUBLIC_API_URL=http://localhost:3000/api
    ```

    Replace `username` and `password` with your PostgreSQL credentials.

4. **Set up the database**:

    Follow the instructions in the [codeChallenge repository](https://github.com/cheskapg/codeChallenge) to set up the database schema and initial data.

5. **Start the development server**:

    Using npm:

    ```bash
    npm run dev
    ```

    Or using yarn:

    ```bash
    yarn dev
    ```

    Open `http://localhost:3000` in your browser.

## Building for Production

1. **Build the project**:

    Using npm:

    ```bash
    npm run build
    ```

    Or using yarn:

    ```bash
    yarn build
    ```

2. **Start the production server**:

    Using npm:

    ```bash
    npm run start
    ```

    Or using yarn:

    ```bash
    yarn start
    ```

## Project Structure

```
sales-dashboard/
├── app/                    # Next.js 15 App Router
│   ├── api/                # API routes
│   ├── dashboard/          # Dashboard page
│   ├── items/              # Items view page
│   └── layout.tsx          # Root layout
├── components/             # Reusable React components
│   ├── charts/             # Chart components
│   ├── ui/                 # UI components
│   └── dashboard/          # Dashboard-specific components
├── lib/                    # Utility functions and data fetching
├── public/                 # Static assets
├── styles/                 # Global styles
├── types/                  # TypeScript type definitions
└── prisma/                 # Database schema and migrations
```

## Dashboard Pages

### Main Dashboard (`/dashboard`)

The main dashboard provides a high-level overview of sales performance with the following features:

- **Summary Cards**: Quick metrics showing total sales, customer count, and items sold.
- **Time Navigation**: Select different months and years to view historical data.
- **Sales Trend Chart**: Line chart showing daily sales trends.
- **Customer Distribution**: Pie chart displaying customer spending distribution.
- **Product Performance**: Bar chart of top products by revenue.

### Items View (`/items`)

The items view provides detailed information about product performance:

- **Product Listing**: Comprehensive table of all products with filtering options.
- **Performance Metrics**: Track sales, quantity sold, and average price per product.
- **Stock Management**: Monitor inventory levels and receive low stock alerts.
- **Category Analysis**: Break down sales by product category.
- **Search Functionality**: Quickly find specific products.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Feel free to adjust any sections as needed. Let me know if you need further assistance! 
