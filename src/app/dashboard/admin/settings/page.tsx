
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { IndianRupee, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function SettingsPage() {
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState<string | null>(null);

  const handleSaveSettings = () => {
    // In a real application, you would save these settings to a database.
    toast({
      title: 'Settings Saved',
      description: 'Your library settings have been successfully updated.',
    });
  };

  const handleQrCodeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCode(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-3xl font-bold tracking-tight">Library Settings</h1>
            <p className="text-muted-foreground">Manage library policies and application settings.</p>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Fine & Loan Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="fine-rate">Fine Rate (per day)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="fine-rate" defaultValue="5" className="pl-9" />
              </div>
              <p className="text-xs text-muted-foreground">
                The amount charged for each day a book is overdue.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="loan-period">Loan Period (days)</Label>
              <Input id="loan-period" defaultValue="14" />
              <p className="text-xs text-muted-foreground">
                The number of days a student can borrow a book.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-books">Max Books per Student</Label>
              <Input id="max-books" defaultValue="3" />
              <p className="text-xs text-muted-foreground">
                The maximum number of books a student can issue at once.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
                <Label htmlFor="library-name">Library Name</Label>
                <Input id="library-name" defaultValue="BiblioTech Pro" />
                 <p className="text-xs text-muted-foreground">
                    The name displayed throughout the application.
                </p>
            </div>
             <div className="space-y-2">
                <Label htmlFor="currency-symbol">Currency Symbol</Label>
                <Input id="currency-symbol" defaultValue="₹" />
                 <p className="text-xs text-muted-foreground">
                    The symbol used for monetary values (e.g., fines).
                </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Settings</CardTitle>
          <CardDescription>
            Configure UPI payment details for fine collection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="space-y-2">
              <Label htmlFor="upi-id">UPI ID</Label>
              <Input id="upi-id" placeholder="your-upi-id@okhdfcbank" />
              <p className="text-xs text-muted-foreground">
                Students will use this UPI ID to pay their fines online.
              </p>
            </div>
            
            <div className="space-y-2">
                <Label>QR Code</Label>
                <div className="flex items-center gap-4">
                    <div className="w-32 h-32 rounded-lg border border-dashed flex items-center justify-center bg-muted/50">
                        {qrCode ? (
                            <Image src={qrCode} alt="QR Code Preview" width={128} height={128} className="object-contain rounded-md" />
                        ) : (
                            <span className="text-xs text-muted-foreground">No QR Code</span>
                        )}
                    </div>
                    <div>
                        <Button asChild variant="outline">
                            <label htmlFor="qr-code-upload" className="cursor-pointer">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload QR Code
                            </label>
                        </Button>
                        <Input id="qr-code-upload" type="file" accept="image/*" className="hidden" onChange={handleQrCodeUpload} />
                        <p className="text-xs text-muted-foreground mt-2">
                            Upload an image of your UPI QR code.
                        </p>
                    </div>
                </div>
            </div>

        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button onClick={handleSaveSettings}>Save All Settings</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
