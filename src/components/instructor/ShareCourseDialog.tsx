'use client';

import { useState } from 'react';
import { Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/shared/dialog';
import { Course } from '@/lib/course-api-context';

interface ShareCourseDialogProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course | null;
}

export function ShareCourseDialog({ isOpen, onClose, course }: ShareCourseDialogProps) {
    const [copied, setCopied] = useState(false);

    if (!course) return null;

    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/courses/${course.id}`;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" /> Share Course
                    </DialogTitle>
                    <DialogDescription>Share this course link with others.</DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2 py-4">
                    <Input value={shareUrl} readOnly className="flex-1 text-sm" />
                    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                        {copied ? (
                            <>
                                <Check className="h-4 w-4 text-green-500" /> Copied
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4" /> Copy
                            </>
                        )}
                    </Button>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button variant="odoo" onClick={() => window.open(shareUrl, '_blank')} className="gap-1.5">
                        <ExternalLink className="h-4 w-4" /> Open
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
