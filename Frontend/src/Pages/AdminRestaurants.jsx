import { useEffect, useState } from "react";
import { apiRequest, imgBaseURL } from "../Services/API";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import SideBar from "../Components/Sidebar";

const AdminRestaurants = () => {
	const [restaurants, setRestaurants] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [deletingId, setDeletingId] = useState(null);

	const navigate = useNavigate();
	const { isLoggedIn, isAdmin, loading: authLoading } = useAuth();

	useEffect(() => {
		if (authLoading) return;
		if (!isLoggedIn || !isAdmin) {
			toast.error("Admin access required");
			navigate("/");
			return;
		}
		fetchRestaurants();
	}, [isLoggedIn, isAdmin, authLoading, navigate]);

	const fetchRestaurants = async () => {
		try {
			setLoading(true);
			const res = await apiRequest.get("/restaurant/get/restaurant");
			setRestaurants(res.data.data || res.data);
		} catch (err) {
			console.error(err);
			toast.error("Failed to load restaurants");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id, name) => {
		if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

		setDeletingId(id);
		try {
			await apiRequest.delete(`/restaurant/${id}`);
			toast.success("Restaurant deleted successfully");
			fetchRestaurants();
		} catch (err) {
			toast.error("Failed to delete restaurant");
		} finally {
			setDeletingId(null);
		}
	};

	const getImageUrl = (image) => {
		if (!image) return "https://picsum.photos/id/870/600/400";
		return image.startsWith("http") ? image : `${imgBaseURL}${image}`;
	};

	const filteredRestaurants = restaurants.filter(
		(res) =>
			res.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			res.cuisine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			res.location?.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	return (
		<div className="min-h-screen bg-gray-100">
			<div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
				<SideBar />

				<main className="p-6 md:p-8">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
						<h1 className="text-3xl font-bold text-gray-900">
							All Restaurants
						</h1>

						<div className="flex gap-4 w-full md:w-auto">
							<input
								type="text"
								placeholder="Search restaurants..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="px-5 py-3 border border-gray-300 rounded-2xl focus:border-orange-500 w-full md:w-80"
							/>
							<button
								onClick={() => navigate("/admin/add-restaurant")}
								className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-medium transition"
							>
								+ Add Restaurant
							</button>
						</div>
					</div>

					{loading ? (
						<div className="text-center py-20 text-xl">
							Loading restaurants...
						</div>
					) : (
						<div className="bg-white rounded-2xl shadow overflow-hidden">
							<table className="w-full">
								<thead className="bg-gray-50 border-b">
									<tr>
										<th className="px-6 py-5 text-left">Restaurant</th>
										<th className="px-6 py-5 text-left">Cuisine</th>
										<th className="px-6 py-5 text-left">Location</th>
										<th className="px-6 py-5 text-center">Rating</th>
										<th className="px-6 py-5 text-center">Delivery Time</th>
										<th className="px-6 py-5 text-center">Actions</th>
									</tr>
								</thead>
								<tbody>
									{filteredRestaurants.length === 0 ? (
										<tr>
											<td
												colSpan="6"
												className="text-center py-12 text-gray-500"
											>
												No restaurants found
											</td>
										</tr>
									) : (
										filteredRestaurants.map((restaurant) => (
											<tr
												key={restaurant._id}
												className="border-b hover:bg-gray-50"
											>
												<td className="px-6 py-5">
													<div className="flex items-center gap-4">
														<img
															src={getImageUrl(restaurant.image)}
															alt={restaurant.name}
															className="w-14 h-14 object-cover rounded-xl"
															onError={(e) =>
																(e.target.src =
																	"https://picsum.photos/id/870/600/400")
															}
														/>
														<div>
															<p className="font-semibold text-lg">
																{restaurant.name}
															</p>
														</div>
													</div>
												</td>
												<td className="px-6 py-5 text-gray-700">
													{restaurant.cuisine}
												</td>
												<td className="px-6 py-5 text-gray-600">
													{restaurant.location}
												</td>
												<td className="px-6 py-5 text-center font-semibold">
													⭐ {restaurant.rating || "N/A"}
												</td>
												<td className="px-6 py-5 text-center">
													{restaurant.deliveryTime}
												</td>
												<td className="px-6 py-5 text-center space-x-4">
													<button
														onClick={() =>
															navigate(`/editRestaurant/${restaurant._id}`)
														}
														className="text-blue-600 hover:text-blue-800 font-medium"
													>
														Edit
													</button>
													<button
														onClick={() =>
															handleDelete(restaurant._id, restaurant.name)
														}
														disabled={deletingId === restaurant._id}
														className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
													>
														{deletingId === restaurant._id
															? "Deleting..."
															: "Delete"}
													</button>
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					)}
				</main>
			</div>
		</div>
	);
};

export default AdminRestaurants;
