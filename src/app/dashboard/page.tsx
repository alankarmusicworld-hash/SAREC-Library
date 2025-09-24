import Link from 'next/link';
import { BookCopy, Users, BookUp } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const features = [
  {
    title: 'Browse Books',
    description: 'Explore our vast collection of books.',
    href: '/dashboard/student/browse',
    icon: BookCopy,
  },
  {
    title: 'Manage Users',
    description: 'Add, edit, or remove user accounts (Admin).',
    href: '/dashboard/admin/users',
    icon: Users,
  },
  {
    title: 'Book Inventory',
    description: 'Manage the library book stock (Librarian).',
    href: '/dashboard/librarian/inventory',
    icon: BookUp,
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Welcome to the SAREC Library Portal
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your one-stop solution for library management.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link href={feature.href} key={feature.title} className="group">
            <Card className="flex h-full flex-col transition-all group-hover:shadow-lg group-hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="rounded-lg bg-primary p-3 text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
