import { users, User } from '@/lib/data';
import { DataTable } from './components/data-table';
import { columns } from './components/columns';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage all user accounts and roles in the system.
            </CardDescription>
          </div>
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data} />
      </CardContent>
    </Card>
  );
}
