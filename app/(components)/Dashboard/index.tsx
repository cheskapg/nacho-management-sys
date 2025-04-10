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
  Package,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Sale {
  uuid: string;
  date: string;
  total_amount: number;
  items: {
    product_uuid: string;
    product_name: string;
    subtotal: number;
    quantity: number;
  }[];
}

interface CustomerSummaryItem {
  customer: {
    uuid: string;
    name: string;
  };
  total_customer_monthly_sale: number;
  total_spent: number;
  sales: Sale[];
}

const SalesDashboard = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [customerUuid, setCustomerUuid] = useState("1");
  const [monthlySalesData, setMonthlySalesData] = useState<any>({});
  const [customerSummary, setCustomerSummary] = useState<CustomerSummaryItem[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

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
      const response = await fetch(`/api/reports/month/${year}/${month}/monthly-sales`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setMonthlySalesData(data);
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
      const response = await fetch(`/api/reports/month/${year}/${month}/${customerUuid}/customer-monthly-sales`);
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

  // Toggle customer expansion
  const toggleCustomerExpansion = (customerId: string) => {
    if (expandedCustomer === customerId) {
      setExpandedCustomer(null);
    } else {
      setExpandedCustomer(customerId);
    }
  };

  // Prepare data for charts
  const prepareCustomerPieData = () => {
    return customerSummary
      .filter(
        (item) =>
          item.customer && item.customer.name && 
          (item.total_customer_monthly_sale != null || item.total_spent != null)
      )
      .map((item) => ({
        name: item.customer.name,
        value: item.total_customer_monthly_sale || item.total_spent || 0,
      }));
  };

  // Daily sales data for line chart
  const prepareDailySalesData = () => {
    if (!monthlySalesData || !monthlySalesData.sales) {
      return [];
    }
    
    const dailyData: { [key: number]: { day: number; total: number; count: number } } = {};
  
    monthlySalesData.sales.forEach((sale: any) => {
      if (!sale || !sale.date || sale.total_amount == null) {
        return;
      }
  
      const date = new Date(sale.date);
      const day = date.getDate();
  
      if (!dailyData[day]) {
        dailyData[day] = { day, total: 0, count: 0 };
      }
  
      dailyData[day].total += parseFloat(sale.total_amount);
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
        sale.items?.forEach((item) => {
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

  // Prepare customer product breakdown data
  const prepareCustomerProductBreakdown = () => {
    return customerSummary.map(customer => {
      // Create a map to aggregate products per customer
      const productMap = new Map<string, {
        product_uuid: string,
        product_name: string,
        total_quantity: number,
        total_spent: number
      }>();
      
      // Process all sales for this customer
      customer.sales.forEach(sale => {
        sale.items?.forEach(item => {
          if (!productMap.has(item.product_uuid)) {
            productMap.set(item.product_uuid, {
              product_uuid: item.product_uuid,
              product_name: item.product_name,
              total_quantity: 0,
              total_spent: 0
            });
          }
          
          const currentProduct = productMap.get(item.product_uuid)!;
          currentProduct.total_quantity += item.quantity;
          currentProduct.total_spent += item.subtotal;
        });
      });
      
      // Convert the map to an array
      const products = Array.from(productMap.values());
      
      return {
        customer_uuid: customer.customer.uuid,
        customer_name: customer.customer.name,
        total_spent: customer.total_customer_monthly_sale || customer.total_spent || 0,
        order_count: customer.sales.length,
        products: products
      };
    });
  };

  // Calculate summary stats
  const calculateSummaryStats = () => {
    let totalSales = 0;
    let totalItems = 0;
    let totalTransactions = 0;

    if (monthlySalesData && monthlySalesData.totalMonthlySales) {
      totalSales = parseFloat(monthlySalesData.totalMonthlySales);
      totalTransactions = monthlySalesData.numberOfSales || 0;
    } else {
      customerSummary.forEach((customer) => {
        totalSales += customer.total_customer_monthly_sale || customer.total_spent || 0;
        totalTransactions += customer.sales.length;
      });
    }

    customerSummary.forEach((customer) => {
      customer.sales.forEach((sale) => {
        sale.items?.forEach((item) => {
          totalItems += item.quantity;
        });
      });
    });

    return {
      totalSales,
      totalCustomers: customerSummary.length,
      totalItems,
      totalTransactions,
      avgOrderValue: totalTransactions ? totalSales / totalTransactions : 0,
    };
  };

  const stats = calculateSummaryStats();
  const pieData = prepareCustomerPieData();
  const dailyData = prepareDailySalesData();
  const topProducts = prepareTopProductsData();
  const customerProductBreakdown = prepareCustomerProductBreakdown();

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
              <Tooltip formatter={(value: number) => `$${value}`} />
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
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customerProductBreakdown.map((customer) => {
                // Calculate total items
                let totalItems = 0;
                customer.products.forEach((product) => {
                  totalItems += product.total_quantity;
                });

                return (
                  <React.Fragment key={customer.customer_uuid}>
                    <tr className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">
                        {customer.customer_name}
                      </td>
                      <td className="py-2 px-4 border-b">
                        ${customer.total_spent}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {customer.order_count}
                      </td>
                      <td className="py-2 px-4 border-b">{totalItems}</td>
                      <td className="py-2 px-4 border-b">
                        <button
                          onClick={() => toggleCustomerExpansion(customer.customer_uuid)}
                          className="flex items-center px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded text-blue-600 text-sm"
                        >
                          {expandedCustomer === customer.customer_uuid ? (
                            <>
                              <ChevronUp size={14} className="mr-1" />
                              Hide Products
                            </>
                          ) : (
                            <>
                              <ChevronDown size={14} className="mr-1" />
                              Show Products
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedCustomer === customer.customer_uuid && (
                      <tr>
                        <td colSpan={5} className="p-0">
                          <div className="bg-gray-50 p-4">
                            <h4 className="font-medium text-gray-700 mb-2">
                              Products Purchased by {customer.customer_name}
                            </h4>
                            <table className="min-w-full bg-white border">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="py-2 px-4 border-b text-left">Product</th>
                                  <th className="py-2 px-4 border-b text-left">Quantity</th>
                                  <th className="py-2 px-4 border-b text-left">Total Spent</th>
                                </tr>
                              </thead>
                              <tbody>
                                {customer.products.map((product, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b">
                                      {product.product_name}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                      {product.total_quantity}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                      ${product.total_spent}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCustomerProductCards = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Customer Product Purchases</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customerProductBreakdown.map((customer) => (
            <div 
              key={customer.customer_uuid}
              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="bg-blue-50 p-4 border-b">
                <div className="flex items-center">
                  <User size={20} className="text-blue-500 mr-2" />
                  <h4 className="font-medium">{customer.customer_name}</h4>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span>Total: ${customer.total_spent}</span>
                  <span>Orders: {customer.order_count}</span>
                </div>
              </div>
              <div className="p-4">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Purchased Products:</h5>
                <div className="space-y-2">
                  {customer.products.map((product, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm border-b pb-2">
                      <div className="flex items-center">
                        <Package size={14} className="text-gray-400 mr-2" />
                        <span>{product.product_name}</span>
                      </div>
                      <div className="text-right">
                        <div>Qty: {product.total_quantity}</div>
                        <div className="text-green-600">${product.total_spent}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
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
                    ${stats.totalSales}
                  </p>
                  <p className="text-sm text-gray-500">
                    Avg: ${stats.avgOrderValue}/order
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
                    {stats.totalTransactions} orders placed
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
              {renderCustomerProductCards()}
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
                            ${product.sales}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {product.quantity}
                          </td>
                          <td className="py-2 px-4 border-b">
                            ${(product.sales / product.quantity)}
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