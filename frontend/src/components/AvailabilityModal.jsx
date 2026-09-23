import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { API_URL } from "../config";

export default function AvailabilityModal({ isOpen, onClose, type, title, options }) {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(type);
  const [availableCount, setAvailableCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Set default to today
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (isOpen) {
      setSelectedType(type);
      setStartDate(new Date().toISOString().split("T")[0]);
    }
  }, [isOpen, type]);

  useEffect(() => {
    if (isOpen && selectedType) {
      setIsLoading(true);
      fetch(`${API_URL}/api/bookings/public-workspaces/`)
        .then((res) => res.json())
        .then((data) => {
          // Count available seats for this specific type
          const count = data.filter(
            (ws) => ws.workspace_type === selectedType && ws.is_available
          ).length;
          setAvailableCount(count);
        })
        .catch((err) => console.error("Failed to fetch workspaces", err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, selectedType]);

  if (!isOpen) return null;

  const displayTitle = options 
    ? `${options.find(o => o.value === selectedType)?.label} Availability`
    : (title || "Check Availability");

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
            {displayTitle}
          </h3>
          <p className="text-text-main/70 mb-6">
            Review seat availability before proceeding to pricing.
          </p>

          {options && (
            <div className="flex relative mb-6 p-1 bg-background rounded-lg border border-border-main">
              {options.map((opt) => {
                const isSelected = selectedType === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedType(opt.value)}
                    className={`relative flex-1 py-2 text-sm font-medium rounded-md transition-colors z-10 ${
                      isSelected
                        ? "text-white"
                        : "text-text-main/70 hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-primary rounded-md shadow-sm -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}

          <div className="bg-background rounded-xl p-6 mb-6 text-center border border-border-main/50 relative overflow-hidden min-h-[160px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </motion.div>
              ) : availableCount > 0 ? (
                <motion.div
                  key="available"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                >
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h4 className="text-3xl font-bold text-text-main mb-1">
                    {availableCount} Seats
                  </h4>
                  <p className="text-green-500 font-medium">Currently Available</p>
                  <p className="text-sm text-text-main/50 mt-2">
                    The system will automatically allocate you a seat after payment.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="unavailable"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                >
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <h4 className="text-xl font-bold text-text-main mb-1">
                    Fully Booked
                  </h4>
                  <p className="text-red-500 font-medium">No seats available right now.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {availableCount > 0 && !isLoading && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-text-main mb-2">
                Select Subscription Start Date
              </label>
              <input
                type="date"
                value={startDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-background border border-border-main rounded-xl px-4 py-2.5 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={isLoading || availableCount === 0 || !startDate}
              onClick={() => {
                onClose();
                navigate(`/pricing?plan=${selectedType}&startDate=${startDate}`);
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
