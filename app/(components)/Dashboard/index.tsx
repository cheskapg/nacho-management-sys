"use client"; // Needed if used inside app directory and uses hooks or browser-only features

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  DollarSign,
  Users,
  ShoppingBag,
} from "lucide-react";

interface Sale {
  date: string;
  total_amount: number;
}

interface CustomerSummaryItem {
  customer: {
    uuid: string;
    name: string;
  };
  total_spent: number;
  sales: {
    items: {
      product_uuid: string;
      product_name: string;
      subtotal: number;
      quantity: number;
    }[];
  }[];
}

const SalesDashboard = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [customerSummary, setCustomerSummary] = useState<CustomerSummaryItem[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
  ];

  // Format month for display
  const getMonthName = (monthNum: number) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthNum - 1];
  };

  // Handle month navigation
  const changeMonth = (increment: number) => {
    let newMonth = month + increment;
    let newYear = year;

    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }

    setMonth(newMonth);
    setYear(newYear);
  };

  // Fetch sales data by month
  const fetchSalesByMonth = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sales/month/${year}/${month}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setSalesData(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch sales data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer sales summary
  const fetchCustomerSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/customers/sales/${year}/${month}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setCustomerSummary(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch customer summary");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when month or year changes
  useEffect(() => {
    fetchSalesByMonth();
    fetchCustomerSummary();
  }, [year, month]);

  // Prepare data for charts
  const prepareCustomerPieData = () => {
    return customerSummary
      .filter(
        (item) =>
          item.customer && item.customer.name && item.total_spent != null
      ) // Ensure valid data
      .map((item) => ({
        name: item.customer.name, // Safe access to name
        value: item.total_spent, // Safe access to total_spent
      }));
  };
  // Daily sales data for line chart
  const prepareDailySalesData = () => {
    // Ensure salesData is always an array (fallback to empty array)
    const safeSalesData = Array.isArray(salesData) ? salesData : [];
    
    const dailyData: { [key: number]: { day: number; total: number; count: number } } = {};
  
    safeSalesData.forEach(sale => {
      if (!sale || !sale.date || sale.total_amount == null) {
        // Skip if sale data is invalid or has missing required fields
        return;
      }
  
      const date = new Date(sale.date);
      const day = date.getDate();
  
      if (!dailyData[day]) {
        dailyData[day] = { day, total: 0, count: 0 };
      }
  
      dailyData[day].total += sale.total_amount;
      dailyData[day].count += 1;
    });
  
    return Object.values(dailyData).sort((a, b) => a.day - b.day);
  };
  

  // Top products data
  const prepareTopProductsData = () => {
    const productSales: {
      [key: string]: { name: string; sales: number; quantity: number };
    } = {};

    customerSummary.forEach((customer) => {
      customer.sales.forEach((sale) => {
        sale.items.forEach((item) => {
          if (!productSales[item.product_uuid]) {
            productSales[item.product_uuid] = {
              name: item.product_name,
              sales: 0,
              quantity: 0,
            };
          }

          productSales[item.product_uuid].sales += item.subtotal;
          productSales[item.product_uuid].quantity += item.quantity;
        });
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  };

  // Calculate summary stats
  const calculateSummaryStats = () => {
    let totalSales = 0;
    let totalItems = 0;

    customerSummary.forEach((customer) => {
      totalSales += customer.total_spent;

      customer.sales.forEach((sale) => {
        sale.items.forEach((item) => {
          totalItems += item.quantity;
        });
      });
    });

    return {
      totalSales,
      totalCustomers: customerSummary.length,
      totalItems,
      avgOrderValue: salesData.length ? totalSales / salesData.length : 0,
    };
  };

  const stats = calculateSummaryStats();
  const pieData = prepareCustomerPieData();
  const dailyData = prepareDailySalesData();
  const topProducts = prepareTopProductsData();

  const renderPieChart = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">
          Customer Spending Distribution
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={(entry: { name: string; percent: number }) =>
                  `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderLineChart = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Daily Sales Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                label={{
                  value: "Day of Month",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                label={{
                  value: "Sales ($)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#8884d8"
                name="Total Sales"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderBarChart = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Top Products by Revenue</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Bar dataKey="sales" fill="#82ca9d" name="Sales Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderCustomerTable = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Customer Sales Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">Customer</th>
                <th className="py-2 px-4 border-b text-left">Total Spent</th>
                <th className="py-2 px-4 border-b text-left">Orders</th>
                <th className="py-2 px-4 border-b text-left">
                  Items Purchased
                </th>
              </tr>
            </thead>
            <tbody>
              {customerSummary.map((customer) => {
                // Calculate total items
                let totalItems = 0;
                customer.sales.forEach((sale) => {
                  sale.items.forEach((item) => {
                    totalItems += item.quantity;
                  });
                });

                return (
                  <tr key={customer.customer.uuid} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      {customer.customer.name}
                    </td>
                    <td className="py-2 px-4 border-b">
                      ${customer.total_spent.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {customer.sales.length}
                    </td>
                    <td className="py-2 px-4 border-b">{totalItems}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
          Sales Dashboard
        </h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-lg p-2 bg-white shadow-sm">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center mx-2">
              <Calendar size={18} className="mr-2 text-gray-500" />
              <span className="font-medium">
                {getMonthName(month)} {year}
              </span>
            </div>
            <button
              onClick={() => changeMonth(1)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <button
            onClick={() => {
              fetchSalesByMonth();
              fetchCustomerSummary();
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <RefreshCw size={18} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
          role="alert"
        >
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <DollarSign size={24} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Total Sales
                  </h3>
                  <p className="text-2xl font-bold">
                    ${stats.totalSales.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Avg: ${stats.avgOrderValue.toFixed(2)}/order
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <Users size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Active Customers
                  </h3>
                  <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                  <p className="text-sm text-gray-500">
                    {salesData.length} orders placed
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-full mr-4">
                  <ShoppingBag size={24} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Items Sold
                  </h3>
                  <p className="text-2xl font-bold">{stats.totalItems}</p>
                  <p className="text-sm text-gray-500">Across all sales</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b mb-6">
            <button
              className={`py-2 px-4 mr-2 ${
                activeTab === "overview"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`py-2 px-4 mr-2 ${
                activeTab === "customers"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("customers")}
            >
              Customers
            </button>
            <button
              className={`py-2 px-4 ${
                activeTab === "products"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("products")}
            >
              Products
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderLineChart()}
              {renderPieChart()}
            </div>
          )}

          {activeTab === "customers" && (
            <div className="space-y-6">
              {renderPieChart()}
              {renderCustomerTable()}
            </div>
          )}

          {activeTab === "products" && (
            <div className="space-y-6">
              {renderBarChart()}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Product Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-2 px-4 border-b text-left">
                          Product
                        </th>
                        <th className="py-2 px-4 border-b text-left">
                          Revenue
                        </th>
                        <th className="py-2 px-4 border-b text-left">
                          Quantity Sold
                        </th>
                        <th className="py-2 px-4 border-b text-left">
                          Avg Price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((product) => (
                        <tr key={product.name} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">{product.name}</td>
                          <td className="py-2 px-4 border-b">
                            ${product.sales.toFixed(2)}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {product.quantity}
                          </td>
                          <td className="py-2 px-4 border-b">
                            ${(product.sales / product.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SalesDashboard;
