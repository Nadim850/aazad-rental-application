import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Wifi, Wind, BatteryCharging, ShieldCheck, Droplet, Coffee, Lock, Sparkles, Clock, Info, Calendar, ArrowLeft, Printer, Car, Users
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

const FACILITIES = {
  startup: {
    id: 'startup',
    name: 'Conference Room',
    description: 'Spacious private offices and conference rooms tailored for growing startups and team collaborations.',
    image: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&q=80',
    amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Power Backup', 'Meeting Room Access', 'Reception Support', 'Housekeeping', 'Parking', 'IT Support'],
    status: 'Limited Availability',
    hours: '24/7 Access',
    workspaceType: 'Enterprise & Startups',
    cancelPolicy: '60 days notice required.'
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

export default function StartupFacilityDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeFacility, setActiveFacility] = useState('startup');
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

  const getFilteredPlans = () => {
    return plans.filter(plan => plan.workspace_type === activeFacility);
  };

  const facility = FACILITIES[activeFacility];
  const filteredPlans = getFilteredPlans();

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

  return (
    <div className="min-h-screen bg-background pt-6 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button & Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button 
            onClick={() => navigate('/startup')} 
            className="flex items-center text-sm font-medium text-text-main/60 hover:text-primary transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Startup Services
          </button>
        </div>

        {isBookingMode && (
          <div className="mb-8">
            <Badge variant="success" className="px-3 py-1 text-sm bg-success/10 text-success border-success/20">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> 
                Booking Seat {seatParam} &bull; {facility.name}
              </span>
            </Badge>
            <h1 className="text-3xl font-bold mt-4">Select your membership plan</h1>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mt-4">
          
          {/* Left Column: Sticky Facility Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={facility.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="rounded-2xl overflow-hidden border border-border-main shadow-lg bg-surface relative group">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img 
                      src={facility.image} 
                      alt={facility.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <Badge variant="primary" className="mb-2 bg-primary/90 text-white border-none shadow-sm backdrop-blur-md">
                        {facility.workspaceType}
                      </Badge>
                      <h2 className="text-2xl font-bold">{facility.name}</h2>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-sm text-text-main/80 leading-relaxed mb-6">
                      {facility.description}
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-main/60">Status</span>
                        <span className={`font-medium ${facility.status === 'Available' ? 'text-success' : 'text-warning'}`}>
                          {facility.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-main/60">Access Hours</span>
                        <span className="font-medium">{facility.hours}</span>
                      </div>
                    </div>

                    <div className="mt-8">
                      <Button 
                        variant="primary" 
                        className="w-full" 
                        onClick={() => {
                          const plansSection = document.getElementById('plans-section');
                          if (plansSection) {
                            plansSection.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                      >
                        View Available Plans
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Details & Plans */}
          <div className="lg:col-span-8 space-y-12">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={facility.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-12"
              >
                
                {/* About & Amenities Section */}
                <section>
                  <div className="mb-6 border-b border-border-main pb-4">
                    <h3 className="text-2xl font-bold tracking-tight">Facilities & Amenities</h3>
                    <p className="text-text-main/60 mt-1">Everything you need to work effectively.</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {facility.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex flex-col items-center justify-center p-4 bg-surface border border-border-main/50 rounded-xl text-center hover:border-primary/50 transition-colors group">
                        <div className="p-3 bg-primary/5 rounded-full text-primary mb-3 group-hover:scale-110 transition-transform">
                          {getAmenityIcon(amenity)}
                        </div>
                        <span className="text-xs font-medium">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Plans Table Section */}
                <section id="plans-section" className="scroll-mt-24">
                  <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-main pb-4">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight">Available Plans</h3>
                      <p className="text-text-main/60 mt-1">Choose the duration that fits your needs.</p>
                    </div>
                    
                    {/* Duration Toggles */}
                    <div className="flex bg-border-main/20 p-1 rounded-xl w-fit border border-border-main/50">
                      {durationOptions.map(option => (
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
                  ) : filteredPlans.length === 0 ? (
                    <Card className="bg-surface/50 border-dashed border-border-main text-center p-12">
                      <p className="text-text-main/50">No plans currently available for this facility.</p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredPlans.map(plan => {
                        const basePrice = parseFloat(plan.monthly_price);
                        const totalPrice = basePrice * duration;
                        
                        return (
                          <Card key={plan.id} className="relative overflow-hidden flex flex-col h-full hover:border-primary/50 transition-colors">
                            <CardHeader className="bg-primary/5 pb-4 border-b border-border-main/50">
                              <CardTitle className="text-lg">{plan.name}</CardTitle>
                              <div className="mt-2">
                                <span className="text-3xl font-bold">₹{totalPrice.toLocaleString('en-IN')}</span>
                                <span className="text-sm text-text-main/60 ml-1">/{duration} {duration === 1 ? 'month' : 'months'}</span>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-6 flex-1 flex flex-col">
                              <ul className="space-y-3 mb-8 flex-1">
                                {plan.features.map((feature, i) => (
                                  <li key={i} className="flex items-start gap-3 text-sm">
                                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                                    <span className="text-text-main/80">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                              <Button 
                                variant="primary" 
                                className="w-full mt-auto"
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
                </section>

                {/* Additional Information */}
                <section>
                  <div className="mb-6 border-b border-border-main pb-4">
                    <h3 className="text-2xl font-bold tracking-tight">Additional Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-surface rounded-xl border border-border-main flex items-start gap-4">
                      <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Operating Hours</h4>
                        <p className="text-sm text-text-main/70">{facility.hours}. Staff available Monday to Saturday, 9 AM - 7 PM.</p>
                      </div>
                    </div>
                    <div className="p-4 bg-surface rounded-xl border border-border-main flex items-start gap-4">
                      <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Cancellation Policy</h4>
                        <p className="text-sm text-text-main/70">{facility.cancelPolicy}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-surface rounded-xl border border-border-main flex items-start gap-4">
                      <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Seat Allocation</h4>
                        <p className="text-sm text-text-main/70">Seats are subject to availability. You can choose a specific seat during the booking process.</p>
                      </div>
                    </div>
                    <div className="p-4 bg-surface rounded-xl border border-border-main flex items-start gap-4">
                      <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Terms & Conditions</h4>
                        <p className="text-sm text-text-main/70">By booking, you agree to our community guidelines and workspace policies.</p>
                      </div>
                    </div>
                  </div>
                </section>

              </motion.div>
            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  );
}
