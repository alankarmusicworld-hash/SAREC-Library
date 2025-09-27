
'use client';

import { useState, useEffect } from 'react';
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
import { User, Mail, GraduationCap, Building, Calendar, BookOpen, Edit } from 'lucide-react';
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

type StudentProfile = {
  name: string | null;
  email: string | null;
  enrollment: string | null;
  department: string | null;
  year: string | null;
  semester: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setProfile({
        name: localStorage.getItem('userName'),
        email: localStorage.getItem('userEmail'),
        enrollment: localStorage.getItem('userEnrollment'),
        department: localStorage.getItem('userDepartment'),
        year: localStorage.getItem('userYear'),
        semester: localStorage.getItem('userSemester'),
      });
    }
  }, []);

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

  const getInitials = (name: string | null) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

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
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="h-4 w-4"/>
                    Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>
                    Make changes to your profile here. Click save when you're done.
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                        Name
                        </Label>
                        <Input id="name" defaultValue={profile.name || ''} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                        Email
                        </Label>
                        <Input id="email" defaultValue={profile.email || ''} className="col-span-3" disabled />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="enrollment" className="text-right">
                        Enrollment
                        </Label>
                        <Input id="enrollment" defaultValue={profile.enrollment || ''} className="col-span-3" disabled />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="department" className="text-right">
                        Department
                        </Label>
                        <Input id="department" defaultValue={profile.department || ''} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="submit">Save changes</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex flex-col items-center gap-4 w-full md:w-48">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                    <AvatarImage src={`https://avatar.vercel.sh/${profile.email}.png`} alt={profile.name || 'Student'} />
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
