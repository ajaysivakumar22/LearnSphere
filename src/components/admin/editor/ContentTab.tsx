'use client';

import { useState } from 'react';
import { MoreVertical, Plus, GripVertical } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Reorder, useDragControls } from 'framer-motion';
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
import { useContentStore } from '@/lib/content-store';

export interface ContentItem {
  id: string;
  title: string;
  category: 'Video' | 'Document' | 'Image' | 'Quiz';
  url?: string;
  description?: string;
  fileName?: string;
  allowDownload?: boolean;
}

export default function ContentTab({ courseId }: { courseId: string }) {
  const { getContent, addContent, updateContent, removeContent, setContents } = useContentStore();
  const { contents } = getContent(courseId);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);

  const handleAdd = (item: ContentItem) => {
    addContent(courseId, item);
    setShowAddDialog(false);
  };

  const handleUpdate = (updated: ContentItem) => {
    updateContent(courseId, updated);
    setEditingContent(null);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      removeContent(courseId, deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleReorder = (newOrder: ContentItem[]) => {
    setContents(courseId, newOrder);
  };

  return (
    <div>
      {/* Reorder List Header */}
      <div className="flex items-center rounded-t-lg border border-b-0 bg-muted/50 px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
        <div className="w-8"></div> {/* Grip placeholder */}
        <div className="flex-1">Content Title</div>
        <div className="w-32">Category</div>
        <div className="w-12"></div> {/* Actions placeholder */}
      </div>

      {/* Reorder List Body */}
      <div className="rounded-b-lg border bg-card">
        <Reorder.Group axis="y" values={contents} onReorder={handleReorder} className="divide-y">
          {contents.map((item) => (
            <Reorder.Item key={item.id} value={item} className="group flex items-center bg-card px-4 py-3 hover:bg-muted/30">
              {/* Drag Handle */}
              <div className="mr-3 flex w-5 cursor-grab items-center justify-center text-muted-foreground hover:text-foreground active:cursor-grabbing">
                <GripVertical className="h-4 w-4" />
              </div>

              {/* Title */}
              <div className="flex-1 text-sm font-medium text-foreground">
                {item.title}
              </div>

              {/* Category */}
              <div className="w-32 text-sm text-muted-foreground">
                {item.category}
              </div>

              {/* Actions */}
              <div className="w-12 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded p-1 opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100 focus:opacity-100">
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
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {contents.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            No content yet. Click &quot;Add content&quot; to get started.
          </div>
        )}
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
