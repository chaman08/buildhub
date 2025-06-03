
import { useState } from 'react';
import { Phone, Mail, MessageCircle, X, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ContactButtonsProps {
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

const ContactButtons = ({ size = 'md', showLabels = false, className = '' }: ContactButtonsProps) => {
  const [showContactCard, setShowContactCard] = useState(false);
  const { toast } = useToast();

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  const handlePhoneClick = () => {
    try {
      // Try to make a call
      window.open('tel:+919243425538', '_blank');
      
      // Check if the call was likely successful (this is approximate)
      setTimeout(() => {
        // If user is still on the page after 2 seconds, assume call failed
        if (document.hasFocus()) {
          setShowContactCard(true);
        }
      }, 2000);
    } catch (error) {
      // Fallback to contact card
      setShowContactCard(true);
    }
  };

  const handleEmailClick = () => {
    window.open('mailto:support@buildhub.services?subject=General Inquiry', '_blank');
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/919243425538?text=Hi, I need help with BuildHub', '_blank');
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: `${type} copied!`,
        description: `${text} has been copied to your clipboard.`,
      });
    }).catch(() => {
      toast({
        title: "Copy failed",
        description: "Please copy the contact details manually.",
        variant: "destructive",
      });
    });
  };

  return (
    <>
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Phone Button */}
        <div className="relative group">
          <Button
            variant="outline"
            size="icon"
            className={`${sizeClasses[size]} bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600 hover:text-blue-700`}
            onClick={handlePhoneClick}
            title="Call us"
          >
            <Phone size={iconSizes[size]} />
          </Button>
          {showLabels && <span className="text-xs text-gray-600 mt-1 block">Call</span>}
        </div>

        {/* Email Button */}
        <div className="relative group">
          <Button
            variant="outline"
            size="icon"
            className={`${sizeClasses[size]} bg-green-50 hover:bg-green-100 border-green-200 text-green-600 hover:text-green-700`}
            onClick={handleEmailClick}
            title="Email us"
          >
            <Mail size={iconSizes[size]} />
          </Button>
          {showLabels && <span className="text-xs text-gray-600 mt-1 block">Email</span>}
        </div>

        {/* WhatsApp Button */}
        <div className="relative group">
          <Button
            variant="outline"
            size="icon"
            className={`${sizeClasses[size]} bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-600 hover:text-orange-700`}
            onClick={handleWhatsAppClick}
            title="Message us on WhatsApp"
          >
            <MessageCircle size={iconSizes[size]} />
          </Button>
          {showLabels && <span className="text-xs text-gray-600 mt-1 block">WhatsApp</span>}
        </div>
      </div>

      {/* Contact Details Card Modal */}
      {showContactCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md mx-auto bg-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl font-bold text-gray-900">Contact Details</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowContactCard(false)}
                className="h-8 w-8"
              >
                <X size={16} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-gray-600">Choose your preferred way to contact us</p>
              </div>

              {/* Phone Details */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                    <Phone className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Phone</h4>
                    <p className="text-gray-600">+91 92434 25538</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard('+919243425538', 'Phone number')}
                  title="Copy phone number"
                >
                  <Copy size={16} />
                </Button>
              </div>

              {/* Email Details */}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <p className="text-gray-600">support@buildhub.services</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard('support@buildhub.services', 'Email address')}
                  title="Copy email address"
                >
                  <Copy size={16} />
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 mt-6">
                <Button 
                  onClick={handleEmailClick}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Send Email
                </Button>
                <Button 
                  onClick={handleWhatsAppClick}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Chat on WhatsApp
                </Button>
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-500">Business Hours: Monday - Saturday, 10:00 AM - 6:00 PM IST</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default ContactButtons;
