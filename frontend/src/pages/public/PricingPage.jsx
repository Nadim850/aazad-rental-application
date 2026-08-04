import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Briefcase, ChevronRight, Monitor, Rocket, 
  CheckCircle2, Wifi, Wind, BatteryCharging, ShieldCheck, Droplet, Coffee, Lock, Sparkles, Printer, Car, Users, Clock, Info, Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { getDurationPrice, getSavingsPercentage } from "../../lib/pricingUtils";

const FACILITIES = [
  {
    id: 'library',
    apiType: 'library',
    name: 'Library Zones',
    description: 'A pin-drop silence zone designed for deep focus, research, and uninterrupted study. Perfect for students and researchers.',
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80',
    icon: <BookOpen className="w-8 h-8 text-primary" />,
    colorClass: "text-primary",
    bgAccent: "bg-primary/5",
    borderHover: "hover:border-primary",
    amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Power Backup', 'CCTV Security', 'RO Water', 'Locker Facility'],
    status: 'Available',
    hours: '24/7 Access'
  },
  {
    id: 'dedicated',
    apiType: 'dedicated',
    name: 'Dedicated Desk',
    description: 'Your own personal desk in a vibrant coworking environment. Leave your monitors and gear securely overnight.',
    image: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&q=80',
    icon: <Monitor className="w-8 h-8 text-secondary" />,
    colorClass: "text-secondary",
    bgAccent: "bg-secondary/5",
    borderHover: "hover:border-secondary",
    amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Power Backup', 'Printer & Scanner', 'Tea/Coffee', 'Housekeeping', 'Meeting Room Access'],
    status: 'Limited Seats',
    hours: '24/7 Access'
  },
  {
    id: 'cabin',
    apiType: 'cabin',
    name: 'Private Cabin',
    description: 'A fully furnished, soundproof private office for you and your small team. Focus without distractions.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80',
    icon: <Briefcase className="w-8 h-8 text-warning" />,
    colorClass: "text-warning",
    bgAccent: "bg-warning/5",
    borderHover: "hover:border-warning",
    amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Power Backup', 'Soundproof', 'Reception Support', 'Mail Handling', 'Parking'],
    status: 'Available',
    hours: '24/7 Access'
  },
  {
    id: 'conference',
    apiType: 'startup', // backend uses 'startup' for this category
    name: 'Conference Room',
    description: 'Spacious private offices and conference rooms tailored for growing startups, team collaborations, and board meetings.',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80',
    icon: <Rocket className="w-8 h-8 text-success" />,
    colorClass: "text-success",
    bgAccent: "bg-success/5",
    borderHover: "hover:border-success",
    amenities: ['6 Seats Capacity', 'High-Speed Wi-Fi', 'Projector & Screen', 'Air Conditioning', 'Power Backup', 'Whiteboard', 'Reception Support', 'Housekeeping'],
    status: 'Limited Availability',
    hours: '9 AM - 8 PM'
  }
];

const getAmenityIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('wi-fi')) return <Wifi className="w-5 h-5" />;
  if (n.includes('air')) return <Wind className="w-5 h-5" />;
  if (n.includes('power')) return <BatteryCharging className="w-5 h-5" />;
  if (n.includes('cctv') || n.includes('security')) return <ShieldCheck className="w-5 h-5" />;
  if (n.includes('water')) return <Droplet className="w-5 h-5" />;
  if (n.includes('coffee') || n.includes('tea')) return <Coffee className="w-5 h-5" />;
  if (n.includes('print') || n.includes('projector')) return <Printer className="w-5 h-5" />;
  if (n.includes('park')) return <Car className="w-5 h-5" />;
  if (n.includes('reception') || n.includes('seat')) return <Users className="w-5 h-5" />;
  if (n.includes('locker') || n.includes('soundproof')) return <Lock className="w-5 h-5" />;
  return <Sparkles className="w-5 h-5" />;
};

const DURATION_OPTIONS = [
  { value: 1, label: '1 Month' },
  { value: 3, label: '3 Months' },
  { value: 6, label: '6 Months' },
  { value: 12, label: '12 Months' },
];

export default function PricingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const seatParam = searchParams.get('seat');
  const isBookingMode = !!seatParam;

  useEffect(() => {
    // Check if we need to scroll to a specific section based on ?plan=
    const planParam = searchParams.get('plan');
    if (planParam) {
      setTimeout(() => {
        const targetId = planParam === 'startup' ? 'conference' : planParam;
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    } else {
      window.scrollTo(0, 0);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/bookings/public-plans/');
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
    const token = localStorage.getItem('access');
    const targetUrl = `/payment?plan=${encodeURIComponent(planName)}&months=${duration}${seatParam ? `&seat=${seatParam}` : ''}`;
    if (token) {
      navigate(targetUrl);
    } else {
      navigate(`/auth/signup?redirect=${encodeURIComponent(targetUrl)}`);
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const PricingSection = ({ facility }) => {
    const facilityPlans = plans.filter(p => p.workspace_type === facility.apiType);
    const [duration, setDuration] = useState(1);

    return (
      <section id={facility.id} className="pt-24 pb-12 border-t border-border-main scroll-mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: sticky details */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className={`rounded-2xl overflow-hidden border border-border-main shadow-lg bg-surface relative group`}>
              <div className="aspect-[4/3] relative overflow-hidden bg-black/5">
                <img 
                  src={facility.image} 
                  alt={facility.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white flex items-center gap-3">
                  <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg">
                    {React.cloneElement(facility.icon, { className: 'w-6 h-6 text-white' })}
                  </div>
                  <h2 className="text-2xl font-bold">{facility.name}</h2>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-sm text-text-main/80 leading-relaxed mb-6">
                  {facility.description}
                </p>
                <div className="space-y-4 text-sm border-t border-border-main/50 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-text-main/60 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Hours
                    </span>
                    <span className="font-medium">{facility.hours}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-main/60 flex items-center gap-2">
                      <Info className="w-4 h-4" /> Status
                    </span>
                    <span className={`font-medium ${facility.status.includes('Available') ? 'text-success' : 'text-warning'}`}>
                      {facility.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Amenities for Desktop */}
            <div className="hidden lg:block">
              <h3 className="font-bold mb-4">Included Amenities</h3>
              <ul className="grid grid-cols-2 gap-3">
                {facility.amenities.map((amenity, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-text-main/80 bg-surface p-2 rounded-lg border border-border-main/50">
                    <div className={facility.colorClass}>{getAmenityIcon(amenity)}</div>
                    <span className="truncate">{amenity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Plans */}
          <div className="lg:col-span-8 space-y-8">
            {/* Mobile Amenities Scroll */}
            <div className="lg:hidden mb-8">
              <h3 className="font-bold mb-3 px-1">Amenities</h3>
              <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 snap-x">
                {facility.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex-shrink-0 flex items-center gap-2 p-2 px-3 bg-surface border border-border-main/50 rounded-lg whitespace-nowrap snap-start shadow-sm">
                    <div className={facility.colorClass}>
                      {getAmenityIcon(amenity)}
                    </div>
                    <span className="text-xs font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-main pb-4">
              <div>
                <h3 className="text-2xl font-bold tracking-tight">Available Plans</h3>
                <p className="text-text-main/60 mt-1 text-sm">Choose the duration that fits your needs.</p>
              </div>
              
              {/* Duration Toggles */}
              <div className="flex bg-border-main/20 p-1 rounded-xl w-fit border border-border-main/50">
                {DURATION_OPTIONS.map(option => (
                  <button 
                    key={option.value}
                    onClick={() => setDuration(option.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                      duration === option.value 
                        ? 'bg-surface shadow-sm text-primary scale-105' 
                        : 'text-text-main/60 hover:text-text-main'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : facilityPlans.length === 0 ? (
              <Card className="bg-surface/50 border-dashed border-border-main text-center p-12">
                <p className="text-text-main/50">No plans currently available for {facility.name}.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {facilityPlans.map(plan => {
                  const totalPrice = getDurationPrice(plan, duration);
                  const savingsPct = getSavingsPercentage(plan, duration);
                  
                  return (
                    <Card key={plan.id} className={`relative overflow-hidden flex flex-col h-full ${facility.borderHover} transition-colors shadow-sm`}>
                      {savingsPct > 0 && (
                        <div className="absolute top-4 right-4 z-10">
                          <Badge variant="success" className="animate-pulse shadow-sm">Save {savingsPct}%</Badge>
                        </div>
                      )}
                      <CardHeader className={`${facility.bgAccent} pb-4 border-b border-border-main/50 relative`}>
                        <CardTitle className="text-lg pr-20 flex items-center gap-2">
                          {plan.name}
                          {plan.total_seats > 0 && (
                            <Badge variant="outline" className="text-xs bg-surface/50 border-border-main/50 text-text-main/70 flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {plan.total_seats} {plan.total_seats === 1 ? 'Seat' : 'Seats'}
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="mt-2">
                          <span className="text-3xl font-bold">₹{totalPrice.toLocaleString('en-IN')}</span>
                          <span className="text-sm text-text-main/60 ml-1">/{duration} {duration === 1 ? 'month' : 'months'}</span>
                          {savingsPct > 0 && (
                            <div className="text-xs text-text-main/50 line-through mt-1">
                              ₹{(parseFloat(plan.monthly_price) * duration).toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6 flex-1 flex flex-col">
                        <ul className="space-y-3 mb-8 flex-1">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                              <CheckCircle2 className={`w-5 h-5 ${facility.colorClass} shrink-0`} />
                              <span className="text-text-main/80">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button 
                          variant="primary" 
                          className={`w-full mt-auto`}
                          onClick={() => handleBookNow(plan.name, duration)}
                        >
                          {(isBookingMode && seatParam) ? 'Confirm & Pay' : 'Book Now'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-background pt-16 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Choose the Workspace That Fits You
          </h1>
          <p className="text-lg text-text-main/70 max-w-2xl mx-auto">
            Flexible plans designed for studying, individual work, private teams, and meetings.
          </p>
        </div>

        {isBookingMode && (
          <div className="mb-8 max-w-4xl mx-auto">
            <Badge variant="success" className="px-3 py-1 text-sm bg-success/10 text-success border-success/20 mb-2">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> 
                Booking Seat {seatParam}
              </span>
            </Badge>
            <p className="text-text-main/70 text-sm">Scroll down to select a plan for your chosen seat.</p>
          </div>
        )}

        {/* Workspace Category Anchor Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {FACILITIES.map((facility, idx) => (
            <motion.div
              key={facility.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <Card 
                className={`h-full border border-border-main ${facility.borderHover} transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md bg-surface group`}
                onClick={() => scrollToSection(facility.id)}
              >
                <div className="aspect-[16/9] relative overflow-hidden rounded-t-xl">
                  <img
                    src={facility.image}
                    alt={facility.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    {React.cloneElement(facility.icon, { className: `w-6 h-6 ${facility.colorClass}` })}
                    <h3 className="font-bold text-lg">{facility.name}</h3>
                  </div>
                  <p className="text-sm text-text-main/60 line-clamp-2 mb-4">
                    {facility.description}
                  </p>
                  <div className={`flex items-center text-sm font-semibold ${facility.colorClass} group-hover:translate-x-1 transition-transform`}>
                    Explore Plans <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Pricing Sections */}
        {FACILITIES.map(facility => (
          <PricingSection key={facility.id} facility={facility} />
        ))}

        {/* Contact / Help Section */}
        <section className="mt-20 text-center py-12 px-4 rounded-3xl bg-surface border border-border-main">
          <h2 className="text-2xl font-bold mb-4">Need Help Choosing?</h2>
          <p className="text-text-main/70 max-w-xl mx-auto mb-8">
            Our team is here to help you find the perfect workspace setup. Contact us for custom enterprise plans or a free campus tour.
          </p>
          <Button variant="outline" size="lg" onClick={() => navigate('/contact')}>
            Contact Sales Team
          </Button>
        </section>

      </div>
    </div>
  );
}
