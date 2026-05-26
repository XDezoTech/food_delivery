import { useEffect, useState } from "react";
import { apiRequest, imgBaseURL } from "../Services/API";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import SideBar from "../Components/Sidebar";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);

  const navigate = useNavigate();
  const { isLoggedIn, isAdmin, loading: authLoading } = useAuth();

  const limit = 10;

  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    if (!isAdmin) {
      toast.error("Access denied. Admin only.");
      navigate("/");
      return;
    }

    fetchOrders(currentPage);
  }, [isLoggedIn, isAdmin, authLoading, currentPage, navigate]);

  const fetchOrders = async (page) => {
    try {
      setLoading(true);
      const res = await apiRequest.get(`/order/admin/all?page=${page}&limit=${limit}`);

      setOrders(res.data.orders || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalOrders(res.data.totalOrders || 0);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Admin access required");
        navigate("/");
      } else {
        toast.error("Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await apiRequest.put(`/order/admin/status/${orderId}`, {
        status: newStatus,
      });

      // Update UI immediately
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );

      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getImageUrl = (item) => {
    if (!item) return "https://picsum.photos/id/1080/300/200";
    if (item.image) {
      return item.image.startsWith("http") ? item.image : `${imgBaseURL}${item.image}`;
    }
    return "https://picsum.photos/id/1080/300/200";
  };

  const statusOptions = ["Pending", "Processing", "Out for Delivery", "Delivered", "Cancelled"];

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-700",
    Processing: "bg-blue-100 text-blue-700",
    "Out for Delivery": "bg-orange-100 text-orange-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
        <SideBar />

        <main className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">All Customer Orders</h1>
            <p className="text-gray-600">
              Total Orders: <span className="font-semibold">{totalOrders}</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow overflow-hidden">
            {orders.map((order) => (
              <div key={order._id} className="p-6 border-b last:border-b-0 hover:bg-gray-50">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-mono text-sm">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    {order.user && (
                      <p className="text-sm mt-1">
                        Customer: {order.user.name || order.user.email}
                      </p>
                    )}
                  </div>

                  <select
                    value={order.orderStatus || "Pending"}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    disabled={updatingId === order._id}
                    className={`px-5 py-3 rounded-2xl text-sm font-semibold border-0 focus:ring-2 ${
                      statusColors[order.orderStatus] || "bg-gray-100"
                    }`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Order Items */}
                <div className="space-y-6">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex gap-6 items-center">
                      <img
                        src={getImageUrl(item)}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-xl border"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://picsum.photos/id/1080/300/200";
                        }}
                      />

                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{item.name}</h4>
                        <p className="text-gray-600">
                          Rs. {item.price} × {item.quantity}
                        </p>
                      </div>

                      <div className="font-semibold text-right">
                        Rs. {(item.price * item.quantity).toFixed(0)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Amount */}
                <div className="mt-8 pt-6 border-t flex justify-between items-center text-xl font-bold">
                  <span>Total Amount</span>
                  <span className="text-orange-600">Rs. {order.totalAmount}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-12">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-6 py-3 bg-white border rounded-xl hover:bg-gray-50 disabled:opacity-50"
              >
                ← Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-12 h-12 rounded-2xl font-medium transition ${
                    currentPage === page ? "bg-orange-600 text-white" : "bg-white border hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-6 py-3 bg-white border rounded-xl hover:bg-gray-50 disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          )}

          {orders.length === 0 && !loading && (
            <div className="text-center py-20 text-gray-500 text-xl">
              No orders found yet.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminOrders;