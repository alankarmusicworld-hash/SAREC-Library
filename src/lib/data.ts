

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
    {
    id: '6',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    publicationDate: '2008-08-01',
    publisher: 'Prentice Hall',
    status: 'checked-out',
    coverImageUrl: 'https://picsum.photos/seed/book6/300/400',
    category: 'Software',
    copies: '1/2',
  },
  {
    id: '7',
    title: 'Introduction to Algorithms',
    author: 'CLRS',
    isbn: '9780262033848',
    publicationDate: '2009-07-31',
    publisher: 'The MIT Press',
    status: 'checked-out',
    coverImageUrl: 'https://picsum.photos/seed/book7/300/400',
    category: 'Computer Science',
    copies: '2/3',
  },
   {
    id: '8',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    isbn: '978-1503290563',
    publicationDate: '1813-01-28',
    publisher: 'T. Egerton, Whitehall',
    status: 'available',
    coverImageUrl: 'https://picsum.photos/seed/book8/300/400',
    category: 'Romance',
    copies: '4/4',
  },
];

export const users: User[] = [
  { 
    id: '1', 
    name: 'Alice Admin', 
    email: 'alice@sarec.com', 
    role: 'admin', 
    avatar: 'https://i.pravatar.cc/40?u=alice@sarec.com', 
    enrollment: 'N/A', 
    department: 'Administration',
    year: undefined,
    semester: undefined,
    booksIssued: 0
  },
  { 
    id: '2', 
    name: 'Bob Librarian', 
    email: 'bob@sarec.com', 
    role: 'librarian', 
    avatar: 'https://i.pravatar.cc/40?u=bob@sarec.com',
    enrollment: 'N/A',
    department: 'Library',
    year: undefined,
    semester: undefined,
    booksIssued: 0
  },
  { 
    id: '3', 
    name: 'Alankar Kushwaha', 
    email: 'alankar@sarec.com', 
    role: 'student',
    avatar: '',
    enrollment: '2412150209001',
    department: 'Electrical Engineering',
    year: 3,
    semester: 5,
    booksIssued: 1
  },
  { 
    id: '4', 
    name: 'Rishi', 
    email: 'rishi@sarec.com', 
    role: 'student',
    avatar: 'https://i.pravatar.cc/40?u=rishi@sarec.com',
    enrollment: '2412150209002',
    department: 'Electrical Engineering',
    year: 3,
    semester: 5,
    booksIssued: 0
  },
    { 
    id: '5', 
    name: 'Milind', 
    email: 'milind@sarec.com', 
    role: 'student',
    avatar: '',
    enrollment: '2412150209003',
    department: 'Electrical Engineering',
    year: 3,
    semester: 5,
    booksIssued: 0
  },
  { 
    id: '1001',
    name: 'Riya Sharma',
    email: 'riya@sarec.com',
    role: 'student',
    avatar: '',
    enrollment: 'STU1001',
    department: 'Computer Science',
    year: 2,
    semester: 4,
    booksIssued: 1
  },
   { 
    id: '1002',
    name: 'Aman Verma',
    email: 'aman@sarec.com',
    role: 'student',
    avatar: '',
    enrollment: 'STU1002',
    department: 'Mechanical Engineering',
    year: 3,
    semester: 6,
    booksIssued: 1
  },
];

export const borrowingHistory: BorrowingHistory[] = [
  {
    id: 'h1',
    userId: '3',
    bookId: '2',
    checkoutDate: '2024-05-01',
    dueDate: '2024-05-15',
    returnDate: null,
    status: 'issued',
  },
  {
    id: 'h2',
    userId: '4',
    bookId: '5',
    checkoutDate: '2024-05-10',
    dueDate: '2024-05-24',
    returnDate: null,
    status: 'issued',
  },
  {
    id: 'h3',
    userId: '3',
    bookId: '1',
    checkoutDate: '2024-04-15',
    dueDate: '2024-04-29',
    returnDate: '2024-04-28',
    status: 'returned',
  },
  {
    id: 'h4',
    userId: '1001',
    bookId: '6',
    checkoutDate: '2024-07-25',
    dueDate: '2024-08-08',
    returnDate: null,
    status: 'overdue',
  },
  {
    id: 'h5',
    userId: '1002',
    bookId: '7',
    checkoutDate: '2024-07-10',
    dueDate: '2024-07-24',
    returnDate: null,
    status: 'overdue',
  },
  {
    id: 'h6',
    userId: '4',
    bookId: '8',
    checkoutDate: '2023-08-23',
    dueDate: '2023-09-06',
    returnDate: '2023-09-01',
    status: 'returned',
  },
];

export const fines: Fine[] = [
    {
      id: 'f1',
      userId: '3',
      bookId: '1',
      amount: 20.00,
      reason: 'Late return (4 days)',
      dateIssued: '2024-05-05',
      status: 'unpaid',
      paymentDate: null,
      paymentMethod: null,
      verifiedBy: null,
    },
    {
      id: 'f2',
      userId: '4',
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
      reason: 'Late return (3 days)',
      dateIssued: '2024-04-18',
      status: 'paid',
      paymentDate: '2024-04-22',
      paymentMethod: 'online',
      verifiedBy: 'librarian'
    },
    {
      id: 'f4',
      userId: '1001',
      bookId: '6',
      amount: 25.00,
      reason: 'Late return (5 days)',
      dateIssued: '2024-08-13',
      status: 'unpaid',
      paymentDate: null,
      paymentMethod: null,
      verifiedBy: null
    },
    {
      id: 'f5',
      userId: '1002',
      bookId: '7',
      amount: 45.00,
      reason: 'Late return (9 days)',
      dateIssued: '2024-08-02',
      status: 'pending-verification',
      paymentDate: '2024-08-03',
      paymentMethod: 'cash',
      verifiedBy: null,
    },
     {
      id: 'f6',
      userId: '4',
      bookId: '8',
      amount: 10.00,
      reason: 'Late return (2 days)',
      dateIssued: '2023-09-08',
      status: 'paid',
      paymentDate: '2023-09-08',
      paymentMethod: 'cash',
      verifiedBy: 'admin'
    },
  ];


