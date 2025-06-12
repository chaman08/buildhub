
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthProvider from '@/contexts/AuthContext';
import { BookmarkProvider } from '@/contexts/BookmarkContext';

// Import all pages
import Index from '@/pages/Index';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import Contractors from '@/pages/Contractors';
import ContractorProfile from '@/pages/ContractorProfile';
import ContractorServices from '@/pages/ContractorServices';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import ContractorDashboard from '@/pages/ContractorDashboard';
import ProfilePage from '@/pages/ProfilePage';
import Messages from '@/pages/Messages';
import Bookmarks from '@/pages/Bookmarks';
import AdminPanel from '@/pages/AdminPanel';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BookmarkProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/project/:id" element={<ProjectDetail />} />
                <Route path="/contractors" element={<Contractors />} />
                <Route path="/contractor/:id" element={<ContractorProfile />} />
                <Route path="/contractor-services" element={<ContractorServices />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/contractor-dashboard" element={<ContractorDashboard />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </BookmarkProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
