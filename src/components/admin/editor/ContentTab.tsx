'use client';

import { useState } from 'react';
import { MoreVertical, Plus } from 'lucide-react';
import { Button } from '@/components/shared/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shared/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/shared/dialog';
import AddContentDialog from '@/components/admin/editor/AddContentDialog';

export interface ContentItem {
  id: string;
  title: string;
  category: 'Video' | 'Document' | 'Image' | 'Quiz';
}

const initialContent: ContentItem[] = [];

export default function ContentTab({ courseId }: { courseId: string }) {
  const [contents, setContents] = useState<ContentItem[]>(initialContent);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);

  const handleAdd = (item: ContentItem) => {
    setContents([...contents, item]);
    setShowAddDialog(false);
  };

  const handleUpdate = (updated: ContentItem) => {
    setContents(contents.map((c) => (c.id === updated.id ? updated : c)));
    setEditingContent(null);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      setContents(contents.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      {/* Table */}
      <div className="overflow-hidden rounded-b-lg border border-t-0 bg-card">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Content title</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {contents.map((item) => (
              <tr key={item.id} className="group hover:bg-muted/50">
                <td className="px-4 py-3 text-sm text-foreground">{item.title}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{item.category}</td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded p-1 opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingContent(item)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => setDeleteTarget(item)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {contents.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No content yet. Click &quot;Add content&quot; to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add content button */}
      <div className="mt-4 flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddDialog(true)}
          className="border-primary text-primary hover:bg-primary/5"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add content
        </Button>
      </div>

      {/* Add Content Dialog */}
      <AddContentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={handleAdd}
      />

      {/* Edit Content Dialog */}
      {editingContent && (
        <AddContentDialog
          open={!!editingContent}
          onOpenChange={(open) => !open && setEditingContent(null)}
          onSave={handleUpdate}
          editItem={editingContent}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Content</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
