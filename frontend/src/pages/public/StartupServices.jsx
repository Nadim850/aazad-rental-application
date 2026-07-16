import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Users, Presentation, Server, ShieldCheck, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function StartupServices() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-24 md:pt-32 md:pb-32 overflow-hidden bg-background">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-success/20 dark:bg-success/10 rounded-full blur-[120px] opacity-60 z-0 translate-x-1/4"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <Badge className="mb-6 bg-success/20 text-success dark:bg-success/30">
              For Growing Teams
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold text-text-main tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
              Headquarters for the next <span className="text-success">generation</span> of startups.
            </h1>
            <p className="text-lg md:text-xl text-text-main/70 mb-10 leading-relaxed max-w-2xl mx-auto">
              Custom-built suites, high-tech conference rooms, and enterprise-grade infrastructure. Scale your team without worrying about the lease.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/pricing?plan=startup">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 rounded-2xl shadow-lg hover:-translate-y-1 bg-success hover:bg-success/90 text-white border-none">
                  Request a Tour <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/pricing?plan=startup">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-2xl shadow-sm hover:-translate-y-1">
                  View Enterprise Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-24 bg-surface border-t border-border-main/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <div className="order-2 md:order-1 relative rounded-3xl overflow-hidden shadow-lg border border-border-main aspect-[4/3]">
              <img 
                src="https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=1200" 
                alt="Conference Room" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-6">
                <Presentation className="w-6 h-6 text-success" />
              </div>
              <h2 className="text-3xl font-bold text-text-main mb-4">Conference Rooms</h2>
              <p className="text-text-main/70 mb-8 text-lg">
                State-of-the-art meeting spaces designed for high-stakes pitches, collaborative workshops, and executive board meetings.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-text-main/80">
                  <CheckCircle2 className="w-5 h-5 text-success" /> 4K presentation displays with Apple TV/Chromecast
                </li>
                <li className="flex items-center gap-3 text-text-main/80">
                  <CheckCircle2 className="w-5 h-5 text-success" /> High-fidelity conference audio & camera setup
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-24 bg-background border-t border-border-main/50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text-main mb-4">Enterprise-grade amenities.</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 shadow-sm bg-surface">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Server className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Dedicated IT Infrastructure</h3>
                <p className="text-text-main/70">Private VLANs, dedicated bandwidth allocations, and secure server rack space available for your team's exclusive use.</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-surface">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6 text-success" />
                </div>
                <h3 className="text-xl font-bold mb-3">Enhanced Security</h3>
                <p className="text-text-main/70">24/7 biometric access control, localized CCTV monitoring, and strict guest registration protocols for total peace of mind.</p>
              </CardContent>
            </Card>
          </div>
         </div>
      </section>
      
      {/* CTA */}
      <section className="py-24 bg-surface border-t border-border-main/50 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-text-main mb-6">Ready to scale your operations?</h2>
          <p className="text-text-main/70 text-lg mb-10 max-w-xl mx-auto">
            Speak with our enterprise team to build a custom workspace solution that fits your startup's trajectory.
          </p>
          <div className="flex justify-center">
            <Link to="/pricing?plan=startup">
              <Button size="lg" className="h-14 px-8 text-lg rounded-2xl shadow-lg hover:-translate-y-1">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
