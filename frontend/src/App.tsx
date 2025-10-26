import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileSetupModal from './components/ProfileSetupModal';
import MarketplaceContent from './components/MarketplaceContent';
import LandingPage from './components/LandingPage';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { getAuthToken } from './lib/auth-storage';

export default function App() {
  const [authToken, setAuthTokenState] = useState<string | null>(() => getAuthToken());
  const [hasEntered, setHasEntered] = useState(() => !!authToken);

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile({
    enabled: !!authToken && hasEntered,
  });

  const showProfileSetup = hasEntered && !!authToken && !profileLoading && isFetched && userProfile === null;

  const handleAuthenticated = () => {
    setAuthTokenState(getAuthToken());
    setHasEntered(true);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          {!hasEntered ? (
            <LandingPage onAuthenticated={handleAuthenticated} />
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
