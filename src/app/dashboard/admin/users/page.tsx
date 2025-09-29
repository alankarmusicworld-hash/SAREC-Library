
import { users, User } from '@/lib/data';
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

async function getUsers(): Promise<User[]> {
  // In a real app, you would fetch data from an API.
  return users;
}

export default async function UserManagementPage() {
  const data = await getUsers();

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
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Member
          </Button>
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
