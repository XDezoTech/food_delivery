import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, imgBaseURL } from "../Services/API";
import { toast } from "react-toastify";
import { useCart } from "../Context/CartContext";
import { AuthContext } from "../Context/AuthContext";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { refreshCart } = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    try {
      setLoading(true);
      const res = await apiRequest.get("/cart");
      const items = res.data.cart || res.data.items || [];
      setCartItems(items);

      const sum = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      setTotal(sum);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (menuItemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await apiRequest.put("/cart/update", { menuItemId, quantity: newQuantity });
     
      setCartItems((prev) =>
				prev.map((item) =>
					item.menuItemId === menuItemId
						? { ...item, quantity: newQuantity }
						: item,
				),
			);

			setTotal(
				(prev) =>
					prev +
					(newQuantity -
						cartItems.find((i) => i.menuItemId === menuItemId).quantity) *
						cartItems.find((i) => i.menuItemId === menuItemId).price,
			);
      refreshCart();
      toast.success("Quantity updated");
    } catch (err) {
      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (menuItemId) => {
    try {
      await apiRequest.delete(`/cart/remove/${menuItemId}`);
      refreshCart();
      toast.success("Item removed");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading cart...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-6">🛒</p>
            <h2 className="text-2xl">Your cart is empty</h2>
            <button onClick={() => navigate("/restaurants")} className="mt-6 px-8 py-3 bg-orange-600 text-white rounded-xl">
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {cartItems.map((item) => (
                <div key={item.menuItemId} className="bg-white p-6 rounded-2xl shadow-sm mb-4 flex gap-6">
                  <img
                    src={item.image ? `${imgBaseURL}${item.image}` : "https://picsum.photos/id/1080/300/200"}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-xl"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl">{item.name}</h3>
                    <p className="text-gray-600">{item.restaurantName}</p>
                    <p className="text-orange-600 font-bold mt-1">Rs. {item.price}</p>

                    <div className="flex items-center gap-4 mt-4">
                      <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="w-9 h-9 border rounded-lg">-</button>
                      <span className="font-semibold w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="w-9 h-9 border rounded-lg">+</button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl">Rs. {(item.price * item.quantity)}</p>
                    <button onClick={() => removeItem(item.menuItemId)} className="text-red-600 mt-6 text-sm">Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-3xl sticky top-8">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                <div className="flex justify-between text-lg mb-4">
                  <span>Subtotal</span>
                  <span>Rs. {total}</span>
                </div>
                <div className="flex justify-between text-lg mb-6">
                  <span>Delivery Fee</span>
                  <span className="text-green-600">Calculated at checkout</span>
                </div>
                <div className="border-t pt-6 flex justify-between text-2xl font-bold">
                  <span>Total</span>
                  <span>Rs. {total}</span>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full mt-10 py-4 bg-orange-600 text-white rounded-2xl font-semibold text-lg hover:bg-orange-700"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;