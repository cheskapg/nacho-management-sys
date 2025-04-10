  // app/api/customers/sales/[year]/[month]/route.ts
  import { NextRequest, NextResponse } from 'next/server';

  const API_URL = process.env.API_URL || 'http://localhost:3000';

  export async function GET(
    request: NextRequest,
  context: { params: { year: string; month: string } }
  ) {
    try {
      const { year, month } = context.params;
      
      const response = await fetch(`${API_URL}/customers/sales/${year}/${month}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error fetching customer sales summary:', error);
      return NextResponse.json(
        { error: 'Failed to fetch customer sales data' },
        { status: 500 }
      );
    }
  }