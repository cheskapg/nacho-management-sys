// app/api/sales/month/[year]/[month]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const NEXT_PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

export async function GET(
  request: NextRequest,
  { params }: { params: { year: string; month: string } }
) {
  try {
    const { year, month } = params;

    const response = await fetch(`${NEXT_PUBLIC_API_BASE}/reports/month/${year}/${month}`, {
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
    console.error('Error fetching sales by month:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales data' },
      { status: 500 }
    );
  }
}