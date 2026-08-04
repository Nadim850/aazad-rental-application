import React, { useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Briefcase, ChevronRight, Monitor, Rocket } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";

export default function PricingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);

    // If coming from Seat Map with a specific plan/type selected, redirect directly to the specific facility page
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

  const OFFERINGS = [
    {
      id: "library",
      title: "Library Zones",
      description: "A pin-drop silence zone designed for deep focus, research, and uninterrupted study.",
      image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80",
      icon: <BookOpen className="w-8 h-8 text-primary" />,
      link: "/pricing/library",
      colorClass: "text-primary",
      hoverClass: "hover:border-primary"
    },
    {
      id: "dedicated-desk",
      title: "Dedicated Desks",
      description: "Your own personal desk in a vibrant coworking environment. Leave your monitors and gear securely overnight.",
      image: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&q=80",
      icon: <Monitor className="w-8 h-8 text-secondary" />,
      link: "/pricing/coworking",
      colorClass: "text-secondary",
      hoverClass: "hover:border-secondary"
    },
    {
      id: "private-cabin",
      title: "Private Cabins",
      description: "A fully furnished, soundproof private office for you and your small team. Focus without distractions.",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80",
      icon: <Briefcase className="w-8 h-8 text-warning" />,
      link: "/pricing/coworking",
      colorClass: "text-warning",
      hoverClass: "hover:border-warning"
    },
    {
      id: "startup",
      title: "Startup Spaces",
      description: "Large, customizable office spaces with independent access for growing companies and enterprise teams.",
      image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80",
      icon: <Rocket className="w-8 h-8 text-success" />,
      link: "/pricing/startup",
      colorClass: "text-success",
      hoverClass: "hover:border-success"
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-16 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Choose your workspace
          </h1>
          <p className="text-lg text-text-main/70 max-w-2xl mx-auto">
            Select the type of environment that best suits your work style. From
            absolute silence to vibrant collaboration.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
          {OFFERINGS.map((offering, idx) => {
            const seatQuery = searchParams.get("seat") ? `?seat=${searchParams.get("seat")}` : "";
            
            return (
              <motion.div
                key={offering.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Link to={`${offering.link}${seatQuery}`} className="block group h-full">
                  <Card className={`h-full border-2 border-border-main ${offering.hoverClass} transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl bg-surface flex flex-col`}>
                    <div className="aspect-video relative overflow-hidden shrink-0">
                      <img
                        src={offering.image}
                        alt={offering.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    </div>
                    <CardContent className="p-8 relative flex-1 flex flex-col">
                      <div className="absolute -top-10 right-8 bg-surface p-4 rounded-2xl shadow-lg border border-border-main">
                        {offering.icon}
                      </div>
                      <h2 className="text-3xl font-bold mb-3 pr-16">{offering.title}</h2>
                      <p className="text-text-main/70 leading-relaxed mb-8 flex-1">
                        {offering.description}
                      </p>
                      <div className={`flex items-center ${offering.colorClass} font-bold group-hover:translate-x-2 transition-transform mt-auto`}>
                        View Plans & Details{" "}
                        <ChevronRight className="ml-1 w-5 h-5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
