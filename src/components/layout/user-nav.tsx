
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CreditCard,
  LogOut,
  Settings,
  User as UserIcon,
  Bell,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '../ui/badge';
import { useNotifications } from '@/context/NotificationProvider';

export function UserNav() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const { notifications, clearNotifications } = useNotifications();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserRole(localStorage.getItem('userRole'));
      setUserEmail(localStorage.getItem('userEmail'));
      setUserName(localStorage.getItem('userName'));
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
    }
    router.push('/');
  };

  const getInitials = (name: string | null) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
                <Badge className="absolute top-1 right-1 h-4 w-4 justify-center p-0 text-xs" variant="destructive">
                    {notifications.length}
                </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80">
          <div className="p-2">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-lg">Notifications</h3>
                {notifications.length > 0 && (
                    <Button variant="link" className="p-0 h-auto" onClick={clearNotifications}>Clear all</Button>
                )}
            </div>
            <div className="flow-root">
                {notifications.length > 0 ? (
                    <div className="-my-2 divide-y divide-gray-100 dark:divide-gray-700">
                        {notifications.map((notif) => (
                            <div key={notif.id} className="py-2">
                                <p className="text-sm">{notif.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(notif.timestamp, { addSuffix: true })}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                        You have no new notifications.
                    </div>
                )}
            </div>
             <Button variant="link" className="w-full mt-2" disabled>View all notifications</Button>
          </div>
        </PopoverContent>
      </Popover>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={`https://avatar.vercel.sh/${userEmail}.png`}
                alt="User avatar"
              />
              <AvatarFallback>
                {userName ? getInitials(userName) : <UserIcon />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {userName ||
                  (userRole
                    ? `${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`
                    : 'Guest')}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {userEmail}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => router.push('/dashboard/student/profile')}
              disabled={userRole !== 'student'}
              className={userRole === 'student' ? 'cursor-pointer' : ''}
            >
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
