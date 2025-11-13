import React, { useState } from "react";
import { useToast } from "./ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { X, Send } from "lucide-react";

export interface AdvertisementSubmission {
  _id?: string;
  bannerType: string;
  fullName: string;
  email: string;
  phone: string;
  projectName: string;
  location: string;
  projectType: string;
  budget?: string;
  description: string;
  createdAt?: Date;
  status?: "new" | "viewed" | "contacted";
}

interface AdvertisementBanner {
  id: string;
  title: string;
  description: string;
  bgColor: string;
  icon: string;
  type: "residential" | "commercial" | "investment" | "industrial";
}

const BANNERS: AdvertisementBanner[] = [
  {
    id: "residential",
    title: "Advertise Your New Residential Project in Rohtak",
    description: "Reach thousands of homebuyers looking for their dream home",
    bgColor: "from-blue-50 to-blue-100",
    icon: "🏠",
    type: "residential",
  },
  {
    id: "commercial",
    title: "Advertise Your New Commercial Project in Rohtak",
    description: "Connect with business owners and investors",
    bgColor: "from-green-50 to-green-100",
    icon: "🏢",
    type: "commercial",
  },
  {
    id: "investment",
    title: "Advertise Your Real Estate Investment Project in Rohtak",
    description: "Attract serious investors to your projects",
    bgColor: "from-purple-50 to-purple-100",
    icon: "💰",
    type: "investment",
  },
  {
    id: "industrial",
    title: "Advertise Your Industrial Property in Rohtak",
    description: "Find the right businesses and manufacturers",
    bgColor: "from-orange-50 to-orange-100",
    icon: "🏭",
    type: "industrial",
  },
];

interface AdvertisementBannersProps {
  className?: string;
}

export default function AdvertisementBanners({
  className = "",
}: AdvertisementBannersProps) {
  const [selectedBanner, setSelectedBanner] =
    useState<AdvertisementBanner | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<AdvertisementSubmission>({
    bannerType: "",
    fullName: "",
    email: "",
    phone: "",
    projectName: "",
    location: "",
    projectType: "",
    budget: "",
    description: "",
  });

  const handleBannerClick = (banner: AdvertisementBanner) => {
    setSelectedBanner(banner);
    setFormData({
      bannerType: banner.type,
      fullName: "",
      email: "",
      phone: "",
      projectName: "",
      location: "",
      projectType: banner.type,
      budget: "",
      description: "",
    });
    setShowForm(true);
  };

  const handleInputChange = (
    field: keyof AdvertisementSubmission,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.projectName ||
      !formData.location ||
      !formData.description
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/advertisement/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Your submission has been sent to our sales team",
        });
        setShowForm(false);
        setSelectedBanner(null);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to submit form",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`w-full ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-6">
          {BANNERS.map((banner) => (
            <Card
              key={banner.id}
              className={`bg-gradient-to-br ${banner.bgColor} border-0 cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden`}
              onClick={() => handleBannerClick(banner)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{banner.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {banner.title}
                    </h3>
                    <p className="text-gray-700 text-sm mb-4">
                      {banner.description}
                    </p>
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBannerClick(banner);
                      }}
                    >
                      Get Started
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Advertisement Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Advertise Your Project</span>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </DialogTitle>
            {selectedBanner && (
              <DialogDescription className="text-base text-gray-700 mt-2">
                {selectedBanner.title}
              </DialogDescription>
            )}
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
              />
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <Input
                type="text"
                placeholder="Enter your project name"
                value={formData.projectName}
                onChange={(e) =>
                  handleInputChange("projectName", e.target.value)
                }
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location in Rohtak *
              </label>
              <Input
                type="text"
                placeholder="Enter project location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                required
              />
            </div>

            {/* Project Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Type
              </label>
              <Select value={formData.projectType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Budget (Optional)
              </label>
              <Input
                type="text"
                placeholder="e.g., 10 Lakhs - 50 Lakhs"
                value={formData.budget || ""}
                onChange={(e) => handleInputChange("budget", e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Description *
              </label>
              <Textarea
                placeholder="Describe your project details"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={4}
                required
              />
            </div>

            {/* Contact Info Footer */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">
                <strong>Or contact our sales team directly:</strong>
              </p>
              <p className="text-sm text-gray-700 mt-2">
                📧 Email:{" "}
                <a
                  href="mailto:sales@ashishproperties.in"
                  className="text-red-600 font-medium hover:underline"
                >
                  sales@ashishproperties.in
                </a>
              </p>
              <p className="text-sm text-gray-700">
                📞 Phone:{" "}
                <a
                  href="tel:+919896095599"
                  className="text-red-600 font-medium hover:underline"
                >
                  +91 9896095599
                </a>
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <Send size={16} className="mr-2" />
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
