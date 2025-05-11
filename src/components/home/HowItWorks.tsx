
import { CheckCircle, Search, Calendar, MessageSquare } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Search Contractors',
    description: 'Browse through our extensive network of verified contractors or post your specific project requirements.',
    icon: <Search className="w-8 h-8 text-primary" />,
  },
  {
    id: 2,
    title: 'Get Multiple Quotes',
    description: 'Receive competitive quotes from interested contractors who match your project needs.',
    icon: <CheckCircle className="w-8 h-8 text-primary" />,
  },
  {
    id: 3,
    title: 'Schedule Service',
    description: 'Choose the right professional for your job and schedule the service at your convenience.',
    icon: <Calendar className="w-8 h-8 text-primary" />,
  },
  {
    id: 4,
    title: 'Complete Your Project',
    description: 'Stay in touch with your contractor through our platform and pay securely when the job is done.',
    icon: <MessageSquare className="w-8 h-8 text-primary" />,
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">How BuildHub Works</h2>
          <p className="mt-4 text-lg text-gray-600">
            A simple process to connect you with the right contractor for your project
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2"></div>
          
          <div className="space-y-12 relative">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                <div className={`md:flex items-center ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                  {/* Circle with number */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold z-10">
                    {step.id}
                  </div>
                  
                  {/* Content */}
                  <div className="md:w-1/2 p-4">
                    <div className={`bg-gray-50 p-6 rounded-lg shadow-sm ${index % 2 === 0 ? 'md:mr-10' : 'md:ml-10'}`}>
                      <div className="flex md:hidden items-center mb-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold mr-4">
                          {step.id}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                      </div>
                      <div className="hidden md:block">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                      </div>
                      <p className="text-gray-600">{step.description}</p>
                      <div className="mt-4 flex justify-center md:justify-start">
                        {step.icon}
                      </div>
                    </div>
                  </div>
                  
                  {/* Empty div for spacing in alternating layout */}
                  <div className="hidden md:block md:w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
