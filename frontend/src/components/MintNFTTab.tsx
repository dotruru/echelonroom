import { useState, type ChangeEvent } from 'react';
import { useMintNFT } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Plus, Eye, Lock, Download, X, Hash, Key, Copy, Shield } from 'lucide-react';
import { embedMessageAdvanced, EncryptionType } from '../lib/steganography-advanced';
import {
  sha256, sha1, md5,
  base64Encode, hexEncode, binaryEncode,
  caesarCipher, vigenereCipher, xorCipher,
  aesEncrypt
} from '../lib/crypto';
import { toast } from 'sonner';
import BitPlaneOverlayTab from './puzzle-studio/BitPlaneOverlayTab';

export default function MintNFTTab() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Steganography encoding states
  const [message, setMessage] = useState('');
  const [encryptionType, setEncryptionType] = useState<EncryptionType>('none');
  const [passphrase, setPassphrase] = useState('');
  const [bitDepth, setBitDepth] = useState([1]);
  const [processedImage, setProcessedImage] = useState<Uint8Array | null>(null);
  const [processedPreview, setProcessedPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { mutate: mintNFT, isPending } = useMintNFT();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setProcessedImage(null);
      setProcessedPreview(null);
    }
  };

  const handleEmbed = async () => {
    if (!imageFile || !message.trim()) {
      toast.error('Please provide both an image and a message');
      return;
    }

    if (encryptionType !== 'none' && !passphrase) {
      toast.error('Please provide a passphrase for encryption');
      return;
    }

    try {
      setIsProcessing(true);
      const arrayBuffer = await imageFile.arrayBuffer();
      const imageData = new Uint8Array(arrayBuffer);

      const embeddedData = await embedMessageAdvanced(
        imageData,
        message.trim(),
        bitDepth[0],
        encryptionType,
        passphrase
      );
      setProcessedImage(embeddedData);

      // Convert to proper ArrayBuffer for Blob
      const buffer = new ArrayBuffer(embeddedData.length);
      const view = new Uint8Array(buffer);
      view.set(embeddedData);
      const blob = new Blob([view], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      setProcessedPreview(url);

      toast.success('Message embedded successfully!');
    } catch (error) {
      console.error('Embedding error:', error);
      toast.error('Failed to embed message. The image might be too small for the message.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;

    // Convert to proper ArrayBuffer for Blob
    const buffer = new ArrayBuffer(processedImage.length);
    const view = new Uint8Array(buffer);
    view.set(processedImage);
    const blob = new Blob([view], { type: 'image/png' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `encoded-${imageFile?.name || 'image.png'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Encoded image downloaded');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !imageFile) {
      toast.error('Complete all required fields');
      return;
    }

    const imageData = processedPreview ?? imagePreview;

    if (!imageData) {
      toast.error('Unable to read image data');
      return;
    }

    mintNFT(
      { name, description, imageData },
      {
        onSuccess: () => {
          setName('');
          setDescription('');
          setImageFile(null);
          setImagePreview(null);
          setMessage('');
          setPassphrase('');
          setProcessedImage(null);
          setProcessedPreview(null);
        },
      }
    );
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold uppercase tracking-wide text-primary cyber-glow">PUZZLE STUDIO</h2>
        <p className="text-muted-foreground uppercase text-xs tracking-widest">ENCODING PROTOCOL // STEGANOGRAPHY & CIPHER TOOLS</p>
      </div>

      <Tabs defaultValue="image-encoding" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="image-encoding" className="uppercase tracking-wider">Image Encoding</TabsTrigger>
          <TabsTrigger value="bit-plane-overlay" className="uppercase tracking-wider">Bit Plane Overlay</TabsTrigger>
          <TabsTrigger value="cipher-tools" className="uppercase tracking-wider">Cipher Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="image-encoding">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload & Encoding Section */}
            <Card className="cyber-border bg-black/50">
              <CardHeader>
                <CardTitle className="uppercase tracking-wide text-primary flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  STEGANOGRAPHY ENCODING
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image" className="uppercase text-xs tracking-widest text-muted-foreground">
                    SOURCE IMAGE
                  </Label>
                  <div className="cyber-border rounded-sm bg-black/50 p-4">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Original"
                            className="mx-auto max-h-64 rounded-sm border border-primary/30"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
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
                        htmlFor="image"
                        className="flex cursor-pointer flex-col items-center justify-center py-8 transition-colors hover:bg-primary/5"
                      >
                        <Upload className="mb-3 h-12 w-12 text-primary cyber-pulse" />
                        <p className="mb-1 text-sm font-medium text-primary uppercase tracking-wider">UPLOAD IMAGE</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">
                          CLICK TO SELECT FILE
                        </p>
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          required
                        />
                      </label>
                    )}
                  </div>
                </div>

                {imageFile && (
                  <>
                    {/* Secret Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message" className="uppercase text-xs tracking-widest text-muted-foreground">
                        SECRET MESSAGE
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Enter the message you want to hide..."
                        value={message}
                        onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                          setMessage(event.target.value)
                        }
                        rows={4}
                        className="cyber-border bg-black/50 text-foreground placeholder:text-muted-foreground/50"
                      />
                    </div>

                    {/* Encryption Options */}
                    <div className="space-y-2">
                      <Label htmlFor="encryption" className="uppercase text-xs tracking-widest text-muted-foreground">
                        ENCRYPTION METHOD
                      </Label>
                      <select
                        id="encryption"
                        value={encryptionType}
                        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                          setEncryptionType(event.target.value as EncryptionType)
                        }
                        className="cyber-border w-full rounded-sm border border-primary/30 bg-black/50 px-3 py-2 text-xs uppercase tracking-widest text-foreground"
                      >
                        <option value="none">None</option>
                        <option value="aes">AES-256-GCM</option>
                        <option value="xor">XOR Cipher</option>
                      </select>
                    </div>

                    {encryptionType !== 'none' && (
                      <div className="space-y-2">
                        <Label htmlFor="passphrase" className="uppercase text-xs tracking-widest text-muted-foreground">
                          ENCRYPTION PASSPHRASE
                        </Label>
                        <Input
                          id="passphrase"
                          type="password"
                          placeholder="Enter encryption passphrase"
                          value={passphrase}
                          onChange={(event: ChangeEvent<HTMLInputElement>) => setPassphrase(event.target.value)}
                          className="cyber-border bg-black/50 text-foreground placeholder:text-muted-foreground/50"
                        />
                      </div>
                    )}

                    {/* Bit Depth Slider */}
                    <div className="space-y-2">
                      <Label htmlFor="bit-depth" className="uppercase text-xs tracking-widest text-muted-foreground">
                        BIT DEPTH: {bitDepth[0]}
                      </Label>
                      <Slider
                        id="bit-depth"
                        min={1}
                        max={4}
                        step={1}
                        value={bitDepth}
                        onValueChange={setBitDepth}
                        className="cyber-border"
                      />
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">
                        HIGHER = MORE CAPACITY, LOWER = LESS VISIBLE
                      </p>
                    </div>

                    {/* Encode Button */}
                    <Button
                      type="button"
                      onClick={handleEmbed}
                      disabled={isProcessing || !message.trim()}
                      variant="outline"
                      className="w-full gap-2 border-primary/50 bg-transparent text-primary hover:bg-primary/10 uppercase tracking-wider"
                    >
                      <Eye className="h-4 w-4" />
                      {isProcessing ? 'ENCODING...' : 'ENCODE & PREVIEW'}
                    </Button>

                    {/* Encoded Image Preview */}
                    {processedPreview && (
                      <div className="space-y-4 pt-4 border-t border-primary/30">
                        <div className="rounded-sm border border-primary/30 bg-primary/5 p-3">
                          <p className="text-xs text-primary uppercase tracking-wider flex items-center gap-2">
                            <Lock className="h-3 w-3" />
                            ENCODED IMAGE - MESSAGE EMBEDDED
                          </p>
                        </div>
                        <img
                          src={processedPreview}
                          alt="Encoded Preview"
                          className="mx-auto max-h-64 rounded-sm border border-primary/30"
                        />
                        <Button
                          type="button"
                          onClick={handleDownload}
                          variant="outline"
                          className="w-full gap-2 border-primary/50 bg-transparent text-primary hover:bg-primary/10 uppercase tracking-wider"
                        >
                          <Download className="h-4 w-4" />
                          DOWNLOAD ENCODED IMAGE
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* NFT Metadata Section */}
            {imageFile && (
              <Card className="cyber-border bg-black/50">
                <CardHeader>
                  <CardTitle className="uppercase tracking-wide text-primary">NFT METADATA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="uppercase text-xs tracking-widest text-muted-foreground">
                      PUZZLE NAME
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
                      placeholder="Enter puzzle name"
                      required
                      className="cyber-border bg-black/50 text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="uppercase text-xs tracking-widest text-muted-foreground">
                      PUZZLE DESCRIPTION
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                        setDescription(event.target.value)
                      }
                      placeholder="Enter puzzle description"
                      required
                      rows={4}
                      className="cyber-border bg-black/50 text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mint Button */}
            {imageFile && (
              <Button
                type="submit"
                disabled={isPending || !name || !description}
                className="w-full gap-2 bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30 hover:shadow-cyber uppercase tracking-wider"
              >
                <Plus className="h-4 w-4" />
                {isPending ? 'MINTING PUZZLE...' : 'MINT AS NFT'}
              </Button>
            )}
          </form>
        </TabsContent>

        <TabsContent value="bit-plane-overlay">
          <BitPlaneOverlayTab />
        </TabsContent>

        <TabsContent value="cipher-tools">
          <CipherToolsContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CipherToolsContent() {
  return (
    <Tabs defaultValue="hash" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="hash" className="uppercase tracking-wider">Hash</TabsTrigger>
        <TabsTrigger value="encode" className="uppercase tracking-wider">Encode</TabsTrigger>
        <TabsTrigger value="cipher" className="uppercase tracking-wider">Cipher</TabsTrigger>
        <TabsTrigger value="aes" className="uppercase tracking-wider">AES-256</TabsTrigger>
      </TabsList>

      <TabsContent value="hash" className="mt-6">
        <HashTools />
      </TabsContent>

      <TabsContent value="encode" className="mt-6">
        <EncodeTools />
      </TabsContent>

      <TabsContent value="cipher" className="mt-6">
        <CipherTools />
      </TabsContent>

      <TabsContent value="aes" className="mt-6">
        <AESTools />
      </TabsContent>
    </Tabs>
  );
}

function HashTools() {
  const [input, setInput] = useState('');
  const [sha256Hash, setSha256Hash] = useState('');
  const [sha1Hash, setSha1Hash] = useState('');
  const [md5Hash, setMd5Hash] = useState('');

  const handleHash = async () => {
    if (!input) {
      toast.error('Please enter text to hash');
      return;
    }

    const sha256Result = await sha256(input);
    const sha1Result = await sha1(input);
    const md5Result = await md5(input);

    setSha256Hash(sha256Result);
    setSha1Hash(sha1Result);
    setMd5Hash(md5Result);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <Card className="cyber-border bg-black/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 uppercase tracking-wide text-primary">
          <Hash className="h-5 w-5" />
          HASH GENERATORS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="hash-input" className="uppercase text-xs tracking-widest text-muted-foreground">
            INPUT TEXT
          </Label>
          <Textarea
            id="hash-input"
            placeholder="Enter text to hash..."
            value={input}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
            rows={4}
            className="cyber-border bg-black/50 text-foreground placeholder:text-muted-foreground/50"
          />
        </div>

        <Button 
          onClick={handleHash} 
          className="w-full border border-primary/50 bg-primary/20 text-primary hover:bg-primary/30 hover:shadow-cyber uppercase tracking-wider"
        >
          GENERATE HASHES
        </Button>

        {sha256Hash && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="uppercase text-xs tracking-widest text-muted-foreground">SHA-256</Label>
              <div className="flex gap-2">
                <Input 
                  value={sha256Hash} 
                  readOnly 
                  className="cyber-border bg-black/50 font-mono text-xs text-foreground" 
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(sha256Hash, 'SHA-256')}
                  className="border-primary/50 bg-transparent text-primary hover:bg-primary/10"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="uppercase text-xs tracking-widest text-muted-foreground">SHA-1</Label>
              <div className="flex gap-2">
                <Input 
                  value={sha1Hash} 
                  readOnly 
                  className="cyber-border bg-black/50 font-mono text-xs text-foreground" 
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(sha1Hash, 'SHA-1')}
                  className="border-primary/50 bg-transparent text-primary hover:bg-primary/10"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="uppercase text-xs tracking-widest text-muted-foreground">MD5</Label>
              <div className="flex gap-2">
                <Input 
                  value={md5Hash} 
                  readOnly 
                  className="cyber-border bg-black/50 font-mono text-xs text-foreground" 
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(md5Hash, 'MD5')}
                  className="border-primary/50 bg-transparent text-primary hover:bg-primary/10"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EncodeTools() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [encoding, setEncoding] = useState<'base64' | 'hex' | 'binary'>('base64');

  const handleEncode = () => {
    if (!input) {
      toast.error('Please enter text to encode');
      return;
    }

    try {
      let result = '';
      if (encoding === 'base64') {
        result = base64Encode(input);
      } else if (encoding === 'hex') {
        result = hexEncode(input);
      } else if (encoding === 'binary') {
        result = binaryEncode(input);
      }
      setOutput(result);
    } catch (error) {
      toast.error('Encoding failed');
    }
  };

  return (
    <Card className="cyber-border bg-black/50">
      <CardHeader>
        <CardTitle className="uppercase tracking-wide text-primary">TEXT ENCODERS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={encoding === 'base64' ? 'default' : 'outline'}
            onClick={() => setEncoding('base64')}
            className={encoding === 'base64' 
              ? "flex-1 border border-primary/50 bg-primary/20 text-primary hover:bg-primary/30 uppercase tracking-wider" 
              : "flex-1 border-primary/50 bg-transparent text-primary hover:bg-primary/10 uppercase tracking-wider"
            }
          >
            BASE64
          </Button>
          <Button
            variant={encoding === 'hex' ? 'default' : 'outline'}
            onClick={() => setEncoding('hex')}
            className={encoding === 'hex' 
              ? "flex-1 border border-primary/50 bg-primary/20 text-primary hover:bg-primary/30 uppercase tracking-wider" 
              : "flex-1 border-primary/50 bg-transparent text-primary hover:bg-primary/10 uppercase tracking-wider"
            }
          >
            HEX
          </Button>
          <Button
            variant={encoding === 'binary' ? 'default' : 'outline'}
            onClick={() => setEncoding('binary')}
            className={encoding === 'binary' 
              ? "flex-1 border border-primary/50 bg-primary/20 text-primary hover:bg-primary/30 uppercase tracking-wider" 
              : "flex-1 border-primary/50 bg-transparent text-primary hover:bg-primary/10 uppercase tracking-wider"
            }
          >
            BINARY
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="encode-input" className="uppercase text-xs tracking-widest text-muted-foreground">
            INPUT TEXT
          </Label>
          <Textarea
            id="encode-input"
            placeholder="Enter text to encode..."
            value={input}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
            rows={4}
            className="cyber-border bg-black/50 text-foreground placeholder:text-muted-foreground/50"
          />
        </div>

        <Button 
          onClick={handleEncode} 
          className="w-full border border-primary/50 bg-primary/20 text-primary hover:bg-primary/30 hover:shadow-cyber uppercase tracking-wider"
        >
          ENCODE
        </Button>

        {output && (
          <div className="space-y-2">
            <Label className="uppercase text-xs tracking-widest text-muted-foreground">OUTPUT</Label>
            <div className="flex gap-2">
              <Textarea 
                value={output} 
                readOnly 
                rows={4} 
                className="cyber-border bg-black/50 font-mono text-xs text-foreground" 
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  toast.success('Copied to clipboard!');
                }}
                className="border-primary/50 bg-transparent text-primary hover:bg-primary/10"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CipherTools() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [cipher, setCipher] = useState<'caesar' | 'vigenere' | 'xor'>('caesar');
  const [key, setKey] = useState('');
  const [shift, setShift] = useState('3');

  const handleEncode = () => {
    if (!input) {
      toast.error('Please enter text to encode');
      return;
    }

    try {
      let result = '';
      if (cipher === 'caesar') {
        result = caesarCipher(input, parseInt(shift) || 3, false);
      } else if (cipher === 'vigenere') {
        if (!key) {
          toast.error('Please enter a key');
          return;
        }
        result = vigenereCipher(input, key, false);
      } else if (cipher === 'xor') {
        if (!key) {
          toast.error('Please enter a key');
          return;
        }
        result = xorCipher(input, key);
      }
      setOutput(result);
    } catch (error) {
      toast.error('Encoding failed');
    }
  };

  return (
    <Card className="cyber-border bg-black/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 uppercase tracking-wide text-primary">
          <Key className="h-5 w-5" />
          CLASSIC CIPHER ENCODING
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={cipher === 'caesar' ? 'default' : 'outline'}
            onClick={() => setCipher('caesar')}
            className={cipher === 'caesar' 
              ? "flex-1 border border-primary/50 bg-primary/20 text-primary hover:bg-primary/30 uppercase tracking-wider" 
              : "flex-1 border-primary/50 bg-transparent text-primary hover:bg-primary/10 uppercase tracking-wider"
            }
          >
            CAESAR
          </Button>
          <Button
            variant={cipher === 'vigenere' ? 'default' : 'outline'}
            onClick={() => setCipher('vigenere')}
            className={cipher === 'vigenere' 
              ? "flex-1 border border-primary/50 bg-primary/20 text-primary hover:bg-primary/30 uppercase tracking-wider" 
              : "flex-1 border-primary/50 bg-transparent text-primary hover:bg-primary/10 uppercase tracking-wider"
            }
          >
            VIGENÈRE
          </Button>
          <Button
            variant={cipher === 'xor' ? 'default' : 'outline'}
            onClick={() => setCipher('xor')}
            className={cipher === 'xor' 
              ? "flex-1 border border-primary/50 bg-primary/20 text-primary hover:bg-primary/30 uppercase tracking-wider" 
              : "flex-1 border-primary/50 bg-transparent text-primary hover:bg-primary/10 uppercase tracking-wider"
            }
          >
            XOR
          </Button>
        </div>

        {cipher === 'caesar' && (
          <div className="space-y-2">
            <Label htmlFor="shift" className="uppercase text-xs tracking-widest text-muted-foreground">
              SHIFT AMOUNT
            </Label>
            <Input
              id="shift"
              type="number"
              value={shift}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setShift(event.target.value)}
              placeholder="3"
              className="cyber-border bg-black/50 text-foreground placeholder:text-muted-foreground/50"
            />
          </div>
        )}

        {(cipher === 'vigenere' || cipher === 'xor') && (
          <div className="space-y-2">
            <Label htmlFor="cipher-key" className="uppercase text-xs tracking-widest text-muted-foreground">
              KEY
            </Label>
            <Input
              id="cipher-key"
              value={key}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setKey(event.target.value)}
              placeholder="Enter cipher key"
              className="cyber-border bg-black/50 text-foreground placeholder:text-muted-foreground/50"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="cipher-input" className="uppercase text-xs tracking-widest text-muted-foreground">
            INPUT TEXT
          </Label>
          <Textarea
            id="cipher-input"
            placeholder="Enter text to encode..."
            value={input}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
            rows={4}
            className="cyber-border bg-black/50 text-foreground placeholder:text-muted-foreground/50"
          />
        </div>

        <Button 
          onClick={handleEncode} 
          className="w-full border border-primary/50 bg-primary/20 text-primary hover:bg-primary/30 hover:shadow-cyber uppercase tracking-wider"
        >
          ENCODE
        </Button>

        {output && (
          <div className="space-y-2">
            <Label className="uppercase text-xs tracking-widest text-muted-foreground">OUTPUT</Label>
            <div className="flex gap-2">
              <Textarea 
                value={output} 
                readOnly 
                rows={4} 
                className="cyber-border bg-black/50 text-foreground"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  toast.success('Copied to clipboard!');
                }}
                className="border-primary/50 bg-transparent text-primary hover:bg-primary/10"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AESTools() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEncrypt = async () => {
    if (!input) {
      toast.error('Please enter text to encrypt');
      return;
    }

    if (!password) {
      toast.error('Please enter a password');
      return;
    }

    try {
      setIsProcessing(true);
      const encrypted = await aesEncrypt(input, password);
      setOutput(encrypted);
      toast.success('Text encrypted successfully!');
    } catch (error) {
      console.error('Encryption error:', error);
      toast.error('Encryption failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="cyber-border bg-black/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 uppercase tracking-wide text-primary">
          <Shield className="h-5 w-5" />
          AES-256 ENCRYPTION
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="aes-password" className="uppercase text-xs tracking-widest text-muted-foreground">
            PASSWORD
          </Label>
          <Input
            id="aes-password"
            type="password"
            value={password}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
            placeholder="Enter encryption password"
            className="cyber-border bg-black/50 text-foreground placeholder:text-muted-foreground/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="aes-input" className="uppercase text-xs tracking-widest text-muted-foreground">
            INPUT TEXT
          </Label>
          <Textarea
            id="aes-input"
            placeholder="Enter text to encrypt..."
            value={input}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
            rows={4}
            className="cyber-border bg-black/50 text-foreground placeholder:text-muted-foreground/50"
          />
        </div>

        <Button 
          onClick={handleEncrypt}
          disabled={isProcessing}
          className="w-full border border-primary/50 bg-primary/20 text-primary hover:bg-primary/30 hover:shadow-cyber uppercase tracking-wider"
        >
          {isProcessing ? 'ENCRYPTING...' : 'ENCRYPT'}
        </Button>

        {output && (
          <div className="space-y-2">
            <Label className="uppercase text-xs tracking-widest text-muted-foreground">ENCRYPTED OUTPUT</Label>
            <div className="flex gap-2">
              <Textarea 
                value={output} 
                readOnly 
                rows={4} 
                className="cyber-border bg-black/50 font-mono text-xs text-foreground" 
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  toast.success('Copied to clipboard!');
                }}
                className="border-primary/50 bg-transparent text-primary hover:bg-primary/10"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
