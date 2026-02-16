# Technical Audit & Architectural Report - LearnSphere

**Date:** 2026-02-10
**Auditor:** Senior Full Stack Developer & UI/UX Designer
**Project Status:** Active Development
**Stack:** Next.js 15, TypeScript, Tailwind CSS, PostgreSQL (via `pg`), Clerk Auth, Stripe

---

## 1. Executive Summary
The "LearnSphere" project is built on a solid, modern foundation using the Next.js App Router and a component-driven UI architecture. The visual design system (using `lucide-react` and `tailwindcss`) is consistent and premium. However, deeper analysis indicates several "MVP-style" architectural decisions in the backend and data handling layers that will become bottlenecks for performance, scalability, and code maintainability as the user base grows.

**Key Findings:**
*   **UI/UX**: Excellent foundation. Client has requested no visual changes, so optimizations here will focus purely on performance (LCP/CLS) and accessibility.
*   **Backend**: Relies on manual SQL queries with `pg`. While performant, it lacks type safety for database results and is prone to maintenance errors.
*   **Data Model**: The database schema has some fragility, particularly in how Quizzes and User Progress are stored.
*   **Code Quality**: Heavy reliance on `any` types in critical processing logic and client-side data fetching waterfalls need addressing.

---

## 2. Frontend Analysis (Next.js & React)

### 2.1. Client-Side Waterfall Fetching
**Observation:**
In `src/app/learner/courses/[id]/learn/page.tsx`, we observe a "waterfall" of `fetch` requests inside a `useEffect`:
1.  Fetch Course Metadata
2.  Fetch Lessons
3.  Fetch Enrollments & Progress (Parallel)

**Risk:** This increases Time to Interactive (TTI). The user sees a loader longer than necessary.

**Recommendation:**
*   Move the initial data fetching to **Server Components** (`page.tsx` should be a Server Component that fetches data and passes it to a Client Component `LearningPlayer` via props). This leverages Next.js caching and eliminates the client-side network waterfall.

### 2.2. Type Safety Violations
**Observation:**
The codebase uses `any` in critical logic, specifically when parsing lesson data:
```typescript
lessonsData.forEach((l: any) => { ... })
```
**(Line 169 in `src/app/learner/courses/[id]/learn/page.tsx`)**

**Risk:** This completely bypasses TypeScript's safety, leading to potential runtime errors if the API response shape changes.

**Recommendation:**
*   Define a shared `Lesson` interface (e.g., in `src/types/db.ts`) effectively mirroring the DB schema and use it across both API and Frontend.

### 2.3. State Management Complexity
**Observation:**
The learning player page uses over 15 separate `useState` hooks.

**Risk:** Hard to debug and maintain. Race conditions likely (e.g., `quizStarted`, `currentIdx`, `isPlayerOpen` modifying simultaneously).

**Recommendation:**
*   Refactor to a reducer pattern (`useReducer`) or a lightweight state manager keying off the active course ID.

---

## 3. Backend & Database Analysis

### 3.1. The "Quiz Data" Hack
**Observation:**
The code attempts to parse quiz questions from the `content_url` string field:
```typescript
if (l.type === 'quiz') {
  const qs = JSON.parse(l.contentUrl);
}
```
**(Line 174 in `src/app/learner/courses/[id]/learn/page.tsx`)**

**Risk:**
*   **Fragile**: `content_url` is meant for URLs, not JSON blobs.
*   **Limited**: You cannot easily query "How many questions are in this quiz?" via SQL.
*   **Data Integrity**: No validation on the JSON structure when inserting into the DB.

**Recommendation:**
*   **Urgent**: Utilize the `quiz_questions` table defined in `schema.sql`. The frontend parsing logic suggests the API might not be joining this table correctly, or the data has been temporarily stuffed into `content_url`. Ensure the API returns a structured `questions` array joined from the `quiz_questions` table.

### 3.2. User Synchronization (Race Condition)
**Observation:**
`src/lib/user-sync.ts` runs an `INSERT` if a user doesn't exist.
```typescript
const { rows: inserted } = await query(...)
```

**Risk:** High traffic or double-click logins can trigger a unique constraint violation on `email`, causing the API 500 error for the user.

**Recommendation:**
*   Add `ON CONFLICT (email) DO NOTHING` (or `DO UPDATE`) to the SQL query.
*   Wrap the check-and-insert logic in a `try/catch` specifically handling code `23505` (Postgres unique violation).

### 3.3. Database Connection Management
**Observation:**
We are using `pg` directly with manual connection pooling in `src/db/index.ts`.

**Risk:** In a serverless environment (Vercel/Next.js/Cloud Run), "lazy" singletons are generally fine, but we must ensure we aren't exhausting connections.

**Recommendation:**
*   Consider migrating to an ORM like **Drizzle ORM**. It matches the "close to SQL" philosophy of your current stack but forces type safety and handles connection edge cases better. It would also generate the migration SQL for you.

---

## 4. Security & Performance

### 4.1. Raw SQL Usage
**Observation:**
You are using parameterized queries (`$1`, `$2`), which guards against SQL Injection. **This is good.**

**Recommendation:**
*   Maintain this discipline strictly. **Never** use template literals (`` `SELECT * FROM ${table}` ``) for table names or values.

### 4.2. Progress Tracking Granularity
**Observation:**
The schema has `enrollments.progress_pct`, but lacks a robust way to track *exactly* which lessons are finished (currently relying on `completedIds` array in a JSON blob or derived logic).

**Recommendation:**
*   Create a `lesson_completions` table:
    *   `id` (UUID)
    *   `user_id` (FK)
    *   `lesson_id` (FK)
    *   `completed_at` (Timestamp)
*   This allows accurate reporting ("User X finished Lesson Y at time Z") and makes calculating `progress_pct` a simple `COUNT` query rather than updating a mutable integer.

---

## 5. Roadmap & Action Plan

1.  **Immediate Fixes (High Priority)**:
    *   Add `ON CONFLICT` to `user-sync.ts`.
    *   Replace `any` types in `LearningPlayerPage` with `Lesson/Course` interfaces.
    *   Refactor `LearningPlayerPage` to a Server Component parent + Client Component child to fix the waterfall.

2.  **Architectural Improvements (Medium Priority)**:
    *   Migrate the "Quiz JSON in URL" hack to use the real `quiz_questions` table.
    *   Introduce `lesson_completions` table for granular tracking.

3.  **Long-term (Low Priority)**:
    *   Adopt Drizzle ORM for better type inference from DB schema to TypeScript.
    *   Implement Redis for caching course metadata (currently relying on `api-cache` generic).

**Prepared By:** Antigravity (Senior Full Stack Developer)
