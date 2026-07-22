# Study_Tracker
StudyTracker - Notion & Calendar Inspired Study Workspace

StudyTracker is a sleek, modern, single-page study management application designed to help students and self-learners organize their courses, track study hours, set productivity goals, and visualize their academic progress. Inspired by the minimal aesthetic of Notion and the scheduling power of Google Calendar, this application operates 100% in the browser without requiring any backend server or database.

✨ Features

📊 1. Overview Dashboard

Key Metrics: Instantly view total subjects, cumulative study hours, completed study sessions, and active goals.

Today's Schedule: Dynamic daily schedule displaying your planned and completed study blocks for the current date.

Upcoming Sessions: Preview upcoming study sessions at a glance.

Goal Progress Indicator: Quick-glance sidebar bar tracking your primary study target progress.

📚 2. Subject Management

Custom Subjects: Create, edit, and delete subjects/courses.

Personalized Aesthetics: Assign custom accent colors and Bootstrap Icons (e.g., bi-laptop, bi-calculator, bi-code-slash) to each subject.

Detailed Summaries: Track the total hours spent and number of sessions logged for each specific subject.

⏱️ 3. Study Session Logging

Automated Duration Calculation: Simply input start and end times; the app automatically calculates total study hours.

Status Toggle: Mark sessions as Pending or Completed with a single click.

Rich Context: Add custom study notes, topics covered, and revision goals.

Filtering & Search: Filter sessions by Date (Today, Tomorrow, This Week, This Month), Subject, or Status. Instant keyword search across titles and notes.

🎯 4. Target Goals

Milestone Tracking: Set target study hours and target deadlines for exams or major projects.

Automated Progress: Visual progress bars automatically calculate progress percentage based on completed session hours.

📅 5. Interactive Calendar

FullCalendar Integration: Full monthly, weekly, and daily view powered by FullCalendar.js.

Interactive Drag & Drop: Reschedule sessions by dragging them to new dates directly on the calendar grid.

Date Click Creation: Click any calendar date cell to pre-fill and log a session for that day.

📈 6. Advanced Analytics & Statistics

Visual Charts (Chart.js):

Weekly Breakdown: Bar chart showing hours studied over the past 7 days.

Subject Distribution: Donut chart showing time allocation per course.

Completion Rate: Pie chart displaying completed vs. pending sessions.

Monthly Progress: Line chart tracking cumulative study hours throughout the year.

⚙️ 7. Theme & Data Management

Dark / Light Mode: Sleek theme switcher with automatic preference saving in LocalStorage.

Data Export & Import: Backup your complete workspace data to a .json file and restore it on any device.

Sample Data Reset: Includes built-in sample data for quick demonstration and testing.

🛠️ Tech Stack

HTML5 & CSS3: Semantic layout with custom CSS CSS variables for themes.

Bootstrap 5: Responsive grid, layout utilities, modals, dropdowns, and toasts.

Bootstrap Icons: Modern vector icons for UI actions and custom subject indicators.

Vanilla JavaScript (ES6+): Clean, modular object-driven architecture (No frameworks like React or Vue required).

FullCalendar.js (v6): Interactive event calendar and scheduler.

Chart.js: Responsive canvas-based data visualizations.

LocalStorage API: Browser-native persistent storage with zero server dependencies.

🚀 Getting Started

No build tools, compilation, or web servers (like Node.js or Python) are required to run this application!

Download / Clone the index.html file.

Open index.html directly in any modern web browser (Google Chrome, Firefox, Safari, Microsoft Edge).

Start organizing! You can use the built-in sample data or click Settings > Reset / Clear Data to start with a fresh workspace.

🗂️ Project Structure

StudyTracker/
└── index.html       # Single-file HTML application containing CSS styles, SVG assets, and JS modules


🔒 Data Privacy & Offline Use

All your study records, goals, and subject configurations are stored locally in your browser's LocalStorage. No personal data or study activity is ever transmitted to external servers. You can use the application entirely offline.
