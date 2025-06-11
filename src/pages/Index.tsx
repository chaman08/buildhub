
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import WhyChooseUs from "@/components/WhyChooseUs";
import ContractorPreview from "@/components/ContractorPreview";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PostProjectDialog from "@/components/dashboard/PostProjectDialog";
import { useAuth } from "@/contexts/AuthContext";
import { usePostProject } from "@/hooks/usePostProject";
import PersonalizedGreeting from "@/components/PersonalizedGreeting";

const Index = () => {
  const { currentUser } = useAuth();
  const { showPostDialog, setShowPostDialog } = usePostProject();

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
      
      <PostProjectDialog
        open={showPostDialog}
        onOpenChange={setShowPostDialog}
      />
    </div>
  );
};

export default Index;
