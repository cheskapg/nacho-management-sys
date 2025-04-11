// app/api/customers/sales/[year]/[month]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const NEXT_PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ year: string; month: string }> } // Note the Promise type/ Note the Promise type
) {
  try {
    const { year, month } = await params;

    const response = await fetch(`${NEXT_PUBLIC_API_BASE}/customers/sales/${year}/${month}`, {
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