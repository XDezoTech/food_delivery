import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../Services/API";
import Sidebar from "../Components/Sidebar";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const EditRestaurant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    cuisine: "",
    rating: "",
    deliveryTime: "",
    location: "",
    popular: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [position, setPosition] = useState([28.2096, 83.9856]); // Default Pokhara

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      const res = await apiRequest.get(`/restaurant/get/restaurant/${id}`);
      const data = res.data.data || res.data;

      setFormData({
        name: data.name,
        cuisine: data.cuisine,
        rating: data.rating,
        deliveryTime: data.deliveryTime,
        location: data.location,
        popular: data.popular || "",
      });

      if (data.coordinates?.coordinates) {
        const [lng, lat] = data.coordinates.coordinates;
        setPosition([lat, lng]);
      }

      if (data.image) {
        setPreview(data.image.startsWith("http") ? data.image : `http://localhost:4000${data.image}`);
      }
    } catch (err) {
      alert("Failed to load restaurant");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      },
    });
    return <Marker position={position} />;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("cuisine", formData.cuisine);
    data.append("rating", formData.rating);
    data.append("deliveryTime", formData.deliveryTime);
    data.append("location", formData.location);
    data.append("popular", formData.popular);

    if (image) data.append("image", image);

    data.append("coordinates", JSON.stringify({
      type: "Point",
      coordinates: [position[1], position[0]] // [lng, lat]
    }));

    try {
      await apiRequest.put(`/restaurant/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Restaurant updated successfully!");
      navigate("/admin/restaurants");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update restaurant");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
        <Sidebar />

        <main className="p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-3xl font-bold mb-8">Edit Restaurant</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Restaurant Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-5 py-3 border border-gray-300 rounded-2xl focus:border-orange-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cuisine *</label>
                  <input type="text" name="cuisine" value={formData.cuisine} onChange={handleChange} required className="w-full px-5 py-3 border border-gray-300 rounded-2xl focus:border-orange-500" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <input type="number" name="rating" value={formData.rating} onChange={handleChange} step="0.1" max="5" className="w-full px-5 py-3 border border-gray-300 rounded-2xl focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Delivery Time *</label>
                    <input type="text" name="deliveryTime" value={formData.deliveryTime} onChange={handleChange} required className="w-full px-5 py-3 border border-gray-300 rounded-2xl focus:border-orange-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location Name *</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full px-5 py-3 border border-gray-300 rounded-2xl focus:border-orange-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Popular Items</label>
                  <input type="text" name="popular" value={formData.popular} onChange={handleChange} className="w-full px-5 py-3 border border-gray-300 rounded-2xl focus:border-orange-500" />
                </div>

                {/* Map */}
                <div>
                  <label className="block text-sm font-medium mb-3">Select Location on Map</label>
                  <div className="h-80 rounded-2xl overflow-hidden border">
                    <MapContainer center={position} zoom={15} style={{ height: "100%", width: "100%" }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={position} />
                      <LocationMarker setPosition={setPosition} />
                    </MapContainer>
                  </div>
                </div>

                {/* Image */}
                <div>
                  <label className="block text-sm font-medium mb-2">Restaurant Image</label>
                  {preview && <img src={preview} alt="preview" className="w-full h-64 object-cover rounded-2xl mb-4" />}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-5 py-3 border border-gray-300 rounded-2xl" />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-2xl text-lg font-semibold text-white ${loading ? "bg-gray-400" : "bg-orange-600 hover:bg-orange-700"}`}
                >
                  {loading ? "Updating..." : "Update Restaurant"}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

function LocationMarker({ setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default EditRestaurant;