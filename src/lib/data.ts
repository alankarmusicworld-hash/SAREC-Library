
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
  paymentDate?: string | null;
  paymentMethod?: 'cash' | 'online' | null;
  verifiedBy?: 'admin' | 'librarian' | null;
};


export const books: Book[] = [
  {
    id: '1',
    title: 'Electrical Machines Ist',
    author: 'Ashfak Husen',
    isbn: '81124932184567',
    publicationDate: '2022-01-01',
    publisher: 'Sarthak',
    status: 'available',
    coverImageUrl: 'https://picsum.photos/seed/book1/300/400',
    category: 'Electrical',
    copies: '7/8',
  },
  {
    id: '2',
    title: 'Digital Electronics',
    author: 'Morris Mano',
    isbn: '811249321890',
    publicationDate: '2021-05-15',
    publisher: 'Sarthak',
    status: 'available',
    coverImageUrl: 'https://picsum.photos/seed/book2/300/400',
    category: 'Electronics',
    copies: '20/20',
  },
  {
    id: '3',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    publicationDate: '1925-04-10',
    publisher: "Scribner's",
    status: 'available',
    coverImageUrl: 'https://picsum.photos/seed/book3/300/400',
    category: 'Fiction',
    copies: '5/5',
  },
  {
    id: '4',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0061120084',
    publicationDate: '1960-07-11',
    publisher: 'J. B. Lippincott & Co.',
    status: 'checked-out',
    coverImageUrl: 'https://picsum.photos/seed/book4/300/400',
    category: 'Classic',
    copies: '0/2',
  },
  {
    id: '5',
    title: '1984',
    author: 'George Orwell',
    isbn: '978-0451524935',
    publicationDate: '1949-06-08',
    publisher: 'Secker & Warburg',
    status: 'available',
    coverImageUrl: 'https://picsum.photos/seed/book5/300/400',
    category: 'Dystopian',
    copies: '3/3',
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
      paymentDate: null,
      paymentMethod: null,
      verifiedBy: null,
    },
    {
      id: 'f2',
      userId: '3',
      bookId: '5',
      amount: 50.00,
      reason: 'Book damaged',
      dateIssued: '2024-05-20',
      status: 'unpaid',
      paymentDate: null,
      paymentMethod: null,
      verifiedBy: null,
    },
     {
      id: 'f3',
      userId: '3',
      bookId: '2',
      amount: 15.00,
      reason: 'Late return',
      dateIssued: '2024-04-18',
      status: 'paid',
      paymentDate: '2024-04-22',
      paymentMethod: 'online',
      verifiedBy: 'librarian'
    },
    {
      id: 'f4',
      userId: '4',
      bookId: '3',
      amount: 25.00,
      reason: 'Lost book',
      dateIssued: '2024-03-10',
      status: 'paid',
      paymentDate: '2024-03-15',
      paymentMethod: 'cash',
      verifiedBy: 'admin'
    },
  ];
