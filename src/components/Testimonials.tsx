
const Testimonials = () => {
  const testimonials = [
    {
      name: "Anita Sharma",
      role: "Homeowner",
      location: "Bangalore, Karnataka", 
      rating: 5,
      quote: "I got 5 different quotes for my kitchen renovation within 2 days! The contractors were professional and the whole process was transparent. Highly recommended!",
      image: "👩‍💼"
    },
    {
      name: "Ramesh Patel",
      role: "Civil Contractor",
      location: "Ahmedabad, Gujarat",
      rating: 5, 
      quote: "NirmaanBazaar helped me find consistent work. The quality of customers is excellent and payments are on time. My business has grown 40% since joining!",
      image: "👨‍🔧"
    },
    {
      name: "Dr. Kavita Reddy",
      role: "Clinic Owner", 
      location: "Hyderabad, Telangana",
      rating: 5,
      quote: "Setting up my new clinic was stress-free thanks to this platform. I found an excellent electrical contractor who completed the work on budget and on time.",
      image: "👩‍⚕️"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from customers and contractors who have successfully connected through NirmaanBazaar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-4 mb-6">
                <div className="text-4xl">{testimonial.image}</div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-blue-600 text-sm font-medium">
                    {testimonial.role}
                  </p>
                  <p className="text-gray-500 text-sm">
                    📍 {testimonial.location}
                  </p>
                </div>
              </div>
              
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, starIndex) => (
                  <span key={starIndex} className="text-yellow-500 text-xl">⭐</span>
                ))}
              </div>
              
              <blockquote className="text-gray-700 italic leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
            </div>
          ))}
        </div>

        {/* Overall Stats */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">4.8/5</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-gray-600">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">5000+</div>
              <div className="text-gray-600">Successful Projects</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">48hrs</div>
              <div className="text-gray-600">Average Response Time</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
