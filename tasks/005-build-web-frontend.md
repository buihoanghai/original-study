# Task 005: Build Web Frontend

**Status**: IN PROGRESS  
**Owner**: AI Agent  
**Created**: 2026-02-12  
**Dependencies**: Task 004 (Editor Core)

---

## 1. Goal

Build Next.js web frontend that integrates the mindmap editor, provides routing, and implements core user flows.

---

## 2. Context

- **Editor package** (`@mindmap/editor`) is complete with React Flow integration
- **Sync package** (`@mindmap/sync`) provides CMS communication
- **Domain types** (`@mindmap/domain`) define all data structures
- **Web app** (`apps/mindmap-web`) is Next.js 16.1.6 with App Router
- **CMS** runs on port 3001, web app on port 3000

---

## 3. Scope

### In Scope
- Home page with mindmap list
- Editor page with full mindmap editing
- Create new mindmap flow
- Save/load mindmap integration
- Basic navigation and layout
- Integration with editor package
- Client-side state management

### Out of Scope
- Authentication (future task)
- Flashcard UI (future task)
- Comments UI (future task)
- User profiles
- Sharing features
- Mobile optimization (MVP is desktop-first)

---

## 4. Acceptance Criteria

**AC1**: Home page displays list of mindmaps  
**AC2**: "New Mindmap" button creates and navigates to editor  
**AC3**: Editor page renders MindmapEditor component  
**AC4**: All keyboard shortcuts work in editor page  
**AC5**: Save button persists mindmap to CMS  
**AC6**: Load existing mindmap from URL parameter  
**AC7**: Navigation between home and editor works  
**AC8**: Error states handled gracefully  

---

## 5. Technical Design

### File Structure
```
apps/mindmap-web/
├── app/
│   ├── layout.tsx              # Root layout (update)
│   ├── page.tsx                # Home page (update)
│   ├── editor/
│   │   └── [id]/
│   │       └── page.tsx        # Editor page
│   └── new/
│       └── page.tsx            # New mindmap page
├── components/
│   ├── MindmapList.tsx         # List of mindmaps
│   ├── EditorWrapper.tsx       # Client component wrapper
│   └── Header.tsx              # App header
└── lib/
    └── api.ts                  # API client functions
```

### Routes
- `/` - Home page with mindmap list
- `/new` - Create new mindmap (redirects to `/editor/[id]`)
- `/editor/[id]` - Edit mindmap

### Dependencies to Add
- `@mindmap/editor` (workspace)
- `@mindmap/sync` (workspace)
- `@mindmap/domain` (workspace)
- `@xyflow/react` (peer dependency)
- `zustand` (peer dependency)

---

## 6. Implementation Plan

### Phase 1: Setup Dependencies
1. Add workspace dependencies to package.json
2. Update tsconfig.json paths
3. Verify build works

### Phase 2: API Client
1. Create `lib/api.ts` with fetch wrappers
2. Implement getMindmaps, getMindmap, createMindmap

### Phase 3: Components
1. Create Header component
2. Create MindmapList component
3. Create EditorWrapper (client component)

### Phase 4: Pages
1. Update home page with mindmap list
2. Create /new page for creating mindmaps
3. Create /editor/[id] page with editor

### Phase 5: Integration
1. Wire up save/load with sync package
2. Test all flows end-to-end
3. Handle error states

---

## 7. Testing Strategy

### Unit Tests
- API client functions
- Component rendering
- Error handling

### Integration Tests
- Home page loads mindmaps
- Create new mindmap flow
- Save/load mindmap

### E2E Tests (Future)
- Full user journey
- Keyboard shortcuts in browser

---

## 8. Quality Checks

- [ ] All TypeScript compiles without errors
- [ ] All unit tests pass
- [ ] Home page renders mindmap list
- [ ] Editor page renders and is interactive
- [ ] Save/load works with CMS
- [ ] Navigation works correctly
- [ ] No console errors
- [ ] Keyboard shortcuts work

---

## 9. Deliverables

1. Updated `apps/mindmap-web/package.json` with dependencies
2. `app/page.tsx` - Home page with mindmap list
3. `app/new/page.tsx` - New mindmap creation
4. `app/editor/[id]/page.tsx` - Editor page
5. `components/Header.tsx` - App header
6. `components/MindmapList.tsx` - Mindmap list
7. `components/EditorWrapper.tsx` - Editor wrapper
8. `lib/api.ts` - API client
9. Tests for all components
10. Updated layout with proper metadata

---

## 10. Definition of Done

- All acceptance criteria met
- All tests passing
- TypeScript compiles without errors
- Can create, edit, and save mindmaps
- Navigation works smoothly
- Code reviewed and approved

