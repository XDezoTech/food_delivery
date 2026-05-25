import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">About Foodie Dash</h1>
          <p className="text-2xl text-gray-600">Your favorite food, delivered fast in Pokhara</p>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700">
          <p className="text-xl leading-relaxed">
            Foodie Dash is Pokhara's premier food delivery platform, connecting hungry customers with the best local restaurants. 
            We are passionate about bringing delicious meals straight to your doorstep with speed and care.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16">
            <div className="text-center">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="font-semibold text-xl mb-2">Fast Delivery</h3>
              <p>30-40 minutes average delivery time across Pokhara</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🍽️</div>
              <h3 className="font-semibold text-xl mb-2">Best Restaurants</h3>
              <p>Curated selection of top-rated local eateries</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">❤️</div>
              <h3 className="font-semibold text-xl mb-2">Customer First</h3>
              <p>100% satisfaction guaranteed with every order</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-16 mb-6">Our Mission</h2>
          <p className="text-lg">
            To make great food accessible to everyone in Pokhara by connecting customers with their favorite restaurants 
            through a seamless and reliable delivery experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;