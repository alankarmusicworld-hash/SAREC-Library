

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
};


export const books: Book[] = [];
export const users: User[] = [];
export const borrowingHistory: BorrowingHistory[] = [];
export const fines: Fine[] = [];
