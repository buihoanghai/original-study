# Mindmap Learning App — Project Context (v2)

## 1. Product Axis (Non-negotiable)
This product exists to help users:
1. Organize knowledge
2. Learn deeply
3. Recall effectively

Any feature not directly supporting these goals is OUT OF SCOPE unless approved.

---

## 2. Product Philosophy
- MindMup-like: keyboard-first, speed, minimal UI
- Focus over features
- Local-first editor, content-driven CMS
- Tests before code
- AI executes, human decides

---

## 3. Architecture (LOCKED)
- Architecture style: Modular Monolith
- Repository: Single monorepo
- No microservices
- No realtime collaboration in MVP

Payload CMS is an external **content brain**, NOT editor logic.

Any service split requires an ADR.

---

## 4. Tech Stack (LOCKED)
- Next.js (App Router)
- TypeScript
- React Flow (canvas)
- Zustand (state)
- Payload CMS (content)
- Testing:
    - Unit: Vitest
    - E2E: Playwright

No alternative libraries unless explicitly approved.

---

## 5. Core Domains (Bounded Contexts)
- Editor Core: tree, hotkeys, undo/redo
- Content: node detail, versioning (Payload)
- Learning: flashcards, SRS
- Community: comments, moderation
- Sync: explicit editor ↔ CMS sync

Domains must not leak responsibilities.

---

## 6. UX Rules (Hard Rules)
- Keyboard-only usage must be possible
- No modal dialogs
- No blocking confirmations
- Reference edges hidden by default
- Only selected node shows active affordances
- Escape key controls focus hierarchy

---

## 7. Hotkey Canon (Stable Contract)
- Tab: add child
- Enter: add sibling
- Arrow keys: navigate
- F: collapse / expand
- Esc:
    - exit edit mode
    - then center root
- Ctrl/Cmd + Z: undo
- Ctrl/Cmd + Shift + Z: redo
- Ctrl/Cmd + +/-: zoom

Changing hotkeys requires ADR.

---

## 8. Quality Bar
- Every behavior change requires tests
- Hotkeys must be covered by E2E
- No refactor without contract
- No silent behavior change

---

## 9. AI Working Rules
AI MUST:
- Follow Task Contract
- Write BDD before code
- Add tests before implementation
- Stay within scope

AI MUST NOT:
- Guess requirements
- Expand scope
- Introduce new architecture patterns
