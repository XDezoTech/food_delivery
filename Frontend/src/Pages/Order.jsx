import React from "react";

const Order = () => {
  const orders = [
    { id: "FH-78492", date: "Mar 20, 2026", total: 980, status: "Delivered" },
    { id: "FH-78491", date: "Mar 18, 2026", total: 650, status: "Delivered" },
    { id: "FH-78490", date: "Mar 15, 2026", total: 1250, status: "Delivered" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-10">Order History</h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-8 rounded-3xl shadow flex justify-between items-center">
              <div>
                <p className="font-semibold text-xl">Order #{order.id}</p>
                <p className="text-gray-500">{order.date}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">Rs {order.total}</p>
                <p className="text-green-600 font-medium">{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Order;