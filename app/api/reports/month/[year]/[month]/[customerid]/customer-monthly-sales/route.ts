// app/api/sales/month/[year]/[month]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

export async function GET(
  request: NextRequest,
  { params }: { params: { year: string; month: string , customerUuid: string} }
) {
  try {
    const { year, month, customerUuid } = params;
    
    const response = await fetch(`${API_URL}/reports/month/${year}/${month}/${customerUuid}`, {
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