
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Pencil, ListOrdered, FileText, MapPin, 
  DollarSign, Calendar, Upload, Eye, EyeOff, 
  Phone, Mail, Send, CheckCircle2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";

// Firebase imports
import { auth } from "@/lib/firebase";
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  sendEmailVerification,
  createUserWithEmailAndPassword,
  PhoneAuthProvider,
  signInWithCredential
} from "firebase/auth";

// Project form schema with contact info
const projectFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
  projectType: z.string({
    required_error: "Please select a project type",
  }),
  description: z.string().min(20, "Description must be at least 20 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(5, "Valid pincode is required"),
  budget: z.array(z.number()).length(1),
  timeline: z.enum(["urgent", "flexible", "1-3months"], {
    required_error: "Please select a timeline",
  }),
  visibility: z.enum(["public", "invite-only"], {
    required_error: "Please select visibility",
  }),
  contactPreference: z.enum(["whatsapp", "email", "phone"], {
    required_error: "Please select a contact preference",
  }),
  contactInfo: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

const defaultValues: Partial<ProjectFormValues> = {
  title: "",
  description: "",
  city: "",
  state: "",
  pincode: "",
  budget: [5000],
  timeline: "flexible",
  visibility: "public",
  contactPreference: "email",
  contactInfo: "",
};

const PostProjectPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [fileError, setFileError] = useState("");
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues,
  });

  // Get values from form to determine UI state
  const contactPreference = form.watch("contactPreference");
  const contactInfo = form.watch("contactInfo");

  // Set up reCAPTCHA verifier for phone authentication
  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal',
        'callback': () => {
          // reCAPTCHA solved, continue with verification
        }
      });
    }
  };

  // Send verification based on contact preference
  const sendVerification = async () => {
    setVerificationLoading(true);
    const contact = form.getValues("contactInfo");
    
    if (!contact) {
      toast({
        title: "Contact information required",
        description: "Please enter your contact information first.",
        variant: "destructive",
      });
      setVerificationLoading(false);
      return;
    }

    try {
      if (contactPreference === "phone" || contactPreference === "whatsapp") {
        setupRecaptcha();
        
        const phoneNumber = contact.startsWith('+') ? contact : `+${contact}`;
        const appVerifier = (window as any).recaptchaVerifier;
        
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        setVerificationId(confirmationResult.verificationId);
        setVerificationSent(true);
        
        toast({
          title: "Verification code sent",
          description: `We've sent a verification code to your ${contactPreference === "whatsapp" ? "WhatsApp" : "phone"}`,
        });
      } 
      else if (contactPreference === "email") {
        // For email, create a temporary user to send verification
        const tempPassword = Math.random().toString(36).slice(-8);
        const userCredential = await createUserWithEmailAndPassword(auth, contact, tempPassword);
        
        await sendEmailVerification(userCredential.user);
        setVerificationSent(true);
        
        toast({
          title: "Verification email sent",
          description: "We've sent a verification link to your email. Please check your inbox.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Could not send verification. Please try again.",
        variant: "destructive",
      });
      
      // Reset reCAPTCHA on failure
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    }
    
    setVerificationLoading(false);
  };

  // Verify the code entered by user
  const verifyCode = async () => {
    setVerificationLoading(true);
    
    try {
      if (contactPreference === "phone" || contactPreference === "whatsapp") {
        // Verify phone number with the verification code
        const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
        await signInWithCredential(auth, credential);
        
        setIsVerified(true);
        toast({
          title: "Verification successful",
          description: "Your contact information has been verified.",
        });
      }
      // For email verification we rely on the email link click
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    }
    
    setVerificationLoading(false);
  };

  function onSubmit(data: ProjectFormValues) {
    setIsSubmitting(true);
    
    // Simple validation for files
    if (!files || files.length === 0) {
      setFileError("Please upload at least one file");
      setIsSubmitting(false);
      return;
    } else {
      setFileError("");
    }

    // Check if contact verification is required but not completed
    if (data.contactInfo && !isVerified) {
      toast({
        title: "Contact verification required",
        description: "Please verify your contact information before submitting.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    // Simulate form submission
    setTimeout(() => {
      console.log("Form submitted successfully", { ...data, files });
      toast({
        title: "Project Posted Successfully",
        description: "Contractors will be able to view your project now.",
      });
      setIsSubmitting(false);
      form.reset();
      setFiles(null);
      setVerificationSent(false);
      setVerificationCode("");
      setIsVerified(false);
      setShowContactInfo(false);
    }, 1500);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
      setFileError("");
    }
  }

  // Handle contact preference selection
  function handleContactPreferenceChange(value: string) {
    form.setValue("contactPreference", value as "whatsapp" | "email" | "phone");
    setShowContactInfo(true);
    setVerificationSent(false);
    setIsVerified(false);
    form.setValue("contactInfo", "");
  }

  return (
    <div className="container-custom py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Post a Project</h1>
          <p className="text-muted-foreground">
            Share your project details and connect with qualified contractors
          </p>
        </div>

        <Card className="shadow-md animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl">Project Details</CardTitle>
            <CardDescription>
              Fill in the information below to post your project
            </CardDescription>
          </CardHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                {/* Project Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Pencil className="h-4 w-4" />
                        Project Title
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Kitchen Renovation" {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear title helps contractors understand your project.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Project Type */}
                <FormField
                  control={form.control}
                  name="projectType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <ListOrdered className="h-4 w-4" />
                        Project Type
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="residential">Residential</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="government">Government Tender</SelectItem>
                          <SelectItem value="renovation">Renovation</SelectItem>
                          <SelectItem value="repair">Repair</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Helps match your project with the right contractor expertise.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Project Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Project Description
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide detailed information about your project requirements, specifications, and any other relevant details."
                          className="min-h-[150px]" 
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Be specific about materials, dimensions, and requirements.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          City
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode/Zipcode</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Budget Slider */}
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Budget (USD)
                      </FormLabel>
                      <div className="space-y-2">
                        <FormControl>
                          <div className="pt-4">
                            <Slider
                              value={field.value}
                              min={1000}
                              max={100000}
                              step={1000}
                              onValueChange={field.onChange}
                            />
                          </div>
                        </FormControl>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">$1,000</span>
                          <span className="text-md font-medium">${field.value[0].toLocaleString()}</span>
                          <span className="text-sm text-muted-foreground">$100,000</span>
                        </div>
                      </div>
                      <FormDescription>
                        Drag the slider to set your project budget.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Timeline */}
                <FormField
                  control={form.control}
                  name="timeline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Timeline
                      </FormLabel>
                      <div className="flex flex-wrap gap-2">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-wrap gap-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="urgent" id="urgent" />
                              <label htmlFor="urgent" className="text-sm font-medium cursor-pointer">
                                Urgent (ASAP)
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="flexible" id="flexible" />
                              <label htmlFor="flexible" className="text-sm font-medium cursor-pointer">
                                Flexible
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="1-3months" id="1-3months" />
                              <label htmlFor="1-3months" className="text-sm font-medium cursor-pointer">
                                1-3 Months
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* File Upload */}
                <div className="space-y-2">
                  <FormLabel className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Files
                  </FormLabel>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:bg-gray-50 transition-colors">
                    <Input
                      type="file"
                      multiple
                      id="fileUpload"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                    <label
                      htmlFor="fileUpload"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        Drag and drop files here or click to browse
                      </p>
                      <p className="text-xs text-gray-500">
                        Supports: PDF, Images, Word Documents (Max 10MB)
                      </p>
                    </label>
                  </div>
                  {files && files.length > 0 && (
                    <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      {files.length} file(s) selected
                    </div>
                  )}
                  {fileError && (
                    <p className="text-sm text-red-500">{fileError}</p>
                  )}
                </div>

                {/* Visibility Toggle */}
                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        {field.value === "public" ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                        Project Visibility
                      </FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <div className="flex items-center space-x-4">
                            <Toggle
                              pressed={field.value === "public"}
                              onPressedChange={() =>
                                field.onChange(field.value === "public" ? "invite-only" : "public")
                              }
                              variant="outline"
                              aria-label="Toggle visibility"
                              className="data-[state=on]:bg-primary data-[state=on]:text-white"
                            >
                              {field.value === "public" ? "Public" : "Invite Only"}
                            </Toggle>
                          </div>
                        </FormControl>
                      </div>
                      <FormDescription>
                        {field.value === "public"
                          ? "Visible to all contractors on the platform"
                          : "Only visible to contractors you invite"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact Preference */}
                <FormField
                  control={form.control}
                  name="contactPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Contact Preference
                      </FormLabel>
                      <div className="flex items-center">
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => handleContactPreferenceChange(value)}
                            value={field.value}
                            className="flex flex-wrap gap-3"
                          >
                            <div className="flex flex-col items-center space-y-1">
                              <div className={`border rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors ${field.value === "whatsapp" ? "ring-2 ring-primary" : ""}`}>
                                <RadioGroupItem value="whatsapp" id="whatsapp" className="sr-only" />
                                <label htmlFor="whatsapp" className="cursor-pointer flex flex-col items-center">
                                  <Phone className="h-5 w-5 text-green-500" />
                                  <span className="text-sm font-medium mt-1">WhatsApp</span>
                                </label>
                              </div>
                            </div>
                            <div className="flex flex-col items-center space-y-1">
                              <div className={`border rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors ${field.value === "email" ? "ring-2 ring-primary" : ""}`}>
                                <RadioGroupItem value="email" id="email" className="sr-only" />
                                <label htmlFor="email" className="cursor-pointer flex flex-col items-center">
                                  <Mail className="h-5 w-5 text-blue-500" />
                                  <span className="text-sm font-medium mt-1">Email</span>
                                </label>
                              </div>
                            </div>
                            <div className="flex flex-col items-center space-y-1">
                              <div className={`border rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors ${field.value === "phone" ? "ring-2 ring-primary" : ""}`}>
                                <RadioGroupItem value="phone" id="phone" className="sr-only" />
                                <label htmlFor="phone" className="cursor-pointer flex flex-col items-center">
                                  <Phone className="h-5 w-5 text-primary" />
                                  <span className="text-sm font-medium mt-1">Phone</span>
                                </label>
                              </div>
                            </div>
                          </RadioGroup>
                        </FormControl>
                      </div>
                      <FormDescription>
                        How would you prefer contractors to contact you?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact Information Input - Shows after selecting preference */}
                {showContactInfo && (
                  <div className="space-y-4 p-4 border rounded-md bg-gray-50 animate-in fade-in-50 duration-300">
                    <h3 className="font-medium">
                      {contactPreference === "whatsapp" 
                        ? "Enter WhatsApp Number" 
                        : contactPreference === "email" 
                          ? "Enter Email Address" 
                          : "Enter Phone Number"}
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="contactInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder={
                                contactPreference === "whatsapp" 
                                  ? "WhatsApp number with country code (e.g. +1234567890)" 
                                  : contactPreference === "email" 
                                    ? "Email address" 
                                    : "Phone number with country code (e.g. +1234567890)"
                              }
                              {...field}
                              disabled={isVerified}
                              type={contactPreference === "email" ? "email" : "tel"}
                              className={isVerified ? "bg-green-50 border-green-200" : ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Verification Button */}
                    {contactInfo && !verificationSent && !isVerified && (
                      <div className="flex flex-col gap-3">
                        <div id="recaptcha-container" className="flex justify-center"></div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={sendVerification}
                          disabled={verificationLoading}
                          className="w-full"
                        >
                          {verificationLoading ? (
                            <>
                              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                              Sending...
                            </>
                          ) : (
                            "Verify Contact Info"
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Verification Code Input */}
                    {verificationSent && !isVerified && contactPreference !== "email" && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Enter the 6-digit verification code sent to your {contactPreference === "whatsapp" ? "WhatsApp" : "phone"}
                        </p>
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-center">
                            <InputOTP
                              maxLength={6}
                              value={verificationCode}
                              onChange={setVerificationCode}
                              render={({ slots }) => (
                                <InputOTPGroup>
                                  {slots.map((slot, index) => (
                                    <InputOTPSlot key={index} {...slot} index={index} />
                                  ))}
                                </InputOTPGroup>
                              )}
                            />
                          </div>
                          <Button 
                            type="button"
                            onClick={verifyCode}
                            disabled={verificationCode.length < 6 || verificationLoading}
                            className="mt-2"
                          >
                            {verificationLoading ? (
                              <>
                                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                Verifying...
                              </>
                            ) : (
                              "Submit Code"
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Email Verification Message */}
                    {verificationSent && !isVerified && contactPreference === "email" && (
                      <div className="p-3 bg-blue-50 rounded-md text-sm">
                        <p>We've sent a verification link to your email.</p>
                        <p className="mt-1">Please check your inbox and click the link to verify your email address.</p>
                        <p className="mt-2 font-medium">After verification, please return to this page to complete your submission.</p>
                      </div>
                    )}

                    {/* Verified Success Message */}
                    {isVerified && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-medium">Contact information verified!</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-end">
                <Button 
                  type="submit" 
                  className="transition-all transform hover:scale-105 active:scale-95" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Posting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      <span>Post Project</span>
                    </div>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default PostProjectPage;
