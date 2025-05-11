
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Mail, Phone, MapPin, Check, Calendar, MessageSquare } from 'lucide-react';

// Mock data for a contractor
const mockContractor = {
  id: 1,
  name: 'John Smith',
  profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
  category: 'Electrician',
  location: 'New York, NY',
  rating: 4.8,
  reviewCount: 124,
  description: 'Licensed electrician with over 15 years of experience in residential and commercial electrical installations and repairs. Specializing in electrical panel upgrades, wiring, lighting installations, and troubleshooting complex electrical issues.',
  yearsExperience: 15,
  verified: true,
  contactEmail: 'john.smith@example.com',
  contactPhone: '(123) 456-7890',
  services: [
    'Electrical panel upgrades',
    'Wiring installation and repair',
    'Lighting installation',
    'Ceiling fan installation',
    'Outlet and switch installation',
    'Electric vehicle charging stations',
    'Home automation systems',
    'Electrical safety inspections',
  ],
  workImages: [
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1558211583-d26f610c1eb1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1574359411659-15573a27d686?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
  ],
  reviews: [
    {
      id: 1,
      userName: 'Sarah Johnson',
      userImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
      rating: 5,
      date: '2023-05-15',
      comment: 'John was incredibly professional and knowledgeable. He rewired our entire home office and installed new lighting fixtures. The work was completed ahead of schedule and within budget. Highly recommend!',
    },
    {
      id: 2,
      userName: 'Michael Chen',
      userImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
      rating: 4,
      date: '2023-04-22',
      comment: 'Did a great job installing our EV charging station. Very thorough and explained everything clearly. The only reason for 4 stars instead of 5 is that he arrived a bit late.',
    },
    {
      id: 3,
      userName: 'Emily Davis',
      userImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
      rating: 5,
      date: '2023-03-10',
      comment: 'John helped us with a complete electrical panel upgrade for our home. He was very thorough, ensuring everything was up to code. His attention to detail and safety protocols were impressive.',
    },
  ],
};

const ContractorProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(mockContractor.workImages[0]);
  
  // In a real app, you would fetch the contractor data based on the ID
  // For now, we're using mock data
  const contractor = mockContractor;

  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 ${
            i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container-custom">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Image */}
            <div className="md:w-1/4">
              <div className="aspect-square rounded-lg overflow-hidden">
                <img
                  src={contractor.profileImage}
                  alt={`${contractor.name} profile`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="md:w-3/4">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {contractor.name}
                    {contractor.verified && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                  </h1>
                  <p className="text-gray-600">{contractor.category}</p>
                </div>
                <div className="mt-2 md:mt-0 flex items-center">
                  <div className="flex mr-2">{renderStars(contractor.rating)}</div>
                  <span className="text-gray-600">
                    ({contractor.reviewCount} reviews)
                  </span>
                </div>
              </div>

              <div className="flex items-center text-gray-600 mb-4">
                <MapPin size={18} className="mr-1" />
                <span>{contractor.location}</span>
                <span className="mx-2">•</span>
                <span>{contractor.yearsExperience} years experience</span>
              </div>

              <p className="text-gray-700 mb-6">{contractor.description}</p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#contact-form"
                  className="button-primary flex justify-center items-center"
                >
                  <MessageSquare size={18} className="mr-2" />
                  Request Quote
                </a>
                <button className="button-outline flex justify-center items-center">
                  <Calendar size={18} className="mr-2" />
                  Schedule Consultation
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <div className="lg:w-2/3 space-y-8">
            {/* Services Section */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Services Offered</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {contractor.services.map((service, index) => (
                  <div key={index} className="flex items-center">
                    <Check size={16} className="text-green-500 mr-2" />
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Work Showcase Section */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Showcase</h2>
              <div className="mb-4">
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={selectedImage}
                    alt="Project"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {contractor.workImages.map((image, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer rounded-md overflow-hidden ${
                      selectedImage === image ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image}
                      alt={`Project ${index + 1}`}
                      className="w-full h-full object-cover aspect-square"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews Section */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Customer Reviews ({contractor.reviews.length})
              </h2>
              <div className="space-y-6">
                {contractor.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-start">
                      <img
                        src={review.userImage}
                        alt={review.userName}
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                      />
                      <div>
                        <div className="flex items-center mb-1">
                          <h3 className="font-medium text-gray-900 mr-2">{review.userName}</h3>
                          <span className="text-gray-500 text-sm">{review.date}</span>
                        </div>
                        <div className="flex mb-2">{renderStars(review.rating)}</div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="lg:w-1/3 space-y-8">
            {/* Contact Information */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail size={18} className="text-gray-500 mr-3" />
                  <a href={`mailto:${contractor.contactEmail}`} className="text-primary hover:underline">
                    {contractor.contactEmail}
                  </a>
                </div>
                <div className="flex items-center">
                  <Phone size={18} className="text-gray-500 mr-3" />
                  <a href={`tel:${contractor.contactPhone.replace(/[^0-9]/g, '')}`} className="text-primary hover:underline">
                    {contractor.contactPhone}
                  </a>
                </div>
              </div>
            </section>

            {/* Quote Request Form */}
            <section id="contact-form" className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Request a Quote</h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-gray-700 font-medium mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label htmlFor="project-details" className="block text-gray-700 font-medium mb-1">
                    Project Details
                  </label>
                  <textarea
                    id="project-details"
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Describe your project and requirements"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full button-primary"
                >
                  Submit Quote Request
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorProfilePage;
