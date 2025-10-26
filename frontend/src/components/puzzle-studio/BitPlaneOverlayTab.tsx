import { useState, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, Layers, X, Type, Image as ImageIcon } from 'lucide-react';
import { embedImageInBitPlane, embedTextInBitPlane } from '../../lib/bit-plane-overlay';
import { toast } from 'sonner';

export default function BitPlaneOverlayTab() {
  const [carrierFile, setCarrierFile] = useState<File | null>(null);
  const [carrierPreview, setCarrierPreview] = useState<string | null>(null);
  const [overlayMode, setOverlayMode] = useState<'image' | 'text'>('image');
  
  // Image overlay states
  const [overlayFile, setOverlayFile] = useState<File | null>(null);
  const [overlayPreview, setOverlayPreview] = useState<string | null>(null);
  
  // Text overlay states
  const [overlayText, setOverlayText] = useState('');
  
  // Common states
  const [bitPlane, setBitPlane] = useState([1]);
  const [processedImage, setProcessedImage] = useState<Uint8Array | null>(null);
  const [processedPreview, setProcessedPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCarrierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCarrierFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCarrierPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setProcessedImage(null);
      setProcessedPreview(null);
    }
  };

  const handleOverlayImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOverlayFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOverlayPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setProcessedImage(null);
      setProcessedPreview(null);
    }
  };

  const handleEmbed = async () => {
    if (!carrierFile) {
      toast.error('Please upload a carrier image');
      return;
    }

    if (overlayMode === 'image' && !overlayFile) {
      toast.error('Please upload an overlay image');
      return;
    }

    if (overlayMode === 'text' && !overlayText.trim()) {
      toast.error('Please enter text to overlay');
      return;
    }

    try {
      setIsProcessing(true);
      const carrierBuffer = await carrierFile.arrayBuffer();
      const carrierData = new Uint8Array(carrierBuffer);

      let result: Uint8Array;

      if (overlayMode === 'image' && overlayFile) {
        const overlayBuffer = await overlayFile.arrayBuffer();
        const overlayData = new Uint8Array(overlayBuffer);
        result = await embedImageInBitPlane(carrierData, overlayData, bitPlane[0]);
      } else {
        result = await embedTextInBitPlane(carrierData, overlayText.trim(), bitPlane[0]);
      }

      setProcessedImage(result);

      // Convert to proper ArrayBuffer for Blob
      const buffer = new ArrayBuffer(result.length);
      const view = new Uint8Array(buffer);
      view.set(result);
      const blob = new Blob([view], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      setProcessedPreview(url);

      toast.success('Overlay embedded successfully! Use Bit Plane Viewer in Escape Tools to reveal it.');
    } catch (error) {
      console.error('Embedding error:', error);
      toast.error('Failed to embed overlay. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;

    const buffer = new ArrayBuffer(processedImage.length);
    const view = new Uint8Array(buffer);
    view.set(processedImage);
    const blob = new Blob([view], { type: 'image/png' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bit-plane-overlay-${carrierFile?.name || 'image.png'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Image with overlay downloaded');
  };

  return (
    <div className="space-y-6">
      <Card className="cyber-border bg-black/50">
        <CardHeader>
          <CardTitle className="uppercase tracking-wide text-primary flex items-center gap-2">
            <Layers className="h-5 w-5" />
            BIT PLANE OVERLAY
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Carrier Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="carrier-image" className="uppercase text-xs tracking-widest text-muted-foreground">
              CARRIER IMAGE (PRIMARY)
            </Label>
            <div className="cyber-border rounded-sm bg-black/50 p-4">
              {carrierPreview ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={carrierPreview}
                      alt="Carrier"
                      className="mx-auto max-h-64 rounded-sm border border-primary/30"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setCarrierFile(null);
                        setCarrierPreview(null);
                        setProcessedImage(null);
                        setProcessedPreview(null);
                      }}
                      className="absolute top-2 right-2 h-8 w-8 border-primary/50 bg-black/80 text-primary hover:bg-primary/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="carrier-image"
                  className="flex cursor-pointer flex-col items-center justify-center py-8 transition-colors hover:bg-primary/5"
                >
                  <Upload className="mb-3 h-12 w-12 text-primary cyber-pulse" />
                  <p className="mb-1 text-sm font-medium text-primary uppercase tracking-wider">UPLOAD CARRIER IMAGE</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    CLICK TO SELECT FILE
                  </p>
                  <input
                    id="carrier-image"
                    type="file"
                    accept="image/*"
                    onChange={handleCarrierChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {carrierFile && (
            <>
              {/* Overlay Mode Selection */}
              <div className="space-y-2">
                <Label className="uppercase text-xs tracking-widest text-muted-foreground">
                  OVERLAY MODE
                </Label>
                <Tabs value={overlayMode} onValueChange={(v) => setOverlayMode(v as 'image' | 'text')} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="image" className="uppercase tracking-wider gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Image
                    </TabsTrigger>
                    <TabsTrigger value="text" className="uppercase tracking-wider gap-2">
                      <Type className="h-4 w-4" />
                      Text
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="image" className="mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="overlay-image" className="uppercase text-xs tracking-widest text-muted-foreground">
                        OVERLAY IMAGE (SECONDARY)
                      </Label>
                      <div className="cyber-border rounded-sm bg-black/50 p-4">
                        {overlayPreview ? (
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={overlayPreview}
                                alt="Overlay"
                                className="mx-auto max-h-48 rounded-sm border border-primary/30"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setOverlayFile(null);
                                  setOverlayPreview(null);
                                  setProcessedImage(null);
                                  setProcessedPreview(null);
                                }}
                                className="absolute top-2 right-2 h-8 w-8 border-primary/50 bg-black/80 text-primary hover:bg-primary/10"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <label
                            htmlFor="overlay-image"
                            className="flex cursor-pointer flex-col items-center justify-center py-6 transition-colors hover:bg-primary/5"
                          >
                            <Upload className="mb-2 h-10 w-10 text-primary" />
                            <p className="mb-1 text-sm font-medium text-primary uppercase tracking-wider">UPLOAD OVERLAY IMAGE</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest">
                              WILL BE HIDDEN IN BIT PLANE
                            </p>
                            <input
                              id="overlay-image"
                              type="file"
                              accept="image/*"
                              onChange={handleOverlayImageChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="text" className="mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="overlay-text" className="uppercase text-xs tracking-widest text-muted-foreground">
                        OVERLAY TEXT
                      </Label>
                      <Input
                        id="overlay-text"
                        placeholder="Enter text to hide in bit plane..."
                        value={overlayText}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          setOverlayText(event.target.value);
                          setProcessedImage(null);
                          setProcessedPreview(null);
                        }}
                        className="cyber-border bg-black/50 text-foreground placeholder:text-muted-foreground/50"
                      />
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">
                        TEXT WILL BE RENDERED AS WHITE ON BLACK
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Bit Plane Selection */}
              <div className="space-y-2">
                <Label htmlFor="bit-plane" className="uppercase text-xs tracking-widest text-muted-foreground">
                  TARGET BIT PLANE: {bitPlane[0]}
                </Label>
                <Slider
                  id="bit-plane"
                  min={0}
                  max={3}
                  step={1}
                  value={bitPlane}
                  onValueChange={(v) => {
                    setBitPlane(v);
                    setProcessedImage(null);
                    setProcessedPreview(null);
                  }}
                  className="cyber-border"
                />
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  LOWER = LESS VISIBLE, HIGHER = MORE VISIBLE IN BIT PLANE VIEWER
                </p>
              </div>

              {/* Embed Button */}
              <Button
                type="button"
                onClick={handleEmbed}
                disabled={isProcessing || (overlayMode === 'image' && !overlayFile) || (overlayMode === 'text' && !overlayText.trim())}
                variant="outline"
                className="w-full gap-2 border-primary/50 bg-transparent text-primary hover:bg-primary/10 uppercase tracking-wider"
              >
                <Layers className="h-4 w-4" />
                {isProcessing ? 'EMBEDDING...' : 'EMBED OVERLAY & PREVIEW'}
              </Button>

              {/* Result Preview */}
              {processedPreview && (
                <div className="space-y-4 pt-4 border-t border-primary/30">
                  <div className="rounded-sm border border-primary/30 bg-primary/5 p-3">
                    <p className="text-xs text-primary uppercase tracking-wider flex items-center gap-2">
                      <Layers className="h-3 w-3" />
                      OVERLAY EMBEDDED IN BIT PLANE {bitPlane[0]}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                      USE BIT PLANE VIEWER IN ESCAPE TOOLS TO REVEAL
                    </p>
                  </div>
                  <img
                    src={processedPreview}
                    alt="Result Preview"
                    className="mx-auto max-h-64 rounded-sm border border-primary/30"
                  />
                  <Button
                    type="button"
                    onClick={handleDownload}
                    variant="outline"
                    className="w-full gap-2 border-primary/50 bg-transparent text-primary hover:bg-primary/10 uppercase tracking-wider"
                  >
                    <Download className="h-4 w-4" />
                    DOWNLOAD IMAGE WITH OVERLAY
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
