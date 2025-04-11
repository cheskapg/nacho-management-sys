# NachoSales Management System
![image](https://github.com/user-attachments/assets/0486f3b5-c675-436b-b0b4-c327c1fde273)

A comprehensive analytics dashboard built with Next.js 15 for tracking and visualizing sales data, customer behavior, and product performance.
Show Image
Features

Sales Overview: Track total sales, customer counts, and item sales with real-time metrics
Time-based Analysis: Navigate through different time periods with the interactive date selector
Visual Data Representation: Analyze trends with interactive charts and graphs
Customer Insights: Drill down into customer purchase history and spending patterns
Product Performance: Identify top-selling products and track inventory movement
Responsive Design: Fully responsive layout that works on desktop, tablet, and mobile devices

Tech Stack

Frontend: Next.js 15, React, TypeScript
UI/Styling: Tailwind CSS
Data Visualization: Recharts
Backend: Fastify API with TypeScript
Database: PostgreSQL
Icons: Lucide React

Getting Started
Prerequisites

Node.js 18.17.0 or later
PostgreSQL 14 or later
npm or yarn

Installation

Clone the repository:
bashgit clone https://github.com/cheskapg/nacho-management-sys.git


Install dependencies:
npm install
# or
yarn install

Set up environment variables:
Create a .env.local file in the project root with the following variables:
DATABASE_URL=postgresql://username:password@localhost:5432/sales_dashboard
NEXT_PUBLIC_API_URL=http://localhost:3000/api

Set up the database:
refer to https://github.com/cheskapg/codeChallenge

Start the development server:
bashnpm run dev
# or
yarn dev

Open http://localhost:3000 in your browser

Building for Production
bashnpm run build
# or
yarn build
To start the production server:
bashnpm run start
# or
yarn start
Project Structure
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
Dashboard Pages
Main Dashboard (/dashboard)
The main dashboard provides a high-level overview of sales performance with the following features:

Summary Cards: Quick metrics showing total sales, customer count, and items sold
Time Navigation: Select different months and years to view historical data
Sales Trend Chart: Line chart showing daily sales trends
Customer Distribution: Pie chart displaying customer spending distribution
Product Performance: Bar chart of top products by revenue

Items View (/items)
The items view provides detailed information about product performance:

Product Listing: Comprehensive table of all products with filtering options
Performance Metrics: Track sales, quantity sold, and average price per product
Stock Management: Monitor inventory levels and receive low stock alerts
Category Analysis: Break down sales by product category
Search Functionality: Quickly find specific products
