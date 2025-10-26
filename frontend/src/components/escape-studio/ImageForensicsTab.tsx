import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Upload, BarChart3, Layers, FileText, Activity, GitCompare } from 'lucide-react';
import {
  generateHistogram,
  extractBitPlanes,
  calculateEntropy,
  extractExifData,
  compareImages,
  HistogramData,
  ExifData
} from '../../lib/image-forensics';
import { toast } from 'sonner';

interface ImageForensicsTabProps {
  sharedImageFile: File | null;
  sharedImagePreview: string | null;
  onSharedImageChange: (file: File | null, preview: string | null) => void;
}

export default function ImageForensicsTab({ 
  sharedImageFile, 
  sharedImagePreview, 
  onSharedImageChange 
}: ImageForensicsTabProps) {
  return (
    <Tabs defaultValue="histogram" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="histogram">Histogram</TabsTrigger>
        <TabsTrigger value="bitplane">Bit Planes</TabsTrigger>
        <TabsTrigger value="exif">EXIF</TabsTrigger>
        <TabsTrigger value="entropy">Entropy</TabsTrigger>
        <TabsTrigger value="diff">Diff</TabsTrigger>
      </TabsList>

      <TabsContent value="histogram" className="mt-6">
        <HistogramViewer 
          sharedImageFile={sharedImageFile}
          sharedImagePreview={sharedImagePreview}
          onSharedImageChange={onSharedImageChange}
        />
      </TabsContent>

      <TabsContent value="bitplane" className="mt-6">
        <BitPlaneViewer 
          sharedImageFile={sharedImageFile}
          sharedImagePreview={sharedImagePreview}
          onSharedImageChange={onSharedImageChange}
        />
      </TabsContent>

      <TabsContent value="exif" className="mt-6">
        <ExifViewer 
          sharedImageFile={sharedImageFile}
          sharedImagePreview={sharedImagePreview}
          onSharedImageChange={onSharedImageChange}
        />
      </TabsContent>

      <TabsContent value="entropy" className="mt-6">
        <EntropyScanner 
          sharedImageFile={sharedImageFile}
          sharedImagePreview={sharedImagePreview}
          onSharedImageChange={onSharedImageChange}
        />
      </TabsContent>

      <TabsContent value="diff" className="mt-6">
        <DiffViewer />
      </TabsContent>
    </Tabs>
  );
}

interface ForensicsToolProps {
  sharedImageFile: File | null;
  sharedImagePreview: string | null;
  onSharedImageChange: (file: File | null, preview: string | null) => void;
}

function HistogramViewer({ sharedImageFile, sharedImagePreview, onSharedImageChange }: ForensicsToolProps) {
  const [histogram, setHistogram] = useState<HistogramData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [channel, setChannel] = useState<'luminance' | 'red' | 'green' | 'blue'>('luminance');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSharedImageChange(file, reader.result as string);
      };
      reader.readAsDataURL(file);
      setHistogram(null);
    }
  };

  const handleAnalyze = async () => {
    if (!sharedImageFile) {
      toast.error('Please upload an image');
      return;
    }

    try {
      setIsProcessing(true);
      const arrayBuffer = await sharedImageFile.arrayBuffer();
      const imageData = new Uint8Array(arrayBuffer);
      const histData = await generateHistogram(imageData);
      setHistogram(histData);
      toast.success('Histogram generated!');
    } catch (error) {
      toast.error('Failed to generate histogram');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderHistogram = () => {
    if (!histogram) return null;

    const data = histogram[channel];
    const max = Math.max(...data);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 256, 150);

    const colors = {
      luminance: '#ffffff',
      red: '#ef4444',
      green: '#22c55e',
      blue: '#3b82f6'
    };

    ctx.fillStyle = colors[channel];
    for (let i = 0; i < 256; i++) {
      const height = (data[i] / max) * 140;
      ctx.fillRect(i, 150 - height, 1, height);
    }

    return canvas.toDataURL();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Histogram Viewer
          </CardTitle>
          <CardDescription>Analyze color distribution in images</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hist-image">Upload Image</Label>
            {sharedImagePreview ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
                <img src={sharedImagePreview} alt="Preview" className="h-full w-full object-contain bg-muted" />
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
              id="hist-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('hist-image')?.click()}
              className="w-full gap-2"
            >
              <Upload className="h-4 w-4" />
              {sharedImagePreview ? 'Change Image' : 'Upload Image'}
            </Button>
          </div>

          <Button onClick={handleAnalyze} disabled={isProcessing || !sharedImageFile} className="w-full">
            {isProcessing ? 'Analyzing...' : 'Generate Histogram'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histogram</CardTitle>
          <CardDescription>Color channel distribution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {histogram ? (
            <>
              <div className="flex gap-2">
                <Button
                  variant={channel === 'luminance' ? 'default' : 'outline'}
                  onClick={() => setChannel('luminance')}
                  className="flex-1"
                  size="sm"
                >
                  Luminance
                </Button>
                <Button
                  variant={channel === 'red' ? 'default' : 'outline'}
                  onClick={() => setChannel('red')}
                  className="flex-1"
                  size="sm"
                >
                  Red
                </Button>
                <Button
                  variant={channel === 'green' ? 'default' : 'outline'}
                  onClick={() => setChannel('green')}
                  className="flex-1"
                  size="sm"
                >
                  Green
                </Button>
                <Button
                  variant={channel === 'blue' ? 'default' : 'outline'}
                  onClick={() => setChannel('blue')}
                  className="flex-1"
                  size="sm"
                >
                  Blue
                </Button>
              </div>
              <div className="rounded-lg border border-border bg-black p-4">
                <img src={renderHistogram() || ''} alt="Histogram" className="w-full" />
              </div>
            </>
          ) : (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted">
              <div className="text-center">
                <BarChart3 className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No histogram generated yet</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BitPlaneViewer({ sharedImageFile, sharedImagePreview, onSharedImageChange }: ForensicsToolProps) {
  const [bitPlaneImage, setBitPlaneImage] = useState<string | null>(null);
  const [bitPlane, setBitPlane] = useState([0]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSharedImageChange(file, reader.result as string);
      };
      reader.readAsDataURL(file);
      setBitPlaneImage(null);
    }
  };

  const handleAnalyze = async () => {
    if (!sharedImageFile) {
      toast.error('Please upload an image');
      return;
    }

    try {
      setIsProcessing(true);
      const arrayBuffer = await sharedImageFile.arrayBuffer();
      const imageData = new Uint8Array(arrayBuffer);
      const result = await extractBitPlanes(imageData, bitPlane[0]);
      setBitPlaneImage(result);
      toast.success('Bit plane extracted!');
    } catch (error) {
      toast.error('Failed to extract bit plane');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Bit Plane Viewer
          </CardTitle>
          <CardDescription>Visualize individual bit layers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bitplane-image">Upload Image</Label>
            {sharedImagePreview ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
                <img src={sharedImagePreview} alt="Preview" className="h-full w-full object-contain bg-muted" />
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
              id="bitplane-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('bitplane-image')?.click()}
              className="w-full gap-2"
            >
              <Upload className="h-4 w-4" />
              {sharedImagePreview ? 'Change Image' : 'Upload Image'}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Bit Plane: {bitPlane[0]} (LSB = 0)</Label>
            <Slider
              min={0}
              max={7}
              step={1}
              value={bitPlane}
              onValueChange={setBitPlane}
            />
          </div>

          <Button onClick={handleAnalyze} disabled={isProcessing || !sharedImageFile} className="w-full">
            {isProcessing ? 'Extracting...' : 'Extract Bit Plane'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bit Plane {bitPlane[0]}</CardTitle>
          <CardDescription>Isolated bit layer visualization</CardDescription>
        </CardHeader>
        <CardContent>
          {bitPlaneImage ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
              <img src={bitPlaneImage} alt="Bit Plane" className="h-full w-full object-contain bg-black" />
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted">
              <div className="text-center">
                <Layers className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No bit plane extracted yet</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ExifViewer({ sharedImageFile, sharedImagePreview, onSharedImageChange }: ForensicsToolProps) {
  const [exifData, setExifData] = useState<ExifData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSharedImageChange(file, reader.result as string);
      };
      reader.readAsDataURL(file);
      setExifData(null);
    }
  };

  const handleAnalyze = async () => {
    if (!sharedImageFile) {
      toast.error('Please upload an image');
      return;
    }

    try {
      setIsProcessing(true);
      const arrayBuffer = await sharedImageFile.arrayBuffer();
      const imageData = new Uint8Array(arrayBuffer);
      const data = await extractExifData(imageData);
      setExifData(data);
      toast.success('EXIF data extracted!');
    } catch (error) {
      toast.error('Failed to extract EXIF data');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            EXIF Metadata Viewer
          </CardTitle>
          <CardDescription>Extract image metadata</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exif-image">Upload Image</Label>
            {sharedImagePreview ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
                <img src={sharedImagePreview} alt="Preview" className="h-full w-full object-contain bg-muted" />
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
              id="exif-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('exif-image')?.click()}
              className="w-full gap-2"
            >
              <Upload className="h-4 w-4" />
              {sharedImagePreview ? 'Change Image' : 'Upload Image'}
            </Button>
          </div>

          <Button onClick={handleAnalyze} disabled={isProcessing || !sharedImageFile} className="w-full">
            {isProcessing ? 'Extracting...' : 'Extract EXIF Data'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>EXIF Data</CardTitle>
          <CardDescription>Image metadata information</CardDescription>
        </CardHeader>
        <CardContent>
          {exifData ? (
            <div className="space-y-2">
              {Object.entries(exifData).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-border py-2">
                  <span className="font-medium">{key}:</span>
                  <span className="text-muted-foreground">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted">
              <div className="text-center">
                <FileText className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No EXIF data extracted yet</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EntropyScanner({ sharedImageFile, sharedImagePreview, onSharedImageChange }: ForensicsToolProps) {
  const [entropyMap, setEntropyMap] = useState<number[][] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSharedImageChange(file, reader.result as string);
      };
      reader.readAsDataURL(file);
      setEntropyMap(null);
    }
  };

  const handleAnalyze = async () => {
    if (!sharedImageFile) {
      toast.error('Please upload an image');
      return;
    }

    try {
      setIsProcessing(true);
      const arrayBuffer = await sharedImageFile.arrayBuffer();
      const imageData = new Uint8Array(arrayBuffer);
      const entropy = await calculateEntropy(imageData);
      setEntropyMap(entropy);
      toast.success('Entropy calculated!');
    } catch (error) {
      toast.error('Failed to calculate entropy');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderEntropyMap = () => {
    if (!entropyMap) return null;

    const canvas = document.createElement('canvas');
    canvas.width = entropyMap[0].length * 16;
    canvas.height = entropyMap.length * 16;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const maxEntropy = Math.max(...entropyMap.flat());

    for (let y = 0; y < entropyMap.length; y++) {
      for (let x = 0; x < entropyMap[y].length; x++) {
        const normalized = entropyMap[y][x] / maxEntropy;
        const hue = (1 - normalized) * 240; // Blue (high entropy) to red (low entropy)
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(x * 16, y * 16, 16, 16);
      }
    }

    return canvas.toDataURL();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Entropy Scanner
          </CardTitle>
          <CardDescription>Detect irregular data patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="entropy-image">Upload Image</Label>
            {sharedImagePreview ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
                <img src={sharedImagePreview} alt="Preview" className="h-full w-full object-contain bg-muted" />
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
              id="entropy-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('entropy-image')?.click()}
              className="w-full gap-2"
            >
              <Upload className="h-4 w-4" />
              {sharedImagePreview ? 'Change Image' : 'Upload Image'}
            </Button>
          </div>

          <Button onClick={handleAnalyze} disabled={isProcessing || !sharedImageFile} className="w-full">
            {isProcessing ? 'Scanning...' : 'Scan Entropy'}
          </Button>

          <div className="rounded-lg border border-border bg-muted p-4">
            <p className="text-xs text-muted-foreground">
              <strong>Color Legend:</strong><br />
              Blue = High entropy (random/encrypted data)<br />
              Red = Low entropy (uniform areas)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Entropy Map</CardTitle>
          <CardDescription>Heat map of data randomness</CardDescription>
        </CardHeader>
        <CardContent>
          {entropyMap ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
              <img src={renderEntropyMap() || ''} alt="Entropy Map" className="h-full w-full object-contain bg-black" />
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted">
              <div className="text-center">
                <Activity className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No entropy map generated yet</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DiffViewer() {
  const [image1File, setImage1File] = useState<File | null>(null);
  const [image2File, setImage2File] = useState<File | null>(null);
  const [image1Preview, setImage1Preview] = useState<string | null>(null);
  const [image2Preview, setImage2Preview] = useState<string | null>(null);
  const [diffResult, setDiffResult] = useState<{ differences: number; percentage: number; diffImage: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImage1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage1File(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage1Preview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setDiffResult(null);
    }
  };

  const handleImage2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage2File(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage2Preview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setDiffResult(null);
    }
  };

  const handleCompare = async () => {
    if (!image1File || !image2File) {
      toast.error('Please upload both images');
      return;
    }

    try {
      setIsProcessing(true);
      const buffer1 = await image1File.arrayBuffer();
      const buffer2 = await image2File.arrayBuffer();
      const data1 = new Uint8Array(buffer1);
      const data2 = new Uint8Array(buffer2);
      const result = await compareImages(data1, data2);
      setDiffResult(result);
      toast.success('Comparison complete!');
    } catch (error) {
      toast.error('Failed to compare images');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Image 1 (Original)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {image1Preview ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
                <img src={image1Preview} alt="Image 1" className="h-full w-full object-contain bg-muted" />
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
              id="diff-image1"
              type="file"
              accept="image/*"
              onChange={handleImage1Change}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('diff-image1')?.click()}
              className="w-full gap-2"
            >
              <Upload className="h-4 w-4" />
              {image1Preview ? 'Change Image' : 'Upload Image 1'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Image 2 (Modified)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {image2Preview ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
                <img src={image2Preview} alt="Image 2" className="h-full w-full object-contain bg-muted" />
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
              id="diff-image2"
              type="file"
              accept="image/*"
              onChange={handleImage2Change}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('diff-image2')?.click()}
              className="w-full gap-2"
            >
              <Upload className="h-4 w-4" />
              {image2Preview ? 'Change Image' : 'Upload Image 2'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compare Images</CardTitle>
          <CardDescription>Byte-level difference analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleCompare}
            disabled={isProcessing || !image1File || !image2File}
            className="w-full"
          >
            {isProcessing ? 'Comparing...' : 'Compare Images'}
          </Button>

          {diffResult && (
            <>
              <div className="rounded-lg border border-border bg-muted p-4">
                <p className="text-sm">
                  <strong>Differences Found:</strong> {diffResult.differences.toLocaleString()} pixels
                </p>
                <p className="text-sm">
                  <strong>Difference Percentage:</strong> {diffResult.percentage.toFixed(4)}%
                </p>
              </div>

              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
                <img src={diffResult.diffImage} alt="Diff" className="h-full w-full object-contain bg-black" />
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Red pixels indicate differences between the two images
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
