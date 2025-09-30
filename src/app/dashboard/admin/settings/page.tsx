
'use client';

import { useState, useEffect } from 'react';
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
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";

type Settings = {
    fineRate: string;
    loanPeriod: string;
    maxBooks: string;
    libraryName: string;
    currencySymbol: string;
    upiId: string;
    qrCodeUrl: string;
    logoUrl: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>({
      fineRate: '5',
      loanPeriod: '14',
      maxBooks: '3',
      libraryName: 'BiblioTech Pro',
      currencySymbol: '₹',
      upiId: '',
      qrCodeUrl: '',
      logoUrl: '',
  });
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const settingsRef = doc(db, 'settings', 'libraryConfig');
      try {
        const docSnap = await getDoc(settingsRef);
        if (docSnap.exists()) {
          const fetchedSettings = docSnap.data() as Settings;
          setSettings(fetchedSettings);
          if (fetchedSettings.qrCodeUrl) {
            setQrCodePreview(fetchedSettings.qrCodeUrl);
          }
          if (fetchedSettings.logoUrl) {
            setLogoPreview(fetchedSettings.logoUrl);
          }
        }
      } catch (error) {
        console.error("Error fetching settings: ", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load library settings.',
        });
      } finally {
          setIsLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setSettings(prev => ({...prev, [id]: value }));
  }

  const handleSaveSettings = async () => {
    setIsSaving(true);
    const settingsRef = doc(db, 'settings', 'libraryConfig');
    try {
        await setDoc(settingsRef, settings, { merge: true });
        toast({
            title: 'Settings Saved',
            description: 'Your library settings have been successfully updated.',
        });
    } catch(error) {
         console.error("Error saving settings: ", error);
         toast({
            variant: 'destructive',
            title: 'Save Failed',
            description: 'Could not save settings to the database.',
        });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    path: string,
    setPreview: (url: string | null) => void,
    setSettingsUrl: (url: string) => void,
    currentUrl: string | null
    ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl); // Show preview immediately

        // Upload to Firebase Storage
        const storage = getStorage();
        const storageRef = ref(storage, path);
        try {
            await uploadString(storageRef, dataUrl, 'data_url');
            const downloadURL = await getDownloadURL(storageRef);
            setSettingsUrl(downloadURL);
            toast({
                title: "Image Uploaded",
                description: "Image is ready to be saved with settings."
            });
        } catch(error) {
            console.error("Error uploading image:", error);
            toast({
                variant: 'destructive',
                title: 'Upload Failed',
                description: 'Could not upload image.'
            });
            setPreview(currentUrl); // Revert preview if upload fails
        }
      };
      reader.readAsDataURL(file);
    }
  };


  if (isLoading) {
      return (
          <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight">Library Settings</h1>
              <Card><CardContent className="p-6">Loading settings...</CardContent></Card>
          </div>
      )
  }

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
              <Label htmlFor="fineRate">Fine Rate (per day)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="fineRate" value={settings.fineRate} onChange={handleInputChange} className="pl-9" />
              </div>
              <p className="text-xs text-muted-foreground">
                The amount charged for each day a book is overdue.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="loanPeriod">Loan Period (days)</Label>
              <Input id="loanPeriod" value={settings.loanPeriod} onChange={handleInputChange} />
              <p className="text-xs text-muted-foreground">
                The number of days a student can borrow a book.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxBooks">Max Books per Student</Label>
              <Input id="maxBooks" value={settings.maxBooks} onChange={handleInputChange} />
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
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
                <Label htmlFor="libraryName">Library Name</Label>
                <Input id="libraryName" value={settings.libraryName} onChange={handleInputChange} />
                 <p className="text-xs text-muted-foreground">
                    The name displayed throughout the application.
                </p>
            </div>
             <div className="space-y-2">
                <Label htmlFor="currencySymbol">Currency Symbol</Label>
                <Input id="currencySymbol" value={settings.currencySymbol} onChange={handleInputChange} />
                 <p className="text-xs text-muted-foreground">
                    The symbol used for monetary values (e.g., fines).
                </p>
            </div>
          </div>
          
           <div className="space-y-2">
                <Label>Library Logo</Label>
                <div className="flex items-center gap-4">
                    <div className="w-32 h-32 rounded-lg border border-dashed flex items-center justify-center bg-muted/50 p-2">
                        {logoPreview ? (
                            <Image src={logoPreview} alt="Logo Preview" width={128} height={128} className="object-contain rounded-md" />
                        ) : (
                            <span className="text-xs text-muted-foreground">No Logo</span>
                        )}
                    </div>
                    <div>
                        <Button asChild variant="outline">
                            <label htmlFor="logo-upload" className="cursor-pointer">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Logo
                            </label>
                        </Button>
                        <Input 
                            id="logo-upload" 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(e, 'logos/library_logo.png', setLogoPreview, (url) => setSettings(p => ({...p, logoUrl: url})), settings.logoUrl)}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            Upload your library's logo (PNG, JPG).
                        </p>
                    </div>
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
              <Label htmlFor="upiId">UPI ID</Label>
              <Input id="upiId" placeholder="your-upi-id@okhdfcbank" value={settings.upiId} onChange={handleInputChange} />
              <p className="text-xs text-muted-foreground">
                Students will use this UPI ID to pay their fines online.
              </p>
            </div>
            
            <div className="space-y-2">
                <Label>QR Code</Label>
                <div className="flex items-center gap-4">
                    <div className="w-32 h-32 rounded-lg border border-dashed flex items-center justify-center bg-muted/50">
                        {qrCodePreview ? (
                            <Image src={qrCodePreview} alt="QR Code Preview" width={128} height={128} className="object-contain rounded-md" />
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
                        <Input 
                            id="qr-code-upload" 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(e, 'qrcodes/upi_qr.png', setQrCodePreview, (url) => setSettings(p => ({...p, qrCodeUrl: url})), settings.qrCodeUrl)}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            Upload an image of your UPI QR code.
                        </p>
                    </div>
                </div>
            </div>

        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save All Settings'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
