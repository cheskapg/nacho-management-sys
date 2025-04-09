import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Fetch data from Fastify API
    const response = await fetch('http://localhost:3000/items');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    if (Array.isArray(data) && data.length === 0) {
      return NextResponse.json([]);
    } else {
      return NextResponse.json(data);

    }
    // Return the data as JSON
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from API' },
      { status: 500 }
    );
  }
}
