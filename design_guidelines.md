# Momentum Task Tracker - Design Guidelines

## Design Approach

**Selected Approach:** Hybrid System - Material Design foundations with gaming-inspired visualization elements

**Justification:** Momentum is a productivity dashboard requiring clear information hierarchy and data visualization. Material Design provides robust patterns for forms, modals, and data display, while custom gaming-inspired elements (progress rings, streak counters, replay mechanics) create the motivational gamification layer.

**Key Design Principles:**
- Focus-driven minimalism: Dashboard shows only essential active task information
- Immediate feedback: Every interaction provides visual confirmation
- Gaming psychology: Progress visualization using rings, streaks, and scores feels rewarding
- Dark-first design: Reduces eye strain during extended usage sessions

---

## Core Design Elements

### A. Typography

**Font Family:** 
- Primary: Inter (via Google Fonts) for UI elements, body text, and data
- Accent: JetBrains Mono for timers, counters, and numerical displays

**Hierarchy:**
- Dashboard Task Title: text-3xl font-bold
- Section Headers: text-xl font-semibold
- Modal Headers: text-2xl font-bold
- Body Text: text-base font-normal
- Timer/Counter Displays: text-4xl font-mono font-bold (JetBrains Mono)
- Small Stats/Labels: text-sm font-medium
- Micro-labels: text-xs font-normal

### B. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, and 8 consistently
- Micro spacing (gaps, padding): p-2, gap-2
- Standard component spacing: p-4, gap-4, m-4
- Section spacing: p-6, py-8
- Major layout spacing: p-8, gap-8

**Grid Structure:**
- Dashboard: Single-column centered layout with max-w-4xl container
- Stats/Metrics: 2-column grid on desktop (grid-cols-2), single column mobile
- Category cards: 3-column grid on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)

### C. Component Library

**1. Dashboard Core**
- **Active Task Card:** Large centered card (rounded-2xl, p-8) displaying current task name, category badge, and prominent progress ring (200-250px diameter)
- **Progress Ring:** SVG-based circular progress indicator with:
  - Thick stroke (stroke-width: 12-16)
  - Animated fill on task completion
  - Percentage/time remaining in center
  - Gradient effect using primary accent color
  
**2. Interval Check-in Modal**
- **Structure:** Centered overlay (max-w-md) with backdrop blur
- **Header:** Task name + interval time range
- **Question:** "Did you complete [task details]?" in text-lg
- **Input Area:** 
  - For count tasks: Large number input with +/- stepper buttons
  - For duration tasks: Display logged time with "Yes/No" buttons
- **Action Buttons:** 
  - Primary CTA (Yes/Submit): Large, full-width, rounded-lg
  - Secondary (Replay): Outlined button, slightly smaller

**3. Task Timer Interface**
- **Display:** Extra-large monospace timer (text-6xl) showing MM:SS or HH:MM:SS
- **Controls:** Play/Pause icon button (circular, 64px) and Stop button
- **Visual State:** Pulsing glow effect around active timer
- **Mini-mode:** Sticky floating timer (bottom-right) when user navigates away

**4. Navigation & Categories**
- **Sidebar:** Fixed left sidebar (w-64) with category list
- **Category Items:** Icon + label, highlighted active state with accent color border-left
- **Quick Actions:** Floating action button (FAB, bottom-right, 56px) for adding new tasks

**5. Stats & Visualization**
- **Metric Cards:** Compact cards showing Momentum Score, Streak, Replay Rate
  - Icon at top
  - Large number (text-5xl)
  - Small descriptive label below
- **Heatmap:** Calendar-style grid with color intensity showing effort distribution
- **Progress Charts:** Simple bar charts for monthly totals, minimal decoration

**6. Task Creation Form**
- **Layout:** Multi-step wizard or single scrolling form
- **Fields:** 
  - Task name: Large text input
  - Category: Dropdown with custom category creation
  - Metric type: Toggle between Duration/Count with icons
  - Interval: Slider or dropdown (30 min - 24 hours)
  - Target: Number input with unit label
- **Styling:** Rounded inputs (rounded-lg), generous padding (p-4)

**7. Replay Prompt**
- **Visual Treatment:** Distinct from regular check-in with warning/challenge aesthetic
- **Message:** "Defeat logged. Set a smaller replay goal?"
- **Reduced Target:** Auto-calculated smaller goal (50% of original) with option to customize
- **Countdown:** Visual countdown timer for next interval

**8. Notifications**
- **Browser Notification:** Standard browser API with task icon
- **In-app Toast:** Slide from top-right, rounded-xl, auto-dismiss after 5 seconds
- **Content:** Brief message + task name, click to open check-in modal

### D. Animations

**Strategic Use Only:**
- Progress ring fill: Smooth 1-second easeInOut transition
- Task completion: Brief scale pulse (scale-105) + checkmark appear
- Modal enter/exit: Fade + slight scale (0.95 to 1.0, 200ms)
- Replay prompt: Gentle shake animation (2px horizontal) to draw attention
- Timer state change: Color transition (500ms) when starting/stopping

---

## Images

This is a dashboard application with minimal imagery needs:

**Category Icons:**
- Use Heroicons for category/task type icons throughout
- Display as 24x24px in lists, 32x32px in cards
- Icons needed: Clock, Trophy, Chart, Target, Calendar, plus category-specific (Dumbbell for exercise, Book for study, etc.)

**Empty States:**
- Simple illustration or large icon (128px) for "No active tasks" state
- Centered with supportive text below

**No Hero Section:** This is a dashboard app, not a landing page - users go straight to their task interface.