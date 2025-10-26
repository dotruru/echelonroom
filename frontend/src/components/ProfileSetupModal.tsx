import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

export default function ProfileSetupModal() {
  const [codename, setCodename] = useState('');
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (codename.trim()) {
      saveProfile({ codename: codename.trim() });
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent
        className="cyber-border bg-card/95 backdrop-blur-sm"
        onInteractOutside={(event: Event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 uppercase tracking-wide text-primary">
            <User className="h-5 w-5" />
            AGENT REGISTRATION
          </DialogTitle>
          <DialogDescription className="uppercase text-xs tracking-widest text-muted-foreground">
            ENTER YOUR CODENAME TO COMPLETE CLEARANCE VERIFICATION
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="codename" className="uppercase text-xs tracking-widest text-muted-foreground">
              AGENT CODENAME
            </Label>
            <Input
              id="codename"
              value={codename}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setCodename(event.target.value)}
              placeholder="Enter your codename"
              required
              autoFocus
              className="cyber-border bg-black/50 text-foreground placeholder:text-muted-foreground/50"
            />
          </div>
          <Button
            type="submit"
            disabled={isPending || !codename.trim()}
            className="w-full bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30 hover:shadow-cyber uppercase tracking-wider"
          >
            {isPending ? 'REGISTERING...' : 'CONFIRM REGISTRATION'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
