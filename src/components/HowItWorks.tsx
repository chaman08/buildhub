
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Users, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const HowItWorks = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (!currentUser) {
      navigate('/auth');
    } else {
      navigate('/dashboard');
    }
  };

  const steps = [
    {
      icon: FileText,
      title: "Post Your Project",
      description: "Describe your construction project with details, budget, and timeline. Our platform makes it easy to specify your requirements."
    },
    {
      icon: Users,
      title: "Receive Bids",
      description: "Verified contractors review your project and submit competitive bids. Compare proposals, timelines, and contractor profiles."
    },
    {
      icon: CheckCircle,
      title: "Choose & Build",
      description: "Select the best contractor for your project and start building. Track progress and communicate through our platform."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get your construction project done in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6"
            onClick={handleGetStarted}
          >
            Get Started Today
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
