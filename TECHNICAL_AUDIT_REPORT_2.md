# Additional Technical Audit & Architectural Report - Instructor & API Analysis

**Date:** 2026-02-10
**Auditor:** Senior Full Stack Developer & UI/UX Designer
**Project Status:** Active Development

---

## 1. Instructor Course Management
**Observation:**
The `InstructorCoursesPage` (`src/app/instructor/courses/page.tsx`) uses a client-side only searching and filtering mechanism.

**Code:**
```typescript
const filtered = instructorCourses.filter((c) => { ... })
```

**Risk:**
*   **Scalability**: As the number of courses grows, fetching ALL courses and filtering them in the browser will cause significant performance degradation.
*   **UX**: Initial load time will increase proportionally to the total number of courses in the database.

**Recommendation:**
*   Implement server-side filtering and pagination in the `/api/courses` endpoint.
*   Update the frontend to use URL search parameters (`?q=...&tags=...`) to drive the API queries.

## 2. API Security & Data Leakage
**Observation:**
The `GET /api/courses` endpoint returns all courses to the frontend, relying on the frontend to filter "published" vs "draft" for learners, or restricting views based on user roles.

**Code:**
```typescript
// Guests and learners see only published courses.
// Admin/instructor see ALL courses.
const { rows } = await query(...)
```
(Line 28 in `src/app/api/courses/route.ts`)

**Risk:**
Even though there is a boolean check `isPrivileged`, the logic is slightly convoluted. If `getOrCreateUserFromClerk` fails or behaves unexpectedly, there's a risk of leaking draft course titles/metadata to unauthorized users if the SQL query logic isn't perfectly tight.

**Recommendation:**
*   Ensure rigorous testing of the `isPrivileged` flag.
*   Explicitly type the response to ensure no sensitive internal fields (like internal notes or draft-only metadata) are ever serialized to JSON for guests.

## 3. Optimistic Updates & State Consistency
**Observation:**
The `useCourseAPI` hook implements manual optimistic updates.

**Code:**
```typescript
setCourses(prev => {
    const updated = [newCourse, ...prev];
    set(CACHE_KEYS.COURSES, updated, 30_000); // 30s cache
    return updated;
});
```

**Risk:**
*   **Complexity**: Manually managing the cache consistency between local state, `api-cache` utility, and server state is error-prone.
*   **Stale Data**: If another instructor updates a course, this user won't see it until the 30s TTL expires or they force a refresh.

**Recommendation:**
*   Use a dedicated data fetching library like **TanStack Query (React Query)** or **SWR**. These libraries handle optimistic updates, cache invalidation, and background refetching far more robustly than custom `useEffect`/`useState` implementations.

## 4. Component Reusability (Design System)
**Observation:**
The `Dialog` component in `src/components/shared/dialog.tsx` is a nice wrapper around Radix UI. However, the `InstructorCoursesPage` includes a lot of inline definitions for dialog content.

**Recommendation:**
*   Extract the "Create Course" and "Share Course" dialogs into their own components (e.g., `CreateCourseDialog.tsx`, `ShareCourseDialog.tsx`). This reduces the file size of the page component and makes testing easier.

---

## Summary of Actionable Items

1.  **Refactor API**: Add pagination and server-side filtering to `GET /api/courses`.
2.  **State Management**: Plan migration to **TanStack Query** for `CourseAPIContext`.
3.  **Component Refactoring**: Extract Dialogs from the main Instructor page.

**Prepared By:** Antigravity (Senior Full Stack Developer)
