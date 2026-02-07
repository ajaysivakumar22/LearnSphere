'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Link as LinkIcon, X } from 'lucide-react';
import { Button } from '@/components/shared/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/shared/dialog';
import type { ContentItem } from '@/components/admin/editor/ContentTab';

type Category = 'Video' | 'Document' | 'Image';

interface ContentData {
  title: string;
  category: Category;
  // Video
  videoLink: string;
  // Document / Image
  fileName: string;
  allowDownload: boolean;
  // Common
  responsible: string;
  duration: string; // HH:MM
  // Description
  description: string;
  // Additional attachment
  attachmentFile: string;
  attachmentLink: string;
}

const emptyData: ContentData = {
  title: '',
  category: 'Video',
  videoLink: '',
  fileName: '',
  allowDownload: false,
  responsible: '',
  duration: '00:00',
  description: '',
  attachmentFile: '',
  attachmentLink: '',
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: ContentItem) => void;
  editItem?: ContentItem;
}

export default function AddContentDialog({ open, onOpenChange, onSave, editItem }: Props) {
  const [activeTab, setActiveTab] = useState<'content' | 'description' | 'attachment'>('content');
  const [data, setData] = useState<ContentData>(emptyData);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editItem) {
      setData({
        ...emptyData,
        title: editItem.title,
        category: editItem.category === 'Quiz' ? 'Video' : (editItem.category as Category),
      });
    } else {
      setData(emptyData);
    }
    setActiveTab('content');
  }, [editItem, open]);

  const handleSave = () => {
    if (!data.title.trim()) return;
    const item: ContentItem = {
      id: editItem?.id || String(Date.now()),
      title: data.title,
      category: data.category,
    };
    onSave(item);
  };

  const tabs = [
    { key: 'content' as const, label: 'Content' },
    { key: 'description' as const, label: 'Description' },
    { key: 'attachment' as const, label: 'Additional attachment' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-normal text-gray-500">
            {editItem ? 'Edit Content' : 'Add Content'}
          </DialogTitle>
        </DialogHeader>

        {/* Content Title */}
        <div className="mt-1">
          <input
            type="text"
            placeholder="Content title"
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            className="w-full border-0 border-b border-gray-200 pb-2 text-xl font-semibold text-primary outline-none placeholder:text-gray-300 focus:border-primary"
          />
        </div>

        {/* Tabs */}
        <div className="mt-4 flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-4 min-h-[280px]">
          {/* === Content Tab === */}
          {activeTab === 'content' && (
            <div className="space-y-5">
              {/* Category selection */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Content Category
                </label>
                <div className="flex gap-6">
                  {(['Video', 'Document', 'Image'] as Category[]).map((cat) => (
                    <label key={cat} className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="category"
                        checked={data.category === cat}
                        onChange={() => setData({ ...data, category: cat, fileName: '' })}
                        className="accent-primary"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              {/* === Video Fields === */}
              {data.category === 'Video' && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Video Link
                    </label>
                    <input
                      type="text"
                      value={data.videoLink}
                      onChange={(e) => setData({ ...data, videoLink: e.target.value })}
                      placeholder="Google drive link or youtube video link"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Responsible
                    </label>
                    <input
                      type="text"
                      value={data.responsible}
                      onChange={(e) => setData({ ...data, responsible: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Duration
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={data.duration}
                        onChange={(e) => setData({ ...data, duration: e.target.value })}
                        placeholder="00:00"
                        className="w-28 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                      <span className="text-sm text-gray-500">hours</span>
                    </div>
                  </div>
                </>
              )}

              {/* === Document Fields === */}
              {data.category === 'Document' && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Document
                    </label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="mr-1.5 h-3.5 w-3.5" />
                        Upload file
                      </Button>
                      {data.fileName && (
                        <div className="flex items-center gap-1.5 rounded bg-gray-100 px-2 py-1 text-sm">
                          <span>{data.fileName}</span>
                          <button
                            onClick={() => setData({ ...data, fileName: '' })}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setData({ ...data, fileName: file.name });
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Responsible
                    </label>
                    <input
                      type="text"
                      value={data.responsible}
                      onChange={(e) => setData({ ...data, responsible: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="allowDownloadDoc"
                      checked={data.allowDownload}
                      onChange={(e) => setData({ ...data, allowDownload: e.target.checked })}
                      className="accent-primary"
                    />
                    <label htmlFor="allowDownloadDoc" className="text-sm text-gray-700">
                      Allow Download
                    </label>
                  </div>
                </>
              )}

              {/* === Image Fields === */}
              {data.category === 'Image' && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Image
                    </label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="mr-1.5 h-3.5 w-3.5" />
                        Upload image
                      </Button>
                      {data.fileName && (
                        <div className="flex items-center gap-1.5 rounded bg-gray-100 px-2 py-1 text-sm">
                          <span>{data.fileName}</span>
                          <button
                            onClick={() => setData({ ...data, fileName: '' })}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setData({ ...data, fileName: file.name });
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Responsible
                    </label>
                    <input
                      type="text"
                      value={data.responsible}
                      onChange={(e) => setData({ ...data, responsible: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="allowDownloadImg"
                      checked={data.allowDownload}
                      onChange={(e) => setData({ ...data, allowDownload: e.target.checked })}
                      className="accent-primary"
                    />
                    <label htmlFor="allowDownloadImg" className="text-sm text-gray-700">
                      Allow Download
                    </label>
                  </div>
                </>
              )}
            </div>
          )}

          {/* === Description Tab === */}
          {activeTab === 'description' && (
            <div>
              <textarea
                value={data.description}
                onChange={(e) => setData({ ...data, description: e.target.value })}
                placeholder="Write your content description here..."
                rows={10}
                className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          {/* === Additional Attachment Tab === */}
          {activeTab === 'attachment' && (
            <div className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">File</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => attachFileInputRef.current?.click()}
                  >
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    Upload your file
                  </Button>
                  {data.attachmentFile && (
                    <div className="flex items-center gap-1.5 rounded bg-gray-100 px-2 py-1 text-sm">
                      <span>{data.attachmentFile}</span>
                      <button
                        onClick={() => setData({ ...data, attachmentFile: '' })}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <input
                    ref={attachFileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setData({ ...data, attachmentFile: file.name });
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Link</label>
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={data.attachmentLink}
                    onChange={(e) => setData({ ...data, attachmentLink: e.target.value })}
                    placeholder="e.g. www.google.com"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="odoo" onClick={handleSave} disabled={!data.title.trim()}>
            {editItem ? 'Save' : 'Add'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
