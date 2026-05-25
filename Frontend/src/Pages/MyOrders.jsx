import { useEffect, useState } from "react";
import { apiRequest, imgBaseURL } from "../Services/API";
import { toast } from "react-toastify";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const ordersPerPage = 5;

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const fetchOrders = async (page) => {
    try {
      setLoading(true);
      const res = await apiRequest.get(`/order/myorders?page=${page}&limit=${ordersPerPage}`);

      setOrders(res.data.orders || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalOrders(res.data.totalOrders || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your orders");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (item) => {
    if (!item) return "https://picsum.photos/id/1080/300/200";
    if (item.image) return item.image.startsWith("http") ? item.image : `${imgBaseURL}${item.image}`;
    return "https://picsum.photos/id/1080/300/200";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "text-green-600 bg-green-100";
      case "Processing": return "text-blue-600 bg-blue-100";
      case "Out for Delivery": return "text-orange-600 bg-orange-100";
      case "Cancelled": return "text-red-600 bg-red-100";
      default: return "text-yellow-600 bg-yellow-100";
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading your orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">My Orders</h1>
          {totalOrders > 0 && (
            <p className="text-gray-600">
              {totalOrders} total orders
            </p>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-6">📦</p>
            <h2 className="text-2xl font-semibold text-gray-700">No orders yet</h2>
            <p className="text-gray-500 mt-3">When you place an order, it will appear here.</p>
          </div>
        ) : (
          <>
            <div className="space-y-8">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b bg-gray-50">
                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>
                      <p className="font-mono text-sm">#{order._id.slice(-8).toUpperCase()}</p>
                    </div>

                    <div className="mt-3 md:mt-0 text-right">
                      <p className="text-sm text-gray-500">Placed on</p>
                      <p className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="mt-3 md:mt-0 text-right">
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-medium">
                        {order.paymentMethod}
                      </p>
                    </div>

                    <div className="mt-4 md:mt-0">
                      <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6 space-y-6">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex gap-6">
                        <img
                          src={getImageUrl(item)}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-2xl border"
                          onError={(e) => (e.target.src = "https://picsum.photos/id/1080/300/200")}
                        />

                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <p className="text-gray-600">
                            Rs. {item.price} × {item.quantity}
                          </p>
                        </div>

                        <div className="text-right font-semibold">
                          Rs. {item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="bg-gray-50 px-6 py-5 flex justify-between items-center border-t">
                    <span className="text-lg font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold text-orange-600">
                      Rs. {order.totalAmount}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-6 py-3 bg-white border rounded-xl hover:bg-gray-50 disabled:opacity-50"
                >
                  ← Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-12 h-12 rounded-xl font-medium transition ${
                      currentPage === page
                        ? "bg-orange-600 text-white"
                        : "bg-white border hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 bg-white border rounded-xl hover:bg-gray-50 disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyOrders;