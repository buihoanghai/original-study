# Mindmap Learning App - Completion Plan

**Created**: 2026-02-12
**Status**: Ready for Implementation
**Estimated Timeline**: 4-6 weeks

---

## 🎯 Executive Summary

The application has **90% of backend/logic complete** but only **10% of frontend UI complete**. This plan outlines the work needed to deliver a production-ready MVP.

**Current State**:
- ✅ Domain models (34 tests passing)
- ✅ CMS collections (54 tests passing)
- ✅ Sync package logic (12 tests passing)
- ✅ Editor core logic (21 tests passing)
- ✅ Flashcard system (15 tests passing)
- ❌ Web frontend UI (only template)
- ❌ Authentication system
- ⚠️ E2E tests (2 passing, 20 disabled)

**Goal**: Complete the web frontend, authentication, and E2E tests to deliver a working MVP.

---

## 📋 Implementation Phases

### **Phase 1: Core Pages & Layout** (Week 1)
**Priority**: 🚨 Critical
**Dependencies**: None
**Estimated Effort**: 5-7 days

#### Deliverables:
1. **App Layout & Navigation**
   - Header with logo, navigation links, user menu
   - Responsive layout (mobile-first)
   - Dark mode support (already configured in Tailwind)
   - Footer with links

2. **Home Page (`app/page.tsx`)**
   - Mindmap list component
   - Grid/list view toggle
   - Search and filter functionality
   - "New Mindmap" button
   - Empty state when no mindmaps

3. **New Mindmap Page (`app/new/page.tsx`)**
   - Form to create new mindmap
   - Title and description fields
   - Status selection (draft/published)
   - Create button with loading state

4. **Authentication Pages**
   - Login page (`app/login/page.tsx`)
   - Register page (`app/register/page.tsx`)
   - Logout functionality
   - Password reset (optional for MVP)

#### Files to Create:
```
apps/mindmap-web/
├── app/
│   ├── layout.tsx (update)
│   ├── page.tsx (replace template)
│   ├── new/page.tsx (new)
│   ├── login/page.tsx (new)
│   └── register/page.tsx (new)
├── components/
│   ├── Header.tsx (new)
│   ├── Footer.tsx (new)
│   ├── MindmapList.tsx (new)
│   ├── MindmapCard.tsx (new)
│   └── MindmapForm.tsx (new)
└── lib/
    └── mindmap-api.ts (new - API client)
```

#### Acceptance Criteria:
- [ ] User can see list of their mindmaps on home page
- [ ] User can create new mindmap with title and description
- [ ] User can navigate between pages
- [ ] All pages are responsive (mobile, tablet, desktop)
- [ ] Loading states and error handling work correctly

---

### **Phase 2: Editor UI with React Flow** (Week 2)
**Priority**: 🚨 Critical
**Dependencies**: Phase 1
**Estimated Effort**: 7-10 days

#### Deliverables:
1. **Editor Page (`app/editor/[id]/page.tsx`)**
   - Load mindmap data from CMS
   - Initialize editor store with data
   - React Flow canvas setup
   - Toolbar with actions

2. **Visual Node Components**
   - Custom node component for React Flow
   - Node content display (text)
   - Node selection state
   - Node editing mode (inline text input)
   - Collapsed/expanded state indicator

3. **Basic Mouse Interactions**
   - Click to select node
   - Double-click to edit node
   - Pan canvas (drag background)
   - Zoom (mouse wheel)

4. **Editor Toolbar**
   - Save button
   - Undo/Redo buttons
   - Zoom controls
   - Center view button
   - Status indicator (saved/unsaved)

#### Files to Create:
```
apps/mindmap-web/
├── app/
│   └── editor/
│       └── [id]/
│           └── page.tsx (new)
├── components/
│   ├── editor/
│   │   ├── EditorCanvas.tsx (new)
│   │   ├── MindmapNode.tsx (new)
│   │   ├── EditorToolbar.tsx (new)
│   │   └── NodeEditor.tsx (new)
│   └── ui/
│       ├── Button.tsx (new)
│       ├── Input.tsx (new)
│       └── Spinner.tsx (new)
└── hooks/
    ├── useEditorSync.ts (new)
    └── useKeyboardShortcuts.ts (new)
```

#### Acceptance Criteria:
- [ ] Editor loads mindmap data from CMS
- [ ] Nodes render correctly on React Flow canvas
- [ ] User can select nodes by clicking
- [ ] User can edit node content by double-clicking
- [ ] User can pan and zoom the canvas
- [ ] Toolbar shows save/undo/redo buttons
- [ ] Editor state syncs with Zustand store

---

### **Phase 3: Keyboard Shortcuts & Hotkeys** (Week 3)
**Priority**: 🚨 Critical
**Dependencies**: Phase 2
**Estimated Effort**: 5-7 days

#### Deliverables:

1. **Keyboard Event Handler System**
   - Global keyboard event listener
   - Context-aware shortcuts (canvas vs editing mode)
   - Prevent default browser shortcuts
   - Visual feedback for shortcuts

2. **Hotkey Canon Implementation**
   - **Tab**: Add child node to selected node
   - **Enter**: Add sibling node at same level
   - **Arrow Keys**: Navigate tree (up/down/left/right)
   - **F**: Toggle collapse/expand node
   - **Esc**: Exit edit mode → center root (double Esc)
   - **Ctrl+Z**: Undo last change
   - **Ctrl+Shift+Z**: Redo last undo
   - **Ctrl+S**: Save to CMS
   - **Ctrl+Shift+F**: Open flashcard panel

3. **Focus Management**
   - Track focus mode (canvas/editing/none)
   - Visual focus indicator on selected node
   - Focus hierarchy (Esc behavior)
   - Tab trap in edit mode

4. **Keyboard Shortcuts Help**
   - Help modal with all shortcuts
   - Triggered by "?" key
   - Categorized by function

#### Files to Modify/Create:
```
apps/mindmap-web/
├── hooks/
│   ├── useKeyboardShortcuts.ts (update)
│   └── useFocusManagement.ts (new)
├── components/
│   ├── editor/
│   │   ├── KeyboardShortcutsHelp.tsx (new)
│   │   └── EditorCanvas.tsx (update)
│   └── ui/
│       └── Modal.tsx (new)
└── lib/
    └── keyboard-utils.ts (new)
```

#### Acceptance Criteria:
- [ ] Tab creates child node and enters edit mode
- [ ] Enter creates sibling node and enters edit mode
- [ ] Arrow keys navigate between nodes
- [ ] F toggles collapse/expand
- [ ] Esc exits edit mode, double Esc centers root
- [ ] Ctrl+Z/Ctrl+Shift+Z undo/redo work
- [ ] Ctrl+S saves to CMS
- [ ] All shortcuts work in both canvas and edit modes
- [ ] Help modal shows all available shortcuts

---

### **Phase 4: Sync Integration UI** (Week 3-4)
**Priority**: ⚠️ Important
**Dependencies**: Phase 2, Phase 3
**Estimated Effort**: 3-5 days

#### Deliverables:

1. **Sync UI Components**
   - Save button with loading state
   - Auto-save toggle (optional)
   - Sync status indicator (saved/saving/error)
   - Last saved timestamp
   - Conflict resolution UI (manual merge)

2. **Error Handling**
   - Toast notifications for errors
   - Retry mechanism for failed saves
   - Offline detection
   - Network error messages

3. **Integration with SyncClient**
   - Connect editor store to SyncClient
   - Save on Ctrl+S
   - Load on page mount
   - Handle save/load errors

4. **Optimistic Updates** (Optional)
   - Update UI immediately
   - Rollback on error
   - Show pending state

#### Files to Create/Modify:
```
apps/mindmap-web/
├── components/
│   ├── editor/
│   │   ├── SyncStatus.tsx (new)
│   │   └── EditorToolbar.tsx (update)
│   └── ui/
│       └── Toast.tsx (new)
├── hooks/
│   └── useEditorSync.ts (update)
└── lib/
    └── sync-utils.ts (new)
```

#### Acceptance Criteria:
- [ ] Save button triggers sync to CMS
- [ ] Sync status shows saved/saving/error states
- [ ] Toast notifications show on save success/error
- [ ] Ctrl+S triggers save
- [ ] Editor loads data from CMS on mount
- [ ] Error handling works for network failures
- [ ] Last saved timestamp updates correctly

---

### **Phase 5: Authentication System** (Week 4)
**Priority**: 🚨 Critical
**Dependencies**: Phase 1
**Estimated Effort**: 5-7 days

#### Deliverables:

1. **Auth Context Provider**
   - User state management
   - Login/logout functions
   - Token storage (localStorage/cookies)
   - Session persistence

2. **Integration with Payload CMS Auth**
   - Login API endpoint (`/api/users/login`)
   - Register API endpoint (`/api/users/create`)
   - Logout API endpoint (`/api/users/logout`)
   - Get current user (`/api/users/me`)

3. **Protected Routes**
   - Middleware to check authentication
   - Redirect to login if not authenticated
   - Redirect to home if already authenticated (login/register pages)

4. **User Menu**
   - User avatar/name display
   - Dropdown menu (Profile, Settings, Logout)
   - Profile page (optional for MVP)

#### Files to Create/Modify:
```
apps/mindmap-web/
├── app/
│   ├── login/page.tsx (update)
│   ├── register/page.tsx (update)
│   └── middleware.ts (new)
├── components/
│   ├── Header.tsx (update)
│   ├── UserMenu.tsx (new)
│   └── auth/
│       ├── LoginForm.tsx (new)
│       └── RegisterForm.tsx (new)
├── contexts/
│   └── AuthContext.tsx (new)
├── hooks/
│   └── useAuth.ts (new)
└── lib/
    └── auth-api.ts (new)
```

#### Acceptance Criteria:
- [ ] User can register with email and password
- [ ] User can login with credentials
- [ ] User can logout
- [ ] Protected routes redirect to login
- [ ] User state persists across page refreshes
- [ ] User menu shows current user info
- [ ] Auth tokens are stored securely


---

### **Phase 6: Complete E2E Test Coverage** (Week 5)
**Priority**: ⚠️ Important
**Dependencies**: Phase 2, Phase 3
**Estimated Effort**: 3-5 days

#### Deliverables:

1. **Fix Disabled E2E Tests**
   - Investigate syntax error in `editor-complete.spec.ts`
   - Fix and re-enable 15 editor tests
   - Ensure all tests pass in CI

2. **Flashcard Workflow Tests**
   - Enable flashcard E2E tests
   - Test flashcard creation from nodes
   - Test review workflow
   - Test keyboard shortcuts in review

3. **Authentication E2E Tests**
   - Test login/logout flow
   - Test registration flow
   - Test protected routes

4. **Complete Editor Workflow Tests**
   - Test all keyboard shortcuts
   - Test save/load workflows
   - Test error handling
   - Test undo/redo

#### Files to Modify/Create:
```
e2e/
├── editor-complete.spec.ts.skip (fix and rename)
├── flashcard.spec.ts (enable)
├── auth.spec.ts (new)
└── sync.spec.ts (new)
```

#### Acceptance Criteria:
- [ ] All 15 editor tests pass
- [ ] All 5 flashcard tests pass
- [ ] Auth tests pass (login, register, logout)
- [ ] Sync tests pass (save, load, error handling)
- [ ] All E2E tests pass in CI
- [ ] Total E2E tests: 30+ passing

---

### **Phase 7: Performance & Production Readiness** (Week 6)
**Priority**: ✨ Nice to Have
**Dependencies**: All previous phases
**Estimated Effort**: 5-7 days

#### Deliverables:

1. **Performance Optimizations**
   - Batch API endpoint for node saves
   - Implement optimistic updates
   - Add loading skeletons
   - Lazy load components
   - Image optimization

2. **Test Coverage Reporting**
   - Configure Istanbul/NYC
   - Add coverage to CI workflow
   - Set coverage thresholds (80%+)
   - Add coverage badges to README

3. **Production Deployment Setup**
   - Environment configuration
   - Production database setup
   - SSL certificates
   - Domain configuration
   - Deploy to Vercel/Railway

4. **Monitoring & Error Tracking**
   - Set up Sentry for error tracking
   - Add performance monitoring
   - Configure logging
   - Set up uptime monitoring

5. **Documentation**
   - User guide
   - Developer documentation
   - API documentation
   - Deployment guide

#### Files to Create/Modify:
```
apps/mindmap-cms/
└── src/
    └── endpoints/
        └── batch-nodes.ts (new)

.github/workflows/
└── ci.yml (update)

docs/
├── USER_GUIDE.md (new)
├── DEPLOYMENT.md (new)
└── API.md (new)

README.md (update)
```

#### Acceptance Criteria:
- [ ] Batch API endpoint reduces save time by 50%+
- [ ] Test coverage is 80%+ across all packages
- [ ] Coverage reports in CI
- [ ] Application deployed to production
- [ ] Sentry captures errors
- [ ] Documentation is complete
- [ ] README has setup instructions and badges

---

## 📊 Progress Tracking

### Overall Completion Status

| Phase | Status | Progress | Tests | Priority |
|-------|--------|----------|-------|----------|
| Phase 1: Core Pages & Layout | ⏳ Not Started | 0% | 0/20 | 🚨 Critical |
| Phase 2: Editor UI | ⏳ Not Started | 0% | 0/15 | 🚨 Critical |
| Phase 3: Keyboard Shortcuts | ⏳ Not Started | 0% | 0/10 | 🚨 Critical |
| Phase 4: Sync Integration UI | ⏳ Not Started | 0% | 0/8 | ⚠️ Important |
| Phase 5: Authentication | ⏳ Not Started | 0% | 0/10 | 🚨 Critical |
| Phase 6: E2E Test Coverage | ⏳ Not Started | 0% | 2/30 | ⚠️ Important |
| Phase 7: Production Readiness | ⏳ Not Started | 0% | 0/10 | ✨ Nice to Have |

**Total Progress**: 0% of frontend work complete
**Total Tests**: 2/103 E2E tests passing
**Estimated Completion**: 4-6 weeks

---

## 🎯 Success Criteria

### MVP Definition of Done

**Must Have** (Phases 1-5):
- ✅ User can register and login
- ✅ User can create, view, and edit mindmaps
- ✅ User can add/edit/delete nodes with keyboard shortcuts
- ✅ User can save mindmaps to CMS
- ✅ User can create flashcards from nodes
- ✅ User can review flashcards with SRS
- ✅ All critical E2E tests pass
- ✅ Application is responsive (mobile, tablet, desktop)

**Should Have** (Phase 6):
- ✅ Complete E2E test coverage (30+ tests)
- ✅ Error handling and user feedback
- ✅ Offline detection
- ✅ Help documentation

**Nice to Have** (Phase 7):
- ✅ Performance optimizations
- ✅ Test coverage reporting
- ✅ Production deployment
- ✅ Monitoring and error tracking

---

## 🚀 Getting Started

### Prerequisites
- All backend packages complete (✅ Done)
- CMS running on port 3001 (✅ Done)
- MongoDB running (✅ Done)
- Node.js 20+ installed (✅ Done)

### Start with Phase 1

```bash
# 1. Create a new branch
git checkout -b feature/web-frontend-phase-1

# 2. Start development servers
npm run dev

# 3. Begin implementing Phase 1 deliverables
# - Update app/layout.tsx
# - Replace app/page.tsx
# - Create components/Header.tsx
# - Create components/MindmapList.tsx
# ... (see Phase 1 deliverables)

# 4. Write tests as you go
npm run test:watch

# 5. Run E2E tests
npm run test:e2e

# 6. Commit and push
git add .
git commit -m "feat: implement Phase 1 - Core Pages & Layout"
git push origin feature/web-frontend-phase-1
```

---

## 📝 Notes

### Development Principles
- **Test-Driven Development**: Write tests before implementation
- **Keyboard-First**: All features must work with keyboard
- **Mobile-First**: Design for mobile, enhance for desktop
- **Accessibility**: Follow WCAG 2.1 AA standards
- **Performance**: Optimize for Core Web Vitals

### Architecture Constraints
- **No modal dialogs**: Use inline editing and toasts
- **Explicit sync**: No auto-save on every keystroke
- **Local-first**: Editor works offline, syncs explicitly
- **Stable nodeIds**: Never modify nodeId after creation

### Tech Stack
- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **State**: Zustand + Immer
- **Canvas**: React Flow
- **Backend**: Payload CMS 3.76, MongoDB
- **Testing**: Vitest, Playwright, Testing Library

---

**Ready to start? Begin with Phase 1!** 🚀

