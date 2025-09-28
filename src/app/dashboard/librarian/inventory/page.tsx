
'use client';

import { useState, ChangeEvent, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { books, Book } from '@/lib/data';
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

export default function InventoryManagementPage() {
  const [data, setData] = useState<Book[]>(books);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isAddBookOpen, setAddBookOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedPublisher, setSelectedPublisher] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { toast } = useToast();

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
        book.isbn.toLowerCase().includes(lowercasedQuery) ||
        book.category?.toLowerCase().includes(lowercasedQuery) ||
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
    reader.onload = (e) => {
        try {
            const fileData = e.target?.result;
            const workbook = XLSX.read(fileData, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

            const newBooks: Book[] = jsonData.map((row: any) => ({
                title: row['Book Title'],
                author: row['Author'],
                publisher: row['Publication'],
                isbn: row['ISBN'],
                category: row['Category'],
                copies: row['Copies'],
                status: 'available',
                publicationDate: new Date().toISOString().split('T')[0],
                coverImageUrl: 'https://picsum.photos/seed/newbook/300/400',
            }));

            setData(prev => [...prev, ...newBooks]);

            toast({
                title: "Import Successful",
                description: `${newBooks.length} books have been added to the catalog.`,
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
    setData(prev => [newBook, ...prev]);
  };
  
  const clearFilters = () => {
    setSelectedAuthor('');
    setSelectedPublisher('');
    setSelectedCategory('');
  };


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
                        <Button variant="secondary">Cancel</Button>
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
              <Button variant="outline">
                <ScanLine className="mr-2 h-4 w-4" />
                Scan
              </Button>
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
            <DataTable columns={columns} data={filteredData} />
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
