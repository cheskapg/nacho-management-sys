// app/page.tsx
"use client";

import { useState, useEffect } from "react";

interface DataItem {
  id: number;
  name: string;
}
export interface SaleItem {
  uuid: string;
  quantity: number;
  unit_price: number;
  // Optional: Add name, product_id, sale_id, etc. if those exist
}

export default function Test() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);

          // Fetch from our Next.js API route
         const response = await fetch("/api/getItems"); // ✅ Calls Next.js route.ts (your proxy)

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const apiData = await response.json();
          console.log("API Data:", apiData); // Log the API data for debugging
          setData(apiData);
        } catch (error) {
          console.error("Error fetching data:", error);
          setError("Failed to load data. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Next.js 15 with Fastify API</h1>

        {loading && <p className="text-xl">Loading data...</p>}
        {error && <p className="text-xl text-red-500">{error}</p>}

        {data && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">{"success"}</h2>
            <p className="mb-4">
              {/* Timestamp: {new Date(data.timestamp).toLocaleString()} */}
            </p>

            <h3 className="text-xl font-medium mb-2">Data Items:</h3>
            <ul className="list-disc pl-5">
              {data && data.length > 0 ? (
                data.map((item: any) => (
                  <li key={item.uuid} className="mb-1">
                    {item.quantity} (ID: {item.unit_price})
                  </li>
                ))
              ) : (
                <li>No data found.</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
