
'use client';

import { useState, ChangeEvent } from 'react';
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

async function getBooks(): Promise<Book[]> {
  // In a real app, you would fetch data from an API.
  return books;
}

export default function InventoryManagementPage() {
  const [data, setData] = useState<Book[]>(books);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isAddBookOpen, setAddBookOpen] = useState(false);
  const { toast } = useToast();

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

            // In a real app, you would send this to your API
            console.log('Imported Books:', newBooks);
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
            // Close the dialog by resetting state if you control it
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
            />
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <ScanLine className="mr-2 h-4 w-4" />
                Scan
              </Button>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
          <TabsContent value="all-books" className="mt-4">
            <DataTable columns={columns} data={data} />
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
