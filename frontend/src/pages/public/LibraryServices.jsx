import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { BookOpen, Wifi, Coffee, MapPin, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function LibraryServices() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-24 md:pt-32 md:pb-32 overflow-hidden bg-background">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 dark:bg-primary/10 rounded-full blur-[120px] opacity-60 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-6 bg-primary/20 text-primary dark:bg-primary/30">
                Silent Zones
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold text-text-main tracking-tight mb-6 leading-tight">
                The ultimate <span className="text-primary">focus zone.</span>
              </h1>
              <p className="text-lg md:text-xl text-text-main/70 mb-8 leading-relaxed">
                Engineered for absolute silence. Our library spaces feature ergonomic seating, high-speed Wi-Fi, and natural lighting to keep you productive.
              </p>
              <div className="flex gap-4">
                <Link to="/book?type=library">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-8 rounded-2xl shadow-lg hover:-translate-y-1">
                    Get a Library Pass <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative hidden md:block">
              <div className="rounded-3xl overflow-hidden shadow-lg border border-border-main">
                <img 
                  src="https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=800" 
                  alt="Silent Library" 
                  className="w-full h-[500px] object-cover"
                />
              </div>
              <Card className="absolute -bottom-8 -left-8 p-4 w-64 bg-surface/80 backdrop-blur-xl border border-white/20">
                <CardContent className="p-2 flex items-center gap-4">
                  <div className="bg-primary/20 p-3 rounded-2xl">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-text-main">Downtown Hub</p>
                    <p className="text-sm text-success font-medium">Seats Available</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-surface border-y border-border-main/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text-main mb-4">Designed for deep work.</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: "Zero Distractions", desc: "Strict silence policies in all library zones ensuring you can focus." },
              { icon: Wifi, title: "Dedicated Wi-Fi", desc: "Priority bandwidth for library members. No buffering, no drops." },
              { icon: Coffee, title: "Café Access", desc: "Step out into our adjacent premium café when you need a break." }
            ].map((feature, i) => (
              <Card key={i} className="hover:-translate-y-1 border-0 shadow-sm bg-background">
                <CardContent className="p-8">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-text-main/70">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-white relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold mb-6">Secure your seat today.</h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
            Our library zones have limited capacity to ensure the best possible environment for our members.
          </p>
          <Link to="/book?type=library">
            <Button size="lg" className="h-14 px-8 text-lg rounded-2xl bg-surface text-primary hover:bg-surface/90 shadow-xl">
              Reserve a Seat
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
