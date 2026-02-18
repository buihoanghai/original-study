# Task Contract: Mindmup-Style Visual Improvements

## Type
Feature

---

## Goal
Improve mindmap visual aesthetics with Mindmup-inspired styling: cleaner nodes with curved edges and sticky note annotations for brainstorming.

---

## Background
User requested visual improvements inspired by Mindmup's UI to make the mindmap more visually appealing and add annotation capabilities. Current implementation uses angular `smoothstep` edges and nodes with visible borders. Mindmup uses smooth bezier curves and cleaner node styling.

---

## Non-Goals
- **NO** changes to layout algorithm (keep dagre hierarchical layout)
- **NO** changes to data schema or Payload collections
- **NO** changes to existing node types (mindmapNode remains unchanged in functionality)
- **NO** changes to detail panel or flashcard panel
- **NO** refactoring of unrelated components

---

## Scope (Allowed Areas)
- `packages/editor/src/components/MindmapEditor.tsx` - Edge type configuration
- `packages/editor/src/components/NodeComponent.tsx` - Node styling updates
- `packages/editor/src/components/StickyNoteComponent.tsx` - NEW FILE for sticky notes
- `packages/editor/src/store/editorStore.ts` - Add sticky note actions
- `packages/editor/src/hooks/useHotkeys.ts` - Add Shift+N shortcut
- `packages/editor/src/types.ts` - Add sticky note type definitions (if needed)

Any change outside this scope is a violation.

---

## Acceptance Criteria (MANDATORY)

### Feature 1: Cleaner Nodes with Curved Edges

- [ ] **Given** a mindmap is displayed
  **When** I view the connections between nodes
  **Then** edges should use smooth bezier curves (not angular smoothstep)

- [ ] **Given** a node is not selected
  **When** I view the node
  **Then** it should have no visible border, softer shadow, and 12px border-radius

- [ ] **Given** a node is selected
  **When** I view the node
  **Then** it should have a 2px blue border and enhanced shadow

### Feature 2: Sticky Note Annotations

- [ ] **Given** I am viewing a mindmap
  **When** I press Shift+N
  **Then** a new sticky note should be created at the canvas center

- [ ] **Given** a sticky note exists
  **When** I double-click it
  **Then** I can edit the text content inline

- [ ] **Given** a sticky note is created
  **When** I view it
  **Then** it should have a yellow background, slight rotation (-2deg), and handwriting-style font

- [ ] **Given** multiple sticky notes exist
  **When** I create new ones
  **Then** they should cycle through colors (yellow, pink, blue, green)

---

## UX Rules
- **Hotkeys involved**: Shift+N to create sticky note
- **Focus behavior**: Double-click sticky note to edit, click outside to save
- **Visual constraints**:
  - Sticky notes: 200px x 200px, slight rotation, no connection handles
  - Node border-radius: 12px (increased from 8px)
  - Edges: bezier curves only (except reference edges which stay straight)
  - Sticky notes should not connect to other nodes

---

## Data / Schema Impact
None - This is purely a visual/UI change. No database schema changes required.

---

## Payload Impact
None - No changes to Payload CMS collections or API.

---

## Test Requirements
- **Unit tests**:
  - Test sticky note component renders with correct styling
  - Test sticky note color cycling logic
  - Test editorStore.addStickyNote action
- **Integration tests**:
  - Test Shift+N hotkey creates sticky note
  - Test double-click enables editing mode
- **E2E (Playwright)**:
  - Visual regression test for node styling changes
  - Test sticky note creation and editing workflow

---

## Constraints
- Must follow docs/CONTEXT.md
- No refactor outside scope
- Keep PR small and focused (≤ 5 files changed, ≤ 200 LOC)
- Sticky notes are separate from mindmap nodes (different node type)
- No breaking changes to existing mindmap functionality

---

## Definition of Done
- [x] Acceptance Criteria satisfied
- [ ] Tests added and passing
- [ ] No scope violation
- [ ] Manual UX check completed
- [ ] Edges use bezier curves
- [ ] Nodes have cleaner styling (no border when unselected)
- [ ] Sticky notes can be created with Shift+N
- [ ] Sticky notes are editable and visually distinct

