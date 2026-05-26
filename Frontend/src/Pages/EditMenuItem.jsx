import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiRequest } from "../Services/API";
import { AuthContext, useAuth } from "../Context/AuthContext";
import SideBar from "../Components/Sidebar";

export default function EditMenuItem() {
  const { id } = useParams(); // Menu Item ID
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { isLoggedIn, isAdmin, loading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    restaurant: "",
    name: "",
    description: "",
    price: "",
    category: "Main Course",
    image: null,
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [restaurants, setRestaurants] = useState([]);

  const menuCategories = [
    "Starters", "Main Course", "Pizza", "Burgers", 
    "Desserts", "Beverages", "Nepali", "Chinese", "Indian"
  ];

  // Auth Check
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
  }, [isLoggedIn, isAdmin, authLoading, navigate]);

  // Fetch Restaurants + Current Menu Item
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all restaurants for dropdown
        const resRestaurants = await apiRequest.get("/restaurant/get/restaurant");
        setRestaurants(resRestaurants.data.data || []);

        // Fetch current menu item
        const resMenu = await apiRequest.get(`/menu/${id}`);
        const menu = resMenu.data.data || resMenu.data;

        setFormData({
          restaurant: menu.restaurant?._id || menu.restaurant,
          name: menu.name,
          description: menu.description || "",
          price: menu.price,
          category: menu.category,
        });

        if (menu.image) {
          setPreviewUrl(menu.image.startsWith("http") ? menu.image : `http://localhost:4000${menu.image}`);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load menu item");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!formData.name || !formData.price) {
      setError("Name and Price are required");
      setIsLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append("restaurant", formData.restaurant);
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("price", formData.price);
      submitData.append("category", formData.category);

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      const res = await apiRequest.put(`/menu/${id}`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });

      if (res.data.success) {
        setSuccess("Menu item updated successfully!");
        toast.success("Menu item updated successfully!");

        setTimeout(() => navigate("/menu-items"), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update menu item");
      toast.error("Failed to update menu item");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading menu item...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
        <SideBar />

        <main className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Menu Item</h1>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Restaurant Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Restaurant *
                </label>
                <select
                  name="restaurant"
                  value={formData.restaurant}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Select Restaurant</option>
                  {restaurants.map((res) => (
                    <option key={res._id} value={res._id}>
                      {res.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                >
                  {menuCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 resize-y"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Image
                </label>
                {previewUrl && (
                  <div className="mb-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-48 h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isLoading ? "Updating Menu Item..." : "Update Menu Item"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}