import React, { useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Briefcase, ChevronRight } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background pt-16 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Choose your workspace
          </h1>
          <p className="text-lg text-text-main/70 max-w-2xl mx-auto">
            Select the type of environment that best suits your work style. From
            absolute silence to vibrant collaboration.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Library Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link to={`/pricing/library${searchParams.get("seat") ? `?seat=${searchParams.get("seat")}` : ""}`} className="block group h-full">
              <Card className="h-full border-2 border-border-main hover:border-primary transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl bg-surface">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80"
                    alt="Library Zone"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                </div>
                <CardContent className="p-8 relative">
                  <div className="absolute -top-10 right-8 bg-surface p-4 rounded-2xl shadow-lg border border-border-main">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold mb-3">Library Zones</h2>
                  <p className="text-text-main/70 leading-relaxed mb-8">
                    A pin-drop silence zone designed for deep focus, research,
                    and uninterrupted study.
                  </p>
                  <div className="flex items-center text-primary font-bold group-hover:translate-x-2 transition-transform">
                    View Plans & Details{" "}
                    <ChevronRight className="ml-1 w-5 h-5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* Coworking Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Link to={`/pricing/coworking${searchParams.get("seat") ? `?seat=${searchParams.get("seat")}` : ""}`} className="block group h-full">
              <Card className="h-full border-2 border-border-main hover:border-secondary transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl bg-surface">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&q=80"
                    alt="Coworking Space"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                </div>
                <CardContent className="p-8 relative">
                  <div className="absolute -top-10 right-8 bg-surface p-4 rounded-2xl shadow-lg border border-border-main">
                    <Briefcase className="w-8 h-8 text-secondary" />
                  </div>
                  <h2 className="text-3xl font-bold mb-3">Coworking Spaces</h2>
                  <p className="text-text-main/70 leading-relaxed mb-8">
                    Vibrant shared desks, private cabins, and team offices
                    designed for collaboration and growth.
                  </p>
                  <div className="flex items-center text-secondary font-bold group-hover:translate-x-2 transition-transform">
                    View Plans & Details{" "}
                    <ChevronRight className="ml-1 w-5 h-5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
