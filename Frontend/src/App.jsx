import React from "react";
import { ToastContainer } from "react-toastify";
import Home from "./Pages/Home";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Route, Routes } from "react-router-dom";
import Login from "./Pages/Login";
import Navbar from "./Components/Navbar";
import EditProfile from "./Pages/Profile";
import RestaurantList from "./Pages/RestaurantList";
import RestaurantDetail from "./Pages/RestaurantDetail";
import Cart from "./Pages/Cart";
import Checkout from "./Pages/CheckOut";
import Order from "./Pages/Order";
import AddRestaurant from "./Pages/AddRestaurant";
import MenuItemsList from "./Pages/MenuItemList";
import AddMenuItem from "./Pages/AddMenuItem";
import SignUp from "./Pages/SignUp";
import AdminDashboard from "./Pages/AdminDashboard";
import MainLayout from "./Components/MainLayout";
import AdminLayout from "./Components/AdminLayout";
import MyOrders from "./Pages/MyOrders";
import AdminOrders from "./Pages/AdminOrders";
import AdminRestaurants from "./Pages/AdminRestaurants";
import KhaltiSuccess from "./Pages/KhaltiSuccess";
import EditRestaurant from "./Pages/EditRestaurant";
import EditMenuItem from "./Pages/EditMenuItem";
import About from "./Pages/About";
import Contact from "./Pages/Contact";

const App = () => {
	const GoogleAuthWrapper = () => {
		return (
			<GoogleOAuthProvider clientId="845839277034-ntjf56hk9g1gskf7ihhps2jlta5gdes9.apps.googleusercontent.com">
				<Login></Login>
			</GoogleOAuthProvider>
		);
	};

	return (
		<div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
			<ToastContainer />
			<Routes>
				<Route element={<MainLayout />}>
					<Route path="/" element={<Home />} />
					<Route path="/editprofile" element={<EditProfile />} />
					<Route path="/restaurantList" element={<RestaurantList />} />
					<Route path="/restaurantDetail/:id" element={<RestaurantDetail />} />
					<Route path="/cart" element={<Cart />} />
					<Route path="/checkout" element={<Checkout />} />
					<Route path="/myorders" element={<MyOrders />} />
					<Route path="/order" element={<Order />} />
					<Route path="/khalti-success" element={<KhaltiSuccess />} />
					<Route path="/about" element={<About />} />
					<Route path="/contact" element={<Contact />} />

					<Route path="/login" element={<GoogleAuthWrapper />} />
					<Route path="/signup" element={<SignUp />} />
				</Route>
				<Route element={<AdminLayout />}>
					<Route path="/admindashboard" element={<AdminDashboard />} />
					<Route path="/adminRestaurants" element={<AdminRestaurants />} />
					<Route path="/addRestaurant" element={<AddRestaurant />} />
					<Route path="/editRestaurant/:id" element={<EditRestaurant />} />
					<Route path="/menu-items" element={<MenuItemsList />} />
					<Route path="/editMenuItem/:id" element={<EditMenuItem />} />
					<Route path="/add-menu-item" element={<AddMenuItem />} />
					<Route path="/adminorders" element={<AdminOrders />} />
				</Route>
			</Routes>
		</div>
	);
};

export default App;
