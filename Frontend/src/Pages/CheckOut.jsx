import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../Services/API";
import { toast } from "react-toastify";
import { useCart } from "../Context/CartContext";
import { AuthContext } from "../Context/AuthContext";

const Checkout = () => {
	const navigate = useNavigate();
	const { currentUser } = useContext(AuthContext);
	const { refreshCart } = useCart();

	const [cartItems, setCartItems] = useState([]);
	const [loading, setLoading] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);

	const [formData, setFormData] = useState({
		fullName: "",
		phone: "",
		address: "",
		instructions: "",
	});

	const [paymentMethod, setPaymentMethod] = useState("cod");

	useEffect(() => {
		fetchCart();
	}, []);

	const fetchCart = async () => {
		try {
			const res = await apiRequest.get("/cart");
			setCartItems(res.data.cart || []);
		} catch (err) {
			toast.error("Failed to load cart");
		}
	};

	const subtotal = cartItems.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	);
	const deliveryFee = 60;
	const total = subtotal + deliveryFee;

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handlePlaceOrder = async () => {
		if (!formData.fullName || !formData.phone || !formData.address) {
			toast.error("Please fill all required fields");
			return;
		}

		setLoading(true);

		try {
			const orderData = {
				items: cartItems.map((item) => ({
					menuItemId: item.menuItemId,
					name: item.name,
					price: item.price,
					quantity: item.quantity,
					image: item.image,
				})),
				shippingDetails: {
					fullName: formData.fullName,
					phone: formData.phone,
          email: formData.email,
					address: formData.address,
					instructions: formData.instructions,
				},
				paymentMethod,
				totalAmount: total,
			};

			const res = await apiRequest.post("/order/create", orderData);

			if (res.data.success) {
				toast.success("✅ Order placed successfully!");
				await apiRequest.delete("/cart/clear");
				refreshCart();
				setTimeout(() => navigate("/myorders"), 1500);
			}
		} catch (err) {
			toast.error(err.response?.data?.message || "Failed to place order");
		} finally {
			setLoading(false);
		}
	};

	// Khalti Payment
	const handleKhaltiPayment = async () => {
		if (!formData.fullName || !formData.phone || !formData.address) {
			toast.error("Please fill all required fields");
			return;
		}

		setIsProcessing(true);

		try {
			const res = await apiRequest.post("/khalti/initiate", {
				amount: total,
				shippingDetails: formData,
			});

			if (res.data.success) {
				// Store pending order data
				localStorage.setItem(
					"pendingKhaltiOrder",
					JSON.stringify({
						cartItems,
						shippingDetails: formData,
						totalAmount: total,
						userId: currentUser._id,
					}),
				);

				window.location.href = res.data.paymentUrl;
			}
		} catch (error) {
			toast.error("Failed to initiate Khalti payment");
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-4xl font-bold text-center mb-10">Checkout</h1>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
					{/* Shipping Form */}
					<div className="bg-white rounded-3xl p-8 shadow">
						<h2 className="text-2xl font-bold mb-8">Delivery Information</h2>

						<div className="space-y-6">
							<input
								type="text"
								name="fullName"
								placeholder="Full Name *"
								value={formData.fullName}
								onChange={handleChange}
								className="w-full px-6 py-4 border rounded-2xl focus:border-orange-500"
								required
							/>

							<input
								type="tel"
								name="phone"
								placeholder="Phone Number *"
								value={formData.phone}
								onChange={handleChange}
								className="w-full px-6 py-4 border rounded-2xl focus:border-orange-500"
								required
							/>
							<input
								type="email"
								name="email"
								placeholder="Email Address *"
								value={formData.email}
								onChange={handleChange}
								className="w-full px-6 py-4 border rounded-2xl"
							/>

							<input
								type="text"
								name="address"
								placeholder="Delivery Address *"
								value={formData.address}
								onChange={handleChange}
								className="w-full px-6 py-4 border rounded-2xl focus:border-orange-500"
								required
							/>

							<textarea
								name="instructions"
								placeholder="Any special instructions? (Optional)"
								value={formData.instructions}
								onChange={handleChange}
								rows={4}
								className="w-full px-6 py-4 border rounded-2xl focus:border-orange-500 resize-y"
							/>
						</div>
					</div>

					{/* Order Summary */}
					<div className="bg-white rounded-3xl p-8 shadow h-fit sticky top-8">
						<h2 className="text-2xl font-bold mb-6">Order Summary</h2>

						<div className="space-y-4 max-h-72 overflow-auto mb-8">
							{cartItems.map((item) => (
								<div key={item.menuItemId} className="flex justify-between">
									<div>
										<p>{item.name}</p>
										<p className="text-sm text-gray-500">
											Qty: {item.quantity}
										</p>
									</div>
									<p className="font-medium">
										Rs. {item.price * item.quantity}
									</p>
								</div>
							))}
						</div>

						<div className="border-t pt-6 space-y-3">
							<div className="flex justify-between text-lg">
								<span>Subtotal</span>
								<span>Rs. {subtotal}</span>
							</div>
							<div className="flex justify-between text-lg">
								<span>Delivery Fee</span>
								<span>Rs. {deliveryFee}</span>
							</div>
							<div className="flex justify-between text-2xl font-bold border-t pt-4">
								<span>Total</span>
								<span>Rs. {total}</span>
							</div>
						</div>

						{/* Payment Options */}
						<div className="mt-10">
							<h3 className="text-xl font-semibold mb-4">Payment Method</h3>
							<div className="space-y-3">
								<button
									onClick={() => setPaymentMethod("cod")}
									className={`w-full py-4 rounded-2xl border-2 ${paymentMethod === "cod" ? "border-orange-600 bg-orange-50" : "border-gray-200"}`}
								>
									Cash on Delivery
								</button>

								<button
									onClick={() => setPaymentMethod("khalti")}
									className={`w-full py-4 rounded-2xl border-2 ${paymentMethod === "khalti" ? "border-purple-600 bg-purple-50" : "border-gray-200"}`}
								>
									Pay with Khalti
								</button>
							</div>
						</div>

						<button
							onClick={
								paymentMethod === "khalti"
									? handleKhaltiPayment
									: handlePlaceOrder
							}
							disabled={loading || isProcessing}
							className="w-full mt-10 py-5 bg-orange-600 hover:bg-orange-700 text-white text-xl font-semibold rounded-2xl disabled:opacity-70"
						>
							{loading || isProcessing
								? "Processing..."
								: paymentMethod === "khalti"
									? `Pay Rs. ${total} with Khalti`
									: `Place Order - Rs. ${total}`}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Checkout;
