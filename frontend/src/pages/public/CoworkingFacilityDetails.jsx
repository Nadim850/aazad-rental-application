import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Wifi,
  Wind,
  BatteryCharging,
  ShieldCheck,
  Droplet,
  Coffee,
  Lock,
  Sparkles,
  Clock,
  Info,
  Calendar,
  ArrowLeft,
  Printer,
  Car,
  Users,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { getDurationPrice, getSavingsPercentage } from "../../lib/pricingUtils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { API_URL } from "../../config";

const FACILITIES = {
  dedicated: {
    id: "dedicated",
    name: "Dedicated Desk",
    description:
      "Your own personal desk in a vibrant coworking environment. Leave your monitors and gear securely overnight.",
    image:
      "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&q=80",
    amenities: [
      "High-Speed Wi-Fi",
      "Air Conditioning",
      "Power Backup",
      "Printer & Scanner",
      "Tea/Coffee",
      "Housekeeping",
      "Meeting Room Access",
    ],
    status: "Limited Seats",
    hours: "24/7 Access",
    workspaceType: "Coworking Space",
    cancelPolicy: "30 days notice required.",
  },
  cabin: {
    id: "cabin",
    name: "Private Cabin",
    description:
      "A fully furnished, soundproof private office for you and your small team. Focus without distractions.",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80",
    amenities: [
      "High-Speed Wi-Fi",
      "Air Conditioning",
      "Power Backup",
      "Soundproof",
      "Reception Support",
      "Mail Handling",
      "Parking",
    ],
    status: "Available",
    hours: "24/7 Access",
    workspaceType: "Private Office",
    cancelPolicy: "30 days notice required.",
  },
};

const getAmenityIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes("wi-fi")) return <Wifi className="w-5 h-5" />;
  if (n.includes("air")) return <Wind className="w-5 h-5" />;
  if (n.includes("power")) return <BatteryCharging className="w-5 h-5" />;
  if (n.includes("cctv") || n.includes("security"))
    return <ShieldCheck className="w-5 h-5" />;
  if (n.includes("water")) return <Droplet className="w-5 h-5" />;
  if (n.includes("coffee") || n.includes("tea"))
    return <Coffee className="w-5 h-5" />;
  if (n.includes("print")) return <Printer className="w-5 h-5" />;
  if (n.includes("park")) return <Car className="w-5 h-5" />;
  if (n.includes("reception")) return <Users className="w-5 h-5" />;
  if (n.includes("locker") || n.includes("soundproof"))
    return <Lock className="w-5 h-5" />;
  return <Sparkles className="w-5 h-5" />;
};

export default function CoworkingFacilityDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(1);

  const seatParam = searchParams.get("seat");
  const isBookingMode = !!seatParam;

  const targetFacilityId = searchParams.get("type") || "dedicated";
  const facility = FACILITIES[targetFacilityId] || FACILITIES.dedicated;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [searchParams]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${API_URL}/api/bookings/public-plans/`);
        if (res.ok) {
          const data = await res.json();
          setPlans(data);
        }
      } catch (err) {
        console.error("Failed to fetch plans", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const facilityPlans = plans.filter((p) => p.workspace_type === facility.id);
  const activePlan = facilityPlans[0];

  const handleBookNow = (planName, selectedDuration) => {
    const token = localStorage.getItem("access");
    const targetUrl = `/payment?plan=${encodeURIComponent(planName)}&months=${selectedDuration}${seatParam ? `&seat=${seatParam}` : ""}`;
    if (token) {
      navigate(targetUrl);
    } else {
      navigate(`/auth/signup?redirect=${encodeURIComponent(targetUrl)}`);
    }
  };

  const DURATION_OPTIONS = [
    { value: 1, label: "1 Month" },
    { value: 3, label: "3 Months" },
    { value: 6, label: "6 Months" },
    { value: 12, label: "12 Months" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="pt-24 pb-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <button
          onClick={() => navigate("/coworking")}
          className="flex items-center text-sm font-medium text-text-main/60 hover:text-primary transition-colors w-fit mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Coworking
        </button>

        {isBookingMode && (
          <div className="mb-4">
            <Badge
              variant="success"
              className="px-3 py-1 text-sm bg-success/10 text-success border-success/20"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Booking Seat {seatParam}
              </span>
            </Badge>
            <p className="text-text-main/70 mt-2 text-sm">
              Review details and confirm your reservation below.
            </p>
          </div>
        )}
      </div>

      {/* Main Single-Window Layout (Mirrors PricingPage) */}
      <section className="flex-1 flex flex-col justify-start pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          {/* Left Column: Full-background Image and Active Plan Card */}
          <div className="lg:col-span-6 relative flex flex-col min-h-[500px] lg:h-auto lg:max-h-[calc(100vh-12rem)]">
            <div className="border border-border-main relative flex-1 overflow-hidden shadow-sm flex flex-col justify-end p-8 text-white bg-black">
              {/* Background Image & Overlay */}
              <div className="absolute inset-0">
                <img
                  src={facility.image}
                  alt={facility.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />
              </div>

              {/* Facility Name Label */}
              <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white px-4 py-2 text-sm font-semibold border border-white/20 z-10">
                {facility.name}
              </div>

              {/* Active Plan Details below the image inside the card */}
              <div className="relative z-10 flex flex-col h-full justify-end">
                {isLoading ? (
                  <div className="flex-1 flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                ) : !activePlan ? (
                  <div className="flex-1 flex items-center justify-center text-white/50 py-12">
                    No plans available.
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <h3 className="text-3xl font-bold">{activePlan.name}</h3>
                      {activePlan.total_seats > 0 && (
                        <div className="text-sm text-white/80 mt-1">
                          {activePlan.total_seats}{" "}
                          {activePlan.total_seats === 1
                            ? "seat available"
                            : "seats available"}
                        </div>
                      )}
                    </div>

                    {/* Duration Cycler Button */}
                    <button
                      onClick={() => {
                        const currentIndex = DURATION_OPTIONS.findIndex(
                          (opt) => opt.value === duration,
                        );
                        const nextIndex =
                          (currentIndex + 1) % DURATION_OPTIONS.length;
                        setDuration(DURATION_OPTIONS[nextIndex].value);
                      }}
                      className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 px-5 py-2.5 text-sm font-semibold rounded-full transition-colors w-fit mb-6"
                    >
                      <span>
                        {
                          DURATION_OPTIONS.find((o) => o.value === duration)
                            ?.label
                        }
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Price and Button */}
                    <div className="mt-auto">
                      {(() => {
                        const totalPrice = getDurationPrice(
                          activePlan,
                          duration,
                        );
                        const savingsPct = getSavingsPercentage(
                          activePlan,
                          duration,
                        );

                        return (
                          <div className="flex items-end justify-between mb-6">
                            <div className="flex flex-col">
                              <div className="flex items-baseline tracking-tight">
                                <span className="text-4xl font-bold">
                                  ₹{totalPrice.toLocaleString("en-IN")}
                                </span>
                                <span className="text-sm text-white/80 ml-1">
                                  /{duration}
                                  {duration === 1 ? "mo" : "mo"}
                                </span>
                              </div>
                              {savingsPct > 0 && (
                                <div className="text-sm text-white/60 line-through mt-0.5 flex items-center gap-3">
                                  ₹
                                  {(
                                    parseFloat(activePlan.monthly_price) *
                                    duration
                                  ).toLocaleString("en-IN")}
                                  <span className="text-success font-bold text-xs no-underline bg-success/20 px-2 py-0.5 rounded-sm border border-success/30">
                                    Save {savingsPct}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      <Button
                        variant="primary"
                        className="w-full rounded-none bg-white text-black hover:bg-white/90 font-bold border-none"
                        onClick={() => handleBookNow(activePlan.name, duration)}
                        disabled={!activePlan}
                      >
                        {isBookingMode && seatParam
                          ? "Confirm & Pay"
                          : "Reserve this seat"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Amenities and Features */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-10 lg:pl-8">
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-text-main/60 mb-5 font-bold">
                Included Amenities
              </h3>
              <ul className="grid grid-cols-2 gap-3">
                {facility.amenities.map((amenity, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-sm text-text-main/80 bg-surface px-4 py-3 border border-border-main"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span className="truncate">{amenity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {activePlan &&
              activePlan.features &&
              activePlan.features.length > 0 && (
                <div className="border-t border-dashed border-border-main pt-8">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-text-main/60 mb-5 font-bold">
                    Plan Features
                  </h3>
                  <ul className="flex flex-col">
                    {activePlan.features.map((feature, i) => (
                      <li
                        key={i}
                        className={`flex items-center gap-3 text-sm py-3 ${i !== activePlan.features.length - 1 ? "border-b border-dashed border-border-main" : ""}`}
                      >
                        <div className="w-4 h-4 rounded-full border-[1.3px] border-primary relative shrink-0">
                          <div className="absolute left-[4px] top-[2px] w-[4px] h-[8px] border-r-[1.3px] border-b-[1.3px] border-primary rotate-[40deg]" />
                        </div>
                        <span className="text-text-main/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Additional Info Snippet */}
            <div className="border-t border-dashed border-border-main pt-8 grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface rounded-xl border border-border-main">
                <h4 className="font-semibold text-xs mb-1">Operating Hours</h4>
                <p className="text-xs text-text-main/70">{facility.hours}</p>
              </div>
              <div className="p-4 bg-surface rounded-xl border border-border-main">
                <h4 className="font-semibold text-xs mb-1">Cancellation</h4>
                <p className="text-xs text-text-main/70">
                  {facility.cancelPolicy}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
