import { Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-primary/30 bg-black/95">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground uppercase tracking-widest">
          <p className="flex items-center gap-2">
            <Terminal className="h-3 w-3 text-primary" />
            © 2025 // BUILT WITH{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline hover:cyber-glow"
            >
              CAFFEINE.AI
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
