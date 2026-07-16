import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, ArrowLeft, Building2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { apiFetch } from '../../lib/api';

export default function ReceiptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const receiptRef = useRef();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem('access');
        if (!token) {
          navigate('/auth/login');
          return;
        }

        const res = await apiFetch(`http://localhost:8000/api/bookings/${id}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setBooking(data);
        } else {
          setError('Failed to load receipt details.');
        }
      } catch (err) {
        console.error(err);
        setError('Network error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooking();
  }, [id, navigate]);

  const handleDownloadPDF = () => {
    // Native print is much more reliable and won't freeze the browser
    // The print styles (print:hidden) will handle hiding the rest of the UI
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <p className="text-red-500 mb-4">{error || "Receipt not found"}</p>
          <Button onClick={() => navigate('/')}>Return to Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 print:hidden">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-sm font-medium text-text-main/60 hover:text-text-main transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </button>
          
          <Button onClick={handleDownloadPDF} variant="primary" className="flex items-center">
            <Download className="w-4 h-4 mr-2" /> Print / Save as PDF
          </Button>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="print:m-0 print:p-0 print:shadow-none"
        >
          {/* Printable Receipt Container */}
          <Card ref={receiptRef} className="bg-surface shadow-lg border-border-main/50 overflow-hidden print:shadow-none print:border-none">
            {/* Receipt Header */}
            <div className="bg-primary/5 p-8 border-b border-border-main">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 text-primary font-bold text-2xl mb-1">
                    <Building2 size={28} />
                    Aazad Rental
                  </div>
                  <p className="text-sm text-text-main/60">Your Premium Workspace Partner</p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold tracking-tight text-text-main">RECEIPT</h2>
                  <p className="text-sm font-medium text-text-main/70 mt-1">#INV-{1000 + booking.id}</p>
                </div>
              </div>
            </div>

            <CardContent className="p-8 space-y-8">
              
              {/* Status Banner */}
              <div className="flex items-center justify-center p-4 bg-success/10 border border-success/20 rounded-lg text-success font-medium">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Payment Successful
              </div>

              {/* Transaction & User Details */}
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-text-main/50 font-bold mb-3">Billed To</h3>
                  <p className="font-semibold">{booking.user_first_name} {booking.user_last_name}</p>
                  <p className="text-sm text-text-main/70">{booking.user_email}</p>
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-text-main/50 font-bold mb-3">Transaction Details</h3>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-main/70">Payment ID:</span>
                      <span className="font-medium">{booking.razorpay_payment_id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-main/70">Date:</span>
                      <span className="font-medium">{new Date(booking.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-main/70">Method:</span>
                      <span className="font-medium">Razorpay Gateway</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border-main" />

              {/* Subscription Details Table */}
              <div>
                <h3 className="text-xs uppercase tracking-wider text-text-main/50 font-bold mb-4">Subscription Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border-main text-text-main/60">
                      <tr>
                        <th className="pb-3 font-medium">Description</th>
                        <th className="pb-3 font-medium">Seat</th>
                        <th className="pb-3 font-medium">Type</th>
                        <th className="pb-3 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-main/50">
                      <tr>
                        <td className="py-4">
                          <p className="font-medium">{booking.plan_name || 'Standard Plan'}</p>
                          <p className="text-xs text-text-main/50 mt-1">
                            {new Date(booking.start_time).toLocaleDateString()} &mdash; {new Date(booking.end_time).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-4 font-medium">{booking.workspace?.name}</td>
                        <td className="py-4 capitalize">{booking.workspace?.workspace_type}</td>
                        <td className="py-4 text-right font-medium">₹{parseFloat(booking.amount_paid).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <div className="w-full sm:w-1/2 lg:w-1/3 space-y-3">
                  <div className="flex justify-between text-sm text-text-main/70">
                    <span>Subtotal</span>
                    <span>₹{parseFloat(booking.amount_paid).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-text-main/70">
                    <span>Tax (0%)</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-border-main">
                    <span>Total Paid</span>
                    <span>₹{parseFloat(booking.amount_paid).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer text */}
              <div className="pt-8 text-center text-xs text-text-main/40 mt-auto">
                <p>If you have any questions regarding this receipt, please contact support.</p>
                <p className="mt-1">Thank you for choosing Aazad Rental!</p>
              </div>

            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
