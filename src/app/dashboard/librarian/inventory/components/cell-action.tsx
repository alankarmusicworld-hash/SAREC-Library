
"use client";

import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2, BookUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Book } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { EditBookForm } from './edit-book-form';
import { IssueBookForm } from './issue-book-form';

interface CellActionProps {
  data: Book;
  onBookUpdated: (updatedBook: Book) => void;
  onBookDeleted: (bookId: string) => void;
}

export const CellAction: React.FC<CellActionProps> = ({
  data,
  onBookUpdated,
  onBookDeleted,
}) => {
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isIssueOpen, setIssueOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!data.id) return;
    try {
        await onBookDeleted(data.id);
        setDeleteOpen(false);
    } catch (error) {
        // The error toast is handled in the parent component's `handleBookDeleted` function
    }
  };

  return (
    <>
      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Book Details</DialogTitle>
            <DialogDescription>
              Update the information for "{data.title}".
            </DialogDescription>
          </DialogHeader>
          <EditBookForm
            book={data}
            onBookUpdated={(updatedBook) => {
              onBookUpdated(updatedBook);
              setEditOpen(false);
            }}
            setOpen={setEditOpen}
          />
        </DialogContent>
      </Dialog>
      
      {/* Issue Dialog */}
      <Dialog open={isIssueOpen} onOpenChange={setIssueOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Issue Book</DialogTitle>
                <DialogDescription>
                    Issue "{data.title}" to a student.
                </DialogDescription>
            </DialogHeader>
            <IssueBookForm book={data} setOpen={setIssueOpen} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the book
              "{data.title}" from your catalog.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Yes, Delete Book
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setIssueOpen(true)} className="cursor-pointer">
            <BookUp className="mr-2 h-4 w-4" />
            Issue Book
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setEditOpen(true)} className="cursor-pointer">
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDeleteOpen(true)} className="cursor-pointer text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
