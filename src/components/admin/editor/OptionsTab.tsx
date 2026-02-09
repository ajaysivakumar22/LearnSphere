import { AnimatePresence, motion } from 'framer-motion';
import { useContentStore } from '@/lib/content-store';

const courseAdmins = [
  'Ajay Sivakumar',
  'Salman Khan',
  'Priya Sharma',
  'Ahmed Ali',
  'Jessica Lee',
];

export default function OptionsTab({ courseId }: { courseId: string }) {
  const { getContent, setOptions } = useContentStore();
  const { options } = getContent(courseId);

  const toggleRule = (rule: 'open' | 'invitation' | 'payment') => {
    if (rule === 'open') setOptions(courseId, { isOpen: !options.isOpen });
    if (rule === 'invitation') setOptions(courseId, { isInvitation: !options.isInvitation });
    if (rule === 'payment') setOptions(courseId, { isPaid: !options.isPaid });
  };

  return (
    <div className="overflow-hidden rounded-b-lg border border-t-0 bg-white p-6">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* ---- Left: Access course rights ---- */}
        <div>
          <h3 className="mb-6 text-base font-semibold italic text-gray-800">Access course rights</h3>

          {/* Show course to */}
          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Show course to:
            </label>
            <select
              value={options.showCourseTo}
              onChange={(e) => setOptions(courseId, { showCourseTo: e.target.value as 'everyone' | 'signed_in' })}
              className="w-64 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="everyone">Everyone</option>
              <option value="signed_in">Signed In</option>
            </select>
            <p className="mt-1 text-xs text-gray-400">
              Define who can access your courses and their content
            </p>
          </div>

          {/* Access rules */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Access rules:
            </label>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {/* Open */}
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={options.isOpen}
                  onChange={() => toggleRule('open')}
                  className="accent-primary"
                />
                Open
              </label>

              {/* On Invitation */}
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={options.isInvitation}
                  onChange={() => toggleRule('invitation')}
                  className="accent-primary"
                />
                On Invitation
              </label>

              {/* On Payment */}
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={options.isPaid}
                  onChange={() => toggleRule('payment')}
                  className="accent-primary"
                />
                On Payment
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Defines how people can access/enroll to your courses
            </p>

            {/* Price field (shown only when On Payment is checked) */}
            <AnimatePresence>
              {options.isPaid && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Price:</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">₹</span>
                      <input
                        type="number"
                        value={options.price}
                        onChange={(e) => setOptions(courseId, { price: Number(e.target.value) })}
                        placeholder="0"
                        className="w-32 rounded-md border border-gray-300 py-2 pl-7 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    The user has to pay for accessing the course
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ---- Right: Responsible ---- */}
        <div>
          <h3 className="mb-6 text-base font-semibold italic text-gray-800">Responsible</h3>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Course Admin:
            </label>
            <select
              value={options.assignedInstructor || ''}
              onChange={(e) => setOptions(courseId, { assignedInstructor: e.target.value })}
              className="w-64 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">Select admin...</option>
              {courseAdmins.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">
              Decide who&apos;ll be the responsible of the course
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
