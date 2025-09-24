import { borrowingHistory, books, Book, BorrowingHistory } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type EnrichedHistory = BorrowingHistory & { book: Book | undefined };

async function getHistory(): Promise<EnrichedHistory[]> {
  // In a real app, you would fetch the history for the logged-in user.
  // Here we simulate it for user '3' and enrich it with book details.
  return borrowingHistory
    .filter((h) => h.userId === '3')
    .map((historyItem) => ({
      ...historyItem,
      book: books.find((b) => b.id === historyItem.bookId),
    }));
}

export default async function HistoryPage() {
  const history = await getHistory();

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Borrowing History</CardTitle>
        <CardDescription>
          A record of your current and past borrowed books.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book Title</TableHead>
                <TableHead>Checkout Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length > 0 ? (
                history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.book?.title || 'Unknown Book'}
                    </TableCell>
                    <TableCell>{item.checkoutDate}</TableCell>
                    <TableCell>{item.dueDate}</TableCell>
                    <TableCell>
                      <Badge variant={item.returnDate ? 'secondary' : 'outline'}>
                        {item.returnDate ? 'Returned' : 'Checked Out'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center"
                  >
                    You have no borrowing history.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
