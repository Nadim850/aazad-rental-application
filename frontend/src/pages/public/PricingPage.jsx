import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { API_URL } from "../../config";
import { Badge } from "../../components/ui/Badge";
import { getDurationPrice, getSavingsPercentage } from "../../lib/pricingUtils";
import {
  Wifi,
  Wind,
  BatteryCharging,
  ShieldCheck,
  Droplet,
  Coffee,
  Lock,
  Sparkles,
  Printer,
  Car,
  Users,
  Check,
} from "lucide-react";

const FACILITIES = [
  {
    id: "library",
    apiType: "library",
    name: "Library Zones",
    tabLabel: "Library",
    description:
      "Quiet reading and study seats with locker access. A pin-drop silence zone designed for deep focus, research, and uninterrupted study.",
    image:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80",
    amenities: [
      "High-Speed Wi-Fi",
      "Air Conditioning",
      "Power Backup",
      "CCTV Security",
      "RO Water",
      "Locker Facility",
    ],
  },
  {
    id: "dedicated",
    apiType: "dedicated",
    name: "Dedicated Desk",
    tabLabel: "Coworking",
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
  },
  {
    id: "cabin",
    apiType: "cabin",
    name: "Private Cabin",
    tabLabel: "Private Cabin",
    description:
      "A fully furnished, lockable private office for you and your small team. Focus without distractions away from the open floor.",
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
  },
  {
    id: "conference",
    apiType: "startup",
    name: "Conference Room",
    tabLabel: "Conference",
    description:
      "Prepaid hour blocks for client meetings, interviews, and team collaborations. Book the conference room from your prepaid balance.",
    image:
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80",
    amenities: [
      "6 Seats Capacity",
      "High-Speed Wi-Fi",
      "Projector & Screen",
      "Air Conditioning",
      "Power Backup",
      "Whiteboard",
      "Reception Support",
      "Housekeeping",
    ],
  },
];

const getAmenityIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes("wi-fi")) return <Wifi className="w-4 h-4" />;
  if (n.includes("air")) return <Wind className="w-4 h-4" />;
  if (n.includes("power")) return <BatteryCharging className="w-4 h-4" />;
  if (n.includes("cctv") || n.includes("security"))
    return <ShieldCheck className="w-4 h-4" />;
  if (n.includes("water")) return <Droplet className="w-4 h-4" />;
  if (n.includes("coffee") || n.includes("tea"))
    return <Coffee className="w-4 h-4" />;
  if (n.includes("print") || n.includes("projector"))
    return <Printer className="w-4 h-4" />;
  if (n.includes("park")) return <Car className="w-4 h-4" />;
  if (n.includes("reception") || n.includes("seat") || n.includes("board"))
    return <Users className="w-4 h-4" />;
  if (n.includes("locker") || n.includes("soundproof"))
    return <Lock className="w-4 h-4" />;
  return <Sparkles className="w-4 h-4" />;
};

const DURATION_OPTIONS = [
  { value: 1, label: "Monthly", badge: null },
  { value: 3, label: "Quarterly", badge: null },
  { value: 6, label: "Half-Yearly", badge: "Popular" },
  { value: 12, label: "Yearly", badge: "Best Value" },
];

export default function PricingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const seatParam = searchParams.get("seat");
  const planParam = searchParams.get("plan");
  const isBookingMode = !!seatParam;

  // Determine initial tab based on URL param
  const initialTab = planParam
    ? planParam === "coworking"
      ? "dedicated"
      : planParam === "startup"
        ? "conference"
        : planParam
    : "library";

  const [activeTab, setActiveTab] = useState(
    FACILITIES.some((f) => f.id === initialTab) ? initialTab : "library",
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const handleBookNow = (planName, duration) => {
    const token = localStorage.getItem("access");
    const targetUrl = `/payment?plan=${encodeURIComponent(planName)}&months=${duration}${seatParam ? `&seat=${seatParam}` : ""}`;
    if (token) {
      navigate(targetUrl);
    } else {
      // Trigger modal via custom event or navigate to signup if modal logic isn't wired perfectly here
      // Since we added AuthModalContext, let's use the event dispatch as fallback if we don't want to import hook
      window.dispatchEvent(
        new CustomEvent("open-auth-modal", {
          detail: { mode: "signup", redirect: targetUrl },
        }),
      );
    }
  };

  const activeFacility = FACILITIES.find((f) => f.id === activeTab);
  const activePlan = plans.find(
    (p) => p.workspace_type === activeFacility?.apiType,
  );

  return (
    <div className="min-h-screen bg-background text-text-main relative pt-20 pb-24 md:pt-10 md:pb-32 overflow-hidden font-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
            Pricing Plans
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-main tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
            Flexible <br className="hidden md:block" />{" "}
            <span className="text-secondary"> Membership Plans</span>
          </h1>
          <p className="text-lg md:text-xl text-text-main/60 max-w-2xl mx-auto">
            Simple, transparent pricing. No hidden fees.{" "}
            <br className="hidden sm:block" /> Switch plans or cancel anytime.
          </p>
        </div>

        {isBookingMode && (
          <div className="mb-10 max-w-2xl mx-auto p-4 border border-primary/30 bg-primary/5 rounded-xl text-primary font-medium flex items-center justify-center text-center">
            Booking Seat {seatParam} — Select a plan below to continue.
          </div>
        )}

        {/* Segmented Control (Slider) */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex bg-surface border border-border-main p-1.5 rounded-full overflow-x-auto max-w-full shadow-sm hide-scrollbar">
            {FACILITIES.map((facility) => {
              const isActive = activeTab === facility.id;
              return (
                <button
                  key={facility.id}
                  onClick={() => setActiveTab(facility.id)}
                  className={`relative px-5 py-2.5 text-sm md:text-base font-semibold rounded-full transition-colors whitespace-nowrap outline-none ${
                    isActive
                      ? "text-secondary-foreground"
                      : "text-text-main/70 hover:text-text-main"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-primary rounded-full shadow-sm"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{facility.tabLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : activeFacility && activePlan ? (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-12"
          >
            {/* Facility Details Minimalist Block */}
            <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
              <h2 className="text-2xl md:text-3xl font-bold">
                {activeFacility.name}
              </h2>
              <p className="text-text-main/70 text-lg">
                {activeFacility.description}
              </p>

              <div className="flex flex-wrap justify-center gap-3 pt-4">
                {activeFacility.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 bg-surface border border-border-main/50 px-3 py-1.5 rounded-full text-sm text-text-main/80"
                  >
                    <div className="text-primary">
                      {getAmenityIcon(amenity)}
                    </div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {DURATION_OPTIONS.map((opt) => {
                const duration = opt.value;
                const totalPrice = getDurationPrice(activePlan, duration);
                const savingsPct = getSavingsPercentage(activePlan, duration);
                const isPopular = opt.badge === "Popular";
                const monthlyEquiv = Math.round(totalPrice / duration);

                return (
                  <div
                    key={duration}
                    className={`relative flex flex-col bg-surface rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                      isPopular
                        ? "border-2 border-primary shadow-lg shadow-primary/10"
                        : "border border-border-main hover:border-primary/50"
                    }`}
                  >
                    {/* Top Badges */}
                    <div className="flex justify-between items-start mb-4 h-6">
                      {opt.badge ? (
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${isPopular ? "bg-primary text-primary-foreground" : "bg-secondary/10 text-secondary"}`}
                        >
                          {opt.badge}
                        </span>
                      ) : (
                        <div />
                      )}

                      {savingsPct > 0 && (
                        <span className="text-[12px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                          Save {savingsPct}%
                        </span>
                      )}
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-text-main/80 mb-2">
                        {opt.label}
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold tracking-tight">
                          ₹{totalPrice.toLocaleString("en-IN")}
                        </span>
                        {duration > 1 && (
                          <span className="text-text-main/50 text-sm font-medium">
                            /total
                          </span>
                        )}
                      </div>
                      {duration > 1 && (
                        <p className="text-sm text-text-main/50 mt-2 font-medium">
                          That's ₹{monthlyEquiv.toLocaleString("en-IN")}/mo
                        </p>
                      )}
                    </div>

                    <div className="flex-grow">
                      <ul className="space-y-3 mb-8">
                        {/* We assume activePlan features exist, or we can use generic ones */}
                        {(
                          activePlan.features || [
                            "Access to all amenities",
                            "24/7 Support",
                            "Free event access",
                          ]
                        ).map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-sm text-text-main/70"
                          >
                            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleBookNow(activePlan.name, duration)}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-colors ${
                        isPopular
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
                          : "bg-background border border-border-main hover:border-primary/50 hover:bg-surface text-text-main"
                      }`}
                    >
                      {isBookingMode && seatParam
                        ? "Confirm & Pay"
                        : "Choose Plan"}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-20 text-text-main/50">
            No plans available for this workspace type right now.
          </div>
        )}

        <p className="mt-16 text-[13px] text-text-main/50 text-center max-w-2xl mx-auto">
          3-Months, Half-Yearly, and Yearly plans are billed upfront. Prices
          exclude applicable taxes. For custom enterprise requirements or larger
          team setups, please contact our sales team.
        </p>
      </div>
    </div>
  );
}
