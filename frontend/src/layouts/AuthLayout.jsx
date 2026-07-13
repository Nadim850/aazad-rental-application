import { Outlet, Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Dynamic branding/illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface overflow-hidden items-center justify-center border-r border-border-main">
        <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10" />
        {/* Abstract decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-md text-center">
           <div className="flex justify-center mb-8">
             <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/30">
               <BookOpen size={48} />
             </div>
           </div>
           <h2 className="text-4xl font-bold mb-4 text-text-main">Your Space. Your Time.</h2>
           <p className="text-lg text-text-main/70">Join thousands of professionals and students optimizing their productivity at Aazad Rental.</p>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-32 bg-background">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-xl text-white">
                <BookOpen size={20} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-text-main">Aazad Rental</span>
            </Link>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
