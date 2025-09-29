
'use client';

import { useState, ChangeEvent, useMemo, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Book } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, getDocs, onSnapshot, doc, setDoc, deleteDoc, addDoc, query, where } from 'firebase/firestore';
import { DataTable } from './components/data-table';
import { columns } from './components/columns';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload, ScanLine, Filter, Download, FileText } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { AddBookForm } from './components/add-book-form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function InventoryManagementPage() {
  const [data, setData] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isAddBookOpen, setAddBookOpen] = useState(false);
  const [isScanDialogOpen, setScanDialogOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedPublisher, setSelectedPublisher] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { toast } = useToast();
  
  useEffect(() => {
    setIsLoading(true);
    const booksCollectionRef = collection(db, 'books');
    const unsubscribe = onSnapshot(booksCollectionRef, (querySnapshot) => {
        const booksData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Book));
        setData(booksData);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching books: ", error);
        toast({
            variant: "destructive",
            title: "Error fetching data",
            description: "Could not load books from the database.",
        });
        setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [toast]);


  const authors = useMemo(() => {
    const authorSet = new Set(data.map(book => book.author));
    return Array.from(authorSet).sort();
  }, [data]);

  const publishers = useMemo(() => {
    const publisherSet = new Set(data.map(book => book.publisher));
    return Array.from(publisherSet).sort();
  }, [data]);
  
  const categories = useMemo(() => {
    const categorySet = new Set(data.map(book => book.category).filter(Boolean) as string[]);
    return Array.from(categorySet).sort();
  }, [data]);


  const filteredData = useMemo(() => {
    let filtered = data;

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(lowercasedQuery) ||
        (book.isbn && book.isbn.toLowerCase().includes(lowercasedQuery)) ||
        (book.category && book.category.toLowerCase().includes(lowercasedQuery)) ||
        book.author.toLowerCase().includes(lowercasedQuery)
      );
    }

    if (selectedAuthor) {
      filtered = filtered.filter(book => book.author === selectedAuthor);
    }

    if (selectedPublisher) {
      filtered = filtered.filter(book => book.publisher === selectedPublisher);
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(book => book.category === selectedCategory);
    }

    return filtered;
  }, [data, searchQuery, selectedAuthor, selectedPublisher, selectedCategory]);
  
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };
  
  const handleImport = async () => {
    if (!importFile) {
        toast({
            variant: "destructive",
            title: "No file selected",
            description: "Please select an Excel file to import.",
        });
        return;
    }

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const fileData = e.target?.result;
            const workbook = XLSX.read(fileData, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

            const booksCollectionRef = collection(db, 'books');
            let importedCount = 0;
            
            for (const row of jsonData) {
                 const newBook: Omit<Book, 'id'> = {
                    title: row['Book Title'],
                    author: row['Author'],
                    publisher: row['Publication'],
                    isbn: row['ISBN'],
                    category: row['Category'],
                    copies: row['Copies'],
                    status: 'available',
                    publicationDate: new Date().toISOString().split('T')[0],
                    coverImageUrl: `https://picsum.photos/seed/${row['ISBN'] || `new${importedCount}`}/300/400`,
                };
                await addDoc(booksCollectionRef, newBook);
                importedCount++;
            }

            toast({
                title: "Import Successful",
                description: `${importedCount} books have been added to the catalog.`,
            });
        } catch (error) {
            console.error("Import error:", error);
            toast({
                variant: "destructive",
                title: "Import Failed",
                description: "There was an error processing your file. Please check the format.",
            });
        } finally {
            setIsImporting(false);
            setImportFile(null);
        }
    };
    reader.readAsBinaryString(importFile);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
        {"Book Title": "", "Author": "", "Publication": "", "ISBN": "", "Category": "", "Copies": ""},
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Book Template");
    XLSX.writeFile(workbook, "book_import_template.xlsx");
  };

  const handleBookAdded = (newBook: Book) => {
    // This is now handled by the real-time listener
  };

  const handleBookUpdated = async (updatedBook: Book) => {
    if (!updatedBook.id) return;
    const bookRef = doc(db, 'books', updatedBook.id);
    try {
        const { id, ...bookData } = updatedBook;
        await setDoc(bookRef, bookData, { merge: true });
        toast({
            title: 'Book Updated!',
            description: `"${updatedBook.title}" has been updated.`,
        });
    } catch (error) {
        console.error("Error updating book: ", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update the book in the database.",
        });
    }
  };

  const handleBookDeleted = async (bookId: string) => {
     const bookRef = doc(db, 'books', bookId);
     try {
        await deleteDoc(bookRef);
     } catch (error) {
         console.error("Error deleting book: ", error);
        toast({
            variant: "destructive",
            title: "Delete Failed",
            description: "Could not delete the book from the database.",
        });
     }
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedAuthor('');
    setSelectedPublisher('');
    setSelectedCategory('');
  };
  
    useEffect(() => {
    if (isScanDialogOpen) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this feature.',
          });
        }
      };

      getCameraPermission();
      
      // Cleanup function to stop video stream
      return () => {
          if (videoRef.current && videoRef.current.srcObject) {
              const stream = videoRef.current.srcObject as MediaStream;
              stream.getTracks().forEach(track => track.stop());
          }
      }
    }
  }, [isScanDialogOpen, toast]);



  return (
    <Card>
      <CardHeader>
        <CardTitle>Library Catalog</CardTitle>
        <CardDescription>
          Browse, search, and manage all books in the library.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all-books">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all-books">All Books</TabsTrigger>
              <TabsTrigger value="by-department">Browse by Department</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Import Books
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Books from Excel</DialogTitle>
                        <DialogDescription>
                            Upload an .xlsx or .csv file to bulk-add books to the catalog.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex items-center justify-between rounded-lg border border-dashed p-4">
                            <div>
                               <h3 className="font-semibold">Download Template</h3>
                                <p className="text-sm text-muted-foreground">
                                    Use our template to ensure your data is formatted correctly.
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                                <Download className="mr-2 h-4 w-4" />
                                Template
                            </Button>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="import-file">Upload File</Label>
                            <Input id="import-file" type="file" accept=".xlsx, .csv" onChange={handleFileChange} />
                             {importFile && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                                    <FileText className="h-4 w-4" />
                                    <span>{importFile.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => { setIsImporting(false); setImportFile(null); }}>Cancel</Button>
                        <Button onClick={handleImport} disabled={isImporting || !importFile}>
                            {isImporting ? "Importing..." : "Import Books"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={isAddBookOpen} onOpenChange={setAddBookOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Book
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Add a New Book</DialogTitle>
                        <DialogDescription>
                            Fill out the form below to add a new book to the library catalog.
                        </DialogDescription>
                    </DialogHeader>
                    <AddBookForm onBookAdded={handleBookAdded} setOpen={setAddBookOpen} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
            <Input
              placeholder="Search by title, ISBN, category..."
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="flex items-center gap-2">
               <Dialog open={isScanDialogOpen} onOpenChange={setScanDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <ScanLine className="mr-2 h-4 w-4" />
                        Scan
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Scan Book ISBN</DialogTitle>
                        <DialogDescription>
                           Point the camera at the book's QR or barcode to automatically fill in the ISBN.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="my-4">
                        <div className="relative aspect-video bg-muted rounded-md overflow-hidden border">
                             <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                             <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                 <div className="w-64 h-32 border-2 border-dashed border-white/80 rounded-lg"/>
                             </div>
                        </div>
                         {hasCameraPermission === false && (
                            <Alert variant="destructive" className="mt-4">
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                Please allow camera access in your browser to use this feature.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="scanned-isbn">Scanned ISBN</Label>
                        <Input id="scanned-isbn" placeholder="ISBN will appear here" />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setScanDialogOpen(false)}>Cancel</Button>
                        <Button type="button">Find Book</Button>
                    </DialogFooter>
                </DialogContent>
              </Dialog>
              <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Filter Books</h4>
                            <p className="text-sm text-muted-foreground">
                                Refine by author, publication or category.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="author">Author</Label>
                                <Select onValueChange={setSelectedAuthor} value={selectedAuthor}>
                                    <SelectTrigger className="col-span-2 h-8">
                                        <SelectValue placeholder="Select author" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {authors.map(author => (
                                            <SelectItem key={author} value={author}>{author}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="publisher">Publication</Label>
                                <Select onValueChange={setSelectedPublisher} value={selectedPublisher}>
                                    <SelectTrigger className="col-span-2 h-8">
                                        <SelectValue placeholder="Select publication" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {publishers.map(publisher => (
                                            <SelectItem key={publisher} value={publisher}>{publisher}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="category">Category</Label>
                                <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                                    <SelectTrigger className="col-span-2 h-8">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(category => (
                                            <SelectItem key={category} value={category}>{category}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button variant="ghost" onClick={clearFilters}>Clear Filters</Button>
                    </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <TabsContent value="all-books" className="mt-4">
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <p>Loading books...</p>
                </div>
            ) : (
                <DataTable 
                    columns={columns({ onBookUpdated: handleBookUpdated, onBookDeleted: handleBookDeleted })} 
                    data={filteredData} 
                />
            )}
          </TabsContent>
          <TabsContent value="by-department" className="mt-4">
            <div className="flex flex-col items-center justify-center gap-4 text-center h-64 rounded-md border border-dashed">
                <p className="text-muted-foreground">Department-wise book listing will be shown here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
