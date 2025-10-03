

export type Book = {
  id?: string;
  title: string;
  author: string;
  isbn: string;
  publicationDate: string;
  publisher: string;
  status: 'available' | 'checked-out';
  coverImageUrl: string;
  category?: string;
  copies?: string;
  department?: string;
  year?: string;
  semester?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'librarian' | 'student';
  avatar?: string;
  enrollment?: string;
  department?: string;
  year?: number;
  semester?: number;
  booksIssued?: number;
};

export type BorrowingHistory = {
  id: string;
  userId: string;
  bookId: string;
  checkoutDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'issued' | 'returned' | 'overdue';
};

export type Fine = {
  id: string;
  userId: string;
  bookId: string;
  amount: number;
  reason: string;
  dateIssued: string;
  status: 'paid' | 'unpaid' | 'pending-verification';
  paymentDate?: string | null;
  paymentMethod?: 'cash' | 'online' | null;
  verifiedBy?: 'admin' | 'librarian' | null;
  transactionId?: string;
};


export const books: Book[] = [
    { id: '1', title: 'Data Structures', author: 'John Doe', isbn: '978-0134322474', publicationDate: '2023-01-01', publisher: 'Pearson', status: 'checked-out', coverImageUrl: 'https://picsum.photos/seed/978-0134322474/300/400' },
    { id: '2', title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', publicationDate: '2022-05-15', publisher: 'Prentice Hall', status: 'available', coverImageUrl: 'https://picsum.photos/seed/978-0132350884/300/400' },
    { id: '3', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', publicationDate: '2021-11-20', publisher: 'Scribner', status: 'checked-out', coverImageUrl: 'https://picsum.photos/seed/978-0743273565/300/400' },
];
export const users: User[] = [
    { id: '1', name: 'Admin User', email: 'admin@sarec.com', role: 'admin' },
    { id: '2', name: 'Bob Librarian', email: 'bob@sarec.com', role: 'librarian' },
    { id: '3', name: 'Charlie Student', email: 'charlie@sarec.com', role: 'student', enrollment: 'STU1001', booksIssued: 2 },
];
export const borrowingHistory: BorrowingHistory[] = [];
export const fines: Fine[] = [
    { id: '1', userId: '3', bookId: '1', amount: 50, reason: 'Late Return', dateIssued: '2024-07-01', status: 'unpaid' },
    { id: '2', userId: '3', bookId: '3', amount: 25, reason: 'Book Damaged', dateIssued: '2024-06-15', status: 'pending-verification', paymentMethod: 'online' },
    { id: '3', userId: '3', bookId: '2', amount: 10, reason: 'Late Return', dateIssued: '2024-05-20', status: 'paid', paymentDate: '2024-05-25', paymentMethod: 'cash', verifiedBy: 'librarian' },
];
