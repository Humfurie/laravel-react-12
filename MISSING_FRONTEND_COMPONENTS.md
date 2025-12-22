# Missing Frontend Components

## Status: ❌ NOT IMPLEMENTED

The backend comment system is fully implemented and tested, but the frontend React components are **missing and need to
be implemented**.

## Required Components

### 1. CommentForm.tsx

**Location**: `resources/js/components/comments/CommentForm.tsx`

**Purpose**: Form for creating new comments and replies

**Props**:

```typescript
interface CommentFormProps {
    commentableType: 'blog' | 'giveaway';
    commentableId: number;
    parentId?: number | null;
    onCommentSubmitted?: (comment: Comment) => void;
    placeholder?: string;
}
```

**Features**:

- Text area with character count (3-1000 characters)
- Submit button with loading state
- Real-time validation
- Success/error message display
- Auto-focus on mount for reply forms
- Throttle protection (10 comments/minute)

**Example Implementation**: See `COMMENT_SYSTEM_IMPLEMENTATION.md` lines 200-280

---

### 2. CommentItem.tsx

**Location**: `resources/js/components/comments/CommentItem.tsx`

**Purpose**: Display individual comment with actions

**Props**:

```typescript
interface CommentItemProps {
    comment: Comment;
    currentUserId?: number;
    isAdmin?: boolean;
    depth?: number; // For nesting visualization
    onReply?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onReport?: () => void;
}
```

**Features**:

- User avatar and name
- Comment content with line breaks
- Timestamp with "edited" indicator
- Action buttons (Reply, Edit, Delete, Report)
- Nested reply visualization (max 3 levels)
- Admin moderation controls
- Soft delete indicator
- Report count badge for admins

**Example Implementation**: See `COMMENT_SYSTEM_IMPLEMENTATION.md` lines 282-420

---

### 3. CommentSection.tsx

**Location**: `resources/js/components/comments/CommentSection.tsx`

**Purpose**: Main container for comment system

**Props**:

```typescript
interface CommentSectionProps {
    commentableType: 'blog' | 'giveaway';
    commentableId: number;
    initialComments?: Comment[];
    canComment?: boolean;
    isAuthenticated: boolean;
}
```

**Features**:

- List of root comments
- Nested reply threads
- Comment count header
- Sort options (newest, oldest, most replied)
- "Load more" pagination
- Empty state message
- Authentication prompt for guests
- Real-time comment addition (optimistic UI)

**Example Implementation**: See `COMMENT_SYSTEM_IMPLEMENTATION.md` lines 422-540

---

## Additional UI Components

### 4. ReportModal.tsx

**Location**: `resources/js/components/comments/ReportModal.tsx`

**Purpose**: Modal for reporting inappropriate comments

**Features**:

- Dropdown for report reason (spam, harassment, inappropriate, misinformation, other)
- Optional description field
- Submit/cancel buttons
- Prevents duplicate reports
- Shows success confirmation

---

### 5. EditCommentModal.tsx

**Location**: `resources/js/components/comments/EditCommentModal.tsx`

**Purpose**: Modal for editing own comments

**Features**:

- Pre-filled textarea with existing content
- Character count validation
- Save/cancel buttons
- Shows "edited" indicator after save

---

## Integration Points

### Blog Post Page

Add to `resources/js/pages/user/blog-post.tsx`:

```typescript
import CommentSection from '@/components/comments/CommentSection';

// Inside the component
<CommentSection
    commentableType="blog"
    commentableId={blog.id}
    isAuthenticated={!!auth.user}
/>
```

### Giveaway Page

Add to `resources/js/pages/giveaways/show.tsx`:

```typescript
import CommentSection from '@/components/comments/CommentSection';

// Inside the component
<CommentSection
    commentableType="giveaway"
    commentableId={giveaway.id}
    isAuthenticated={!!auth.user}
/>
```

---

## TypeScript Interfaces

Create `resources/js/types/comment.ts`:

```typescript
export interface Comment {
    id: number;
    user_id: number;
    parent_id: number | null;
    content: string;
    status: 'approved' | 'pending' | 'hidden';
    is_edited: boolean;
    edited_at: string | null;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
        avatar?: string;
    };
    replies?: Comment[];
    replies_count?: number;
    can_edit?: boolean;
    can_delete?: boolean;
}

export interface CommentReport {
    id: number;
    comment_id: number;
    reason: 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'other';
    description?: string;
    status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
}
```

---

## API Endpoints Reference

All endpoints are fully implemented and tested:

- `POST /blogs/{blog}/comments` - Create comment
- `POST /giveaways/{giveaway}/comments` - Create comment
- `PUT /comments/{comment}` - Update own comment
- `DELETE /comments/{comment}` - Delete own comment
- `POST /comments/{comment}/report` - Report comment

---

## Testing Checklist

Before marking frontend as complete, test:

- [ ] Create root comment
- [ ] Create nested reply (1 level deep)
- [ ] Create nested reply (2 levels deep)
- [ ] Create nested reply (3 levels deep - should work)
- [ ] Try to create 4th level (should show error)
- [ ] Edit own comment
- [ ] Try to edit other's comment (should be disabled)
- [ ] Delete own comment
- [ ] Report a comment
- [ ] Try to report same comment twice (should show error)
- [ ] Submit comment with HTML tags (should be stripped)
- [ ] Submit comment too short (< 3 chars)
- [ ] Submit comment too long (> 1000 chars)
- [ ] Comment as guest (should prompt login)
- [ ] Hit rate limit (10 comments/minute)

---

## Recommended UI Libraries

For a polished comment system, consider:

- **@headlessui/react** - For modals and dropdowns (already installed)
- **react-markdown** - For safe markdown rendering (optional)
- **date-fns** - For "3 minutes ago" timestamps (already installed)
- **lucide-react** - For icons (already installed)

---

## Implementation Priority

1. **High Priority**: CommentForm, CommentItem, CommentSection
2. **Medium Priority**: ReportModal, EditCommentModal
3. **Low Priority**: Admin comment management UI (can use current backend interface)

---

## Notes

- The backend is **production-ready** with comprehensive security and validation
- All rate limiting is already configured server-side
- XSS protection is handled on backend (HTML tags stripped)
- Authorization is enforced server-side
- The frontend just needs to provide a good UX around these secure endpoints

---

## Contact

If you need example implementations or have questions, refer to:

- `COMMENT_SYSTEM_IMPLEMENTATION.md` for detailed code examples
- `SECURITY_FIXES.md` for security considerations
- `tests/Feature/CommentTest.php` for expected behavior
