import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Star, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';

export default function PricingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [duration, setDuration] = useState(1);
  const [activePlanFilter, setActivePlanFilter] = useState('all');

  const seatParam = searchParams.get('seat');
  const isBookingMode = !!seatParam;

  useEffect(() => {
    // Ensure page is at the top when navigating to it
    window.scrollTo(0, 0);
    
    const plan = searchParams.get('plan');
    if (plan === 'library' || plan === 'coworking' || plan === 'startup' || plan === 'coworking-dedicated' || plan === 'coworking-private') {
      setActivePlanFilter(plan);
    } else {
      setActivePlanFilter('all');
    }
  }, [searchParams]);

  const allPlans = [
    {
      id: 'library-basic',
      category: 'library',
      name: 'Silent Reader',
      monthlyPrice: 1999,
      yearlyPrice: 19990,
      description: 'Perfect for students preparing for competitive exams.',
      features: ['Dedicated silent zone access', 'High-speed WiFi', 'Ergonomic seating', 'Locker access', '9 AM - 9 PM Access'],
      popular: false,
    },
    {
      id: 'coworking-dedicated',
      category: 'coworking',
      name: 'Dedicated Desk',
      monthlyPrice: 6999,
      yearlyPrice: 69990,
      description: 'Your own personal desk that remains yours 24/7.',
      features: ['Fixed desk with storage', 'Unlimited premium coffee', '5 hrs meeting room/mo', 'High-speed WiFi', '24/7 Access'],
      popular: true,
    },
    {
      id: 'coworking-private',
      category: 'coworking',
      name: 'Private Cabin',
      monthlyPrice: 14999,
      yearlyPrice: 149990,
      description: 'Fully furnished, soundproof private offices for growing startups.',
      features: ['Customizable layout', 'Mail & package handling', '10 hrs meeting room/mo', 'Dedicated IT infrastructure', '24/7 Access'],
      popular: false,
    },
    {
      id: 'startup-enterprise',
      category: 'startup',
      name: 'Enterprise Suite',
      monthlyPrice: 24999,
      yearlyPrice: 249990,
      description: 'Custom-built private suites for growing teams of 10-50.',
      features: ['Dedicated private office', 'Custom layout & branding', 'Unlimited meeting rooms', 'Dedicated IT infrastructure', '24/7 Biometric access'],
      popular: true,
    }
  ];

  const filteredPlans = allPlans.filter(
    plan => activePlanFilter === 'all' || plan.category === activePlanFilter || plan.id === activePlanFilter
  );

  const getPriceData = (basePrice, months) => {
    let discountPercent = 0;
    if (months === 3) discountPercent = 10;
    if (months === 6) discountPercent = 15;
    if (months === 12) discountPercent = 20;
    
    const totalWithoutDiscount = basePrice * months;
    const totalWithDiscount = Math.round(totalWithoutDiscount * (1 - discountPercent / 100));
    const savings = totalWithoutDiscount - totalWithDiscount;
    const effectiveMonthly = Math.round(totalWithDiscount / months);

    return { totalWithDiscount, savings, effectiveMonthly };
  };

  const durationOptions = [
    { value: 1, label: '1 Month', discount: 0 },
    { value: 3, label: '3 Months', discount: 10 },
    { value: 6, label: '6 Months', discount: 15, popular: true },
    { value: 12, label: '12 Months', discount: 20 },
  ];

  return (
    <div className="pt-6 pb-24 max-w-6xl mx-auto px-4">
      
      <div className="mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-sm font-medium text-text-main/60 hover:text-text-main transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-4">
        
        {isBookingMode ? (
          <div className="mb-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Badge variant="success" className="px-3 py-1 text-xs md:text-sm mb-3 bg-success/10 text-success border-success/20 shadow-sm">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> 
                Booking Seat {seatParam} &bull; {activePlanFilter.charAt(0).toUpperCase() + activePlanFilter.slice(1)}
              </span>
            </Badge>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
              Select your membership
            </h1>
            <p className="text-sm md:text-base text-text-main/70 max-w-2xl mx-auto mb-2">
              You've chosen a great spot. Now pick a plan to finalize your reservation.
            </p>
            <button 
              onClick={() => navigate('/pricing')}
              className="text-xs md:text-sm text-primary hover:text-primary-dark underline underline-offset-4 transition-colors"
            >
              View All Plans
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-base md:text-lg text-text-main/70 max-w-2xl mx-auto mb-6">
              No hidden fees. No surprise charges. Choose the plan that best fits your workflow and upgrade anytime.
            </p>
          </div>
        )}

        {/* Filters & Toggles */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
          
          {/* Plan Category Filter */}
          {!isBookingMode && (
            <div className="bg-border-main/50 p-1 rounded-xl inline-flex text-sm font-medium animate-in fade-in zoom-in-95 duration-300">
              <button 
                className={`px-4 py-2 rounded-lg transition-colors ${activePlanFilter === 'all' ? 'bg-surface shadow-sm' : 'hover:bg-surface/50 text-text-main/70'}`}
                onClick={() => setActivePlanFilter('all')}
              >
                All Plans
              </button>
              <button 
                className={`px-4 py-2 rounded-lg transition-colors ${activePlanFilter === 'library' ? 'bg-surface shadow-sm' : 'hover:bg-surface/50 text-text-main/70'}`}
                onClick={() => setActivePlanFilter('library')}
              >
                Library Only
              </button>
              <button 
                className={`px-4 py-2 rounded-lg transition-colors ${activePlanFilter === 'coworking' ? 'bg-surface shadow-sm' : 'hover:bg-surface/50 text-text-main/70'}`}
                onClick={() => setActivePlanFilter('coworking')}
              >
                Coworking Only
              </button>
              <button 
                className={`px-4 py-2 rounded-lg transition-colors ${activePlanFilter === 'startup' ? 'bg-surface shadow-sm' : 'hover:bg-surface/50 text-text-main/70'}`}
                onClick={() => setActivePlanFilter('startup')}
              >
                Startup Teams
              </button>
            </div>
          )}

          {/* Duration Tabs */}
          <div className="flex flex-wrap justify-center gap-1.5 mt-2 sm:mt-0 bg-border-main/20 p-1 rounded-2xl w-fit border border-border-main/50">
            {durationOptions.map(option => (
              <button 
                key={option.value}
                onClick={() => setDuration(option.value)}
                className={`relative px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 ${duration === option.value ? 'bg-surface shadow-md text-primary scale-105 z-10' : 'text-text-main/60 hover:text-text-main hover:bg-border-main/30'}`}
              >
                {option.popular && (
                  <span className="absolute -top-3 -right-2 bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full shadow-sm font-bold uppercase tracking-wider">
                    Popular
                  </span>
                )}
                <span className="flex flex-col items-center">
                  <span>{option.label}</span>
                  {option.discount > 0 && <span className="text-[9px] opacity-70 mt-0.5 font-normal">Save {option.discount}%</span>}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="flex flex-wrap justify-center gap-6 md:gap-8 mt-6">
        <AnimatePresence mode="popLayout">
          {filteredPlans.map((plan) => (
            <motion.div
              key={plan.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-sm"
            >
              <Card className={`relative h-full flex flex-col ${plan.popular ? 'border-primary shadow-lg shadow-primary/10 scale-105 z-10' : ''}`}>
                
                {/* Most Popular Badge popping out of the card */}
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                    <Badge variant="primary" className="px-4 py-1.5 text-xs uppercase tracking-wider font-bold shadow-md shadow-primary/20 bg-primary text-white border-none flex items-center gap-1.5">
                      <Star size={12} className="fill-white" /> Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="pt-4 text-center pb-2">
                  <Badge variant="outline" className="mx-auto mb-2 text-[10px] py-0.5">{plan.category.toUpperCase()}</Badge>
                  <CardTitle className="text-xl mb-1">{plan.name}</CardTitle>
                  <CardContent className="px-0 pb-0 min-h-[36px]">
                    <p className="text-xs text-text-main/70 leading-relaxed">{plan.description}</p>
                  </CardContent>
                </CardHeader>
                
                <CardContent className="flex-1 text-center pb-2">
                  {(() => {
                    const { totalWithDiscount, savings, effectiveMonthly } = getPriceData(plan.monthlyPrice, duration);
                    return (
                      <>
                        <div className="my-3">
                          <span className="text-3xl md:text-4xl font-extrabold tracking-tight">₹{totalWithDiscount.toLocaleString('en-IN')}</span>
                          <span className="text-text-main/50 font-medium ml-1 text-xs">/{duration === 1 ? 'mo' : `${duration} mos`}</span>
                        </div>
                        {duration > 1 && (
                          <div className="text-[10px] font-medium text-success bg-success/10 py-1 px-2.5 rounded-full inline-block mb-1 border border-success/20">
                            Save ₹{savings.toLocaleString('en-IN')} (₹{effectiveMonthly.toLocaleString('en-IN')}/mo)
                          </div>
                        )}
                      </>
                    );
                  })()}
                  
                  <div className="space-y-2.5 text-left mt-4">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-3 pb-4 mt-auto">
                  <Button 
                    variant={plan.popular ? 'primary' : 'outline'} 
                    className="w-full shadow-md hover:-translate-y-0.5 transition-transform"
                    onClick={() => {
                      const currentSeat = searchParams.get('seat');
                      navigate(`/payment?plan=${encodeURIComponent(plan.name)}${currentSeat ? `&seat=${currentSeat}` : ''}`);
                    }}
                  >
                    {(isBookingMode && seatParam) ? 'Continue to Payment' : 'Get Started'}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
