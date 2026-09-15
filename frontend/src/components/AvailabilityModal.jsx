import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { API_URL } from "../config";

export default function AvailabilityModal({ isOpen, onClose, type, title }) {
  const navigate = useNavigate();
  const [availableCount, setAvailableCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && type) {
      setIsLoading(true);
      fetch(`${API_URL}/api/bookings/public-workspaces/`)
        .then((res) => res.json())
        .then((data) => {
          // Count available seats for this specific type
          const count = data.filter(
            (ws) => ws.workspace_type === type && ws.is_available
          ).length;
          setAvailableCount(count);
        })
        .catch((err) => console.error("Failed to fetch workspaces", err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-surface border border-border-main rounded-2xl p-6 w-full max-w-md relative shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-text-main/50 hover:text-text-main transition-colors"
          >
            <X size={20} />
          </button>

          <h3 className="text-2xl font-bold text-text-main mb-2">
            {title || "Check Availability"}
          </h3>
          <p className="text-text-main/70 mb-6">
            Review seat availability before proceeding to pricing.
          </p>

          <div className="bg-background rounded-xl p-6 mb-8 text-center border border-border-main/50">
            {isLoading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            ) : availableCount > 0 ? (
              <div>
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h4 className="text-3xl font-bold text-text-main mb-1">
                  {availableCount} Seats
                </h4>
                <p className="text-green-500 font-medium">Currently Available</p>
                <p className="text-sm text-text-main/50 mt-2">
                  The system will automatically allocate you a seat after payment.
                </p>
              </div>
            ) : (
              <div>
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h4 className="text-xl font-bold text-text-main mb-1">
                  Fully Booked
                </h4>
                <p className="text-red-500 font-medium">No seats available right now.</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={isLoading || availableCount === 0}
              onClick={() => {
                onClose();
                navigate(`/pricing?plan=${type}`);
              }}
            >
              Proceed to Pricing
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
