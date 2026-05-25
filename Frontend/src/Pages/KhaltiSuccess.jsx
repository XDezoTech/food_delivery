import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../Services/API";
import { toast } from "react-toastify";
import { useCart } from "../Context/CartContext";

const KhaltiSuccess = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [verifying, setVerifying] = useState(true);
	const [status, setStatus] = useState("verifying");
	const { refreshCart } = useCart();

	useEffect(() => {
		const verifyPayment = async () => {
			const pidx = searchParams.get("pidx");

			if (!pidx) {
				setStatus("error");
				toast.error("Payment verification failed: Missing payment ID");
				setVerifying(false);
				return;
			}

			try {
				// Get pending order from localStorage
				const pendingOrder = JSON.parse(
					localStorage.getItem("pendingKhaltiOrder"),
				);

				if (!pendingOrder) {
					throw new Error("Order data not found");
				}

				const res = await apiRequest.post("/khalti/verify", {
					pidx,
					pendingOrder,
				});

				if (res.data.success) {
					setStatus("success");
					localStorage.removeItem("pendingKhaltiOrder");
					toast.success("✅ Payment Successful! Order Placed.");

					setTimeout(() => {
						navigate("/myorders");
					}, 2500);
					refreshCart();
				} else {
					setStatus("error");
					toast.error(res.data.message || "Payment verification failed");
				}
			} catch (err) {
				console.error(err);
				setStatus("error");
				toast.error("Payment verification failed. Please contact support.");
			} finally {
				setVerifying(false);
			}
		};

		verifyPayment();
	}, [searchParams, navigate]);

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
			<div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center">
				{verifying ? (
					<>
						<div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
						<h2 className="text-2xl font-semibold mb-2">Verifying Payment</h2>
						<p className="text-gray-600">
							Please wait while we confirm your payment...
						</p>
					</>
				) : status === "success" ? (
					<>
						<div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">
							✓
						</div>
						<h2 className="text-3xl font-bold text-green-600 mb-3">
							Payment Successful!
						</h2>
						<p className="text-gray-600 mb-8">
							Your order has been placed successfully.
						</p>
						<button
							onClick={() => navigate("/myorders")}
							className="w-full py-4 bg-green-600 text-white rounded-2xl font-semibold hover:bg-green-700"
						>
							View My Orders
						</button>
					</>
				) : (
					<>
						<div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">
							✕
						</div>
						<h2 className="text-3xl font-bold text-red-600 mb-3">
							Payment Failed
						</h2>
						<p className="text-gray-600 mb-8">
							We couldn't verify your payment.
						</p>
						<button
							onClick={() => navigate("/checkout")}
							className="w-full py-4 bg-red-600 text-white rounded-2xl font-semibold hover:bg-red-700"
						>
							Try Again
						</button>
					</>
				)}
			</div>
		</div>
	);
};

export default KhaltiSuccess;
