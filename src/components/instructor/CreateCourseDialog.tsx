'use client';

import { useState } from 'react';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/shared/dialog';

interface CreateCourseDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (title: string) => Promise<void>;
}

export function CreateCourseDialog({ isOpen, onClose, onCreate }: CreateCourseDialogProps) {
    const [newTitle, setNewTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async () => {
        if (!newTitle.trim()) return;
        setIsSubmitting(true);
        try {
            await onCreate(newTitle.trim());
            setNewTitle(''); // Reset only on success
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Create Course</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Provide a name.. (Eg: Basics of Odoo CRM)"
                        className="text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && newTitle.trim()) handleCreate();
                        }}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button variant="odoo" onClick={handleCreate} disabled={!newTitle.trim() || isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
