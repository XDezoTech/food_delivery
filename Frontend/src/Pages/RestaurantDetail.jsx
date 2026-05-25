import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest, imgBaseURL } from "../Services/API";
import { toast } from "react-toastify";
import { useCart } from "../Context/CartContext";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshCart } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(null);
  const [activeTab, setActiveTab] = useState("menu");

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    fetchRestaurantData();
  }, [id]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      const [res, menuRes] = await Promise.all([
        apiRequest.get(`/restaurant/get/restaurant/${id}`),
        apiRequest.get(`/menu/restaurant/${id}`)
      ]);

      setRestaurant(res.data.data || res.data);
      setMenuItems(menuRes.data.data || []);
      setReviews(res.data.data?.reviews || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load restaurant details");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imgPath) => {
    if (!imgPath) return "https://picsum.photos/id/870/800/400";
    return imgPath.startsWith("http") ? imgPath : `${imgBaseURL}${imgPath}`;
  };

  const updateQuantity = (itemId, newQty) => {
    if (newQty < 1) return;
    setQuantities(prev => ({
      ...prev,
      [itemId]: newQty
    }));
  };

  const addToCart = async (item) => {
    const quantity = quantities[item._id] || 1;
    setAddingToCart(item._id);

    try {
      await apiRequest.post("/cart/add", {
        menuItemId: item._id,
        quantity: quantity
      });

      toast.success(`✅ ${quantity} × ${item.name} added to cart!`);
      refreshCart();
    } catch (err) {
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    try {
      const res = await apiRequest.post(`/restaurant/${id}/review`, reviewForm);
      toast.success("Thank you for your review!");
      setReviews(res.data.data.reviews);
      setReviewForm({ rating: 5, comment: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    }
  };

  const groupedMenu = menuItems.reduce((acc, item) => {
    const cat = item.category || "Other";
    acc[cat] = acc[cat] || [];
    acc[cat].push(item);
    return acc;
  }, {});

  const defaultPosition = [28.2096, 83.9856];

  const getMapPosition = () => {
    if (restaurant?.coordinates?.coordinates?.length === 2) {
      const [lng, lat] = restaurant.coordinates.coordinates;
      return [lat, lng];
    }
    return defaultPosition;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-2xl">Loading restaurant...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-80">
        <img src={getImageUrl(restaurant.image)} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 px-5 py-2 bg-white/90 hover:bg-white rounded-full">← Back</button>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-10 relative">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{restaurant.name}</h1>
              <p className="text-gray-600 mt-2 text-lg">{restaurant.cuisine}</p>
            </div>
            <div className="text-right">
              <div className="text-emerald-600 text-2xl font-bold">
                ⭐ {restaurant.averageRating ? restaurant.averageRating.toFixed(1) : restaurant.rating}
              </div>
              <div className="text-sm text-gray-500 mt-1">{restaurant.location}</div>
            </div>
          </div>

          <div className="flex border-b mt-10">
            <button onClick={() => setActiveTab("menu")} className={`px-8 py-4 font-semibold ${activeTab === "menu" ? "border-b-4 border-orange-600 text-orange-600" : "text-gray-600"}`}>Menu</button>
            <button onClick={() => setActiveTab("reviews")} className={`px-8 py-4 font-semibold ${activeTab === "reviews" ? "border-b-4 border-orange-600 text-orange-600" : "text-gray-600"}`}>Reviews ({reviews.length})</button>
            <button onClick={() => setActiveTab("location")} className={`px-8 py-4 font-semibold ${activeTab === "location" ? "border-b-4 border-orange-600 text-orange-600" : "text-gray-600"}`}>Location</button>
          </div>

          {activeTab === "menu" && (
            <div className="mt-10">
              {Object.keys(groupedMenu).map((category) => (
                <div key={category} className="mb-12">
                  <h3 className="text-2xl font-semibold mb-6 border-b pb-3">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {groupedMenu[category].map((item) => {
                      const qty = quantities[item._id] || 1;
                      return (
                        <div key={item._id} className="flex gap-5 bg-gray-50 p-5 rounded-2xl hover:bg-white transition-all">
                          <img src={getImageUrl(item.image)} alt={item.name} className="w-28 h-28 object-cover rounded-xl" />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold text-xl">{item.name}</h4>
                              <span className="font-bold text-orange-600">Rs. {item.price}</span>
                            </div>
                            {item.description && <p className="text-gray-600 mt-1 text-sm">{item.description}</p>}

                            <div className="flex items-center gap-4 mt-4">
                              <button onClick={() => updateQuantity(item._id, qty - 1)} className="w-9 h-9 border rounded-lg hover:bg-gray-100">-</button>
                              <span className="font-semibold w-8 text-center">{qty}</span>
                              <button onClick={() => updateQuantity(item._id, qty + 1)} className="w-9 h-9 border rounded-lg hover:bg-gray-100">+</button>
                            </div>

                            <button
                              onClick={() => addToCart(item)}
                              className="mt-4 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-medium transition"
                            >
                              Add {qty} to Cart
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="mt-10">
              <form onSubmit={submitReview} className="bg-gray-50 p-6 rounded-2xl mb-10">
                <h3 className="font-semibold text-xl mb-4">Write a Review</h3>
                <div className="flex gap-4 mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`text-3xl ${reviewForm.rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your experience..."
                  className="w-full p-4 border rounded-2xl"
                  rows={4}
                  required
                />
                <button type="submit" className="mt-4 px-8 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700">
                  Submit Review
                </button>
              </form>

              {reviews.length === 0 ? (
                <p className="text-center text-gray-500 py-10">No reviews yet. Be the first to review!</p>
              ) : (
                reviews.map((review, index) => (
                  <div key={index} className="border-b pb-6 mb-6">
                    <div className="flex justify-between">
                      <p className="font-semibold">{review.name}</p>
                      <div className="text-yellow-500">{"★".repeat(review.rating)}</div>
                    </div>
                    <p className="text-gray-600 mt-2">{review.comment}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "location" && (
            <div className="mt-8">
              <h3 className="text-2xl font-semibold mb-6">Restaurant Location</h3>
              <div className="h-[500px] rounded-2xl overflow-hidden border">
                <MapContainer center={getMapPosition()} zoom={16} style={{ height: "100%", width: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={getMapPosition()}>
                    <Popup>
                      <b>{restaurant.name}</b><br />
                      {restaurant.location}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

//   function updateQuantity(itemId, newQty) {
//     if (newQty < 1) return;
//     setQuantities(prev => ({
//       ...prev,
//       [itemId]: newQty
//     }));
//   }
 };

export default RestaurantDetail;