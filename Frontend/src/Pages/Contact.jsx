import React from "react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-600">We'd love to hear from you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="bg-white rounded-3xl p-10 shadow">
            <h2 className="text-3xl font-semibold mb-8">Foodie Dash</h2>

            <div className="space-y-8">
              <div>
                <p className="text-gray-500 text-sm mb-1">📍 ADDRESS</p>
                <p className="text-lg font-medium">Mahendrapool, Pokhara, Nepal</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm mb-1">📞 PHONE</p>
                <p className="text-lg font-medium">9800000000</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm mb-1">✉️ EMAIL</p>
                <p className="text-lg font-medium">hello@foodiedash.com.np</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm mb-1">🕒 WORKING HOURS</p>
                <p className="text-lg font-medium">10:00 AM - 10:00 PM (Everyday)</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-3xl p-10 shadow">
            <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>

            <form className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <textarea
                  placeholder="Your Message"
                  rows={6}
                  className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:border-orange-500 outline-none resize-y"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-2xl transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;