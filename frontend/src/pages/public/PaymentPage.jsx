import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, ArrowLeft, QrCode } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../components/ui/Card";

import QRCode from "react-qr-code";
import { apiFetch } from "../../lib/api";
import { getDurationPrice } from "../../lib/pricingUtils";
import { API_URL } from "../../config";
export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, success
  const [successfulBookingId, setSuccessfulBookingId] = useState(null);
  const [error, setError] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const planType = searchParams.get("plan") || "Premium Plan";
  const [seatId, setSeatId] = useState(searchParams.get("seat") || "");
  const months = parseInt(searchParams.get("months") || "1", 10);

  const [basePrice, setBasePrice] = useState(1999);
  const [planObj, setPlanObj] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${API_URL}/api/bookings/public-plans/`);
        if (res.ok) {
          const data = await res.json();
          const selectedPlan = data.find((p) => p.name === planType);
          if (selectedPlan) {
            setPlanObj(selectedPlan);
            setBasePrice(parseFloat(selectedPlan.monthly_price));

            // If no seat was provided in the URL, auto-select the first available one for this plan type
            const initialSeatId = searchParams.get("seat");
            if (!initialSeatId) {
              try {
                const wsRes = await fetch(
                  `${API_URL}/api/bookings/public-workspaces/`,
                );
                if (wsRes.ok) {
                  const wsData = await wsRes.json();
                  const availableSeats = wsData
                    .filter(
                      (ws) =>
                        ws.workspace_type === selectedPlan.workspace_type &&
                        ws.is_available,
                    )
                    .sort((a, b) => a.name.localeCompare(b.name));

                  if (availableSeats.length > 0) {
                    setSeatId(availableSeats[0].name);
                  } else {
                    setError("No seats available for this plan.");
                  }
                }
              } catch (wsErr) {
                console.error("Failed to fetch workspaces", wsErr);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch plans for payment", err);
      }
    };
    fetchPlans();
  }, [planType, searchParams]);

  const price = getDurationPrice(planObj, months);
  const total = price;

  const handlePayment = async () => {
    if (!seatId) {
      setError("Please select a seat or wait for one to be auto-assigned.");
      return;
    }
    if (!transactionId.trim()) {
      setError("Please enter the UTR/Transaction ID.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const token = localStorage.getItem("access");
      if (!token) {
        navigate("/auth/login");
        return;
      }

      const orderResponse = await apiFetch(
        `${API_URL}/api/bookings/create-manual-booking/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            seat_id: seatId,
            plan_type: planType,
            months: months,
            transaction_id: transactionId,
          }),
        },
      );

      if (!orderResponse.ok) {
        const data = await orderResponse.json();
        setError(data.error || "Failed to submit payment");
        setIsProcessing(false);
        return;
      }

      const orderData = await orderResponse.json();
      setSuccessfulBookingId(orderData.booking_id);
      setPaymentStatus("success");
    } catch (err) {
      setError("Network error occurred during payment submission");
      setIsProcessing(false);
    }
  };

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full"
        >
          <Card className="text-center border-primary/20 shadow-xl shadow-primary/10">
            <CardContent className="pt-12 pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">Payment Submitted</h2>
              <p className="text-text-main/70 mb-8">
                Your payment details have been sent for verification. Once
                approved by the admin, your seat ({seatId}) will be allocated.
              </p>
              <Button
                size="lg"
                className="w-full"
                onClick={() => navigate(`/dashboard`)}
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const upiLink = `upi://pay?pa=nadimkgn@ybl&pn=Aazad%20Rental&am=${total.toFixed(2)}&cu=INR`;

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
                    <p className="text-sm text-text-main/70">
                      Seat: {seatId || "Assigning..."} &bull; {months}{" "}
                      {months === 1 ? "Month" : "Months"}
                    </p>
                  </div>
                  <span className="font-semibold">₹{price.toFixed(2)}</span>
                </div>

                <div className="space-y-3 pt-6 border-t border-border-main/50 text-sm">
                  <div className="flex justify-between text-text-main/70">
                    <span>Subtotal</span>
                    <span>₹{price.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border-main my-4" />
                  <div className="flex justify-between items-center text-lg font-bold text-text-main">
                    <span>Total Due</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Method */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Secure Checkout (UPI)</h2>
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm">
                {error}
              </div>
            )}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-primary" /> Scan to Pay
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 text-sm text-text-main/70">
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-border-main/50">
                  {/* Dynamic QR Code */}
                  <div className="bg-white p-2 rounded-lg mb-4">
                    <QRCode value={upiLink} size={192} />
                  </div>
                  
                  <p className="font-semibold text-black mb-1">
                    Scan using any UPI App
                  </p>
                  <p className="text-black/60 text-xs font-mono bg-gray-100 px-3 py-1 rounded mb-4">
                    nadimkgn@ybl
                  </p>
                  
                  {/* Deep link for mobile users */}
                  <a 
                    href={upiLink}
                    className="w-full md:hidden mb-4 flex items-center justify-center gap-2 bg-primary text-white py-2.5 px-4 rounded-md font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Pay ₹{total.toFixed(2)} via UPI App
                  </a>

                  {/* UPI App Logos */}
                  <div className="flex items-center justify-center gap-4 border-t border-gray-100 w-full pt-4">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg"
                      alt="BHIM UPI"
                      className="h-4 object-contain"
                    />
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg"
                      alt="Google Pay"
                      className="h-4 object-contain"
                    />
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg"
                      alt="PhonePe"
                      className="h-5 object-contain"
                    />
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg"
                      alt="Paytm"
                      className="h-3 object-contain"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-text-main">
                    Enter UTR / Transaction ID
                  </label>
                  <Input
                    placeholder="e.g. 312345678901"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-text-main/50">
                    After making the payment, please enter the 12-digit UTR or
                    Transaction ID to confirm your booking.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex-col pt-6 border-t border-border-main/50 gap-4">
                <Button
                  className="w-full h-12 text-lg"
                  onClick={handlePayment}
                  isLoading={isProcessing}
                >
                  {isProcessing ? "Submitting..." : `Submit for Approval`}
                </Button>
                <p className="flex items-center justify-center text-xs text-text-main/50">
                  <ShieldCheck className="w-4 h-4 mr-1.5 text-primary" />
                  Manual Verification Process
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
