import React, { useState, useEffect } from "react";
import { apiRequest } from "../Services/API";
import Sidebar from "../Components/Sidebar";
import { toast } from "react-toastify";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalMenuItems: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // You can create these endpoints or mock them for now
      const [statsRes, ordersRes, popularRes] = await Promise.all([
        apiRequest.get("/admin/stats"),
        apiRequest.get("/admin/recent-orders?limit=5"),
        apiRequest.get("/admin/popular-items"),
      ]);

      setStats(statsRes.data.data || statsRes.data);
      setRecentOrders(ordersRes.data.data || []);
      setPopularItems(popularRes.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Sample Data (Remove when backend is ready)
  const revenueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenue (NPR)",
        data: [45000, 68000, 52000, 89000, 76000, 95000],
        backgroundColor: "#f97316",
        borderColor: "#ea580c",
        borderWidth: 2,
      },
    ],
  };

  const categoryData = {
    labels: ["Main Course", "Starters", "Beverages", "Desserts"],
    datasets: [
      {
        data: [45, 25, 20, 10],
        backgroundColor: ["#f97316", "#eab308", "#22c55e", "#a855f7"],
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-2xl">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
        <Sidebar />

        <main className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={fetchDashboardData}
              className="px-5 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700"
            >
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-3xl shadow">
              <p className="text-gray-500">Total Restaurants</p>
              <p className="text-4xl font-bold mt-2">{stats.totalRestaurants}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow">
              <p className="text-gray-500">Menu Items</p>
              <p className="text-4xl font-bold mt-2">{stats.totalMenuItems}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow">
              <p className="text-gray-500">Total Orders</p>
              <p className="text-4xl font-bold mt-2">{stats.totalOrders}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow">
              <p className="text-gray-500">Total Revenue</p>
              <p className="text-4xl font-bold mt-2">Rs. {stats.totalRevenue?.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue Chart */}
            <div className="bg-white p-8 rounded-3xl shadow">
              <h2 className="text-2xl font-semibold mb-6">Monthly Revenue</h2>
              <Bar
                data={revenueData}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                }}
              />
            </div>

            {/* Category Distribution */}
            <div className="bg-white p-8 rounded-3xl shadow">
              <h2 className="text-2xl font-semibold mb-6">Menu Category Distribution</h2>
              <div className="flex justify-center">
                <Pie
                  data={categoryData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Recent Orders & Popular Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Recent Orders */}
            <div className="bg-white p-8 rounded-3xl shadow">
              <h2 className="text-2xl font-semibold mb-6">Recent Orders</h2>
              <div className="space-y-4">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div key={order._id} className="flex justify-between items-center border-b pb-4">
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-gray-500">{order.items?.length} items</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">Rs. {order.totalAmount}</p>
                        <p className="text-xs text-green-600">Completed</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 py-8 text-center">No recent orders</p>
                )}
              </div>
            </div>

            {/* Popular Items */}
            <div className="bg-white p-8 rounded-3xl shadow">
              <h2 className="text-2xl font-semibold mb-6">Popular Items</h2>
              <div className="space-y-4">
                {popularItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-xl">
                      🔥
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.restaurantName}</p>
                    </div>
                    <p className="font-bold text-orange-600">Rs. {item.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;