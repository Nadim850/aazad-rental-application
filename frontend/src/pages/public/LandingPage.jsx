import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Wifi,
  Coffee,
  Book,
  Monitor,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        {/* Background gradient effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50 dark:opacity-20" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="primary" className="mb-6 px-4 py-1.5 text-sm">
                Revolutionizing Work & Study Spaces
              </Badge>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                Your Premium <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  Workspace & Library
                </span>
              </h1>
              <p className="text-lg md:text-xl text-text-main/70 mb-10 max-w-2xl mx-auto leading-relaxed">
                Experience the perfect blend of silent focused study zones and
                dynamic collaborative dedicated spaces. Designed for
                freelancers, entrepreneurs, and ambitious teams.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8 rounded-full"
                  onClick={() => navigate("/book")}
                >
                  Book a Seat <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8 rounded-full bg-surface"
                  onClick={() => navigate("/pricing")}
                >
                  Explore Plans
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-text-main/70 max-w-xl mx-auto">
              Choose the environment that matches your current goal. Whether
              it's deep focus or team collaboration, we have you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <Card className="overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-border-main/50">
              <div className="h-48 bg-primary/10 relative overflow-hidden flex items-center justify-center">
                {/* Placeholder for image */}
                <Book className="w-20 h-20 text-primary opacity-50 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
              </div>
              <CardContent className="pt-6 relative flex flex-col h-[350px]">
                <div>
                  <Badge variant="outline" className="mb-4">
                    For Students & Readers
                  </Badge>
                  <h3 className="text-2xl font-bold mb-2">Premium Library</h3>
                  <p className="text-text-main/70 mb-6 line-clamp-2">
                    Pin-drop silence, ergonomic chairs, personal reading lights,
                    and high-speed WiFi. The ultimate environment for deep focus.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Dedicated silent zones",
                      "Ergonomic seating",
                      "Locker facilities",
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center text-sm">
                        <CheckCircle2 className="w-4 h-4 text-success mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/library")}
                  >
                    Explore Library
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group hover:shadow-xl hover:shadow-secondary/5 transition-all duration-300 border-border-main/50">
              <div className="h-48 bg-secondary/10 relative overflow-hidden flex items-center justify-center">
                {/* Placeholder for image */}
                <Monitor className="w-20 h-20 text-secondary opacity-50 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
              </div>
              <CardContent className="pt-6 relative flex flex-col h-[350px]">
                <div>
                  <Badge variant="outline" className="mb-4">
                    For Professionals
                  </Badge>
                  <h3 className="text-2xl font-bold mb-2">Dedicated Spaces</h3>
                  <p className="text-text-main/70 mb-6 line-clamp-2">
                    Dynamic open desks, private cabins, and state-of-the-art
                    meeting rooms designed to foster creativity and networking.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Hot desks & private cabins",
                      "Conference rooms",
                      "24/7 Access",
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center text-sm">
                        <CheckCircle2 className="w-4 h-4 text-success mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/dedicated")}
                  >
                    Explore Dedicated Spaces
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group hover:shadow-xl hover:shadow-success/5 transition-all duration-300 border-border-main/50">
              <div className="h-48 bg-success/10 relative overflow-hidden flex items-center justify-center">
                {/* Placeholder for image */}
                <svg className="w-20 h-20 text-success opacity-50 group-hover:scale-110 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
                  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
                </svg>
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
              </div>
              <CardContent className="pt-6 relative flex flex-col h-[350px]">
                <div>
                  <Badge variant="outline" className="mb-4">
                    For Growing Teams
                  </Badge>
                  <h3 className="text-2xl font-bold mb-2">Startup Suites</h3>
                  <p className="text-text-main/70 mb-6 line-clamp-2">
                    Move-in ready headquarters with enterprise-grade infrastructure. Scale your team without worrying about the lease.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Dedicated team suites",
                      "Private meeting pods",
                      "Enterprise IT infrastructure",
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center text-sm">
                        <CheckCircle2 className="w-4 h-4 text-success mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/startup")}
                  >
                    Explore Startups
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Designed around your productivity
              </h2>
              <p className="text-text-main/70 mb-8 text-lg">
                We've obsessed over every detail so you don't have to. From the
                lighting temperature to the ergonomic chairs, everything is
                optimized for your performance.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: <Wifi className="w-5 h-5" />, label: "Gigabit WiFi" },
                  {
                    icon: <Coffee className="w-5 h-5" />,
                    label: "Premium Cafe",
                  },
                  { icon: <Book className="w-5 h-5" />, label: "Silent Zones" },
                  {
                    icon: <Monitor className="w-5 h-5" />,
                    label: "Meeting Rooms",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 p-8 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-surface rounded-2xl shadow-2xl border border-border-main/50 p-6 flex flex-col justify-between">
                  {/* Mock dashboard/widget UI in the hero graphic */}
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20" />
                      <div>
                        <div className="w-24 h-3 bg-border-main rounded-full mb-2" />
                        <div className="w-16 h-2 bg-border-main/50 rounded-full" />
                      </div>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-full h-12 rounded-xl bg-background border border-border-main/50 flex items-center px-4 gap-4"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10" />
                        <div className="flex-1">
                          <div className="w-1/2 h-2 bg-border-main rounded-full mb-1.5" />
                          <div className="w-1/3 h-1.5 bg-border-main/50 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
