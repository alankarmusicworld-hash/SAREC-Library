
'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { DataTable } from './components/data-table';
import { columns } from './components/columns';
import { Button } from '@/components/ui/button';
import { UserPlus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddMemberForm } from './components/add-member-form';
import { useToast } from '@/hooks/use-toast';

export default function UserManagementPage() {
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddMemberOpen, setAddMemberOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole');
      setUserRole(role);
    }
  }, []);

  useEffect(() => {
    if (!userRole) return; // Don't fetch until role is known

    setIsLoading(true);
    let usersQuery;
    const usersCollectionRef = collection(db, 'users');

    if (userRole === 'librarian') {
      // Librarians only see students
      usersQuery = query(usersCollectionRef, where('role', '==', 'student'));
    } else {
      // Admins see everyone
      usersQuery = query(usersCollectionRef);
    }
    
    const unsubscribe = onSnapshot(
      usersQuery,
      (querySnapshot) => {
        const usersData = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as User)
        );
        setData(usersData);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching users: ', error);
        toast({
          variant: 'destructive',
          title: 'Error fetching data',
          description: 'Could not load users from the database.',
        });
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [toast, userRole]);

  const handleMemberAdded = () => {
    setAddMemberOpen(false);
  };
  
  const handleUserUpdated = async (updatedUser: User) => {
    if (!updatedUser.id) return;
    const userRef = doc(db, 'users', updatedUser.id);
    try {
        const { id, ...userData } = updatedUser;
        await setDoc(userRef, userData, { merge: true });
        toast({
            title: 'User Updated!',
            description: `${updatedUser.name}'s profile has been updated.`,
        });
    } catch (error) {
        console.error("Error updating user: ", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update the user in the database.",
        });
    }
  };
  
  const handleUserDeleted = async (userId: string) => {
     const userRef = doc(db, 'users', userId);
     try {
        await deleteDoc(userRef);
         toast({
            title: 'User Deleted',
            description: `The user has been removed from the system.`,
        });
     } catch (error) {
         console.error("Error deleting user: ", error);
        toast({
            variant: "destructive",
            title: "Delete Failed",
            description: "Could not delete the user from the database.",
        });
     }
  };

  const filteredData = data.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.enrollment && user.enrollment.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const dynamicColumns = columns({ onUserUpdated: handleUserUpdated, onUserDeleted: handleUserDeleted });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Library Members</CardTitle>
            <CardDescription>
              Browse, search, and manage all members of the library.
            </CardDescription>
          </div>
          <Dialog open={isAddMemberOpen} onOpenChange={setAddMemberOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Library Member</DialogTitle>
                <DialogDescription>
                  Enter the details to create a new student account.
                </DialogDescription>
              </DialogHeader>
              <AddMemberForm onMemberAdded={handleMemberAdded} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID..."
              className="pl-10 h-10 max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <DataTable columns={dynamicColumns} data={filteredData} />
      </CardContent>
    </Card>
  );
}
