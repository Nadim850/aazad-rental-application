import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { User, Mail, Phone, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('http://localhost:8000/api/bookings/contact/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'Thank you for reaching out! We will get back to you shortly.'
        });
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        const errorData = await response.json();
        setStatus({
          type: 'error',
          message: errorData.error || 'Failed to send message. Please try again.'
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'A network error occurred. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-text-main mb-4 tracking-tight">Contact Us</h1>
          <p className="text-lg text-text-main/70">
            Have questions about our spaces or enterprise plans? We're here to help.
          </p>
        </div>

        <Card className="shadow-lg border-border-main/50">
          <CardContent className="p-8">
            {status.message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 mb-6 rounded-xl flex items-start gap-3 ${
                  status.type === 'success' 
                    ? 'bg-success/10 text-success border border-success/20' 
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}
              >
                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" /> : <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />}
                <p>{status.message}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-main">Full Name *</label>
                  <Input 
                    required 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe" 
                    leftIcon={<User size={16} />} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-main">Email Address *</label>
                  <Input 
                    required 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com" 
                    leftIcon={<Mail size={16} />} 
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-main">Phone Number (Optional)</label>
                  <Input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210" 
                    leftIcon={<Phone size={16} />} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-main">Subject *</label>
                  <Input 
                    required 
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help you?" 
                    leftIcon={<MessageSquare size={16} />} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-main">Message *</label>
                <textarea
                  required
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your inquiry..."
                  className="w-full min-h-[150px] p-4 rounded-xl border border-border-main bg-black/5 dark:bg-white/[0.03] text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-y"
                />
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-14 text-lg mt-4 shadow-lg hover:-translate-y-0.5" 
                isLoading={isSubmitting}
              >
                {!isSubmitting && <Send className="w-5 h-5 mr-2" />}
                {isSubmitting ? 'Sending Message...' : 'Send Message'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
