
export type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publicationDate: string;
  publisher: string;
  status: 'available' | 'checked-out';
  coverImageUrl: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'librarian' | 'student';
};

export type BorrowingHistory = {
  id: string;
  userId: string;
  bookId: string;
  checkoutDate: string;
  dueDate: string;
  returnDate: string | null;
};

export type Fine = {
  id: string;
  userId: string;
  bookId: string;
  amount: number;
  reason: string;
  dateIssued: string;
  status: 'paid' | 'unpaid';
};


export const books: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    publicationDate: '1925-04-10',
    publisher: "Scribner's",
    status: 'available',
    coverImageUrl: 'https://picsum.photos/seed/book1/300/400',
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0061120084',
    publicationDate: '1960-07-11',
    publisher: 'J. B. Lippincott &amp; Co.',
    status: 'checked-out',
    coverImageUrl: 'https://picsum.photos/seed/book2/300/400',
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    isbn: '978-0451524935',
    publicationDate: '1949-06-08',
    publisher: 'Secker &amp; Warburg',
    status: 'available',
    coverImageUrl: 'https://picsum.photos/seed/book3/300/400',
  },
  {
    id: '4',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    isbn: '978-1503290563',
    publicationDate: '1813-01-28',
    publisher: 'T. Egerton, Whitehall',
    status: 'available',
    coverImageUrl: 'https://picsum.photos/seed/book4/300/400',
  },
  {
    id: '5',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    isbn: '978-0345339683',
    publicationDate: '1937-09-21',
    publisher: 'George Allen &amp; Unwin',
    status: 'checked-out',
    coverImageUrl: 'https://picsum.photos/seed/book5/300/400',
  },
  {
    id: '6',
    title: 'Brave New World',
    author: 'Aldous Huxley',
    isbn: '978-0060850524',
    publicationDate: '1932-08-30',
    publisher: 'Chatto &amp; Windus',
    status: 'available',
    coverImageUrl: 'https://picsum.photos/seed/book6/300/400',
  },
];

export const users: User[] = [
  { id: '1', name: 'Alice Admin', email: 'alice@sarec.com', role: 'admin' },
  { id: '2', name: 'Bob Librarian', email: 'bob@sarec.com', role: 'librarian' },
  { id: '3', name: 'Charlie Student', email: 'charlie@sarec.com', role: 'student' },
  { id: '4', name: 'Diana Student', email: 'diana@sarec.com', role: 'student' },
];

export const borrowingHistory: BorrowingHistory[] = [
  {
    id: 'h1',
    userId: '3',
    bookId: '2',
    checkoutDate: '2024-05-01',
    dueDate: '2024-05-15',
    returnDate: null,
  },
  {
    id: 'h2',
    userId: '4',
    bookId: '5',
    checkoutDate: '2024-05-10',
    dueDate: '2024-05-24',
    returnDate: null,
  },
  {
    id: 'h3',
    userId: '3',
    bookId: '1',
    checkoutDate: '2024-04-15',
    dueDate: '2024-04-29',
    returnDate: '2024-04-28',
  },
];

export const fines: Fine[] = [
    {
      id: 'f1',
      userId: '3',
      bookId: '1',
      amount: 20.00,
      reason: 'Late return',
      dateIssued: '2024-05-05',
      status: 'unpaid',
    },
    {
      id: 'f2',
      userId: '3',
      bookId: '5',
      amount: 50.00,
      reason: 'Book damaged',
      dateIssued: '2024-05-20',
      status: 'unpaid',
    },
     {
      id: 'f3',
      userId: '4',
      bookId: '2',
      amount: 15.00,
      reason: 'Late return',
      dateIssued: '2024-05-18',
      status: 'paid',
    },
  ];