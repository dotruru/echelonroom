import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Unlock, Hash, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DecodeToolTab from './escape-studio/DecodeToolTab';
import CipherToolsTab from './escape-studio/CipherToolsTab';
import ImageForensicsTab from './escape-studio/ImageForensicsTab';
import type { NFT } from '@/types/domain';

interface EscapeStudioTabProps {
  nftToSolve?: NFT | null;
  onClearNFT?: () => void;
}

export default function EscapeStudioTab({ nftToSolve, onClearNFT }: EscapeStudioTabProps) {
  const [activeTab, setActiveTab] = useState('decode');
  const [sharedImageFile, setSharedImageFile] = useState<File | null>(null);
  const [sharedImagePreview, setSharedImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (nftToSolve) {
      setActiveTab('decode');
    }
  }, [nftToSolve]);

  const handleClearSharedImage = () => {
    setSharedImageFile(null);
    setSharedImagePreview(null);
    if (onClearNFT) {
      onClearNFT();
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-wide text-primary cyber-glow">ESCAPE TOOLS</h2>
          <p className="text-muted-foreground uppercase text-xs tracking-widest">
            ANALYSIS PROTOCOL // STEGANOGRAPHY & CRYPTOGRAPHIC ANALYSIS SUITE
          </p>
        </div>
        {(sharedImageFile || nftToSolve) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearSharedImage}
            className="gap-2 border-primary/50 bg-transparent text-primary hover:bg-primary/10 uppercase tracking-wider"
          >
            <X className="h-4 w-4" />
            Clear Image
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 cyber-border bg-black/50">
          <TabsTrigger 
            value="decode" 
            className="gap-2 uppercase tracking-wider data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            <Unlock className="h-4 w-4" />
            Decode
          </TabsTrigger>
          <TabsTrigger 
            value="cipher" 
            className="gap-2 uppercase tracking-wider data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            <Hash className="h-4 w-4" />
            Cipher Tools
          </TabsTrigger>
          <TabsTrigger 
            value="forensics" 
            className="gap-2 uppercase tracking-wider data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            <ImageIcon className="h-4 w-4" />
            Forensics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="decode" className="mt-6">
          <DecodeToolTab 
            nftToSolve={nftToSolve} 
            onClearNFT={onClearNFT}
            sharedImageFile={sharedImageFile}
            sharedImagePreview={sharedImagePreview}
            onSharedImageChange={(file, preview) => {
              setSharedImageFile(file);
              setSharedImagePreview(preview);
            }}
          />
        </TabsContent>

        <TabsContent value="cipher" className="mt-6">
          <CipherToolsTab />
        </TabsContent>

        <TabsContent value="forensics" className="mt-6">
          <ImageForensicsTab 
            sharedImageFile={sharedImageFile}
            sharedImagePreview={sharedImagePreview}
            onSharedImageChange={(file, preview) => {
              setSharedImageFile(file);
              setSharedImagePreview(preview);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
