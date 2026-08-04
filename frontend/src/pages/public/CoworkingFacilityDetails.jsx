import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, Wifi, Wind, BatteryCharging, ShieldCheck, Droplet, Coffee, Lock, Sparkles, Clock, Info, Calendar, ArrowLeft, Printer, Car, Users
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getDurationPrice, getSavingsPercentage } from '../../lib/pricingUtils';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

const FACILITIES = {
  dedicated: {
    id: 'dedicated',
    name: 'Dedicated Desk',
    description: 'Your own personal desk in a vibrant coworking environment. Leave your monitors and gear securely overnight.',
    image: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&q=80',
    amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Power Backup', 'Printer & Scanner', 'Tea/Coffee', 'Housekeeping', 'Meeting Room Access'],
    status: 'Limited Seats',
    hours: '24/7 Access',
    workspaceType: 'Coworking Space',
    cancelPolicy: '30 days notice required.'
  },
  cabin: {
    id: 'cabin',
    name: 'Private Cabin',
    description: 'A fully furnished, soundproof private office for you and your small team. Focus without distractions.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80',
    amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Power Backup', 'Soundproof', 'Reception Support', 'Mail Handling', 'Parking'],
    status: 'Available',
    hours: '24/7 Access',
    workspaceType: 'Private Office',
    cancelPolicy: '30 days notice required.'
  }
};

const getAmenityIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('wi-fi')) return <Wifi className="w-5 h-5" />;
  if (n.includes('air')) return <Wind className="w-5 h-5" />;
  if (n.includes('power')) return <BatteryCharging className="w-5 h-5" />;
  if (n.includes('cctv') || n.includes('security')) return <ShieldCheck className="w-5 h-5" />;
  if (n.includes('water')) return <Droplet className="w-5 h-5" />;
  if (n.includes('coffee') || n.includes('tea')) return <Coffee className="w-5 h-5" />;
  if (n.includes('print')) return <Printer className="w-5 h-5" />;
  if (n.includes('park')) return <Car className="w-5 h-5" />;
  if (n.includes('reception')) return <Users className="w-5 h-5" />;
  if (n.includes('locker') || n.includes('soundproof')) return <Lock className="w-5 h-5" />;
  return <Sparkles className="w-5 h-5" />;
};

export default function CoworkingFacilityDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(1);

  const seatParam = searchParams.get('seat');
  const isBookingMode = !!seatParam;

  useEffect(() => {
    window.scrollTo(0, 0);
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

  const handleBookNow = (planName) => {
    const token = localStorage.getItem('access');
    const targetUrl = `/payment?plan=${encodeURIComponent(planName)}&months=${duration}${seatParam ? `&seat=${seatParam}` : ''}`;
    if (token) {
      navigate(targetUrl);
    } else {
      navigate(`/auth/signup?redirect=${encodeURIComponent(targetUrl)}`);
    }
  };

  const durationOptions = [
    { value: 1, label: '1 Month' },
    { value: 3, label: '3 Months' },
    { value: 6, label: '6 Months' },
    { value: 12, label: '12 Months' },
  ];

  // Helper component to render a facility section
  const FacilitySection = ({ facility }) => {
    const facilityPlans = plans.filter(p => p.workspace_type === facility.id);

    return (
      <div className="flex flex-col space-y-6 h-full">
        {/* Compact Image & Details Card */}
        <div className="rounded-2xl overflow-hidden border border-border-main shadow-md bg-surface relative group shrink-0">
          {/* Shorter aspect ratio for compact view */}
          <div className="aspect-[16/7] sm:aspect-[21/9] lg:aspect-[16/9] relative overflow-hidden bg-black/5">
            <img 
              src={facility.image} 
              alt={facility.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <Badge variant="primary" className="mb-2 bg-primary/90 text-white border-none shadow-sm backdrop-blur-md text-xs py-0.5 px-2">
                {facility.workspaceType}
              </Badge>
              <h2 className="text-xl sm:text-2xl font-bold">{facility.name}</h2>
            </div>
          </div>
          
          <div className="p-4 sm:p-5">
            <p className="text-sm text-text-main/80 leading-relaxed mb-4">
              {facility.description}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm border-t border-border-main/50 pt-3">
              <div className="flex items-center gap-2">
                <span className="text-text-main/60">Status:</span>
                <span className={`font-medium ${facility.status === 'Available' ? 'text-success' : 'text-warning'}`}>
                  {facility.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-main/60">Hours:</span>
                <span className="font-medium">{facility.hours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Amenities - Horizontal Scroll */}
        <div className="shrink-0">
          <h3 className="text-base font-bold mb-3 px-1">Amenities</h3>
          <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 snap-x">
            {facility.amenities.map((amenity, idx) => (
              <div key={idx} className="flex-shrink-0 flex items-center gap-2 p-2 px-3 bg-surface border border-border-main/50 rounded-lg whitespace-nowrap snap-start hover:border-primary/50 transition-colors">
                <div className="text-primary shrink-0">
                  {getAmenityIcon(amenity)}
                </div>
                <span className="text-xs font-medium">{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="flex-1 flex flex-col pt-2">
          <h3 className="text-base font-bold mb-4 px-1">Plans</h3>
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : facilityPlans.length === 0 ? (
            <Card className="bg-surface/50 border-dashed border-border-main text-center p-8 mt-auto">
              <p className="text-text-main/50 text-sm">No plans currently available.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 h-full">
              {facilityPlans.map(plan => {
                const totalPrice = getDurationPrice(plan, duration);
                const savingsPct = getSavingsPercentage(plan, duration);
                
                return (
                  <Card key={plan.id} className="relative overflow-hidden flex flex-col h-full hover:border-primary/50 transition-colors shadow-sm">
                    {savingsPct > 0 && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge variant="success" className="animate-pulse shadow-sm text-[10px] px-2 py-0.5">Save {savingsPct}%</Badge>
                      </div>
                    )}
                    <CardHeader className="bg-primary/5 pb-3 border-b border-border-main/50 relative px-4 pt-4 shrink-0">
                      <CardTitle className="text-base pr-16">{plan.name}</CardTitle>
                      <div className="mt-1">
                        <span className="text-2xl font-bold">₹{totalPrice.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-text-main/60 ml-1">/{duration} {duration === 1 ? 'mo' : 'mos'}</span>
                        {savingsPct > 0 && (
                          <div className="text-[10px] text-text-main/50 line-through mt-0.5">
                            ₹{(parseFloat(plan.monthly_price) * duration).toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 px-4 pb-4 flex-1 flex flex-col">
                      <ul className="space-y-2 mb-6 flex-1">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs">
                            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                            <span className="text-text-main/80">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        variant="primary" 
                        size="sm"
                        className="w-full mt-auto shrink-0"
                        onClick={() => handleBookNow(plan.name)}
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
    );
  };

  return (
    <div className="min-h-screen bg-background pt-6 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Global Toggles */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/pricing')} 
              className="flex items-center text-sm font-medium text-text-main/60 hover:text-primary transition-colors w-fit shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Back to Workspaces</span>
            </button>
            <h1 className="text-2xl font-bold tracking-tight">Coworking Space</h1>
          </div>
          
          {/* Global Duration Toggles */}
          <div className="flex bg-border-main/20 p-1 rounded-xl w-fit border border-border-main/50 overflow-x-auto no-scrollbar self-start sm:self-auto shrink-0">
            {durationOptions.map(option => (
              <button 
                key={option.value}
                onClick={() => setDuration(option.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 whitespace-nowrap ${
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

        {isBookingMode && (
          <div className="mb-8">
            <Badge variant="success" className="px-3 py-1 text-sm bg-success/10 text-success border-success/20">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> 
                Booking Seat {seatParam}
              </span>
            </Badge>
            <p className="text-text-main/70 mt-2 text-sm">Select a plan for your seat below.</p>
          </div>
        )}

        {/* Side-by-Side (Desktop) / Stacked (Mobile) Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-14 mt-4">
          {/* Left Column: Dedicated Desk */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col"
          >
            <FacilitySection facility={FACILITIES.dedicated} />
          </motion.div>

          {/* Right Column: Private Cabin */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col"
          >
            <FacilitySection facility={FACILITIES.cabin} />
          </motion.div>
        </div>

        {/* Global Additional Information */}
        <section className="mt-20">
          <div className="mb-6 border-b border-border-main pb-4">
            <h3 className="text-xl font-bold tracking-tight">Additional Information</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-surface rounded-xl border border-border-main flex items-start gap-4 hover:border-primary/50 transition-colors">
              <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Operating Hours</h4>
                <p className="text-xs text-text-main/70 leading-relaxed">24/7 Access for members. Staff available Mon-Sat, 9 AM - 7 PM.</p>
              </div>
            </div>
            <div className="p-4 bg-surface rounded-xl border border-border-main flex items-start gap-4 hover:border-primary/50 transition-colors">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Cancellation</h4>
                <p className="text-xs text-text-main/70 leading-relaxed">30 days notice required prior to the end of billing cycle.</p>
              </div>
            </div>
            <div className="p-4 bg-surface rounded-xl border border-border-main flex items-start gap-4 hover:border-primary/50 transition-colors">
              <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Seat Allocation</h4>
                <p className="text-xs text-text-main/70 leading-relaxed">Specific desks/cabins can be chosen during checkout based on availability.</p>
              </div>
            </div>
            <div className="p-4 bg-surface rounded-xl border border-border-main flex items-start gap-4 hover:border-primary/50 transition-colors">
              <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Terms & Conditions</h4>
                <p className="text-xs text-text-main/70 leading-relaxed">Members agree to our community guidelines and fair usage policy.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
