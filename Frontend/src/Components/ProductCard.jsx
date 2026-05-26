import React from "react";
import { imgBaseURL } from "../Services/API";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ restaurant }) => {
  const navigate = useNavigate();

  // Safety check for ID
  const restaurantId = restaurant?._id || restaurant?.id;

  const getImageUrl = () => {
    if (restaurant?.image) {
      return restaurant.image.startsWith("http")
        ? restaurant.image
        : `${imgBaseURL}${restaurant.image}`;
    }
    return "https://picsum.photos/id/870/600/400";
  };

  const handleClick = () => {
    if (!restaurantId) {
      console.error("Missing restaurant ID:", restaurant);
      alert("Error: Restaurant ID is missing. Please refresh the page.");
      return;
    }
    navigate(`/restaurantDetail/${restaurantId}`);
  };

  // Debug logs (remove these after testing)
  console.log("Restaurant Data:", restaurant);
  console.log("Used ID:", restaurantId);

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative h-80 overflow-hidden bg-gray-100">
        <img
          src={getImageUrl()}
          alt={restaurant?.name || "Restaurant"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://picsum.photos/id/870/600/400";
          }}
        />

        <div className="absolute top-4 right-4 bg-white px-4 py-1 rounded-full font-semibold shadow text-sm">
          ⭐ {restaurant?.rating || "N/A"}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {restaurant?.name || "Unnamed Restaurant"}
        </h3>
        <p className="text-gray-600 mb-1">{restaurant?.cuisine || "No cuisine info"}</p>
        <p className="text-sm text-gray-500 mb-4">{restaurant?.location || ""}</p>

        <div className="flex justify-between items-center text-sm">
          <span>🚀 {restaurant?.deliveryTime || "30-40 min"}</span>
          {restaurant?.popular && (
            <span className="text-gray-500 text-xs">
              Popular: {restaurant.popular}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;