import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import WhyChooseUs from "@/components/WhyChooseUs";
import ContractorPreview from "@/components/ContractorPreview";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import PersonalizedGreeting from "@/components/PersonalizedGreeting";

const Index = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {currentUser && <PersonalizedGreeting />}
      <HeroSection />
      <HowItWorks />
      <WhyChooseUs />
      <ContractorPreview />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
