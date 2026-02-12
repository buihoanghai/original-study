# Task Contract: Build Editor Core

## Type
Feature

---

## Goal
Implement the core mindmap editor with keyboard-first UX, tree operations, and sync integration using React Flow and Zustand.

---

## Background
Tasks 001-003 established domain types, CMS collections, and sync functionality. Now we need to build the actual editor that users will interact with.

Per project rules (`docs/CONTEXT.md`):
- **Keyboard-first** - All operations must be possible via keyboard
- **MindMup-like** - Speed, minimal UI, focus over features
- **Local-first** - Editor works offline, syncs explicitly
- **No modal dialogs** - No blocking confirmations
- **Hotkey Canon** - Tab (child), Enter (sibling), Arrow keys (navigate), F (collapse), Esc (exit/center), Ctrl+Z (undo)

---

## Non-Goals
- ❌ No realtime collaboration (MVP)
- ❌ No rich text editing (plain text only for MVP)
- ❌ No drag-and-drop (keyboard-first, mouse is secondary)
- ❌ No auto-save (explicit sync only)
- ❌ No flashcard UI (that's a separate feature)
- ❌ No comment UI (that's a separate feature)
- ❌ No export functionality (future task)

---

## Scope (Allowed Areas)
Files allowed to change:
- `packages/editor/src/store/` (new directory - Zustand store)
- `packages/editor/src/components/` (new directory - React components)
- `packages/editor/src/hooks/` (new directory - React hooks)
- `packages/editor/src/operations/` (new directory - tree operations)
- `packages/editor/src/types.ts` (new - editor-specific types)
- `packages/editor/src/index.ts` (update exports)
- `packages/editor/package.json` (add dependencies)
- `packages/editor/tsconfig.json` (if needed)
- `packages/editor/src/__tests__/` (new directory for tests)

Any change outside this scope is a violation.

---

## Acceptance Criteria (MANDATORY)

### AC1: Tree State Management
- [ ] **Given** a mindmap editor
      **When** initialized
      **Then** it must use Zustand for state management
      **And** state must include: nodes, edges, selectedNodeId, focusMode
      **And** state must use domain types from `@mindmap/domain`

### AC2: Keyboard Navigation
- [ ] **Given** a mindmap with multiple nodes
      **When** user presses Arrow keys
      **Then** focus must move to adjacent nodes (up/down/left/right)
      **And** navigation must follow tree structure

### AC3: Add Child Node (Tab)
- [ ] **Given** a selected node
      **When** user presses Tab
      **Then** a new child node must be created
      **And** focus must move to the new node
      **And** node must enter edit mode

### AC4: Add Sibling Node (Enter)
- [ ] **Given** a selected node
      **When** user presses Enter
      **Then** a new sibling node must be created at the same level
      **And** focus must move to the new node
      **And** node must enter edit mode

### AC5: Edit Mode (Esc to exit)
- [ ] **Given** a node in edit mode
      **When** user presses Esc
      **Then** edit mode must exit
      **And** changes must be saved to state
      **When** user presses Esc again
      **Then** canvas must center on root node

### AC6: Collapse/Expand (F key)
- [ ] **Given** a node with children
      **When** user presses F
      **Then** node must toggle between collapsed and expanded
      **And** children visibility must update

### AC7: Undo/Redo
- [ ] **Given** user has made changes
      **When** user presses Ctrl+Z
      **Then** last change must be undone
      **When** user presses Ctrl+Shift+Z
      **Then** last undo must be redone

### AC8: Sync Integration
- [ ] **Given** a mindmap with changes
      **When** user triggers save (Ctrl+S)
      **Then** SyncClient must save mindmap and nodes to CMS
      **And** stable nodeIds must be preserved
      **When** user triggers load
      **Then** SyncClient must load mindmap and nodes from CMS

---

## UX Rules (MANDATORY)
- ✅ Keyboard-only usage must be possible
- ✅ No modal dialogs
- ✅ No blocking confirmations
- ✅ Reference edges hidden by default
- ✅ Only selected node shows active affordances
- ✅ Escape key controls focus hierarchy (exit edit → center root)

---

## Hotkey Canon (MANDATORY)
- **Tab**: add child node
- **Enter**: add sibling node
- **Arrow keys**: navigate tree
- **F**: collapse / expand node
- **Esc**: exit edit mode → center root
- **Ctrl/Cmd + Z**: undo
- **Ctrl/Cmd + Shift + Z**: redo
- **Ctrl/Cmd + S**: save to CMS
- **Ctrl/Cmd + +/-**: zoom

---

## Data / Schema Impact

### Editor State (Zustand):
```typescript
interface EditorState {
  // Tree data
  nodes: MindmapNode[]
  edges: NodeEdge[]
  
  // UI state
  selectedNodeId: string | null
  editingNodeId: string | null
  collapsedNodeIds: Set<string>
  
  // History
  history: EditorState[]
  historyIndex: number
  
  // Operations
  addChild: (parentId: string) => void
  addSibling: (nodeId: string) => void
  updateNode: (nodeId: string, content: NodeContent) => void
  deleteNode: (nodeId: string) => void
  toggleCollapse: (nodeId: string) => void
  undo: () => void
  redo: () => void
  
  // Sync
  save: () => Promise<void>
  load: (mindmapId: string) => Promise<void>
}
```

---

## Test Requirements

### Unit tests:
- `packages/editor/src/__tests__/store.test.ts`
  - Test state initialization
  - Test tree operations (add child, add sibling, delete)
  - Test undo/redo
  
- `packages/editor/src/__tests__/operations.test.ts`
  - Test tree traversal
  - Test node positioning
  - Test collapse/expand logic

### E2E tests (Playwright):
- `packages/editor/e2e/hotkeys.spec.ts`
  - Test all hotkeys (Tab, Enter, Arrow keys, F, Esc, Ctrl+Z, Ctrl+S)
  - Test keyboard navigation
  - Test edit mode flow

---

## Constraints
- Must use React Flow for canvas
- Must use Zustand for state management
- Must use domain types from `@mindmap/domain`
- Must use SyncClient from `@mindmap/sync`
- Must follow hotkey canon (no changes without ADR)
- Must support keyboard-only usage
- No modal dialogs
- Keep PR focused on core editor (no flashcards, no comments)

---

## Definition of Done
- [ ] Acceptance Criteria satisfied
- [ ] Unit tests added and passing
- [ ] E2E tests for all hotkeys
- [ ] Type checking passes
- [ ] No scope violation
- [ ] All exports from `packages/editor/src/index.ts`
- [ ] No linting errors
- [ ] Code formatted
- [ ] Documentation comments added

