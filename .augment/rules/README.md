# Augment AI Rules

This directory contains workspace rules that are automatically loaded by Augment AI in every chat session.

## File Structure

- **00-context.md** - Project constitution (architecture, tech stack, core rules)
  - Type: `always` - Automatically loaded in every session
  
- **01-how-ai-works.md** - AI working guidelines and mandatory workflow
  - Type: `always` - Automatically loaded in every session
  
- **02-task-template.md** - Task Contract template format
  - Type: `manual` - Load with `@02-task-template.md` when creating tasks
  
- **03-pr-checklist.md** - PR checklist before completion
  - Type: `always` - Automatically loaded in every session
  
- **04-ai-dod.md** - AI Definition of Done statement
  - Type: `always` - Automatically loaded in every session

- **05-debug-workflow.md** - Debug workflow for bug fixes (Repro → Trace → Fix → Verify)
  - Type: `always` - Automatically loaded in every session

- **06-e2e-testing.md** - E2E testing workflow (Run all → List errors → Fix one by one)
  - Type: `always` - Automatically loaded in every session

## Rule Types

- **always**: Automatically included in every AI prompt
- **manual**: Must be manually attached via `@filename` in chat
- **auto**: AI automatically detects and attaches based on description

## Usage

These rules are automatically available to Augment AI. No manual copying needed.

For new tasks, you can reference the task template with:
```
@02-task-template.md
```

## Source

These rules are derived from the documentation in `/docs/`:
- `docs/CONTEXT.md`
- `docs/How-AI-work.md`
- `docs/TASK_TEMPLATE.md`
- `docs/PR_CHECKLIST.md`
- `docs/AI-DOD.md`

