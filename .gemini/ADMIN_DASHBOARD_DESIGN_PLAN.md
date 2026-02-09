# LearnSphere Master Admin Dashboard
## Comprehensive Design & Functionality Plan

**Document Version:** 1.0  
**Date:** February 8, 2026  
**Prepared for:** Development Team  
**Author:** Senior Full Stack Developer & UI/UX Designer

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Dashboard Structure Overview](#2-dashboard-structure-overview)
3. [Master Dashboard Design Specifications](#3-master-dashboard-design-specifications)
4. [Course Editing Page Functionality](#4-course-editing-page-functionality)
5. [Reporting Functionality](#5-reporting-functionality)
6. [Course Page UI Enhancements](#6-course-page-ui-enhancements)
7. [Course Creation Flow](#7-course-creation-flow)
8. [Light/Dark Mode Toggle](#8-lightdark-mode-toggle)
9. [Enhanced Reporting Window](#9-enhanced-reporting-window)
10. [Dark Mode Accessibility](#10-dark-mode-accessibility)
11. [Settings Page Dropdown & Navigation](#11-settings-page-dropdown--navigation)
12. [Implementation Priority Matrix](#12-implementation-priority-matrix)
13. [Technical Specifications](#13-technical-specifications)

---

## 1. Executive Summary

This document outlines a comprehensive redesign and enhancement plan for the LearnSphere Admin Dashboard. The plan addresses UI/UX improvements, new functionality requirements, and accessibility considerations while maintaining consistency with the existing Next.js 15 + React + Tailwind CSS technology stack.

### Key Objectives:
- Create a unified master dashboard with comprehensive analytics
- Enhance course management with improved visual feedback
- Implement robust reporting with data visualization
- Ensure accessibility compliance across all themes
- Streamline user workflows with intuitive navigation

---

## 2. Dashboard Structure Overview

### 2.1 Primary Navigation Tabs

The admin dashboard follows a horizontal tab navigation pattern with the following structure:

```
┌─────────────────────────────────────────────────────────────────────┐
│  🎓 LearnSphere    │ Dashboard │ Courses │ Reporting │ Settings │  │
└─────────────────────────────────────────────────────────────────────┘
```

| Tab | Route | Description |
|-----|-------|-------------|
| **Dashboard** | `/admin/dashboard` | Master overview with KPIs and analytics |
| **Courses** | `/admin/courses` | Course management (Kanban/List views) |
| **Reporting** | `/admin/reports` | Analytics and learner engagement data |
| **Settings** | `/admin/settings` | Platform configuration and preferences |

### 2.2 Navigation Enhancement Required

**Current State:** Navigation only includes Courses, Reporting, Settings  
**Required Change:** Add "Dashboard" as the first tab (new landing page)

**Implementation Location:** `src/app/admin/layout.tsx`

```typescript
const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard' },  // NEW
  { href: '/admin/courses', label: 'Courses' },
  { href: '/admin/reports', label: 'Reporting' },
  { href: '/admin/settings', label: 'Settings' },
];
```

---

## 3. Master Dashboard Design Specifications

### 3.1 Dashboard Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                     MASTER ADMIN DASHBOARD                          │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Total    │  │ Active   │  │ Total    │  │ Completion│            │
│  │ Courses  │  │ Learners │  │ Enrolls  │  │ Rate     │            │
│  │   24     │  │   156    │  │   489    │  │   67%    │            │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────┐  ┌─────────────────────────┐  │
│  │     ENROLLMENT TRENDS           │  │   COURSE STATUS         │  │
│  │     (Bar Chart)                 │  │   (Pie Chart)           │  │
│  │  ▓▓▓▓                           │  │      ████                │  │
│  │  ▓▓▓▓  ▓▓▓▓                     │  │   ██    ██              │  │
│  │  ▓▓▓▓  ▓▓▓▓  ▓▓▓▓               │  │   Published: 18        │  │
│  │  ▓▓▓▓  ▓▓▓▓  ▓▓▓▓  ▓▓▓▓         │  │   Draft: 6             │  │
│  │  Jan   Feb   Mar   Apr          │  │                         │  │
│  └─────────────────────────────────┘  └─────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                LEARNER PROGRESS OVERVIEW                     │   │
│  │  (Stacked Bar Chart - Yet to Start / In Progress / Done)    │   │
│  │  Course 1: ████████░░░░░░░░░░░░░░░░ 35%                     │   │
│  │  Course 2: ████████████████░░░░░░░░ 68%                     │   │
│  │  Course 3: ████████████████████████ 100%                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    RECENT ACTIVITY                           │   │
│  │  • John enrolled in "Introduction to Odoo AI" - 2h ago      │   │
│  │  • Jane completed "Basics of Odoo CRM" - 5h ago             │   │
│  │  • 3 new users joined today                                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 KPI Cards Specification

| Card | Icon | Color | Data Source |
|------|------|-------|-------------|
| Total Courses | `BookOpen` | Blue (#3B82F6) | `GET /api/courses` count |
| Active Learners | `Users` | Green (#22C55E) | `GET /api/reports/users` active count |
| Total Enrollments | `GraduationCap` | Purple (#8B5CF6) | `GET /api/enrollments` total |
| Completion Rate | `CheckCircle` | Orange (#F59E0B) | Calculated: completed/total × 100 |

### 3.3 Bar Chart: Enrollment Trends

**Chart Library:** Recharts (already compatible with Next.js)  
**Data Format:**
```typescript
interface EnrollmentTrend {
  month: string;          // "Jan", "Feb", etc.
  enrollments: number;    // Count of new enrollments
  completions: number;    // Count of completions
}
```

**Design Specifications:**
- **Chart Type:** Grouped Bar Chart
- **Colors:** 
  - Enrollments: `#7C3AED` (Purple)
  - Completions: `#22C55E` (Green)
- **Animation:** Fade-in with 300ms delay
- **Responsive:** Adjusts to container width
- **Tooltip:** Shows exact value on hover
- **Grid:** Subtle horizontal gridlines only

### 3.4 Pie Chart: Course Status Distribution

**Data Format:**
```typescript
interface CourseStatus {
  name: 'Published' | 'Draft';
  value: number;
  color: string;
}
```

**Design Specifications:**
- **Colors:**
  - Published: `#22C55E` (Green)
  - Draft: `#6B7280` (Gray)
- **Center Label:** Total course count
- **Legend:** Bottom-aligned, horizontal
- **Interaction:** Click to filter courses page

---

## 4. Course Editing Page Functionality

### 4.1 Current Location
`src/app/admin/courses/[id]/edit/page.tsx`

### 4.2 Input Field Indicators

#### 4.2.1 Field State Indicators

| State | Visual Indicator | Description |
|-------|------------------|-------------|
| **Required** | Red asterisk (*) | Field must be filled |
| **Optional** | Gray "(optional)" label | Field can be skipped |
| **Valid** | Green checkmark ✓ | Input passes validation |
| **Invalid** | Red border + error text | Input fails validation |
| **Modified** | Yellow dot indicator | Field has unsaved changes |
| **Saving** | Spinner animation | Auto-save in progress |
| **Saved** | Green "Saved" flash | Change persisted |

#### 4.2.2 Dynamic Field Behavior

```typescript
interface FieldIndicator {
  required: boolean;
  modified: boolean;
  valid: boolean;
  errorMessage?: string;
  isSaving: boolean;
}
```

**Visual Implementation:**
```
┌─────────────────────────────────────────┐
│ Course Title *                     🟡   │  ← Yellow dot = modified
│ ┌─────────────────────────────────────┐ │
│ │ Introduction to React              │ │
│ └─────────────────────────────────────┘ │
│ ✓ Valid title                           │  ← Green validation
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Course Description (optional)           │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│ 0/500 characters                        │  ← Character count
└─────────────────────────────────────────┘
```

### 4.3 Dynamic Changes Based on User Interaction

| User Action | System Response |
|-------------|-----------------|
| Focus input field | Subtle highlight, show helper text |
| Type in field | Real-time validation, character count update |
| Leave field (blur) | Validate, show error if invalid |
| Change published status | Update preview badge color |
| Add/remove tag | Instant UI update, auto-save |
| Upload image | Preview thumbnail, progress indicator |
| Toggle visibility | Immediate icon/text change |

### 4.4 Auto-Save Implementation

```typescript
// Debounced auto-save (1500ms delay after last keystroke)
const debouncedSave = useDebouncedCallback(
  async (data: CourseData) => {
    setIsSaving(true);
    try {
      await updateCourse(courseId, data);
      setLastSaved(new Date());
    } finally {
      setIsSaving(false);
    }
  },
  1500
);
```

---

## 5. Reporting Functionality

### 5.1 Course-Specific Reporting Requirements

**Critical Requirement:** Display ONLY original data based on actual learner engagement. No mock/dummy data.

### 5.2 Data Sources (Original Data Only)

| Metric | Source | API Endpoint |
|--------|--------|--------------|
| Total Participants | enrollments table | `GET /api/reports/courses` |
| Yet to Start | enrollments where progress = 0 | `GET /api/reports/courses` |
| In Progress | enrollments where 0 < progress < 100 | `GET /api/reports/courses` |
| Completed | enrollments where progress = 100 | `GET /api/reports/courses` |
| Completion Rate | Calculated | completed / total × 100 |
| Avg. Time Spent | progress table | `GET /api/reports/courses/{id}` |
| Last Activity | progress table | `GET /api/reports/courses/{id}` |

### 5.3 Reports API Enhancement

**New Endpoint:** `GET /api/reports/courses`

```typescript
// Response format
interface CourseReportData {
  stats: {
    [courseId: string]: {
      total: number;
      yetToStart: number;
      inProgress: number;
      completed: number;
      avgTimeSpentMins: number;
      lastActivityAt: string;
    }
  }
}
```

**SQL Query:**
```sql
SELECT 
  c.id AS course_id,
  COUNT(e.id) AS total_enrollments,
  COUNT(CASE WHEN e.progress = 0 THEN 1 END) AS yet_to_start,
  COUNT(CASE WHEN e.progress > 0 AND e.progress < 100 THEN 1 END) AS in_progress,
  COUNT(CASE WHEN e.progress = 100 OR e.status = 'completed' THEN 1 END) AS completed
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id
GROUP BY c.id;
```

### 5.4 Empty State Handling

When no enrollment data exists, display:
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│     📊                                                          │
│     No learner engagement data available yet.                   │
│                                                                 │
│     Learner data will appear here once students                 │
│     enroll in and interact with this course.                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Course Page UI Enhancements

### 6.1 Image Display in Different Views

#### 6.1.1 Kanban View

**Current State:** No course images displayed  
**Required Change:** Add course thumbnail

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────────────┐                                             │
│ │                 │  📖 Introduction to Odoo AI                 │
│ │   [THUMBNAIL]   │  ┌────┐ ┌────┐ ┌──────────┐                │
│ │    200x120      │  │ AI │ │Odoo│ │Automation│                │
│ │                 │  └────┘ └────┘ └──────────┘                │
│ └─────────────────┘                                             │
│                     Views: 15  │  Contents: 6  │  25:30         │
│                                                                 │
│  [Share] [Edit] [Publish] [Delete]                  ┌Published┐ │
└─────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- **Thumbnail Size:** 200×120px (aspect ratio 5:3)
- **Fallback:** Gradient placeholder with course initial
- **Position:** Left side of card
- **Border Radius:** 8px
- **Object Fit:** cover

#### 6.1.2 List View

**Current State:** No images in table  
**Required Change:** Add thumbnail column

```
┌───────────┬─────────────────────┬────────┬───────┬────────┬────────┬─────────┐
│  Image    │ Course Name         │ Tags   │ Views │Contents│Duration│ Actions │
├───────────┼─────────────────────┼────────┼───────┼────────┼────────┼─────────┤
│ ┌───────┐ │ Introduction to     │ [AI]   │  15   │   6    │ 25:30  │ ⋮       │
│ │ 60x40 │ │ Odoo AI             │ [Odoo] │       │        │        │         │
│ └───────┘ │                     │        │       │        │        │         │
├───────────┼─────────────────────┼────────┼───────┼────────┼────────┼─────────┤
│ ┌───────┐ │ Basics of Odoo CRM  │ [CRM]  │  20   │   8    │ 20:35  │ ⋮       │
│ │ 60x40 │ │                     │ [Sales]│       │        │        │         │
│ └───────┘ │                     │        │       │        │        │         │
└───────────┴─────────────────────┴────────┴───────┴────────┴────────┴─────────┘
```

**Specifications:**
- **Thumbnail Size:** 60×40px
- **Column Position:** First column
- **Fallback:** Colored placeholder matching course tag color

### 6.2 Image Upload Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ Course Image                                                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │     📷 Drag & drop an image here, or click to browse    │   │
│  │                                                         │   │
│  │     Recommended: 1200×720px (16:9)                      │   │
│  │     Max size: 5MB | PNG, JPG, WebP                      │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ── OR ──                                                       │
│                                                                 │
│  🔗 Image URL: [________________________________] [Preview]     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Course Creation Flow

### 7.1 "New" Button Behavior

**Location:** Floating Action Button (FAB) on `/admin/courses` page  
**Current Implementation:** Opens `CreateCourseDialog` modal

### 7.2 Enhanced Course Creation Dialog

```
┌─────────────────────────────────────────────────────────────────┐
│  ✕                    Create New Course                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Course Title *                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Enter course title...                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Description (optional)                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Brief description of the course...                      │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Tags                                                           │
│  ┌────────────────────────────────────────────────┐ [+ Add]    │
│  │ Select or type tags...                         │            │
│  └────────────────────────────────────────────────┘            │
│  Suggestions: [AI] [Python] [Web] [Data Science] [Design]      │
│                                                                 │
│  Course Image (optional)                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │     📷 Click to upload thumbnail                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                              [Cancel]  [Create & Continue →]    │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 Post-Creation Redirect Behavior

| Button | Action |
|--------|--------|
| **Cancel** | Close dialog, no changes |
| **Create & Continue** | Create course → Redirect to `/admin/courses/{id}/edit` |
| **Create & Add Another** | Create course → Clear form, stay in dialog |

**Implementation:**
```typescript
const handleCreate = async (redirectToEdit: boolean = true) => {
  const newCourse = await createCourse(formData);
  if (newCourse && redirectToEdit) {
    router.push(`/admin/courses/${newCourse.id}/edit`);
  } else {
    resetForm();
  }
};
```

---

## 8. Light/Dark Mode Toggle

### 8.1 Global Theme Toggle Location

**Placement Options (in priority order):**

1. **Header Bar (Recommended)**
   - Position: Right side of header, before logout
   - Format: Icon toggle (Sun/Moon)
   
2. **Settings Page**
   - Already implemented ✓
   - Full Light/Dark/System selection

### 8.2 Header Toggle Implementation

```
┌─────────────────────────────────────────────────────────────────┐
│  🎓 LearnSphere   │ Dashboard │ Courses │ Reports │ Settings │  │
│                                              [🌙] [👤] [Logout] │
└─────────────────────────────────────────────────────────────────┘
                                                ↑
                                          Theme Toggle
```

**Toggle Behavior:**
- Single click cycles: Light → Dark → System → Light
- Long press/hover shows tooltip with current mode
- Smooth 200ms transition animation

### 8.3 Theme Persistence

**Current Implementation:** Uses `ThemeProvider` in `src/lib/theme-context.tsx`
- Persists to `localStorage` under key `learnsphere-theme`
- Respects `prefers-color-scheme` for "system" mode

### 8.4 Page-by-Page Theme Integration

All pages MUST use theme-aware CSS variables:

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | `bg-background` (#FFFFFF) | `bg-background` (#0A0A0A) |
| Text | `text-foreground` (#171717) | `text-foreground` (#EDEDED) |
| Card | `bg-card` (#FFFFFF) | `bg-card` (#171717) |
| Border | `border-border` (#E5E5E5) | `border-border` (#262626) |
| Primary | `text-primary` (#7C3AED) | `text-primary` (#7C3AED) |
| Muted | `text-muted-foreground` (#737373) | `text-muted-foreground` (#A3A3A3) |

---

## 9. Enhanced Reporting Window

### 9.1 Additional Statistics Overview

**New Charts to Add:**

#### 9.1.1 Pie Chart: Enrollment Status Distribution

```
┌───────────────────────────────────────┐
│     Enrollment Status Distribution    │
│                                       │
│           ████████                    │
│       ████        ████                │
│      ██    Total    ██                │
│      ██     489     ██                │
│       ████        ████                │
│           ████████                    │
│                                       │
│  🔴 Yet to Start (120)  25%          │
│  🟠 In Progress (234)   48%          │
│  🟢 Completed (135)     27%          │
└───────────────────────────────────────┘
```

#### 9.1.2 Total Course Count Card

```
┌─────────────────────────────────┐
│        📚 Total Courses          │
│                                 │
│             24                  │
│                                 │
│   Published: 18  │  Draft: 6    │
│   ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░            │
│                                 │
└─────────────────────────────────┘
```

### 9.2 Enhanced Stats Grid

```
┌────────────────────────────────────────────────────────────────────────┐
│                           OVERVIEW                                      │
├────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ 📚       │  │ 👥       │  │ ⏳       │  │ 🔄       │  │ ✅       │ │
│  │ Total    │  │ Total    │  │ Yet to   │  │ In       │  │ Completed│ │
│  │ Courses  │  │ Learners │  │ Start    │  │ Progress │  │          │ │
│  │    24    │  │   156    │  │   120    │  │   234    │  │   135    │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### 9.3 Chart Specifications

**Pie Chart Configuration:**
```typescript
const pieChartConfig = {
  data: [
    { name: 'Yet to Start', value: totals.yetToStart, fill: '#EF4444' },
    { name: 'In Progress', value: totals.inProgress, fill: '#F97316' },
    { name: 'Completed', value: totals.completed, fill: '#22C55E' },
  ],
  innerRadius: 60,
  outerRadius: 100,
  centerLabel: `Total: ${totals.participants}`,
  animation: true,
  animationDuration: 800,
};
```

---

## 10. Dark Mode Accessibility

### 10.1 Input Field Visibility Requirements

**Problem:** Input fields may have poor contrast in dark mode  
**Solution:** Ensure all form elements meet WCAG 2.1 AA standards (4.5:1 contrast ratio)

### 10.2 Input Field Styles (Dark Mode)

```css
/* Input field dark mode styles */
.dark input,
.dark textarea,
.dark select {
  background-color: hsl(0 0% 9%);        /* #171717 */
  border-color: hsl(0 0% 20%);           /* #333333 */
  color: hsl(0 0% 93%);                  /* #EDEDED */
}

.dark input::placeholder,
.dark textarea::placeholder {
  color: hsl(0 0% 50%);                  /* #808080 */
}

.dark input:focus,
.dark textarea:focus,
.dark select:focus {
  border-color: hsl(262 83% 58%);        /* #7C3AED */
  box-shadow: 0 0 0 2px hsl(262 83% 58% / 0.2);
}
```

### 10.3 Contrast Verification Matrix

| Element | Background | Text | Contrast Ratio | Status |
|---------|------------|------|----------------|--------|
| Input (empty) | #171717 | #808080 (placeholder) | 4.77:1 | ✓ Pass |
| Input (filled) | #171717 | #EDEDED | 12.65:1 | ✓ Pass |
| Button primary | #7C3AED | #FFFFFF | 5.08:1 | ✓ Pass |
| Button outline | #171717 | #EDEDED | 12.65:1 | ✓ Pass |
| Error text | #171717 | #F87171 | 6.12:1 | ✓ Pass |

### 10.4 Additional Accessibility Considerations

1. **Focus Indicators:** All interactive elements must have visible focus rings
2. **Error States:** Use icons + color (not color alone) to indicate errors
3. **Labels:** All inputs must have associated `<label>` elements
4. **ARIA:** Use `aria-describedby` for error messages

---

## 11. Settings Page Dropdown & Navigation

### 11.1 Quick Navigation Dropdown

**Location:** Top of Settings page, below header

```
┌─────────────────────────────────────────────────────────────────┐
│  Settings                                                       │
│                                                                 │
│  Jump to: ┌────────────────────────────────▼┐                  │
│           │ Profile                          │                  │
│           │ Account Settings                 │                  │
│           │ Notifications                    │                  │
│           │ Video Preferences                │                  │
│           │ Appearance                       │                  │
│           │ Security & Access                │                  │
│           │ Help & Support                   │                  │
│           │ About                            │                  │
│           └──────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2 Dropdown Items

| Item | Target Section | Icon |
|------|----------------|------|
| Profile | `#profile` | `User` |
| Account Settings | `#account` | `Settings` |
| Notifications | `#notifications` | `Bell` |
| Video Preferences | `#video` | `PlayCircle` |
| Appearance | `#appearance` | `Sun` |
| Security & Access | `#security` | `Shield` |
| Help & Support | `#help` | `HelpCircle` |
| About | `#about` | `Info` |

### 11.3 Auto-Scroll Behavior

**Implementation:**
```typescript
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
    // Add highlight effect
    element.classList.add('highlight-flash');
    setTimeout(() => element.classList.remove('highlight-flash'), 1500);
  }
};
```

**CSS for highlight flash:**
```css
@keyframes highlightFlash {
  0% { background-color: hsl(262 83% 58% / 0.1); }
  100% { background-color: transparent; }
}

.highlight-flash {
  animation: highlightFlash 1.5s ease-out;
}
```

### 11.4 Sticky Dropdown on Scroll

When user scrolls past header, dropdown becomes sticky:
```typescript
const [isSticky, setIsSticky] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setIsSticky(window.scrollY > 100);
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

---

## 12. Implementation Priority Matrix

### Phase 1: Critical (Sprint 1 - Week 1-2)

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Create Dashboard page | P0 | High | API endpoints |
| Add Dashboard to navigation | P0 | Low | Dashboard page |
| Dark mode input accessibility | P0 | Medium | None |
| Theme toggle in header | P1 | Medium | Theme context |

### Phase 2: High Priority (Sprint 2 - Week 3-4)

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Course image support (Kanban) | P1 | Medium | Image upload API |
| Course image support (List) | P1 | Medium | Above |
| Bar chart on Dashboard | P1 | High | Recharts setup |
| Pie chart on Dashboard | P1 | Medium | Recharts setup |

### Phase 3: Medium Priority (Sprint 3 - Week 5-6)

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Enhanced course creation dialog | P2 | Medium | None |
| Input field indicators | P2 | High | Form library |
| Settings quick navigation | P2 | Medium | None |
| Reporting pie charts | P2 | Medium | API data |

### Phase 4: Enhancement (Sprint 4 - Week 7-8)

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Auto-save in editor | P3 | High | Debounce logic |
| Activity feed on Dashboard | P3 | Medium | Activity API |
| Course completion animations | P3 | Low | None |
| Keyboard shortcuts | P3 | Medium | None |

---

## 13. Technical Specifications

### 13.1 New Dependencies Required

```json
{
  "dependencies": {
    "recharts": "^2.12.0",         // Charts
    "react-dropzone": "^14.2.3",   // File upload
    "use-debounce": "^10.0.0"      // Debounced auto-save
  }
}
```

### 13.2 New Files to Create

```
src/
├── app/
│   └── admin/
│       └── dashboard/
│           └── page.tsx           # NEW: Master dashboard
├── components/
│   └── admin/
│       ├── DashboardKPICard.tsx   # NEW: KPI stat card
│       ├── EnrollmentChart.tsx    # NEW: Bar chart component
│       ├── StatusPieChart.tsx     # NEW: Pie chart component
│       ├── ActivityFeed.tsx       # NEW: Recent activity list
│       └── ImageUploader.tsx      # NEW: Drag-drop image upload
└── lib/
    └── use-debounce.ts            # NEW: Debounce hook
```

### 13.3 API Endpoints Required

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/reports/dashboard` | GET | Returns all dashboard KPIs |
| `/api/reports/enrollments/trends` | GET | Monthly enrollment data |
| `/api/reports/activity` | GET | Recent activity feed |
| `/api/upload/image` | POST | Upload course image |

### 13.4 Database Schema Additions

```sql
-- Add image_url column if not exists
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add activity log table for dashboard feed
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type VARCHAR(50) NOT NULL,  -- 'enrollment', 'completion', 'course_created'
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Appendix A: Color Palette Reference

| Name | Light Mode | Dark Mode | CSS Variable |
|------|------------|-----------|--------------|
| Background | #FFFFFF | #0A0A0A | `--background` |
| Foreground | #171717 | #EDEDED | `--foreground` |
| Card | #FFFFFF | #171717 | `--card` |
| Primary | #7C3AED | #7C3AED | `--primary` |
| Success | #22C55E | #22C55E | `--success` |
| Warning | #F59E0B | #F59E0B | `--warning` |
| Error | #EF4444 | #F87171 | `--destructive` |
| Muted | #737373 | #A3A3A3 | `--muted-foreground` |

---

## Appendix B: Component Naming Conventions

- **Pages:** `PascalCase` + `Page` suffix (e.g., `DashboardPage`)
- **Components:** `PascalCase` (e.g., `EnrollmentChart`)
- **Hooks:** `camelCase` with `use` prefix (e.g., `useDebounce`)
- **Utilities:** `camelCase` (e.g., `formatDuration`)
- **API Routes:** `lowercase` with hyphens (e.g., `/api/reports/course-stats`)

---

*Document prepared following Google Technical Writing Guidelines and Material Design principles. Ready for development team implementation.*
