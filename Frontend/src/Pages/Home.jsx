import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, imgBaseURL } from "../Services/API";

const Home = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch restaurants from database
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const res = await apiRequest.get("/restaurant/get/restaurant");
        const data = res.data.data || res.data;
        setRestaurants(data);
        setFilteredRestaurants(data);
      } catch (err) {
        console.error("Failed to fetch restaurants:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Handle Search
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (!term) {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter((restaurant) =>
        restaurant.name?.toLowerCase().includes(term) ||
        restaurant.cuisine?.toLowerCase().includes(term) ||
        restaurant.location?.toLowerCase().includes(term)
      );
      setFilteredRestaurants(filtered);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return "https://picsum.photos/id/870/600/400";
    return image.startsWith("http") ? image : `${imgBaseURL}${image}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Search Bar */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 py-16 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">Find Delicious Food Near You</h1>
          <p className="text-xl mb-8 opacity-90">Order from the best restaurants in Pokhara</p>

          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search restaurants, cuisines, or dishes..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-8 py-5 rounded-3xl text-lg text-gray-900 focus:outline-none shadow-xl"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-orange-600 hover:bg-orange-700 text-white px-10 py-3.5 rounded-3xl font-semibold transition">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Restaurants Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {searchTerm ? "Search Results" : "Featured Restaurants"}
          </h2>
          <p className="text-gray-600">
            {filteredRestaurants.length} restaurants found
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-xl">Loading restaurants...</div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">No restaurants found 😕</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant._id || restaurant.id}
                onClick={() => navigate(`/restaurantDetail/${restaurant._id || restaurant.id}`)}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
              >
                <div className="relative">
                  <img
                    src={getImageUrl(restaurant.image)}
                    alt={restaurant.name}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = "https://picsum.photos/id/870/600/400";
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold shadow flex items-center gap-1">
                    ⭐ {restaurant.averageRating}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-1">
                    {restaurant.name}
                  </h3>
                  <p className="text-gray-600">{restaurant.cuisine}</p>

                  <div className="flex items-center justify-between mt-4 text-sm">
                    <div className="flex items-center gap-1 text-emerald-600">
                      <span>🚀</span>
                      <span>{restaurant.deliveryTime || "30-40 min"}</span>
                    </div>
                    <div className="text-gray-500">{restaurant.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;