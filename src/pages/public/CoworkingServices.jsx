import React from "react";
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
} from "lucide-react";

export default function CoworkingServices() {
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
            Whether you're a solo freelancer or a growing startup, our coworking
            spaces provide the infrastructure, community, and flexibility you
            need to scale.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/book?type=coworking">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto h-14 px-8 rounded-2xl shadow-lg hover:-translate-y-1"
              >
                Book a Desk <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/pricing?plan=coworking">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 rounded-2xl shadow-sm hover:-translate-y-1"
              >
                View Memberships
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-24 bg-surface border-t border-border-main/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <div className="order-2 md:order-1 relative rounded-3xl overflow-hidden shadow-lg border border-border-main aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200"
                alt="Dedicated Desk"
                className="w-full h-full object-cover"
              />
            </div>
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
            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-border-main aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80&w=1200"
                alt="Private Cabin"
                className="w-full h-full object-cover"
              />
            </div>
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
            <Link to="/pricing?plan=coworking">
              <Button
                size="lg"
                className="h-14 px-8 text-lg rounded-2xl shadow-lg hover:-translate-y-1"
              >
                Compare Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
