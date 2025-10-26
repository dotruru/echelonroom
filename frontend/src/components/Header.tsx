import { Shield, Activity } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/30 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary cyber-pulse" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-primary">the echelon room</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
          <Activity className="h-4 w-4" />
          Public Access Mode
        </div>
      </div>
    </header>
  );
}
