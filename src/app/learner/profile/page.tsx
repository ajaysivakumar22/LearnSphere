'use client';

import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { User } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">My Profile</h1>

      <div className="card-odoo max-w-2xl p-6">
        {/* Avatar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Student User</h2>
            <p className="text-sm text-gray-500">Learner</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="mb-2 block">Email</Label>
            <Input id="email" type="email" defaultValue="student@learnsphere.com" />
          </div>
          <div>
            <Label htmlFor="name" className="mb-2 block">Display Name</Label>
            <Input id="name" defaultValue="Student User" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">3</p>
              <p className="text-xs text-gray-500">Courses Enrolled</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">1</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">85</p>
              <p className="text-xs text-gray-500">Total Points</p>
            </div>
          </div>

          <Button variant="odoo">Update Profile</Button>
        </div>
      </div>
    </div>
  );
}
