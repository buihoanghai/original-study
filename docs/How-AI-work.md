
---

# 🤖 How AI Works in This Repo

> This repository is designed for **AI-assisted development**.
> AI is an executor, not a decision-maker.
> Human approval is mandatory.

---

## 1. Core Principle

AI works under **strict contracts**.
There is **no free-form coding** in this repository.

If a task does not follow the defined process, it must not be executed.

---

## 2. Authority Model

| Role          | Responsibility                              |
| ------------- | ------------------------------------------- |
| Human (Owner) | Product intent, UX judgment, final approval |
| AI            | Execute tasks exactly as specified          |
| Tests         | Enforce behavior                            |
| Documents     | Enforce rules                               |

AI must always defer to written rules.

---

## 3. Mandatory Documents (Non-Negotiable)

Before any work starts, AI MUST read and follow:

1. `docs/CONTEXT.md` — Project Constitution
2. `docs/TASK_TEMPLATE.md` — Task Contract format
3. `docs/PR_CHECKLIST.md` — Definition of Done

If any of these documents are missing or unclear, AI must stop and request clarification.

---

## 4. Allowed Work Flow (STRICT)

Every task must follow this sequence:

```
Task Contract
 ↓
BDD Scenarios (Given / When / Then)
 ↓
Test Plan (unit / e2e)
 ↓
Tests (written first)
 ↓
Implementation
 ↓
Self-check via PR_CHECKLIST
 ↓
Human verification
```

Skipping any step is a violation.

---

## 5. Task Entry Rules

AI must NOT start work unless:

* A Task Contract exists
* Acceptance Criteria are explicit
* Scope is defined

If a task request is vague, AI must respond with:

> “A valid Task Contract is required before proceeding.”

---

## 6. Scope Control

AI may ONLY modify files explicitly listed in the Task Contract.

Any change outside scope, even if “helpful”, is a violation.

---

## 7. Tests Are Mandatory

* Every behavior change requires tests
* User-facing behavior must be covered by Playwright
* Hotkeys must always have E2E coverage
* Bug fixes must include a failing test first

No tests = no fix.

---

## 8. Architecture Enforcement

* Architecture style: **Modular Monolith**
* No microservices
* No realtime systems in MVP
* Payload CMS is a content system, not editor logic

Any architectural change requires an ADR.

---

## 9. Payload CMS Rules

AI MUST:

* Propose schema changes before use
* Keep `nodeId` stable
* Respect versioning and permissions

AI MUST NOT:

* Control editor behavior via CMS
* Implement undo/redo in CMS
* Auto-sync per keystroke

---

## 10. Bug Handling Rules

Bugs are treated as tasks.

A bug fix MUST:

1. Have a Task Contract (Type = Bug)
2. Include reproduction steps
3. Add a failing test
4. Fix the root cause
5. Avoid refactoring

Quick fixes without tests are not allowed.

---

## 11. Definition of "DONE"

AI is **NOT allowed** to declare work as DONE.

AI may only state:

> **“Implementation is complete and ready for human verification.
> All changes comply with `docs/CONTEXT.md`, follow the approved `Task Contract`, and pass every item in `docs/PR_CHECKLIST.md`.
> This work is not considered DONE until manually verified and approved.”**

Only the human owner can declare DONE.

---

## 12. Enforcement Language

If AI violates any rule, the human may respond with:

* “Violation of CONTEXT.md”
* “Violation of Task Contract”
* “Violation of PR_CHECKLIST.md”

AI must immediately stop and correct its work.

---

## 13. Contributor Rules (Human or AI)

* No guessing requirements
* No silent behavior changes
* No scope creep
* No refactoring without approval

This repository values **correctness and focus** over speed.

---

## 14. Success Criteria

This system is successful when:

* AI produces predictable, correct output
* Humans only verify UX and intent
* No architectural drift occurs
* The codebase remains calm and understandable

---

## Final Statement

> **AI executes.
> Documents decide.
> Humans approve.**

---
