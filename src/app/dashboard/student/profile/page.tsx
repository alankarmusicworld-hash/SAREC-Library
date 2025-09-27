
'use client';

import { useState, useEffect, ChangeEvent, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, GraduationCap, Building, Calendar, BookOpen, Edit, Camera } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type StudentProfile = {
  name: string | null;
  email: string | null;
  enrollment: string | null;
  department: string | null;
  year: string | null;
  semester: string | null;
  avatar: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedDepartment, setEditedDepartment] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedProfile = {
        name: localStorage.getItem('userName'),
        email: localStorage.getItem('userEmail'),
        enrollment: localStorage.getItem('userEnrollment'),
        department: localStorage.getItem('userDepartment'),
        year: localStorage.getItem('userYear'),
        semester: localStorage.getItem('userSemester'),
        avatar: localStorage.getItem('userAvatar'),
      };
      setProfile(storedProfile);
      setEditedName(storedProfile.name || '');
      setEditedDepartment(storedProfile.department || '');
      setPreviewAvatar(storedProfile.avatar);
    }
  }, []);

  const getInitials = (name: string | null) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleSaveChanges = () => {
    if (profile) {
        const updatedProfile = { 
            ...profile, 
            name: editedName, 
            department: editedDepartment,
            avatar: previewAvatar,
        };
        setProfile(updatedProfile);

        localStorage.setItem('userName', editedName);
        localStorage.setItem('userDepartment', editedDepartment);
        if (previewAvatar) {
            localStorage.setItem('userAvatar', previewAvatar);
        }
        
        toast({
            title: 'Profile Updated',
            description: 'Your profile information has been saved.',
        });
    }
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewAvatar(reader.result as string);
        }
        reader.readAsDataURL(file);
    }
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading profile...</p>
        </CardContent>
      </Card>
    );
  }

  const ProfileField = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | null }) => (
    <div className="flex items-center gap-4">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{value || 'Not set'}</p>
        </div>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>
            View and manage your profile details.
            </CardDescription>
        </div>
        <Dialog onOpenChange={(open) => {
            if (!open) {
                // Reset preview on close if not saved
                setPreviewAvatar(profile.avatar);
            }
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="h-4 w-4"/>
                    Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>
                    Make changes to your profile here. Click save when you're done.
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={previewAvatar || `https://avatar.vercel.sh/${profile.email}.png`} alt={profile.name || 'Student'} />
                                <AvatarFallback className="text-3xl">{getInitials(profile.name)}</AvatarFallback>
                            </Avatar>
                            <Button
                                size="icon"
                                variant="outline"
                                className="absolute -bottom-2 -right-2 rounded-full h-8 w-8"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Camera className="h-4 w-4" />
                            </Button>
                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </div>
                    </div>
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={editedName} onChange={(e) => setEditedName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" defaultValue={profile.email || ''} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="enrollment">Enrollment</Label>
                            <Input id="enrollment" defaultValue={profile.enrollment || ''} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input id="department" value={editedDepartment} onChange={(e) => setEditedDepartment(e.target.value)} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button type="submit" onClick={handleSaveChanges}>Save changes</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex flex-col items-center gap-4 w-full md:w-48">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                    <AvatarImage src={profile.avatar || `https://avatar.vercel.sh/${profile.email}.png`} alt={profile.name || 'Student'} />
                    <AvatarFallback className="text-4xl">{getInitials(profile.name)}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                    <h2 className="text-2xl font-bold">{profile.name}</h2>
                    <p className="text-muted-foreground">{profile.enrollment}</p>
                    <Badge variant="secondary" className="mt-2">Student</Badge>
                </div>
            </div>

            <Separator orientation="vertical" className="h-auto hidden md:block" />
            <Separator orientation="horizontal" className="w-full md:hidden" />

            <div className="grid gap-6 flex-1 pt-2">
               <ProfileField icon={Mail} label="Email Address" value={profile.email} />
               <ProfileField icon={GraduationCap} label="Department" value={profile.department} />
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ProfileField icon={Calendar} label="Current Year" value={profile.year} />
                <ProfileField icon={BookOpen} label="Current Semester" value={profile.semester} />
               </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

    