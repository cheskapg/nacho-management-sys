// app/api/sales/month/[year]/[month]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const NEXT_PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ customerUuid: string; }> } // Note the Promise type
) {
    try {
        const { customerUuid } = await params;

        const response = await fetch(`${NEXT_PUBLIC_API_BASE}/sales/customer/${customerUuid}`, {
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