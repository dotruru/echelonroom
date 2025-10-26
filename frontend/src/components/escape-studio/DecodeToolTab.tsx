import { useState, useEffect, type ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Upload, Unlock, Copy, X } from 'lucide-react';
import { extractMessageAdvanced, EncryptionType } from '../../lib/steganography-advanced';
import { toast } from 'sonner';
import type { NFT } from '@/types/domain';
import { Badge } from '@/components/ui/badge';

interface DecodeToolTabProps {
  nftToSolve?: NFT | null;
  onClearNFT?: () => void;
  sharedImageFile: File | null;
  sharedImagePreview: string | null;
  onSharedImageChange: (file: File | null, preview: string | null) => void;
}

export default function DecodeToolTab({ 
  nftToSolve, 
  onClearNFT,
  sharedImageFile,
  sharedImagePreview,
  onSharedImageChange
}: DecodeToolTabProps) {
  const [extractedMessage, setExtractedMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [encryptionType, setEncryptionType] = useState<EncryptionType>('none');
  const [passphrase, setPassphrase] = useState('');
  const [bitDepth, setBitDepth] = useState([1]);
  const [loadingNFTImage, setLoadingNFTImage] = useState(false);

  useEffect(() => {
    if (nftToSolve && nftToSolve.imageUri) {
      loadNFTImage(nftToSolve);
    }
  }, [nftToSolve]);

  const loadNFTImage = async (nft: NFT) => {
    if (!nft.imageUri) return;

    try {
      setLoadingNFTImage(true);
      const response = await fetch(nft.imageUri);
      if (!response.ok) {
        throw new Error(`Failed to fetch NFT image (${response.status})`);
      }

      const blob = await response.blob();
      const file = new File([blob], `${nft.name}.png`, { type: blob.type || 'image/png' });

      const reader = new FileReader();
      reader.onloadend = () => {
        onSharedImageChange(file, reader.result as string);
      };
      reader.readAsDataURL(file);
      setExtractedMessage(null);

      toast.success(`NFT "${nft.name}" loaded for analysis`);
    } catch (error) {
      console.error('Error loading NFT image:', error);
      toast.error('Failed to load NFT image');
    } finally {
      setLoadingNFTImage(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSharedImageChange(file, reader.result as string);
      };
      reader.readAsDataURL(file);
      setExtractedMessage(null);
      if (onClearNFT) {
        onClearNFT();
      }
    }
  };

  const handleClearNFT = () => {
    if (onClearNFT) {
      onClearNFT();
    }
    onSharedImageChange(null, null);
    setExtractedMessage(null);
  };

  const handleExtract = async () => {
    if (!sharedImageFile) {
      toast.error('Please upload an image');
      return;
    }

    try {
      setIsProcessing(true);
      const arrayBuffer = await sharedImageFile.arrayBuffer();
      const imageData = new Uint8Array(arrayBuffer);

      const extracted = await extractMessageAdvanced(
        imageData,
        bitDepth[0],
        encryptionType,
        passphrase
      );

      if (extracted) {
        setExtractedMessage(extracted);
        toast.success('Message extracted successfully!');
      } else {
        setExtractedMessage(null);
        toast.error('No hidden message found or incorrect settings');
      }
    } catch (error) {
      console.error('Extraction error:', error);
      toast.error('Failed to extract message. Check your settings.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (extractedMessage) {
      navigator.clipboard.writeText(extractedMessage);
      toast.success('Message copied to clipboard!');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Decode Settings</CardTitle>
          <CardDescription>Extract hidden messages from images</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* NFT Badge */}
          {nftToSolve && (
            <div className="flex items-center justify-between rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50 uppercase text-xs">
                  NFT LOADED
                </Badge>
                <span className="text-sm font-medium">{nftToSolve.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearNFT}
                className="h-6 w-6 p-0 hover:bg-yellow-500/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="decode-image">Upload Image</Label>
            {sharedImagePreview ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
                <img src={sharedImagePreview} alt="Preview" className="h-full w-full object-contain bg-muted" />
              </div>
            ) : loadingNFTImage ? (
              <div className="flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted">
                <div className="text-center">
                  <div className="mx-auto mb-2 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm text-muted-foreground">Loading NFT image...</p>
                </div>
              </div>
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted">
                <div className="text-center">
                  <Upload className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No image selected</p>
                </div>
              </div>
            )}
            <Input
              id="decode-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('decode-image')?.click()}
              className="w-full gap-2"
              disabled={loadingNFTImage}
            >
              <Upload className="h-4 w-4" />
              {sharedImagePreview ? 'Change Image' : 'Upload Image'}
            </Button>
          </div>

          {/* Bit Depth */}
          <div className="space-y-2">
            <Label htmlFor="decode-bit-depth">Bit Depth: {bitDepth[0]}</Label>
            <Slider
              id="decode-bit-depth"
              min={1}
              max={4}
              step={1}
              value={bitDepth}
              onValueChange={setBitDepth}
            />
            <p className="text-xs text-muted-foreground">
              Must match the encoding bit depth
            </p>
          </div>

          {/* Encryption Type */}
          <div className="space-y-2">
            <Label htmlFor="decode-encryption">Encryption</Label>
            <select
              id="decode-encryption"
              value={encryptionType}
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                setEncryptionType(event.target.value as EncryptionType)
              }
              className="cyber-border w-full rounded-sm border border-primary/30 bg-black/50 px-3 py-2 text-xs uppercase tracking-widest text-foreground"
            >
              <option value="none">None</option>
              <option value="aes">AES-256</option>
              <option value="xor">XOR Cipher</option>
            </select>
          </div>

          {/* Passphrase */}
          {encryptionType !== 'none' && (
            <div className="space-y-2">
              <Label htmlFor="decode-passphrase">Passphrase</Label>
              <Input
                id="decode-passphrase"
                type="password"
                placeholder="Enter decryption passphrase"
                value={passphrase}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setPassphrase(event.target.value)}
              />
            </div>
          )}

          {/* Actions */}
          <Button
            onClick={handleExtract}
            disabled={isProcessing || !sharedImageFile || loadingNFTImage}
            className="w-full gap-2"
          >
            <Unlock className="h-4 w-4" />
            {isProcessing ? 'Extracting...' : 'Extract Message'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Extracted Message</CardTitle>
          <CardDescription>View the hidden message</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {extractedMessage ? (
            <>
              <div className="min-h-[200px] rounded-lg border border-border bg-muted p-4">
                <p className="whitespace-pre-wrap break-words">{extractedMessage}</p>
              </div>
              <Button onClick={handleCopy} variant="outline" className="w-full gap-2">
                <Copy className="h-4 w-4" />
                Copy to Clipboard
              </Button>
              <div className="rounded-lg border border-border bg-muted p-4">
                <p className="text-sm">
                  <strong>Extraction Details:</strong>
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li>• Bit Depth: {bitDepth[0]}</li>
                  <li>• Encryption: {encryptionType === 'none' ? 'None' : encryptionType.toUpperCase()}</li>
                  <li>• Message Length: {extractedMessage.length} characters</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted">
              <div className="text-center">
                <Unlock className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No message extracted yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Upload an image and click "Extract Message"
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
