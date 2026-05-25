import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiRequest } from "../Services/API";
import { AuthContext, useAuth } from "../Context/AuthContext";
import SideBar from "../Components/Sidebar";

export default function MenuItemsList() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { isLoggedIn, isAdmin, loading: authLoading } = useAuth();

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Auth Check
  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn || !isAdmin) {
      toast.error("Access denied. Admin only.");
      navigate("/");
    }
  }, [isLoggedIn, isAdmin, authLoading, navigate]);

  // Fetch All Menu Items
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const res = await apiRequest.get("/menu");
      setMenuItems(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;

    setDeletingId(id);
    try {
      await apiRequest.delete(`/menu/${id}`, {
        headers: { Authorization: `Bearer ${currentUser?.token}` },
      });

      toast.success("Menu item deleted successfully");
      fetchMenuItems(); // Refresh list
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete menu item");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl">Loading menu items...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
        <SideBar />

        <main className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">All Menu Items</h1>
            <button
              onClick={() => navigate("/add-menu-item")}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition flex items-center gap-2"
            >
              + Add New Menu Item
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Image</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Item Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Restaurant</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {menuItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        No menu items found. Add some!
                      </td>
                    </tr>
                  ) : (
                    menuItems.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {item.image ? (
                            <img
                              src={item.image.startsWith("http") ? item.image : `http://localhost:4000${item.image}`}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                              No Image
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium">{item.name}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {item.restaurant?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold">₹{item.price}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              item.isAvailable
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.isAvailable ? "Available" : "Unavailable"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center space-x-3">
                          <button
                            onClick={() => navigate(`/editMenuItem/${item._id}`)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            disabled={deletingId === item._id}
                            className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                          >
                            {deletingId === item._id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}