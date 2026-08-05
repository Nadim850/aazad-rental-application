import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import {
  Briefcase,
  Building2,
  Monitor,
  Users,
  ChevronRight,
  CheckCircle2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CoworkingServices() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-24 md:pt-32 md:pb-32 overflow-hidden bg-background">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-secondary/20 dark:bg-secondary/10 rounded-full blur-[120px] opacity-60 z-0 -translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Badge className="mb-6 bg-secondary/20 text-secondary dark:bg-secondary/30">
            Enterprise Grade
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold text-text-main tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
            Workspaces designed for{" "}
            <span className="text-secondary">collaboration</span> and growth.
          </h1>
          <p className="text-lg md:text-xl text-text-main/70 mb-10 leading-relaxed max-w-2xl mx-auto">
            Whether you're a solo freelancer or a growing startup, our dedicated
            spaces provide the infrastructure, community, and flexibility you
            need to scale.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/book?type=dedicated">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto h-14 px-8 rounded-2xl shadow-lg hover:-translate-y-1"
              >
                Book a Desk <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-14 px-8 rounded-2xl shadow-sm hover:-translate-y-1"
              onClick={() => setIsModalOpen(true)}
            >
              View Memberships
            </Button>
          </div>
        </div>
      </section>

      {/* Membership Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border-main rounded-3xl p-6 md:p-8 max-w-lg w-full relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-text-main/50 hover:text-text-main hover:bg-border-main/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bold mb-2">Explore Memberships</h3>
            <p className="text-text-main/70 mb-8">Which facility would you like to explore?</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  navigate('/pricing?plan=dedicated');
                }}
                className="flex flex-col items-center text-center p-6 rounded-2xl border border-border-main hover:border-secondary hover:bg-secondary/5 transition-all group"
              >
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Monitor className="w-6 h-6 text-secondary" />
                </div>
                <span className="font-semibold text-lg">Dedicated Desk</span>
              </button>
              
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  navigate('/pricing?plan=cabin');
                }}
                className="flex flex-col items-center text-center p-6 rounded-2xl border border-border-main hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <span className="font-semibold text-lg">Private Cabin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Solutions Grid */}
      <section className="py-24 bg-surface border-t border-border-main/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <Link to="/pricing?plan=dedicated" className="order-2 md:order-1 relative rounded-3xl overflow-hidden shadow-lg border border-border-main aspect-[4/3] group block cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200"
                alt="Dedicated Desk"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-black px-4 py-2 rounded-full font-medium shadow-sm transform translate-y-4 group-hover:translate-y-0 transition-all">View Pricing</span>
              </div>
            </Link>
            <div className="order-1 md:order-2">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
                <Monitor className="w-6 h-6 text-secondary" />
              </div>
              <h2 className="text-3xl font-bold text-text-main mb-4">
                Dedicated Desks
              </h2>
              <p className="text-text-main/70 mb-8 text-lg">
                Your own permanent desk in a shared workspace. Leave your
                monitors and equipment securely overnight. Ideal for dedicated
                freelancers and small teams.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-text-main/80">
                  <CheckCircle2 className="w-5 h-5 text-secondary" /> Lockable
                  filing cabinet
                </li>
                <li className="flex items-center gap-3 text-text-main/80">
                  <CheckCircle2 className="w-5 h-5 text-secondary" /> 24/7
                  building access
                </li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-text-main mb-4">
                Private Cabins
              </h2>
              <p className="text-text-main/70 mb-8 text-lg">
                Fully furnished, soundproof private offices for growing startups
                and established teams. Scale your space as you scale your team.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-text-main/80">
                  <CheckCircle2 className="w-5 h-5 text-primary" /> Customizable
                  layout
                </li>
                <li className="flex items-center gap-3 text-text-main/80">
                  <CheckCircle2 className="w-5 h-5 text-primary" /> Mail &
                  package handling
                </li>
              </ul>
            </div>
            <Link to="/pricing?plan=cabin" className="relative rounded-3xl overflow-hidden shadow-lg border border-border-main aspect-[4/3] group block cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80&w=1200"
                alt="Private Cabin"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-black px-4 py-2 rounded-full font-medium shadow-sm transform translate-y-4 group-hover:translate-y-0 transition-all">View Pricing</span>
              </div>
            </Link>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-background border-t border-border-main/50 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-text-main mb-6">
            Take your workspace to the next level.
          </h2>
          <p className="text-text-main/70 text-lg mb-10 max-w-xl mx-auto">
            Join our community of innovators and creators. Flexible
            month-to-month plans available.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="h-14 px-8 text-lg rounded-2xl shadow-lg hover:-translate-y-1"
              onClick={() => setIsModalOpen(true)}
            >
              Compare Plans
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
