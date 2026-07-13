import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, ShieldCheck, Tag, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, success

  const planType = searchParams.get('plan') || 'Premium Plan';
  const seatId = searchParams.get('seat') || 'L-12';
  const price = 1999;
  const gst = price * 0.18;
  const total = price + gst;

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate Razorpay / Payment Gateway delay
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentStatus('success');
    }, 2000);
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full"
        >
          <Card className="text-center border-success/20 shadow-xl shadow-success/10">
            <CardContent className="pt-12 pb-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-success" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-text-main/70 mb-8">
                Your workspace at Aazad Rental is confirmed. Invoice #INV-{Math.floor(Math.random() * 10000)} has been sent to your email.
              </p>
              <Button size="lg" className="w-full" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-sm font-medium text-text-main/60 hover:text-text-main mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Order Summary */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Order Summary</h2>
            <Card className="bg-surface/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-lg">{planType}</h3>
                    <p className="text-sm text-text-main/70">Seat: {seatId}</p>
                  </div>
                  <span className="font-semibold">₹{price.toFixed(2)}</span>
                </div>
                
                <div className="space-y-3 pt-6 border-t border-border-main/50 text-sm">
                  <div className="flex justify-between text-text-main/70">
                    <span>Subtotal</span>
                    <span>₹{price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-text-main/70">
                    <span>GST (18%)</span>
                    <span>₹{gst.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-border-main/50 flex justify-between font-bold text-lg">
                    <span>Total Due</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Input placeholder="Enter coupon code" leftIcon={<Tag size={16} />} className="flex-1" />
              <Button variant="outline">Apply</Button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Payment Details</h2>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" /> Credit Card
                  </CardTitle>
                  <div className="flex gap-2">
                    <div className="w-8 h-5 bg-border-main rounded" />
                    <div className="w-8 h-5 bg-border-main rounded" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Card Number</label>
                  <Input placeholder="0000 0000 0000 0000" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Expiry Date</label>
                    <Input placeholder="MM/YY" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">CVC</label>
                    <Input placeholder="123" type="password" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Cardholder Name</label>
                  <Input placeholder="Name on card" />
                </div>
              </CardContent>
              <CardFooter className="flex-col pt-6 border-t border-border-main/50 gap-4">
                <Button 
                  className="w-full h-12 text-lg" 
                  onClick={handlePayment}
                  isLoading={isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
                </Button>
                <p className="flex items-center justify-center text-xs text-text-main/50">
                  <ShieldCheck className="w-4 h-4 mr-1.5 text-success" />
                  Payments are secure and encrypted
                </p>
              </CardFooter>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
