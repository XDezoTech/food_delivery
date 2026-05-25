import React, { useContext, useState } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../Services/API";

const EditProfile = () => {
	const { updateUser, currentUser } = useContext(AuthContext);
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		username: currentUser?.username || "",
	});

	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleChange = (e) => {
		setFormData({
			...formData,
			username: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			const res = await apiRequest.put(
				`/user/edit/${currentUser._id}`,
				formData
			);

			updateUser(res.data.data);
			navigate("/");
		} catch (error) {
			setError(error.response?.data?.msg || "Something went wrong");
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	// Show current avatar or fallback
	const avatarUrl = currentUser?.avatar || 
		"https://via.placeholder.com/120?text=" + (currentUser?.username?.[0] || "?");

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
				
				{/* Profile Header / Preview */}
				<div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-10 text-white">
					<div className="flex flex-col items-center">
						<div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/30 shadow-lg mb-4">
							<img
								src={avatarUrl}
								alt="Profile"
								className="w-full h-full object-cover"
								onError={(e) => {
									e.target.src = "https://via.placeholder.com/120?text=👤";
								}}
							/>
						</div>
						
						<h1 className="text-2xl font-semibold tracking-tight">
							{currentUser?.username}
						</h1>
						<p className="text-indigo-100 mt-1">{currentUser?.email}</p>
					</div>
				</div>

				{/* Edit Form */}
				<div className="p-8">
					<div className="text-center mb-8">
						<h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
						<p className="text-gray-500 mt-1">Update your username</p>
					</div>

					{error && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label
								htmlFor="username"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Username
							</label>
							<input
								id="username"
								type="text"
								name="username"
								value={formData.username}
								onChange={handleChange}
								className="block w-full px-5 py-3.5 rounded-2xl border border-gray-300 
                           focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 
                           outline-none transition-all text-lg"
								placeholder="Enter new username"
								required
							/>
						</div>

						{/* Info: Email and Avatar are not editable */}
						<div className="pt-4 border-t border-gray-100">
							<p className="text-xs text-gray-500 mb-3">Other information (cannot be changed here)</p>
							
							<div className="space-y-3 text-sm">
								<div className="flex justify-between bg-gray-50 px-4 py-3 rounded-xl">
									<span className="text-gray-500">Email</span>
									<span className="font-medium text-gray-700">{currentUser?.email}</span>
								</div>
								<div className="flex justify-between bg-gray-50 px-4 py-3 rounded-xl">
									<span className="text-gray-500">Avatar URL</span>
									<span className="font-medium text-gray-700 truncate max-w-[200px]">
										{currentUser?.avatar || "Not set"}
									</span>
								</div>
							</div>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-200 
								${isLoading 
									? "bg-gray-400 cursor-not-allowed" 
									: "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-lg shadow-indigo-200"
								}`}
						>
							{isLoading ? "Updating Username..." : "Save Changes"}
						</button>

						<button
							type="button"
							onClick={() => navigate("/")}
							className="w-full py-3 text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium"
						>
							Cancel
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default EditProfile;