'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectItem,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, Loader2, MessageCircle, Bug, Lightbulb, User } from 'lucide-react';

// --- Email sending function (uses Resend SDK) ---
const sendFeedback = async (data: FeedbackData): Promise<boolean> => {
  try {
    const res = await fetch('/api/send-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (error) {
    console.error('Feedback send error:', error);
    return false;
  }
};

export type FeedbackData = {
  name: string;
  email: string;
  type: 'feedback' | 'bug' | 'feature';
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
};

export default function FeedbackPage() {
  const [formData, setFormData] = useState<FeedbackData>({
    name: '',
    email: '',
    type: 'feedback',
    subject: '',
    message: '',
    priority: 'medium',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: keyof FeedbackData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError('Please fill in all required fields');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const success = await sendFeedback(formData);
      if (success) setIsSubmitted(true);
      else setError('Failed to send feedback. Please try again.');
    } catch (err) {
      console.error('Submission error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeInfo = () => {
    switch (formData.type) {
      case 'bug':
        return { icon: Bug, title: 'Bug Report', description: 'Report a technical issue', color: 'red' };
      case 'feature':
        return { icon: Lightbulb, title: 'Feature Request', description: 'Suggest new features', color: 'blue' };
      default:
        return { icon: MessageCircle, title: 'General Feedback', description: 'Share your thoughts', color: 'green' };
    }
  };

  const typeInfo = getTypeInfo();
  const TypeIcon = typeInfo.icon;

  const glassCard = 'bg-black/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl';

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6  text-white">
        <Card className={`${glassCard} max-w-md w-full`}>
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Thank You!</h1>
            <p className="text-gray-300 mb-4">
              Your {typeInfo.title.toLowerCase()} has been submitted. We appreciate your help!
            </p>
            <Button onClick={() => window.location.href = '/'} className="w-full bg-green-600 hover:bg-green-700">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-6  text-white">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-10">
        <div className="space-y-6">
          <Card className={glassCard}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="w-5 h-5 text-green-400" /> Feedback Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 p-3 bg-green-500/10 rounded-lg">
                <MessageCircle className="text-green-400" />
                <div>
                  <p className="font-medium">General Feedback</p>
                  <p className="text-sm text-green-200">Comments and suggestions</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 bg-red-500/10 rounded-lg">
                <Bug className="text-red-400" />
                <div>
                  <p className="font-medium">Bug Report</p>
                  <p className="text-sm text-red-200">Technical issues</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 bg-blue-500/10 rounded-lg">
                <Lightbulb className="text-blue-400" />
                <div>
                  <p className="font-medium">Feature Request</p>
                  <p className="text-sm text-blue-200">Ideas for new features</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={glassCard}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="text-purple-400" /> Response Times
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span>General</span><span>1-2 days</span></div>
              <div className="flex justify-between"><span>Bug Reports</span><span>24 hours</span></div>
              <div className="flex justify-between"><span>Critical</span><span>Same day</span></div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className={glassCard}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TypeIcon className={`text-${typeInfo.color}-400`} /> {typeInfo.title}
              </CardTitle>
              <CardDescription>{typeInfo.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label>Subject</Label>
                    <Input value={formData.subject} onChange={(e) => handleInputChange('subject', e.target.value)} required />
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={formData.priority} onVolumeChange={(val: string) => handleInputChange('priority', val)}>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Type</Label>
                  <Select value={formData.type} onVolumeChange={(val: string) => handleInputChange('type', val)}>
                    <SelectItem value="feedback">General Feedback</SelectItem>
                    <SelectItem value="bug">Bug Report</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                  </Select>
                </div>

                <div>
                  <Label>Message</Label>
                  <Textarea value={formData.message} onChange={(e) => handleInputChange('message', e.target.value)} rows={6} required />
                </div>

                {error && <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}

                <Button type="submit" disabled={isLoading} className={`w-full rounded-2xl bg-${typeInfo.color}-600 hover:bg-${typeInfo.color}-700`}>
                  {isLoading ? <><Loader2 className="animate-spin w-4 h-4 mr-2" /> Submitting...</> : <><TypeIcon className="w-4 h-4 mr-2" /> Submit</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
