import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Briefcase, ChevronRight, Monitor, Rocket, ChevronLeft } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";

const OFFERINGS = [
  {
    id: "library",
    title: "Library Zones",
    description: "A pin-drop silence zone designed for deep focus, research, and uninterrupted study.",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80",
    icon: <BookOpen className="w-8 h-8 md:w-12 md:h-12 text-primary" />,
    link: "/pricing/library",
    colorClass: "text-primary",
    hoverClass: "hover:border-primary border-primary/20",
    bgAccent: "bg-primary/5"
  },
  {
    id: "dedicated-desk",
    title: "Dedicated Desks",
    description: "Your own personal desk in a vibrant coworking environment. Leave your monitors and gear securely overnight.",
    image: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&q=80",
    icon: <Monitor className="w-8 h-8 md:w-12 md:h-12 text-secondary" />,
    link: "/pricing/coworking",
    colorClass: "text-secondary",
    hoverClass: "hover:border-secondary border-secondary/20",
    bgAccent: "bg-secondary/5"
  },
  {
    id: "private-cabin",
    title: "Private Cabins",
    description: "A fully furnished, soundproof private office for you and your small team. Focus without distractions.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80",
    icon: <Briefcase className="w-8 h-8 md:w-12 md:h-12 text-warning" />,
    link: "/pricing/coworking",
    colorClass: "text-warning",
    hoverClass: "hover:border-warning border-warning/20",
    bgAccent: "bg-warning/5"
  },
  {
    id: "startup",
    title: "Startup Spaces",
    description: "Large, customizable office spaces with independent access for growing companies and enterprise teams.",
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80",
    icon: <Rocket className="w-8 h-8 md:w-12 md:h-12 text-success" />,
    link: "/pricing/startup",
    colorClass: "text-success",
    hoverClass: "hover:border-success border-success/20",
    bgAccent: "bg-success/5"
  }
];

const variants = {
  enter: (direction) => {
    return {
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (direction) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    };
  }
};

export default function PricingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Redirect logic if arriving with specific seat parameters
    const seatParam = searchParams.get("seat");
    const planParam = searchParams.get("plan");
    if (seatParam && planParam) {
      if (planParam === "library") {
        navigate(`/pricing/library?seat=${seatParam}`, { replace: true });
      } else if (planParam === "startup") {
        navigate(`/pricing/startup?seat=${seatParam}`, { replace: true });
      } else {
        navigate(`/pricing/coworking?seat=${seatParam}&plan=${planParam}`, {
          replace: true,
        });
      }
    }
  }, [searchParams, navigate]);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    let newIndex = currentIndex + newDirection;
    if (newIndex < 0) {
      newIndex = OFFERINGS.length - 1;
    } else if (newIndex >= OFFERINGS.length) {
      newIndex = 0;
    }
    setCurrentIndex(newIndex);
  };

  const currentOffering = OFFERINGS[currentIndex];
  const seatQuery = searchParams.get("seat") ? `?seat=${searchParams.get("seat")}` : "";

  return (
    <div className="min-h-screen bg-background pt-16 pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Choose your workspace
          </h1>
          <p className="text-lg text-text-main/70 max-w-2xl mx-auto">
            Select the type of environment that best suits your work style. Swipe through to discover all our offerings.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-4xl mx-auto flex items-center justify-center">
          
          {/* Left Arrow */}
          <button 
            onClick={() => paginate(-1)}
            className="absolute left-0 lg:-left-16 z-10 p-3 rounded-full bg-surface shadow-md border border-border-main text-text-main/70 hover:text-primary hover:border-primary transition-colors hidden sm:flex items-center justify-center focus:outline-none"
            aria-label="Previous offering"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Card Display Area */}
          <div className="relative w-full aspect-[4/5] sm:aspect-square md:aspect-[16/10] overflow-hidden rounded-3xl p-1">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                  scale: { duration: 0.2 }
                }}
                className="w-full h-full"
              >
                <Link to={`${currentOffering.link}${seatQuery}`} className="block h-full group">
                  <Card className={`h-full flex flex-col border-2 ${currentOffering.hoverClass} transition-all duration-300 overflow-hidden shadow-md hover:shadow-2xl bg-surface`}>
                    
                    {/* Image Section */}
                    <div className="relative h-1/2 md:h-[55%] overflow-hidden">
                      <img
                        src={currentOffering.image}
                        alt={currentOffering.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:opacity-80" />
                      
                      {/* Icon overlay inside image on desktop */}
                      <div className="absolute bottom-6 right-6 bg-surface/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/10 hidden md:block group-hover:scale-110 transition-transform">
                        {currentOffering.icon}
                      </div>
                    </div>

                    {/* Content Section */}
                    <CardContent className={`p-6 md:p-10 relative flex-1 flex flex-col ${currentOffering.bgAccent}`}>
                      {/* Icon overlay on mobile (overlapping border) */}
                      <div className="absolute -top-8 right-6 bg-surface p-3 rounded-2xl shadow-lg border border-border-main md:hidden">
                        {currentOffering.icon}
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-center">
                        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{currentOffering.title}</h2>
                        <p className="text-base md:text-lg text-text-main/70 leading-relaxed mb-6 md:mb-8">
                          {currentOffering.description}
                        </p>
                      </div>

                      <div className={`flex items-center text-lg ${currentOffering.colorClass} font-bold group-hover:translate-x-2 transition-transform mt-auto`}>
                        View Plans & Details{" "}
                        <ChevronRight className="ml-2 w-6 h-6" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Arrow */}
          <button 
            onClick={() => paginate(1)}
            className="absolute right-0 lg:-right-16 z-10 p-3 rounded-full bg-surface shadow-md border border-border-main text-text-main/70 hover:text-primary hover:border-primary transition-colors hidden sm:flex items-center justify-center focus:outline-none"
            aria-label="Next offering"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Navigation & Pagination */}
        <div className="mt-8 flex flex-col items-center justify-center gap-6">
          {/* Mobile Arrows */}
          <div className="flex items-center gap-6 sm:hidden">
            <button 
              onClick={() => paginate(-1)}
              className="p-4 rounded-full bg-surface shadow-sm border border-border-main active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-6 h-6 text-text-main/70" />
            </button>
            <button 
              onClick={() => paginate(1)}
              className="p-4 rounded-full bg-surface shadow-sm border border-border-main active:scale-95 transition-transform"
            >
              <ChevronRight className="w-6 h-6 text-text-main/70" />
            </button>
          </div>

          {/* Pagination Dots */}
          <div className="flex gap-3">
            {OFFERINGS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex 
                    ? `w-8 h-2.5 ${OFFERINGS[currentIndex].colorClass.replace('text-', 'bg-')}` 
                    : "w-2.5 h-2.5 bg-border-main hover:bg-border-main/70"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
