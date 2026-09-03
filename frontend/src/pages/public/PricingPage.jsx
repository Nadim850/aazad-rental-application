import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_URL } from "../../config";
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
} from "lucide-react";

const FACILITIES = [
  {
    id: "library",
    apiType: "library",
    name: "Library Zones",
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
  { value: 1, label: "Monthly" },
  { value: 3, label: "3-Months" },
  { value: 6, label: "Half-Yearly" },
  { value: 12, label: "Yearly" },
];

export default function PricingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const seatParam = searchParams.get("seat");
  const planParam = searchParams.get("plan");
  const isBookingMode = !!seatParam;

  useEffect(() => {
    window.scrollTo(0, 0);
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
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
      navigate(`/auth/signup?redirect=${encodeURIComponent(targetUrl)}`);
    }
  };

  // Filter facilities based on the ?plan= parameter to act as separate pages
  let displayedFacilities = FACILITIES;
  if (planParam) {
    if (planParam === "library") {
      displayedFacilities = FACILITIES.filter((f) => f.apiType === "library");
    } else if (planParam === "coworking") {
      displayedFacilities = FACILITIES.filter((f) => f.apiType === "dedicated" || f.apiType === "cabin");
    } else if (planParam === "conference" || planParam === "startup") {
      displayedFacilities = FACILITIES.filter((f) => f.apiType === "startup");
    } else {
      // Exact match for specific plans like "dedicated" or "cabin"
      const exactMatch = FACILITIES.filter((f) => f.apiType === planParam || f.id === planParam);
      if (exactMatch.length > 0) {
        displayedFacilities = exactMatch;
      }
    }
  }

  return (
    <div className="min-h-screen bg-background text-text-main pt-16 pb-24">
      <div className="max-w-[1080px] mx-auto px-6 md:px-8">
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12 border-b border-border-main pb-8">
          <div>
            <div
              className="text-[15px] tracking-wide text-primary mb-3 font-serif"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Aazad Rental
            </div>
            <h1
              className="font-medium text-[32px] md:text-[44px] leading-[1.12] mt-0 mb-3.5 max-w-[560px] tracking-tight font-serif"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Space, by the hour, the month, or the year.
            </h1>
            <p
              className="text-[16px] text-text-main/70 max-w-[440px] leading-[1.6] m-0 font-sans"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Library seats, coworking desks and cabins, conference rooms — pick
              a term that matches how you actually work.
            </p>
          </div>
        </div>

        {isBookingMode && (
          <div
            className="mb-10 p-4 border border-success/30 bg-success/5 rounded text-success font-medium flex items-center justify-center font-sans"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            Booking Seat {seatParam} — Select a plan below to continue.
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-16">
            {displayedFacilities.map((facility) => {
              const activePlan = plans.find(
                (p) => p.workspace_type === facility.apiType,
              );

              if (!activePlan) return null;

              return (
                <div
                  key={facility.id}
                  className="bg-surface border border-border-main overflow-hidden rounded-md flex flex-col"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  {/* TOP SIDE: Image */}
                  <div className="w-full h-[250px] lg:h-[350px] relative border-b border-border-main">
                    <img
                      src={facility.image}
                      alt={facility.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* BOTTOM SIDE: Split into two columns */}
                  <div className="flex flex-col lg:flex-row p-6 md:p-10 gap-10">
                    {/* LEFT COLUMN: Details & Amenities */}
                    <div className="lg:w-5/12 flex flex-col">
                      <h2
                        className="text-[28px] font-medium mb-3 font-serif tracking-tight"
                        style={{ fontFamily: "'Fraunces', serif" }}
                      >
                        {facility.name}
                      </h2>
                      <p className="text-[15px] text-text-main/70 mb-8 leading-relaxed">
                        {facility.description}
                      </p>

                      {/* Amenities Grid */}
                      <div className="mb-10">
                        <h3 className="text-[11px] font-bold text-text-main/50 uppercase tracking-widest mb-4">
                          Amenities & Facilities
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-4">
                          {facility.amenities.map((amenity, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 text-[14px]"
                            >
                              <div className="text-primary shrink-0 opacity-80">
                                {getAmenityIcon(amenity)}
                              </div>
                              <span className="text-text-main/80 font-medium">
                                {amenity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Available Plans (Durations) Nested Boxes */}
                    <div className="lg:w-7/12">
                      <h3
                        className="text-[16px] font-bold mb-6 font-serif tracking-tight"
                        style={{ fontFamily: "'Fraunces', serif" }}
                      >
                        Available Plans
                      </h3>

                      <div className="flex flex-col gap-4">
                        {DURATION_OPTIONS.map((durationOpt) => {
                          const duration = durationOpt.value;
                          const totalPrice = getDurationPrice(
                            activePlan,
                            duration,
                          );
                          const savingsPct = getSavingsPercentage(
                            activePlan,
                            duration,
                          );
                          const originalPrice =
                            parseFloat(activePlan.monthly_price) * duration;

                          return (
                            <div
                              key={duration}
                              className="border border-border-main bg-background p-5 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-colors hover:border-text-main/30"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h4 className="font-bold text-[15px] m-0">
                                    {durationOpt.label}
                                  </h4>
                                  {savingsPct > 0 && (
                                    <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                                      Save {savingsPct}%
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-baseline gap-2 mb-2">
                                  <span
                                    className="text-[22px] font-medium font-serif"
                                    style={{ fontFamily: "'Fraunces', serif" }}
                                  >
                                    ₹{totalPrice.toLocaleString("en-IN")}
                                  </span>
                                  {savingsPct > 0 && (
                                    <span className="text-[12px] text-text-main/50 line-through">
                                      ₹{originalPrice.toLocaleString("en-IN")}
                                    </span>
                                  )}
                                </div>

                                {activePlan.features &&
                                  activePlan.features.length > 0 && (
                                    <div className="text-[13px] text-text-main/70 leading-snug">
                                      Includes: {activePlan.features.join(", ")}
                                    </div>
                                  )}
                              </div>

                              <div className="sm:shrink-0 w-full sm:w-auto">
                                <button
                                  onClick={() =>
                                    handleBookNow(activePlan.name, duration)
                                  }
                                  className="w-full sm:w-auto text-center py-2.5 px-6 rounded-sm text-[13.5px] font-bold border border-text-main bg-transparent text-text-main hover:bg-text-main/5 transition-colors cursor-pointer"
                                >
                                  {isBookingMode && seatParam
                                    ? "Confirm & Pay"
                                    : "Choose plan"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p
          className="mt-12 text-[12.5px] text-text-main/70 text-center font-sans"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          3-Months and yearly plans are billed upfront. Prices exclude
          applicable taxes.
        </p>
      </div>
    </div>
  );
}
