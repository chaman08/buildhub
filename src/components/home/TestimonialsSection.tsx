
// Testimonials section for the homepage

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  avatarUrl: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Homeowner',
    content: 'BuildHub made finding a reliable contractor so easy. The electrician I hired was professional, punctual and did an amazing job rewiring my home office.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Property Manager',
    content: 'As a property manager, I need reliable contractors fast. BuildHub has never disappointed me. Their verification process ensures I always get qualified professionals.',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
    rating: 4,
  },
  {
    id: 3,
    name: 'Alisha Patel',
    role: 'Interior Designer',
    content: 'I regularly collaborate with contractors through BuildHub for my interior design projects. The platform makes communication seamless, and the quality of contractors is consistently high.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
    rating: 5,
  },
];

const TestimonialsSection = () => {
  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`text-lg ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">What Our Users Are Saying</h2>
          <p className="mt-4 text-lg text-gray-600">
            Don't take our word for it, hear from satisfied customers and contractors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <img
                    src={testimonial.avatarUrl}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex">{renderStars(testimonial.rating)}</div>
              </div>
              <blockquote>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
              </blockquote>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Join thousands of satisfied customers who found their perfect contractor match on BuildHub
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
