# Quizizz-Inspired Quiz Builder - Implementation Guide

## Overview

A modern, immersive Quiz Builder has been integrated into the Course Dashboard LMS. The experience is designed to feel like a premium edtech platform, with smooth animations, interactive components, and intuitive workflows.

## User Flow

### 1. Course Dashboard Stream Page
- Instructors see a "Create Content" section with action buttons
- Four buttons available: Announcement, Module, Assignment, **Quiz**
- The Quiz button is now styled as a modern action card

### 2. Quiz Type Selection (Full-Screen Modal)
**Route:** `/dashboard/course/:courseId/quiz/types`

When instructors click "Quiz", they're taken to a beautiful full-screen selection interface featuring:

- **Animated Cards** for each question type
- **Hover Effects** with scale and glow animations
- **Visual Indicators** showing selected types
- **Color-Coded Design** (Blue, Purple, Emerald, Amber)
- **Detailed Descriptions** for each question type

#### Available Question Types:

1. **Multiple Choice** (Blue)
   - One correct answer
   - Best for straightforward knowledge checks

2. **Checkbox** (Purple)
   - Multiple correct answers
   - Ideal for advanced comprehension questions

3. **True/False** (Emerald)
   - Binary selection
   - Perfect for quick assessments

4. **Short Answer** (Amber)
   - Text-based responses
   - Great for open-ended and critical thinking questions

### 3. Quiz Builder Page
**Route:** `/dashboard/course/:courseId/quiz/create?type={type}`

After selecting a question type, instructors enter the modern Quiz Builder with:

#### Layout Components:

**Sticky Header**
- Quiz title input field (auto-focus)
- Auto-save status indicator
- Save Draft button
- Publish button
- Back button

**Left/Main Section**
- Quiz Settings (description, time limit, due date, attempts, passing score)
- Question Editor (cards for each question type)
- Add Question button

**Right Sidebar**
- Quiz Summary (total questions, points, averages)
- Question Navigator (indexed list of questions)
- Quick stats

## Key Features

### 1. Question Type Cards

Each question type has a dedicated card component:

#### MultipleChoiceCard
- Question text input
- Points editor
- Dynamic answer choices
- Radio button selection for correct answer
- Add/remove choices

#### CheckboxCard
- Question text input
- Points editor
- Multiple correct answers support
- Checkbox selection
- Dynamic choice management

#### TrueFalseCard
- Question text input
- Points editor
- Pre-defined True/False buttons
- Simple selection interface

#### ShortAnswerCard
- Question text input
- Points editor
- Expected answer input (for reference)
- Case-sensitive toggle option

### 2. Drag-and-Drop Support

**Question Reordering**
- Drag questions by the grip handle
- Smooth visual feedback during dragging
- Auto-reorder on drop
- Preserves all question data

**Answer Choice Reordering**
- Future-ready (dnd-kit integrated)
- Can be extended for answer reordering

### 3. Auto-Save Functionality

- Saves quiz every 5 seconds automatically
- Visual status indicator in header
- Saves as draft status
- No data loss on accidental navigation

### 4. Animations

All animations use **Framer Motion** for smooth, performant transitions:

- **Page Transitions:** Fade and scale on entry
- **Card Animations:** Expand/collapse with smooth height transitions
- **Hover Effects:** Scale, glow, and color changes
- **Drag Effects:** Opacity and color feedback
- **Button Animations:** Scale and tap feedback
- **Background Elements:** Subtle moving gradients

### 5. Responsive Design

- Mobile-first approach
- Sidebar collapses on smaller screens
- Touch-friendly buttons and interactions
- Flexible grid layouts

### 6. Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- Focus management
- Screen-reader friendly structure
- Semantic HTML

## Code Structure

```
src/components/quiz/
├── QuizTypeSelector.jsx        # Full-screen type selection
├── QuizBuilderPage.jsx         # Main builder interface
├── QuestionCards.jsx           # Individual question type components
│   ├── MultipleChoiceCard
│   ├── CheckboxCard
│   ├── TrueFalseCard
│   └── ShortAnswerCard
└── QuizBuilderSidebar.jsx      # Header and sidebar components
    ├── QuizBuilderHeader
    └── QuizSidebar
```

## Styling

- **Tailwind CSS** for all styling
- **Consistent Color Palette:**
  - Blue: Multiple Choice
  - Purple: Checkbox
  - Emerald: True/False
  - Amber: Short Answer
- **Rounded Corners:** `rounded-2xl` for modern look
- **Shadows:** Soft shadows for depth
- **Gradients:** Subtle gradients for visual interest

## Integration Points

### Routes in App.jsx
```jsx
<Route path="/dashboard/course/:courseId/quiz/types" element={<QuizTypeSelector />} />
<Route path="/dashboard/course/:courseId/quiz/create" element={<QuizBuilderPage />} />
<Route path="/dashboard/course/:courseId/quiz/:quizId/edit" element={<QuizBuilderPage />} />
```

### Dashboard Integration
In `CourseDetails.jsx`, the Quiz button now navigates to:
```jsx
window.location.href = `/dashboard/course/${id}/quiz/types`
```

## Data Structure

### Quiz Object
```javascript
{
  title: "String",
  description: "String",
  time_limit: "Number (minutes)",
  due_at: "ISO Date String",
  attempts_allowed: "Number",
  passing_score: "Number (0-100)",
  status: "draft|published",
  questions: [/* Question Array */]
}
```

### Question Object
```javascript
{
  id: "Unique ID",
  type: "multiple-choice|checkbox|true-false|short-answer",
  text: "Question text",
  points: "Number",
  caseSensitive: "Boolean (short-answer only)",
  choices: [
    {
      id: "Unique ID",
      text: "Choice text",
      is_correct: "Boolean"
    }
  ]
}
```

## API Endpoints

- **Create Quiz:** `POST /api/courses/:courseId/quizzes`
- **Update Quiz:** `PUT /api/quizzes/:quizId`
- **Get Quiz:** `GET /api/quizzes/:quizId`
- **Auto-save:** Triggered every 5 seconds if data changed

## Validation

### Quiz Validation
- Title is required
- At least one question required for publishing
- Cannot publish without title

### Question Validation
- All questions need text
- Multiple Choice: minimum one correct answer
- Checkbox: minimum one correct answer
- True/False: must have correct answer selected
- Short Answer: no validation required (manual grading)

## Future Enhancements

1. **File Attachments**
   - Image uploads for questions
   - PDF support
   - Video embedding

2. **Advanced Features**
   - Question shuffling option
   - Answer choice randomization
   - Question pools/question banks
   - Import/export quizzes

3. **Analytics**
   - Question difficulty tracking
   - Student performance per question
   - Time-to-complete analytics

4. **Collaborative Features**
   - Quiz sharing with co-instructors
   - Feedback on quiz design
   - Version control

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

- Lazy loading of question cards
- Optimized animations with GPU acceleration
- Debounced auto-save
- Efficient state management
- No unnecessary re-renders

## Troubleshooting

**Quiz not saving:**
- Check network connection
- Verify API endpoint is accessible
- Check browser console for errors

**Animations not smooth:**
- Ensure Framer Motion is installed
- Check GPU acceleration in browser
- Reduce animation complexity on slower devices

**Questions disappearing:**
- Check browser local storage
- Verify auto-save is functioning
- Check browser console for errors

## Developer Notes

### Adding New Question Types

1. Create new Card component in `QuestionCards.jsx`
2. Export the component
3. Add type to the type selection screen
4. Update question template in `QuizBuilderPage.jsx`
5. Add validation logic
6. Update API schema

### Customizing Animations

All animations use Framer Motion's `motion` component. Modify:
- `variants` objects for complex animations
- `animate` props for entrance animations
- `transition` props for timing

### Extending the Builder

The component is designed to be extensible:
- Add new sidebar stats easily
- Extend question types without modifying core logic
- Add new validation rules to `handlePublish`
- Implement custom styling with Tailwind

## Testing Checklist

- [x] Quiz type selection displays all types
- [x] Navigation between screens is smooth
- [x] Auto-save works every 5 seconds
- [x] Can add/remove questions
- [x] Can add/remove answer choices
- [x] Drag-and-drop reordering works
- [x] Save Draft saves correctly
- [x] Publish validation works
- [x] All animations are smooth
- [x] Mobile layout is responsive
- [x] Keyboard navigation works
- [x] Forms validate correctly

## Support

For issues or questions about the Quiz Builder implementation, refer to:
- Framer Motion docs: https://www.framer.com/motion/
- Tailwind CSS docs: https://tailwindcss.com/
- dnd-kit docs: https://docs.dndkit.com/
