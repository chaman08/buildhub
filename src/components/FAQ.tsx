import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "Is it really free to post projects?",
      answer: "Yes! Posting projects on NirmaanBazaar is completely free for customers. You can post unlimited projects, receive bids from contractors, and communicate with them at no cost. We only charge contractors for premium features."
    },
    {
      question: "How do I know the contractors are genuine and qualified?",
      answer: "All contractors on our platform undergo a verification process including Aadhaar KYC, GST verification, and portfolio review. We also have a rating and review system where past customers share their experiences, helping you make informed decisions."
    },
    {
      question: "What happens after I receive bids from contractors?",
      answer: "Once you receive bids, you can review each contractor's profile, past work, ratings, and pricing. You can then communicate directly with your preferred contractors through our secure chat system to discuss details and finalize terms."
    },
    {
      question: "Is my contact information shared with contractors?",
      answer: "Your contact information is only shared when you choose to initiate contact with a contractor. Until then, all communication happens through our secure in-platform messaging system, protecting your privacy."
    },
    {
      question: "How do payments work? Do I pay through the platform?",
      answer: "Currently, payments are handled directly between customers and contractors. We provide a secure communication channel for you to negotiate terms. We're working on integrated payment features for added security and convenience."
    },
    {
      question: "What types of construction projects can I post?",
      answer: "You can post any construction-related project including residential construction, commercial projects, interior design, electrical work, plumbing, painting, architecture services, and more. From small repairs to large construction projects."
    },
    {
      question: "How long does it take to receive bids?",
      answer: "Most projects start receiving bids within 24-48 hours. The timeline depends on your project complexity, location, and the number of contractors available in your area. You typically receive multiple bids within a week."
    },
    {
      question: "Can I cancel a project after posting?",
      answer: "Yes, you can cancel or modify your project at any time before finalizing with a contractor. Simply log into your dashboard and manage your project status. We recommend informing interested contractors about any changes."
    }
  ];

  const handleEmailClick = () => {
    window.open('mailto:support@buildhub.services?subject=Support Request', '_blank');
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/919243425538?text=Hi, I need help with BuildHub', '_blank');
  };

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Get answers to common questions about using NirmaanBazaar.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border border-gray-200 rounded-lg px-6"
            >
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <span className="text-lg font-medium text-gray-900 pr-4">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 bg-orange-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6">
            Our support team is here to help you get started with your construction project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleEmailClick}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              📧 Email Support
            </button>
            <button 
              onClick={handleWhatsAppClick}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              📱 WhatsApp Support
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
