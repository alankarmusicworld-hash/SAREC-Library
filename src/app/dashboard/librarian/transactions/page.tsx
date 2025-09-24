import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function TransactionPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Book Checkout</CardTitle>
          <CardDescription>
            Process a book checkout for a user.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="checkout-user-id">User ID</Label>
              <Input
                id="checkout-user-id"
                placeholder="Enter user ID (e.g., 3)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout-book-isbn">Book ISBN</Label>
              <Input
                id="checkout-book-isbn"
                placeholder="Enter book ISBN"
              />
            </div>
            <Button className="w-full">Check Out Book</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Book Return</CardTitle>
          <CardDescription>Process a book return.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="return-book-isbn">Book ISBN</Label>
              <Input id="return-book-isbn" placeholder="Enter book ISBN" />
            </div>
            <Button variant="secondary" className="w-full">
              Process Return
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
