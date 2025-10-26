import { useState, type ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Hash, Key, Shield } from 'lucide-react';
import {
  sha256, sha1, md5,
  base64Decode,
  hexDecode,
  binaryDecode,
  caesarCipher, vigenereCipher, xorCipher,
  aesDecrypt
} from '../../lib/crypto';
import { toast } from 'sonner';

export default function CipherToolsTab() {
  return (
    <Tabs defaultValue="hash" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="hash">Hash</TabsTrigger>
        <TabsTrigger value="decode">Decode</TabsTrigger>
        <TabsTrigger value="cipher">Cipher</TabsTrigger>
        <TabsTrigger value="aes">AES-256</TabsTrigger>
      </TabsList>

      <TabsContent value="hash" className="mt-6">
        <HashTools />
      </TabsContent>

      <TabsContent value="decode" className="mt-6">
        <DecodeTools />
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
          Hash Generators
        </CardTitle>
        <CardDescription className="uppercase text-xs tracking-widest text-muted-foreground">
          Generate cryptographic hashes from text
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="hash-input" className="uppercase text-xs tracking-widest text-muted-foreground">
            Input Text
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
          Generate Hashes
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

function DecodeTools() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [encoding, setEncoding] = useState<'base64' | 'hex' | 'binary'>('base64');

  const handleDecode = () => {
    if (!input) {
      toast.error('Please enter text to decode');
      return;
    }

    try {
      let result = '';
      if (encoding === 'base64') {
        result = base64Decode(input);
      } else if (encoding === 'hex') {
        result = hexDecode(input);
      } else if (encoding === 'binary') {
        result = binaryDecode(input);
      }
      setOutput(result);
    } catch (error) {
      toast.error('Invalid input for decoding');
    }
  };

  return (
    <Card className="cyber-border bg-black/50">
      <CardHeader>
        <CardTitle className="uppercase tracking-wide text-primary">Text Decoders</CardTitle>
        <CardDescription className="uppercase text-xs tracking-widest text-muted-foreground">
          Decode text from different encodings
        </CardDescription>
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
            Base64
          </Button>
          <Button
            variant={encoding === 'hex' ? 'default' : 'outline'}
            onClick={() => setEncoding('hex')}
            className={encoding === 'hex' 
              ? "flex-1 border border-primary/50 bg-primary/20 text-primary hover:bg-primary/30 uppercase tracking-wider" 
              : "flex-1 border-primary/50 bg-transparent text-primary hover:bg-primary/10 uppercase tracking-wider"
            }
          >
            Hex
          </Button>
          <Button
            variant={encoding === 'binary' ? 'default' : 'outline'}
            onClick={() => setEncoding('binary')}
            className={encoding === 'binary' 
              ? "flex-1 border border-primary/50 bg-primary/20 text-primary hover:bg-primary/30 uppercase tracking-wider" 
              : "flex-1 border-primary/50 bg-transparent text-primary hover:bg-primary/10 uppercase tracking-wider"
            }
          >
            Binary
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="decode-input" className="uppercase text-xs tracking-widest text-muted-foreground">
            Encoded Input
          </Label>
          <Textarea
            id="decode-input"
            placeholder="Enter encoded text to decode..."
            value={input}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
            rows={4}
            className="cyber-border bg-black/50 text-foreground placeholder:text-muted-foreground/50"
          />
        </div>

        <Button 
          onClick={handleDecode} 
          className="w-full border border-primary/50 bg-primary/20 text-primary hover:bg-primary/30 hover:shadow-cyber uppercase tracking-wider"
        >
          Decode
        </Button>

        {output && (
          <div className="space-y-2">
            <Label className="uppercase text-xs tracking-widest text-muted-foreground">Decoded Output</Label>
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

  const handleDecrypt = () => {
    if (!input) {
      toast.error('Please enter text to decrypt');
      return;
    }

    try {
      let result = '';
      if (cipher === 'caesar') {
        result = caesarCipher(input, parseInt(shift) || 3, true);
      } else if (cipher === 'vigenere') {
        if (!key) {
          toast.error('Please enter a key');
          return;
        }
        result = vigenereCipher(input, key, true);
      } else if (cipher === 'xor') {
        if (!key) {
          toast.error('Please enter a key');
          return;
        }
        result = xorCipher(input, key);
      }
      setOutput(result);
    } catch (error) {
      toast.error('Decryption failed');
    }
  };

  return (
    <Card className="cyber-border bg-black/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 uppercase tracking-wide text-primary">
          <Key className="h-5 w-5" />
          Classic Cipher Analysis
        </CardTitle>
        <CardDescription className="uppercase text-xs tracking-widest text-muted-foreground">
          Analyze and decrypt classic cipher algorithms
        </CardDescription>
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
            Caesar
          </Button>
          <Button
            variant={cipher === 'vigenere' ? 'default' : 'outline'}
            onClick={() => setCipher('vigenere')}
            className={cipher === 'vigenere' 
              ? "flex-1 border border-primary/50 bg-primary/20 text-primary hover:bg-primary/30 uppercase tracking-wider" 
              : "flex-1 border-primary/50 bg-transparent text-primary hover:bg-primary/10 uppercase tracking-wider"
            }
          >
            Vigenère
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
              Shift Amount
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
              Key
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
            Encrypted Text
          </Label>
          <Textarea
            id="cipher-input"
            placeholder="Enter encrypted text to decrypt..."
            value={input}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
            rows={4}
            className="cyber-border bg-black/50 text-foreground placeholder:text-muted-foreground/50"
          />
        </div>

        <Button 
          onClick={handleDecrypt} 
          className="w-full border border-primary/50 bg-primary/20 text-primary hover:bg-primary/30 hover:shadow-cyber uppercase tracking-wider"
        >
          Decrypt
        </Button>

        {output && (
          <div className="space-y-2">
            <Label className="uppercase text-xs tracking-widest text-muted-foreground">Decrypted Output</Label>
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

  const handleDecrypt = async () => {
    if (!input) {
      toast.error('Please enter encrypted text to decrypt');
      return;
    }

    if (!password) {
      toast.error('Please enter a password');
      return;
    }

    try {
      setIsProcessing(true);
      const decrypted = await aesDecrypt(input, password);
      setOutput(decrypted);
      toast.success('Text decrypted successfully!');
    } catch (error) {
      console.error('Decryption error:', error);
      toast.error('Decryption failed. Check your password and encrypted text.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="cyber-border bg-black/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 uppercase tracking-wide text-primary">
          <Shield className="h-5 w-5" />
          AES-256 Decryption
        </CardTitle>
        <CardDescription className="uppercase text-xs tracking-widest text-muted-foreground">
          Decrypt AES-256 encrypted messages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="aes-password" className="uppercase text-xs tracking-widest text-muted-foreground">
            Password
          </Label>
          <Input
            id="aes-password"
            type="password"
            value={password}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
            placeholder="Enter decryption password"
            className="cyber-border bg-black/50 text-foreground placeholder:text-muted-foreground/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="aes-input" className="uppercase text-xs tracking-widest text-muted-foreground">
            Encrypted Text
          </Label>
          <Textarea
            id="aes-input"
            placeholder="Enter encrypted text to decrypt..."
            value={input}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
            rows={4}
            className="cyber-border bg-black/50 text-foreground placeholder:text-muted-foreground/50"
          />
        </div>

        <Button 
          onClick={handleDecrypt}
          disabled={isProcessing}
          className="w-full border border-primary/50 bg-primary/20 text-primary hover:bg-primary/30 hover:shadow-cyber uppercase tracking-wider"
        >
          {isProcessing ? 'DECRYPTING...' : 'DECRYPT'}
        </Button>

        {output && (
          <div className="space-y-2">
            <Label className="uppercase text-xs tracking-widest text-muted-foreground">Decrypted Output</Label>
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
