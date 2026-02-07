'use client';

import { useState } from 'react';
import { Input } from '@/components/shared/input';
import { Textarea } from '@/components/shared/textarea';
import { Label } from '@/components/shared/label';
import { Button } from '@/components/shared/button';

export default function DescriptionTab({ courseId }: { courseId: string }) {
  const [title, setTitle] = useState('Basics of Odoo CRM');
  const [description, setDescription] = useState(
    'Learn the fundamentals of customer relationship management with Odoo. This comprehensive course covers pipeline management, lead tracking, and sales automation.'
  );
  const [tags, setTags] = useState('CRM, Odoo, Sales');
  const [imageUrl, setImageUrl] = useState('');

  return (
    <div className="card-odoo max-w-2xl p-6">
      <h2 className="mb-6 text-lg font-semibold">Course Description</h2>
      <div className="space-y-6">
        <div>
          <Label htmlFor="title" className="mb-2 block">Course Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="description" className="mb-2 block">Full Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
          />
        </div>

        <div>
          <Label htmlFor="tags" className="mb-2 block">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="image" className="mb-2 block">Cover Image URL</Label>
          <Input
            id="image"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
          {imageUrl && (
            <div className="mt-2 overflow-hidden rounded-lg border">
              <img src={imageUrl} alt="Preview" className="h-48 w-full object-cover" />
            </div>
          )}
        </div>

        <Button variant="odoo">Save Description</Button>
      </div>
    </div>
  );
}
