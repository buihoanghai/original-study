# Task 012: Project-Skill Mapping System

**Status**: 📝 PENDING APPROVAL  
**Owner**: AI Agent  
**Created**: 2026-02-15  
**Dependencies**: Task 001 (Domain Models), Task 008 (Skill Progress Tracking)

---

## Type
**Feature** - Learning enhancement

---

## Goal

Enable users to create learning projects that map to required skills, providing project-based learning paths and skill gap analysis.

**User-facing outcome**: Users can create projects (e.g., "Build REST API"), link required/optional skills, see skill gaps, and track project completion.

---

## Background

The current mindmap system focuses on individual skill learning, but lacks:
1. **Project-based learning** - No way to group skills into practical projects
2. **Skill gap analysis** - Can't see which skills are missing for a project
3. **Learning motivation** - No concrete goals beyond individual skills
4. **Portfolio tracking** - No record of completed projects

This task adds a project entity with many-to-many relationships to skills, enabling project-based learning paths.

---

## Non-Goals

**Explicitly OUT of scope**:
- ❌ Project templates or starter code
- ❌ Code repository integration (GitHub, GitLab)
- ❌ Project collaboration features
- ❌ Project deployment or hosting
- ❌ AI-generated project ideas
- ❌ Project difficulty estimation algorithms
- ❌ External course/tutorial integration
- ❌ Project reviews or feedback
- ❌ Refactoring existing mindmap structure

---

## Scope (Allowed Areas)

### New Files (to be created):
**Domain Types**:
- `packages/domain/src/types/project.ts`

**CMS Collections**:
- `apps/mindmap-cms/src/collections/LearningProjects.ts`
- `apps/mindmap-cms/src/collections/ProjectSkills.ts` (join table)

**Frontend Components**:
- `apps/mindmap-web/components/ProjectCard.tsx`
- `apps/mindmap-web/components/ProjectEditor.tsx`
- `apps/mindmap-web/components/SkillGapAnalysis.tsx`
- `apps/mindmap-web/components/ProjectList.tsx`

**Pages**:
- `apps/mindmap-web/app/projects/page.tsx`
- `apps/mindmap-web/app/projects/[id]/page.tsx`

**API Client**:
- `apps/mindmap-web/lib/project-api.ts`

### Modified Files (existing):
- `packages/domain/src/index.ts` (export new types)
- `apps/mindmap-cms/src/payload.config.ts` (register new collections)
- `apps/mindmap-web/app/layout.tsx` (add Projects navigation link)
- `packages/editor/src/components/MindmapNode.tsx` (show project badges)

**Any change outside this scope is a violation.**

---

## Acceptance Criteria (MANDATORY)

### AC1: Create learning project
- [ ] **Given** a user is on the projects page
  **When** they click "Create Project" and fill in title, description, difficulty
  **Then** a new project is created and saved

### AC2: Link required skills to project
- [ ] **Given** a user is editing a project
  **When** they select skills from the mindmap as "required"
  **Then** those skills are linked to the project with required=true

### AC3: Link optional skills to project
- [ ] **Given** a user is editing a project
  **When** they select skills from the mindmap as "optional"
  **Then** those skills are linked to the project with required=false

### AC4: Show skill gap analysis
- [ ] **Given** a project has required skills
  **When** the user views the project
  **Then** skill gap shows: Completed (X), In Progress (Y), Not Started (Z)

### AC5: Display project badges on skill nodes
- [ ] **Given** a skill is linked to one or more projects
  **When** the user views the mindmap
  **Then** the skill node shows a project badge with count (e.g., "📁 3")

### AC6: Track project completion
- [ ] **Given** a project has required skills
  **When** all required skills are marked "completed"
  **Then** project status auto-updates to "completed"

---

## UX Rules

**Keyboard shortcuts**:
- `Ctrl+Shift+P` - Open projects panel (from mindmap view)
- `P` - Toggle project selection mode (select skills for project)

**Visual constraints**:
- Project card: 300x200px, shows title, description, progress bar, difficulty badge
- Difficulty badges: Junior (Green), Mid (Blue), Senior (Purple)
- Progress bar: Shows % of required skills completed
- Project badge on nodes: 16x16px folder icon with count

**Focus behavior**:
- Project editor opens as modal overlay
- Skill selection mode highlights selectable nodes
- Clicking skill in gap analysis selects it in mindmap
- Esc closes project editor

---

## Data / Schema Impact

**New domain type** (`packages/domain/src/types/project.ts`):
```typescript
export interface LearningProject {
  id: string
  title: string
  description: string
  difficulty: 'Junior' | 'Mid' | 'Senior'
  status: 'not-started' | 'in-progress' | 'completed'
  estimatedHours: number
  requiredSkills: string[]  // nodeIds
  optionalSkills: string[]  // nodeIds
  owner: string
  createdAt: Date
  updatedAt: Date
}

export interface ProjectSkillLink {
  projectId: string
  nodeId: string
  required: boolean
  order: number  // For display ordering
}

export interface SkillGap {
  total: number
  completed: number
  inProgress: number
  notStarted: number
  percentage: number
}
```

**New CMS Collections**:
- `learning-projects` - Stores project metadata
- `project-skills` - Join table for many-to-many relationship

---

## Payload Impact

**Collections affected**:
- `learning-projects` - New collection
- `project-skills` - New collection (join table)

**Read/Write behavior**:
- Read: Fetch projects with linked skills
- Write: Create/update projects and skill links
- Aggregate: Calculate completion percentage from skill statuses

**Versioning impact**: None (projects are not versioned)

**Permissions**: 
- Users can only read/write their own projects
- Skill links inherit project ownership

---

## Test Requirements

**Unit tests**:
- Test project creation and validation
- Test skill gap calculation
- Test project completion detection
- Test required vs optional skill logic

**Integration tests**:
- Test project creation via API
- Test skill linking
- Test gap analysis calculation
- Test project status updates

**E2E (Playwright)**:
- `tests/e2e/project-skill-mapping.spec.ts`:
  - Create project → verify saved
  - Link required skills → verify gap analysis updates
  - Complete all required skills → verify project auto-completes
  - View mindmap → verify project badges on nodes
  - Keyboard shortcuts work (Ctrl+Shift+P, P)

---

## Constraints

- Must follow `docs/CONTEXT.md`
- No refactor outside scope
- Keep PR small and focused (≤ 5 files changed, ≤ 200 LOC)
- No breaking changes to existing node structure
- Projects are independent of mindmaps (can link to any skill)
- Many-to-many relationship (one skill can be in multiple projects)
- Skill links are soft references (deleting skill doesn't delete project)

---

## Definition of Done

- [ ] Acceptance Criteria satisfied
- [ ] Tests added and passing (`npm run test`)
- [ ] E2E tests passing (`npm run test:e2e`)
- [ ] No scope violation
- [ ] Manual UX check completed
- [ ] Documentation updated (if needed)
- [ ] PR checklist completed

