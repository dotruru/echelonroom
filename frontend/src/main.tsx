import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { SolanaWalletProvider } from './providers/SolanaWalletProvider';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <SolanaWalletProvider>
      <App />
    </SolanaWalletProvider>
  </QueryClientProvider>
);
