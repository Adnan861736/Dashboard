# Games Management Page Documentation

## Overview
The Games Management Page (`app/dashboard/games/page.tsx`) is a comprehensive CRUD interface for managing educational games on the platform. It supports two game types: Crossword and Puzzle games.

## Features Implemented

### 1. Full CRUD Operations
- **Create**: Add new games with complete configuration
- **Read**: Display all games in a responsive grid layout
- **Update**: Edit existing games (with game type preservation)
- **Delete**: Remove games with confirmation dialog

### 2. Game Types

#### Crossword Games
- **Grid Size**: Configurable game board dimensions (5-20)
- **Words Array**: Support for multiple words with:
  - Word text
  - Clue/definition
  - Start coordinates (X, Y)
  - Direction (Across/Down)

#### Puzzle Games
- **Pieces**: Number of puzzle pieces (10-1000, step 10)
- **Difficulty**: Three levels (Easy, Medium, Hard)
- **Image URL**: Reference to the puzzle image

### 3. Filtering System
Filter games by type:
- All Games (default)
- Crossword Games
- Puzzle Games

### 4. User Interface

#### Page Layout
- Header with title and "Add New Game" button
- Type filter dropdown
- Responsive grid display (1-3 columns based on screen size)
- Empty state with call-to-action

#### Game Cards
Each game card displays:
- Game title
- Game type badge (Crossword/Puzzle)
- Type-specific metadata:
  - Crossword: Grid size and word count
  - Puzzle: Piece count and difficulty level
- Educational message (if available)
- Points reward
- Creator name
- Edit and Delete action buttons

#### Modal Dialog
Create/Edit modal with:
- Game title input
- Game type selector (disabled when editing)
- Educational message textarea
- Points reward input
- Conditional fields based on game type
- Form validation
- Cancel and Submit buttons

### 5. Arabic Text Support
All labels, messages, and placeholders are in Arabic:
- Page titles: "إدارة الألعاب"
- Form labels: "عنوان اللعبة", "نوع اللعبة", etc.
- Messages: "جاري التحميل...", "لا توجد ألعاب", etc.
- Game types: "كلمات متقاطعة", "أحجية"
- Difficulty levels: "سهل", "متوسط", "صعب"

### 6. Toast Notifications
- Success messages for create/update/delete operations
- Error messages with API error details
- Informative validation messages

### 7. API Integration

Uses the `gamesAPI` from `lib/api.ts`:
- `getAll(type?: string)`: Fetch all games, optionally filtered by type
- `create(data)`: Create a new game
- `update(id, data)`: Update an existing game
- `delete(id)`: Delete a game

## Component Structure

### TypeScript Interfaces

```typescript
interface GameWord {
  word: string;
  clue: string;
  startX: number;
  startY: number;
  direction: 'across' | 'down';
}

interface CrosswordContent {
  gridSize: number;
  words: GameWord[];
}

interface PuzzleContent {
  pieces: number;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl: string;
}

interface Game {
  id: string;
  type: 'crossword' | 'puzzle';
  title: string;
  content: CrosswordContent | PuzzleContent;
  educationalMessage?: string;
  pointsReward: number;
  admin: { id: string; name: string };
  createdAt: string;
}
```

### Component Imports

```typescript
// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

// API & Utilities
import { gamesAPI } from '@/lib/api';
import toast from 'react-hot-toast';

// Icons
import { Plus, Trash2, Edit2, X, Gamepad2 } from 'lucide-react';
```

## State Management

The component uses React hooks for state management:

**Common State:**
- `games`: Array of all games
- `loading`: Loading state during data fetch
- `showModal`: Modal visibility toggle
- `editingGame`: Currently editing game (null for create)
- `filterType`: Active filter type (all/crossword/puzzle)

**Form State:**
- `title`: Game title
- `gameType`: Selected game type
- `educationalMessage`: Educational message
- `pointsReward`: Points reward value

**Crossword State:**
- `gridSize`: Grid dimensions
- `words`: Array of word objects

**Puzzle State:**
- `pieces`: Number of pieces
- `difficulty`: Difficulty level
- `imageUrl`: Image URL

## Key Functions

### `fetchGames()`
Retrieves all games from the API and updates state.

### `handleSubmit(e)`
Processes form submission, validates input, and creates/updates games.

### `handleDelete(id)`
Deletes a game after confirmation.

### `openEditModal(game)`
Populates form with game data and opens edit modal.

### `resetForm()`
Clears all form fields to initial state.

### `addWord()` / `removeWord(index)`
Manages crossword word array dynamically.

### `updateWord(index, field, value)`
Updates specific word field values.

## Styling & Responsiveness

- **RTL Layout**: `dir="rtl"` for proper Arabic text direction
- **Responsive Grid**: 
  - Mobile: 1 column
  - Tablet: 2 columns (md:grid-cols-2)
  - Desktop: 3 columns (lg:grid-cols-3)
- **Tailwind CSS Classes**: Using the project's design system
- **Animations**: Loading spinner, hover effects, modal transitions

## Validation

The form includes validation for:
- Required fields (title, game type, points reward)
- Crossword: At least one word required
- Puzzle: Image URL required
- Grid size: Between 5-20
- Points reward: Between 1-1000
- Pieces: Between 10-1000

## Error Handling

- Try-catch blocks for all API calls
- User-friendly error messages
- Detailed error logging to console
- Toast notifications for error feedback

## Access & Permissions

- Page is protected by Next.js middleware (as per existing auth system)
- Admin token included via request interceptor
- Accessible at: `/dashboard/games`

## Browser Compatibility

- Modern browsers supporting ES6+
- CSS Grid and Flexbox support required
- Client-side rendering ('use client')

## Future Enhancements

Potential improvements:
- Game preview functionality
- Drag-and-drop word positioning for crosswords
- Image upload for puzzles
- Batch operations
- Export/Import games
- Analytics and usage statistics
- Search functionality
