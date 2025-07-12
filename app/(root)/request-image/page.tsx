'use client';

import { useState } from 'react';
import { sendImageRequest, sendImageRequestConfirmation, ImageRequestData } from '@/lib/email';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2, Mail, Image, User, MessageSquare } from 'lucide-react';

export default function RequestImagePage() {
  const [formData, setFormData] = useState<ImageRequestData>({
    name: '',
    email: '',
    description: '',
    details: '',
    imageType: '',
    urgency: 'medium'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: keyof ImageRequestData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Send request to admin
      const adminSuccess = await sendImageRequest(formData);
      
      // Send confirmation to user
      const userSuccess = await sendImageRequestConfirmation(formData);

      if (adminSuccess && userSuccess) {
        setIsSubmitted(true);
      } else {
        setError('Failed to send request. Please try again.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen py-5 px-6  text-white">
        <Card className="w-full max-w-md glass-card">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h1>
            <p className="text-gray-600 mb-4">
              We've received your image request and sent you a confirmation email. 
              We'll review your request and get back to you within 1-3 business days.
            </p>
            <Button 
              onClick={() => window.location.href = '/gallery'}
              className="w-full bg-gradient-to-r from-blue-500 to-red-500 hover:from-blue-700 hover:to-red-700"
            >
              Browse Gallery
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6  text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-300 mb-4">
              Request Custom Image
            </h1>
            <p className="text-xl text-white-600 max-w-2xl mx-auto">
              Have a specific image in mind? Let us know what you're looking for and we'll create it for you.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-black/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-6 mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Image className="w-5 h-5 text-blue-600" />
                    What We Create
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge variant="secondary" className=" backdrop-blur-4xl saturate-200 bg-white/10 text-blue-500">AI Art</Badge>
                  <Badge variant="secondary" className="backdrop-blur-4xl saturate-200 bg-white/10 text-green-700">Photography</Badge>
                  <Badge variant="secondary" className="backdrop-blur-4xl saturate-200 bg-white/10 text-purple-700">Digital Art</Badge>
                  <Badge variant="secondary" className="backdrop-blur-4xl saturate-200 bg-white/10 text-orange-700">Illustrations</Badge>
                  <Badge variant="secondary" className="backdrop-blur-4xl saturate-200 bg-white/10 text-pink-700">Abstract Art</Badge>
                  <Badge variant="secondary" className="backdrop-blur-4xl saturate-200 bg-white/10 text-indigo-700">Landscapes</Badge>
                </CardContent>
              </Card>

              <Card className="bg-black/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-6 mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    Response Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Standard</span>
                      <span className="text-sm font-medium">1-3 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Priority</span>
                      <span className="text-sm font-medium">24-48 hrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Urgent</span>
                      <span className="text-sm font-medium">12-24 hrs</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Request Form */}
            <div className="lg:col-span-2">
              <Card className="bg-black/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-6 mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-6 h-6 text-blue-600" />
                    Tell Us About Your Image Request
                  </CardTitle>
                  <CardDescription>
                    Provide as much detail as possible to help us create exactly what you're looking for.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Contact Information */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="required">Your Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="required">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    {/* Image Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="required">Image Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe the image you want us to create..."
                        rows={4}
                        required
                      />
                      <p className="text-sm text-gray-500">
                        Be specific about style, colors, mood, subject matter, etc.
                      </p>
                    </div>

                    {/* Additional Details */}
                    <div className="space-y-2">
                      <Label htmlFor="details">Additional Details</Label>
                      <Textarea
                        id="details"
                        value={formData.details}
                        onChange={(e) => handleInputChange('details', e.target.value)}
                        placeholder="Any additional requirements, inspiration references, or specific techniques..."
                        rows={3}
                      />
                    </div>

                    {/* Image Type and Urgency */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="imageType">Image Type</Label>
                        <Select onVolumeChange={(value) => handleInputChange('imageType', value)}>
                          <SelectItem value="">Select image type</SelectItem>
                          <SelectItem value="ai-art">AI Art</SelectItem>
                          <SelectItem value="photography">Photography</SelectItem>
                          <SelectItem value="digital-art">Digital Art</SelectItem>
                          <SelectItem value="illustration">Illustration</SelectItem>
                          <SelectItem value="abstract">Abstract Art</SelectItem>
                          <SelectItem value="landscape">Landscape</SelectItem>
                          <SelectItem value="portrait">Portrait</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="urgency">Urgency Level</Label>
                        <Select 
                          value={formData.urgency} 
                          onVolumeChange={(value: 'low' | 'medium' | 'high') => handleInputChange('urgency', value)}
                        >
                          <SelectItem value="low">🟢 Low (3+ days)</SelectItem>
                          <SelectItem value="medium">🟠 Medium (1-3 days)</SelectItem>
                          <SelectItem value="high">🔴 High (12-24 hrs)</SelectItem>
                        </Select>
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 text-sm">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-5 bg-gradient-to-r from-blue-500 to-red-500 hover:from-blue-700 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting Request...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Submit Request
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
