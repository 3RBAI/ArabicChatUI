# Design Guidelines: Professional AI Chat Interface with RTL Support

## Design Approach
**Reference-Based Approach**: Inspired by ChatGPT, Claude, and modern AI chat interfaces, adapted for bilingual (Arabic/English) support and multi-model functionality.

## Core Design Principles
- **Clarity Over Decoration**: Clean, distraction-free interface that prioritizes conversation flow
- **Contextual Density**: Compact sidebar, spacious message area
- **Seamless Bilingualism**: Flawless RTL/LTR transitions with mirror-perfect layouts
- **Subtle Elegance**: Professional appearance with minimal but purposeful animations

---

## Color Palette

### Light Mode
**Background System**:
- Primary Background: `220 13% 98%` (off-white, reduces eye strain)
- Sidebar Background: `220 14% 96%` (subtle differentiation)
- Message Area: `0 0% 100%` (pure white for content focus)
- User Bubble: `217 91% 60%` (vibrant blue)
- AI Bubble: `220 13% 95%` (neutral light gray)

**Text Colors**:
- Primary Text: `220 13% 18%` (near black)
- Secondary Text: `220 9% 46%` (muted gray)
- On Primary: `0 0% 100%` (white text on blue)

**Accent Colors**:
- Primary Action: `217 91% 60%` (blue - matching user bubble)
- Success: `142 76% 36%` (green)
- Warning: `38 92% 50%` (amber)
- Error: `0 84% 60%` (red)
- AI Indicator: `262 83% 58%` (purple)

### Dark Mode
**Background System**:
- Primary Background: `220 13% 9%` (deep charcoal)
- Sidebar Background: `220 13% 7%` (darker differentiation)
- Message Area: `220 13% 11%` (slightly lighter for content)
- User Bubble: `217 91% 50%` (slightly muted blue)
- AI Bubble: `220 13% 15%` (subtle elevation)

**Text Colors**:
- Primary Text: `220 13% 91%` (off-white)
- Secondary Text: `220 9% 65%` (medium gray)
- On Primary: `220 13% 9%` (dark text on blue)

**Borders & Dividers**: `220 13% 18%` in dark mode, `220 13% 88%` in light mode

---

## Typography

**Font Families**:
- Arabic: `'IBM Plex Sans Arabic', 'Tajawal', sans-serif`
- English: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
- Code: `'Fira Code', 'Consolas', monospace`

**Type Scale**:
- Sidebar Session Title: 14px / 500 weight
- Message Text: 15px / 400 weight / 1.6 line-height
- Composer Input: 15px / 400 weight
- Header Title: 16px / 600 weight
- Timestamps: 12px / 400 weight
- Code Blocks: 13px / 400 weight / 1.5 line-height

---

## Layout System

**Spacing Primitives**: Use Tailwind units of `2, 3, 4, 6, 8, 12, 16, 20` for consistent rhythm
- Component padding: `p-4` to `p-6`
- Section spacing: `gap-4` or `gap-6`
- Message bubble margins: `my-3`
- Sidebar item padding: `px-3 py-2`

**Grid Structure**:
- Sidebar: Fixed 280px width (collapsed to 64px)
- Message Area: Flexible with `max-w-3xl` container centered
- Composer: Full width with `max-w-3xl` inner container

**RTL Considerations**:
- All margins/paddings use logical properties (`ms-`, `me-`, `ps-`, `pe-`)
- Icons flip horizontally in RTL (except universally recognized symbols)
- Animations reverse direction for RTL

---

## Component Library

### Chat Sidebar
**Structure**:
- Header with app logo and new chat button
- Search input with icon
- Scrollable session list (grouped: Pinned → Recent → Archived)
- User profile/settings at bottom

**Visual Treatment**:
- Sessions: Rounded `md` containers, hover state with `bg-opacity-70` transition
- Active session: Solid background with left border accent (4px blue)
- Icons: 18px size, secondary text color
- Dividers: 1px subtle borders between groups

### Message Bubbles
**User Messages**:
- Background: Primary blue color
- Text: White
- Alignment: End-aligned (right in LTR, left in RTL)
- Max width: 75% of container
- Border radius: `lg` (16px)

**AI Messages**:
- Background: Light/dark gray (mode-dependent)
- Text: Primary text color
- Alignment: Start-aligned
- Max width: 100% of container (for code blocks)
- Border radius: `lg`

**Content Support**:
- Markdown rendering with syntax highlighting
- Code blocks with language badge and copy button
- Image lazy-loading with skeleton placeholders
- File attachments with icon, name, size preview

### Chat Header
**Elements**:
- Session title (center or start-aligned)
- Model selector dropdown (displays current model: "GPT-4", "DeepSeek")
- Mode toggle (Chat/Agent) with icon indicator
- Settings/options menu (kebab icon)
- Connection status indicator (subtle dot: green/yellow/red)

**Style**: Minimal design with `border-b` separator, height `h-16`

### Composer
**Structure**:
- Multiline textarea with auto-expand (max 200px)
- File attachment button (paperclip icon)
- Quick action buttons (4-6 buttons: Summarize, Brainstorm, Code, etc.)
- Send button (arrow icon, primary color, disabled state when empty)

**Visual Treatment**:
- Rounded `xl` container with border
- Floating effect with subtle shadow in light mode
- File previews appear above input as chips
- Character count for long messages (subtle, secondary text)

### Loading & Status Indicators
- Typing indicator: Three animated dots (scale animation, 150ms stagger)
- Message sending: Subtle opacity animation on user bubble
- Loading spinner: Rotating circle with primary color
- Progress bar: Linear indicator for file uploads (4px height, rounded)

---

## Animations & Transitions

**Message Animations**:
- Entry: `fade-in-up` - opacity 0→1 + translateY(8px→0) over 200ms
- Exit: `fade-out` - opacity 1→0 over 150ms (for deletions)
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`

**Component Transitions**:
- Sidebar collapse: 250ms width transition
- Hover states: 150ms all properties
- Button clicks: 100ms scale(0.98) on active
- Dropdown menus: 200ms opacity + translateY

**Direction-Aware**:
- Sidebar slides from right in RTL, left in LTR
- Message bubbles slide from appropriate side based on sender

**Performance**: Use `will-change` sparingly, prefer `transform` and `opacity` for GPU acceleration

---

## Images
No hero images required for chat interface. All visuals are functional:
- User avatars (32px circles)
- File attachment thumbnails
- Model logos (16px icons in dropdown)

---

## Accessibility & Responsiveness

- Focus rings: 2px blue ring with 2px offset
- Keyboard navigation: Full support for sidebar navigation and composer
- Screen reader: Proper ARIA labels for all interactive elements
- Mobile breakpoint: Sidebar becomes overlay drawer below 768px
- Touch targets: Minimum 44px height for all interactive elements