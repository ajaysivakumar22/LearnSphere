'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/shared/label';
import { Input } from '@/components/shared/input';
import { Button } from '@/components/shared/button';

export default function OptionsTab({ courseId }: { courseId: string }) {
  const [visibility, setVisibility] = useState('everyone');
  const [accessRule, setAccessRule] = useState('open');
  const [price, setPrice] = useState('');

  return (
    <div className="card-odoo max-w-2xl p-6">
      <h2 className="mb-6 text-lg font-semibold">Course Options</h2>
      <div className="space-y-6">
        {/* Visibility */}
        <div>
          <Label className="mb-2 block">Visibility</Label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="everyone">Everyone</option>
            <option value="signed_in">Signed In Users Only</option>
          </select>
        </div>

        {/* Access Rules */}
        <div>
          <Label className="mb-2 block">Access Rules</Label>
          <div className="space-y-3">
            {[
              { value: 'open', label: 'Open', desc: 'Anyone can enroll' },
              { value: 'invitation', label: 'On Invitation', desc: 'Manual enrollment required' },
              { value: 'payment', label: 'On Payment', desc: 'Requires payment to enroll' },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all ${
                  accessRule === option.value ? 'border-primary bg-primary/5' : 'hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="accessRule"
                  value={option.value}
                  checked={accessRule === option.value}
                  onChange={(e) => setAccessRule(e.target.value)}
                  className="text-primary"
                />
                <div>
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-gray-500">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Price */}
        <AnimatePresence>
          {accessRule === 'payment' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Label htmlFor="price" className="mb-2 block">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price in Rupees"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <Button variant="odoo">Save Options</Button>
      </div>
    </div>
  );
}
