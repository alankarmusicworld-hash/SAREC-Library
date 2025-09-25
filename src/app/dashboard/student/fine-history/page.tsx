
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Zap } from 'lucide-react';

export default function FineHistoryPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fine History</CardTitle>
        <CardDescription>
          View your past fine payments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-4 text-center h-64">
            <Zap className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">This feature is coming soon. Stay tuned!</p>
        </div>
      </CardContent>
    </Card>
  );
}
