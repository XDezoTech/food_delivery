import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, imgBaseURL } from "../Services/API";
import { toast } from "react-toastify";

const RestaurantList = () => {
	const navigate = useNavigate();

	const [restaurants, setRestaurants] = useState([]);
	const [filteredRestaurants, setFilteredRestaurants] = useState([]);
	const [loading, setLoading] = useState(true);

	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCuisine, setSelectedCuisine] = useState("All");
	const [minRating, setMinRating] = useState(0);
	const [sortBy, setSortBy] = useState("recommended");

	useEffect(() => {
		fetchRestaurants();
	}, []);

	const fetchRestaurants = async () => {
		try {
			setLoading(true);
			const res = await apiRequest.get("/restaurant/get/restaurant");
			const data = res.data.data || res.data || [];

			console.log("📊 Full Data Received:", data); // Debug

			setRestaurants(data);
			setFilteredRestaurants(data);
		} catch (err) {
			console.error(err);
			toast.error("Failed to load restaurants");
		} finally {
			setLoading(false);
		}
	};

	const getImageUrl = (image) => {
		if (!image) return "https://picsum.photos/id/870/600/400";
		return image.startsWith("http") ? image : `${imgBaseURL}${image}`;
	};

	// Force priority to averageRating
	const getDisplayRating = (res) => {
		if (res.averageRating !== undefined && res.averageRating !== null) {
			return Number(res.averageRating);
		}
		if (res.rating !== undefined && res.rating !== null) {
			return Number(res.rating);
		}
		return 0;
	};

	useEffect(() => {
		let result = [...restaurants];

		if (searchTerm.trim()) {
			const term = searchTerm.toLowerCase();
			result = result.filter(
				(r) =>
					(r.name || "").toLowerCase().includes(term) ||
					(r.cuisine || "").toLowerCase().includes(term) ||
					(r.location || "").toLowerCase().includes(term),
			);
		}

		if (selectedCuisine !== "All") {
			result = result.filter((r) => r.cuisine === selectedCuisine);
		}

		if (minRating > 0) {
			result = result.filter((r) => getDisplayRating(r) >= minRating);
		}

		if (sortBy === "rating") {
			result.sort((a, b) => getDisplayRating(b) - getDisplayRating(a));
		} else if (sortBy === "delivery") {
			result.sort((a, b) => {
				const timeA = parseInt(a.deliveryTime) || 999;
				const timeB = parseInt(b.deliveryTime) || 999;
				return timeA - timeB;
			});
		}

		setFilteredRestaurants(result);
	}, [searchTerm, selectedCuisine, minRating, sortBy, restaurants]);

	const cuisines = [
		"All",
		...new Set(restaurants.map((r) => r.cuisine).filter(Boolean)),
	];

	return (
		<div className="min-h-screen bg-gray-50 py-10">
			<div className="max-w-7xl mx-auto px-6">
				<h1 className="text-5xl font-bold text-gray-900 mb-10">
					Restaurants in Pokhara
				</h1>

				<div className="bg-white p-6 rounded-3xl shadow mb-10">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
						<div className="md:col-span-2">
							<input
								type="text"
								placeholder="Search restaurants or cuisines..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full px-6 py-4 text-lg border border-gray-300 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
							/>
						</div>

						<select
							value={selectedCuisine}
							onChange={(e) => setSelectedCuisine(e.target.value)}
							className="px-6 py-4 border border-gray-300 rounded-2xl focus:border-orange-500 outline-none"
						>
							{cuisines.map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>

						<select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value)}
							className="px-6 py-4 border border-gray-300 rounded-2xl focus:border-orange-500 outline-none"
						>
							<option value="recommended">Recommended</option>
							<option value="rating">Highest Rated</option>
							<option value="delivery">Fastest Delivery</option>
						</select>
					</div>
				</div>

				{loading ? (
					<div className="text-center py-20 text-2xl">
						Loading restaurants...
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{filteredRestaurants.map((restaurant) => {
							const rating = getDisplayRating(restaurant);
							return (
								<div
									key={restaurant._id}
									onClick={() => navigate(`/restaurantDetail/${restaurant._id}`)}
									className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
								>
									<div className="relative h-64">
										<img
											src={getImageUrl(restaurant.image)}
											alt={restaurant.name}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
											onError={(e) =>
												(e.target.src = "https://picsum.photos/id/870/600/400")
											}
										/>
										<div className="absolute top-4 right-4 bg-white px-4 py-1.5 rounded-full font-bold shadow flex items-center gap-1">
											⭐ {rating.toFixed(1)}
										</div>
									</div>

									<div className="p-6">
										<h3 className="text-2xl font-semibold text-gray-900 mb-1">
											{restaurant.name}
										</h3>
										<p className="text-gray-600 mb-3">{restaurant.cuisine}</p>

										<div className="flex items-center justify-between text-sm">
											<div className="flex items-center gap-1 text-emerald-600">
												🚀 {restaurant.deliveryTime || "30-40 min"}
											</div>
											<div className="text-gray-500">{restaurant.location}</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export default RestaurantList;
