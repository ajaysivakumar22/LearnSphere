'use client';

import { Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';

export default function AdminSettingsPage() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Settings</h1>
      <div className="card-odoo max-w-2xl p-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="platformName" className="mb-2 block">Platform Name</Label>
            <Input id="platformName" defaultValue="LearnSphere" />
          </div>
          <div>
            <Label htmlFor="adminEmail" className="mb-2 block">Admin Email</Label>
            <Input id="adminEmail" type="email" placeholder="admin@learnsphere.com" />
          </div>
          <div>
            <Label className="mb-2 block">Default Course Visibility</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="everyone">Everyone</option>
              <option value="signed_in">Signed In Users Only</option>
            </select>
          </div>
          <Button variant="odoo">Save Settings</Button>
        </div>
      </div>
    </div>
  );
}
