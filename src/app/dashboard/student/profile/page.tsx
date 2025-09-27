
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type StudentProfile = {
  name: string;
  email: string;
  enrollment: string;
  department: string;
  year: string;
  semester: string;
  avatar: string | null;
  password?: string;
};

const departments = [
  'Computer Science',
  'Electrical Engineering',
  'Electronics Engineering',
  'Information Technology',
  'Mechanical Engineering',
  'Civil Engineering',
  'General',
];
const years = ['1st', '2nd', '3rd', '4th'];
const semesterOptions: Record<string, string[]> = {
  '1st': ['1', '2'],
  '2nd': ['3', '4'],
  '3rd': ['5', '6'],
  '4th': ['7', '8'],
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedProfile: StudentProfile = {
        name: localStorage.getItem('userName') || '',
        email: localStorage.getItem('userEmail') || '',
        enrollment: localStorage.getItem('userEnrollment') || '',
        department: localStorage.getItem('userDepartment') || '',
        year: localStorage.getItem('userYear') || '',
        semester: localStorage.getItem('userSemester') || '',
        avatar: localStorage.getItem('userAvatar'),
        password: '', // Should be fetched securely if needed
      };
      setProfile(storedProfile);
      setIsLoading(false);
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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setProfile(prev => prev ? { ...prev, [id]: value } : null);
  };
  
  const handleSelectChange = (id: keyof StudentProfile, value: string) => {
    setProfile(prev => {
        if (!prev) return null;
        const newProfile = { ...prev, [id]: value };
        // If year is changed, reset semester
        if (id === 'year') {
            newProfile.semester = '';
        }
        return newProfile;
    });
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if(profile) {
            setProfile({ ...profile, avatar: reader.result as string});
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    if (profile) {
      localStorage.setItem('userName', profile.name);
      localStorage.setItem('userDepartment', profile.department);
      localStorage.setItem('userYear', profile.year);
      localStorage.setItem('userSemester', profile.semester);
      localStorage.setItem('userEmail', profile.email);
      if (profile.avatar) {
        localStorage.setItem('userAvatar', profile.avatar);
      }
      // Note: In a real app, password updates would be handled by a backend service.
      // Storing password in localStorage is insecure.
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been successfully saved.',
      });
    }
  };

  const availableSemesters = profile?.year ? semesterOptions[profile.year] : [];

  if (isLoading) {
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

  if (!profile) {
      return (
          <Card>
            <CardHeader><CardTitle>Profile not found.</CardTitle></CardHeader>
          </Card>
      )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>
          View and update your personal information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={profile.avatar || `https://avatar.vercel.sh/${profile.email}.png`} alt={profile.name} />
              <AvatarFallback className="text-4xl">{getInitials(profile.name)}</AvatarFallback>
            </Avatar>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              Upload New Photo
            </Button>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <p className="text-xs text-muted-foreground text-center">
              For best results, upload a square image.
            </p>
          </div>

          <div className="md:col-span-2">
            <form className="grid gap-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={profile.name} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enrollment">College ID</Label>
                  <Input id="enrollment" value={profile.enrollment} disabled />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                 <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select value={profile.department} onValueChange={(value) => handleSelectChange('department', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                            {departments.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select value={profile.year} onValueChange={(value) => handleSelectChange('year', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(y => <SelectItem key={y} value={y}>{y} Year</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                     <Select value={profile.semester} onValueChange={(value) => handleSelectChange('semester', value)} disabled={!profile.year}>
                        <SelectTrigger>
                            <SelectValue placeholder="Semester" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableSemesters.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
              </div>
              
              <Separator />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={profile.email} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter new password (optional)" onChange={handleInputChange} />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="button" onClick={handleSaveChanges}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
