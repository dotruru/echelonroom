import { useState } from 'react';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileSetupModal from './components/ProfileSetupModal';
import MarketplaceContent from './components/MarketplaceContent';
import LandingPage from './components/LandingPage';

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const showProfileSetup = hasEntered && !profileLoading && isFetched && userProfile === null;

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          {!hasEntered ? (
            <LandingPage onEnter={() => setHasEntered(true)} />
          ) : (
            <MarketplaceContent />
          )}
        </main>
        <Footer />
        {showProfileSetup && <ProfileSetupModal />}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
