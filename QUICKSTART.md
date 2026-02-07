# LearnSphere - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

This guide will get your LearnSphere platform up and running quickly.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Basic knowledge of Next.js and React

## Step 1: Supabase Setup (5 minutes)

### 1.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Click "New Project"
5. Fill in:
   - **Name**: learnsphere
   - **Database Password**: (generate a strong password)
   - **Region**: Choose closest to you
6. Wait 2-3 minutes for project creation

### 1.2 Get Your Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values:
   - `Project URL` (starts with https://)
   - `anon public` key
3. Go to **Settings** → **Database**
4. Scroll down to **Connection string** → **URI**
5. Click "Copy" (this is your DATABASE_URL)
6. Replace `[YOUR-PASSWORD]` with your database password

## Step 2: Local Setup (2 minutes)

### 2.1 Install Dependencies

```bash
cd learnsphere
npm install
```

### 2.2 Configure Environment

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Database Setup (3 minutes)

### 3.1 Push Schema to Database

```bash
npm run db:push
```

This creates all tables in your Supabase database.

### 3.2 Apply Row-Level Security

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Click "New Query"
4. Copy the entire contents of `supabase-setup.sql`
5. Paste and click "Run"

You should see "Success. No rows returned"

### 3.3 Create Storage Buckets

1. In Supabase Dashboard, go to **Storage**
2. Click "Create a new bucket"
3. Create these three buckets:

**Bucket 1: course-images**
- Name: `course-images`
- Public: ✅ Yes
- Click "Create bucket"

**Bucket 2: lesson-content**
- Name: `lesson-content`
- Public: ❌ No
- Click "Create bucket"

**Bucket 3: user-avatars**
- Name: `user-avatars`
- Public: ✅ Yes
- Click "Create bucket"

## Step 4: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see the LearnSphere home page! 🎉

## Step 5: Create Your First User

### 5.1 Enable Email Auth

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Make sure "Email" is enabled
3. Scroll down to **Email Auth**
4. Toggle on "Enable email confirmations" (optional for development)

### 5.2 Sign Up

You can use Supabase Auth UI or create a user directly:

#### Option A: Use Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click "Add user"
3. Choose "Create new user"
4. Enter email and password
5. Click "Create user"

#### Option B: Sign Up via SQL

```sql
-- Run in Supabase SQL Editor
-- This creates a test user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'instructor@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);

-- Then create the user profile
INSERT INTO public.users (id, email, role, total_points, badge_level)
SELECT 
  id,
  email,
  'instructor',
  0,
  'Newbie'
FROM auth.users 
WHERE email = 'instructor@test.com';
```

## Step 6: Test the Platform

### Test as Instructor

1. Navigate to `/admin/courses`
2. Click "Create Course"
3. Add course details
4. Create lessons
5. Publish course

### Test as Learner

1. Create another user with role 'learner'
2. Navigate to `/learner/my-courses`
3. Browse available courses
4. Enroll in a course
5. Start learning!

## 🎨 Customization

### Change Primary Color

Edit `tailwind.config.js`:

```js
colors: {
  odoo: {
    primary: "#714B67", // Change this
    secondary: "#875A7B", // And this
  },
}
```

### Modify Badge Levels

Edit `src/lib/utils.ts`:

```typescript
export function getBadgeLevel(points: number): string {
  // Customize point thresholds here
  if (points >= 120) return 'Master';
  // ... etc
}
```

## 📝 Next Steps

### Essential Features to Implement

1. **Authentication Pages**
   - Create `/auth/login` and `/auth/signup` pages
   - Use Supabase Auth with email/password
   - Add social auth (Google, GitHub) if needed

2. **Course Creation Flow**
   - Build the 4-tab course editor
   - Implement drag-and-drop for lesson ordering
   - Add rich text editor for descriptions

3. **Learning Experience**
   - Build the full-screen learning player
   - Implement video player with progress tracking
   - Create quiz interface with point calculation

4. **Payment Integration** (if using paid courses)
   - Integrate Razorpay or Stripe
   - Handle course purchase flow
   - Update enrollment on payment success

### Recommended Improvements

1. **Email Notifications**
   - Course enrollment confirmation
   - New lesson notifications
   - Course completion certificates

2. **Analytics Dashboard**
   - Course performance metrics
   - Student engagement tracking
   - Revenue reports (for paid courses)

3. **Advanced Features**
   - Live sessions with video conferencing
   - Discussion forums per course
   - Assignment submissions
   - Certificate generation

## 🐛 Troubleshooting

### Issue: "Missing environment variables"

**Solution**: Make sure `.env.local` exists and has all required variables.

### Issue: Database connection error

**Solution**: 
1. Check your `DATABASE_URL` is correct
2. Make sure you replaced `[YOUR-PASSWORD]` with actual password
3. Verify database is accessible (check Supabase project status)

### Issue: RLS policy errors

**Solution**:
1. Make sure you ran the entire `supabase-setup.sql`
2. Check user is authenticated (has valid auth.uid())
3. Verify user role matches required permissions

### Issue: Storage upload fails

**Solution**:
1. Verify storage buckets are created
2. Check bucket names match exactly
3. Ensure bucket policies allow uploads

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/UI Components](https://ui.shadcn.com)

## 🤝 Support

For issues specific to this implementation:
1. Check the README.md for detailed documentation
2. Review IMPLEMENTATION_GUIDE.md for code examples
3. Examine the database schema in `src/db/schema.ts`

## 🎉 You're All Set!

Your LearnSphere platform is now running. Start building amazing courses!

Key URLs:
- **Home**: http://localhost:3000
- **Admin**: http://localhost:3000/admin/courses
- **Learner**: http://localhost:3000/learner/my-courses
- **Supabase Dashboard**: https://supabase.com/dashboard

Happy teaching and learning! 🚀
