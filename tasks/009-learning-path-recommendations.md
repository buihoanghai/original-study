# Task 009: Learning Path Recommendation Engine

**Status**: 📝 PENDING APPROVAL  
**Owner**: AI Agent  
**Created**: 2026-02-15  
**Dependencies**: Task 001 (Domain Models), Task 008 (Skill Progress Tracking)

---

## Type
**Feature** - Learning enhancement

---

## Goal

Implement a learning path recommendation system that suggests "What should I learn next?" based on skill prerequisites, current progress, and topological ordering of the skill tree.

**User-facing outcome**: Users see recommended next skills, prerequisite chains are highlighted, and skills are locked until prerequisites are completed.

---

## Background

The current mindmap system shows skill relationships through parent-child edges, but lacks:
1. **Prerequisite enforcement** - No distinction between "parent-child" and "prerequisite" relationships
2. **Learning path guidance** - No suggestions for what to learn next
3. **Dependency visualization** - Can't see prerequisite chains for a skill
4. **Smart ordering** - No topological sort for optimal learning sequence

This task adds prerequisite edge types and a recommendation algorithm to guide learning progression.

---

## Non-Goals

**Explicitly OUT of scope**:
- ❌ AI/ML-based recommendations (use rule-based algorithm)
- ❌ Personalized learning styles
- ❌ Skill difficulty estimation
- ❌ Time-based recommendations
- ❌ Collaborative filtering ("users who learned X also learned Y")
- ❌ External course/resource recommendations
- ❌ Adaptive difficulty adjustment
- ❌ Multi-path optimization
- ❌ Refactoring existing edge logic

---

## Scope (Allowed Areas)

### New Files (to be created):
**Domain Types**:
- `packages/domain/src/types/prerequisite.ts`

**Utilities**:
- `packages/domain/src/utils/topological-sort.ts`
- `packages/domain/src/utils/path-finder.ts`

**Frontend Components**:
- `apps/mindmap-web/components/LearningPathPanel.tsx`
- `apps/mindmap-web/components/PrerequisiteChain.tsx`
- `apps/mindmap-web/components/NextSkillSuggestion.tsx`

**API Client**:
- `apps/mindmap-web/lib/path-api.ts`

### Modified Files (existing):
- `packages/domain/src/types/tree.ts` (add prerequisite edge type)
- `packages/domain/src/index.ts` (export new types)
- `packages/editor/src/components/MindmapEditor.tsx` (highlight prerequisite edges)
- `apps/mindmap-web/app/mindmaps/[id]/page.tsx` (add learning path panel)

**Any change outside this scope is a violation.**

---

## Acceptance Criteria (MANDATORY)

### AC1: Add prerequisite edge type
- [ ] **Given** a user creates an edge between two nodes
  **When** they set the edge type to "prerequisite"
  **Then** the edge is stored with type="prerequisite" and required=true/false

### AC2: Recommend next skill based on prerequisites
- [ ] **Given** a user has completed some skills
  **When** they click "What should I learn next?"
  **Then** the system shows skills where all hard prerequisites are completed

### AC3: Highlight prerequisite chain
- [ ] **Given** a user selects a skill node
  **When** they press `P` key
  **Then** all prerequisite nodes are highlighted in the graph

### AC4: Lock skills until prerequisites completed
- [ ] **Given** a skill has hard prerequisites
  **When** the user views the skill and prerequisites are incomplete
  **Then** the skill shows a lock icon and tooltip "Complete [X, Y] first"

### AC5: Topological sort for learning order
- [ ] **Given** a skill tree with prerequisite edges
  **When** the user requests "Show learning path"
  **Then** skills are ordered using topological sort (prerequisites before dependents)

### AC6: Distinguish hard vs soft prerequisites
- [ ] **Given** a prerequisite edge with required=false
  **When** calculating recommendations
  **Then** soft prerequisites are suggested but not enforced

---

## UX Rules

**Keyboard shortcuts**:
- `Ctrl+Shift+P` - Toggle learning path panel
- `P` - Highlight prerequisite chain for selected node
- `N` - Jump to next recommended skill

**Visual constraints**:
- Prerequisite edges: Dashed line (vs solid for parent-child)
- Hard prerequisites: Red dashed line
- Soft prerequisites: Orange dashed line
- Locked skills: Gray overlay with lock icon
- Recommended skills: Green glow effect

**Focus behavior**:
- Learning path panel opens as slide-in from left
- Clicking a recommended skill selects it in the graph
- Esc closes learning path panel

---

## Data / Schema Impact

**New domain type** (`packages/domain/src/types/prerequisite.ts`):
```typescript
export interface PrerequisiteEdge extends NodeEdge {
  type: 'prerequisite'
  required: boolean  // true = hard prerequisite, false = soft
  weight?: number    // Importance 1-10 (optional)
}
```

**Extended EdgeType** (`packages/domain/src/types/tree.ts`):
```typescript
export type EdgeType = 'parent-child' | 'reference' | 'prerequisite'

export interface NodeEdge {
  from: string
  to: string
  type: EdgeType
  required?: boolean  // Only for prerequisite edges
  weight?: number     // Only for prerequisite edges
}
```

---

## Payload Impact

**Collections affected**:
- None (edges are stored in mindmap structure, not separate collection)

**Read/Write behavior**:
- Read: Fetch edges with type information
- Write: Update edge type when user changes it

**Versioning impact**: None

**Permissions**: Inherit from parent mindmap (no change)

---

## Test Requirements

**Unit tests**:
- `packages/domain/src/utils/topological-sort.test.ts` - Test topological sort algorithm
- `packages/domain/src/utils/path-finder.test.ts` - Test prerequisite chain finding
- Test recommendation algorithm with various skill states

**Integration tests**:
- Test prerequisite edge creation via API
- Test recommendation calculation
- Test prerequisite chain highlighting

**E2E (Playwright)**:
- `tests/e2e/learning-path.spec.ts`:
  - Create prerequisite edge → verify dashed line
  - Complete prerequisite → verify dependent unlocks
  - Click "Next skill" → verify recommendation shown
  - Press P key → verify prerequisite chain highlights
  - Keyboard shortcuts work (Ctrl+Shift+P, P, N)

---

## Constraints

- Must follow `docs/CONTEXT.md`
- No refactor outside scope
- Keep PR small and focused (≤ 5 files changed, ≤ 200 LOC)
- No breaking changes to existing edge structure
- Prerequisite edges are optional (backward compatible)
- Algorithm must handle cycles gracefully (detect and warn)

---

## Definition of Done

- [ ] Acceptance Criteria satisfied
- [ ] Tests added and passing (`npm run test`)
- [ ] E2E tests passing (`npm run test:e2e`)
- [ ] No scope violation
- [ ] Manual UX check completed
- [ ] Documentation updated (if needed)
- [ ] PR checklist completed

