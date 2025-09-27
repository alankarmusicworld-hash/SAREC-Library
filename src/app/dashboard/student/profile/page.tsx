
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
        <Button variant="outline" size="sm" className="gap-2">
            <Edit className="h-4 w-4"/>
            Edit Profile
        </Button>
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
