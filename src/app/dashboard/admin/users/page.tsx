
'use client';

import { useState, useEffect } from 'react';
import { users as initialUsers, User } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
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
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const usersCollectionRef = collection(db, 'users');
    const unsubscribe = onSnapshot(
      usersCollectionRef,
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
  }, [toast]);

  const handleMemberAdded = () => {
    // The form now handles adding to Firebase and showing toast.
    // We just need to close the dialog.
    setAddMemberOpen(false);
  };

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
            />
          </div>
        </div>
        <DataTable columns={columns} data={data} />
      </CardContent>
    </Card>
  );
}
