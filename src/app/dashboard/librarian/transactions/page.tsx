
'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { DataTable } from './components/data-table';
import { columns } from './components/columns';
import { borrowingHistory, Book, User, BorrowingHistory } from '@/lib/data';
import { books, users } from '@/lib/data';

export type EnrichedTransaction = BorrowingHistory & {
  book?: Book;
  user?: User;
};

// This function can be expanded to fetch real data
function getEnrichedTransactions(): EnrichedTransaction[] {
  return borrowingHistory.map((history) => {
    const book = books.find((b) => b.id === history.bookId);
    const user = users.find((u) => u.id === history.userId);
    return { ...history, book, user };
  });
}


export default function TransactionPage() {
  const [allTransactions, setAllTransactions] = useState<EnrichedTransaction[]>(getEnrichedTransactions);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return allTransactions;

    const lowercasedQuery = searchQuery.toLowerCase();
    return allTransactions.filter((transaction) => {
      const bookTitle = transaction.book?.title.toLowerCase() || '';
      const author = transaction.book?.author.toLowerCase() || '';
      const studentName = transaction.user?.name.toLowerCase() || '';
      const isbn = transaction.book?.isbn.toLowerCase() || '';
      
      return (
        bookTitle.includes(lowercasedQuery) ||
        author.includes(lowercasedQuery) ||
        studentName.includes(lowercasedQuery) ||
        isbn.includes(lowercasedQuery)
      );
    });
  }, [searchQuery, allTransactions]);
  
  const handleMarkAsReturned = (transactionId: string) => {
    setAllTransactions(prev => 
      prev.map(t => t.id === transactionId ? { ...t, status: 'returned', returnDate: new Date().toISOString().split('T')[0] } : t)
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issues & Returns</CardTitle>
        <CardDescription>
          Track all currently issued books and manage returns.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by book, author, student, or ISBN..."
              className="pl-10 h-11 max-w-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <DataTable columns={columns({ handleMarkAsReturned })} data={filteredTransactions} />
      </CardContent>
    </Card>
  );
}

