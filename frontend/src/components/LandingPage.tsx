import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingPageProps {
  onEnter: () => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  const regions = [
    { name: 'NORTH AMERICA', coords: '40.7128°N, 74.0060°W', status: 'SECURE' },
    { name: 'EUROPE', coords: '51.5074°N, 0.1278°W', status: 'SECURE' },
    { name: 'ASIA PACIFIC', coords: '35.6762°N, 139.6503°E', status: 'SECURE' },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-5xl">
        {/* Hero Section with Globe */}
        <div className="mb-12 text-center">
          <h1 className="mb-8 text-5xl font-bold tracking-tight">
            <span className="text-primary cyber-glow">the echelon room</span>
          </h1>
        </div>

        {/* Animated Globe Section */}
        <div className="mb-12 cyber-border rounded-sm bg-card/50 p-8 backdrop-blur-sm">
          <div className="relative h-96 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial from-primary/20 to-transparent" />
            <img
              src="/assets/generated/generated/cyber-globe-transparent.dim_400x400.png"
              alt="Global Operations"
              className="h-80 w-80 object-contain rotate-slow opacity-80"
            />
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-20">
              {[...Array(144)].map((_, i) => (
                <div key={i} className="border border-primary/20" />
              ))}
            </div>
            {regions.map((region, idx) => (
              <div
                key={idx}
                className="absolute cyber-pulse"
                style={{
                  top: `${25 + idx * 20}%`,
                  left: `${20 + idx * 25}%`,
                }}
              >
                <Target className="h-6 w-6 text-primary" />
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            {regions.map((region, idx) => (
              <div key={idx} className="cyber-border rounded-sm bg-black/50 p-4">
                <p className="text-sm text-primary uppercase tracking-widest mb-2 font-bold">{region.name}</p>
                <p className="text-xs text-muted-foreground mb-1">{region.coords}</p>
                <p className="text-xs text-primary uppercase tracking-wider">{region.status}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Access Section */}
        <div className="rounded-sm border border-primary/30 bg-card/50 p-8 shadow-cyber backdrop-blur-sm">
          <p className="mb-6 text-lg uppercase tracking-wide text-foreground/80 text-center">
            ACCESS PROTOCOLS ENGAGED
          </p>
          <div className="text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
              CLEARANCE LEVEL: PUBLIC
            </div>
            <p className="text-sm text-foreground/70 max-w-2xl mx-auto mb-6">
              Engage the command link below to enter the echelon room dashboard. All core systems are available without external identity verification.
            </p>
            <Button
              onClick={onEnter}
              variant="outline"
              className="gap-2 border-primary/50 bg-transparent text-primary hover:bg-primary/10 hover:text-primary hover:shadow-cyber uppercase tracking-wider"
            >
              ENTER COMMAND
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
