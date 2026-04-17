# Ralph Wiggum Loop + OpenSpec — Workflow Guide

> **One task. Fresh context. Ship it. Repeat.**
>
> This is an AI-driven development approach where you describe what you want,
> the AI creates a structured plan, and then builds it one task at a time —
> with a fresh context window on every iteration.

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Prerequisites](#prerequisites)
3. [Creating a New Project](#creating-a-new-project)
4. [Phase 1 — Planning with OpenSpec](#phase-1--planning-with-openspec)
5. [Phase 2 — Building with the Ralph Loop](#phase-2--building-with-the-ralph-loop)
6. [Tracking Progress](#tracking-progress)
7. [Adding a New Feature or Bug Fix](#adding-a-new-feature-or-bug-fix)
8. [Phase 3 — Archiving When Done](#phase-3--archiving-when-done)
9. [Tuning Ralph When Things Go Wrong](#tuning-ralph-when-things-go-wrong)
10. [Quick Reference](#quick-reference)

---

## Core Concepts

The approach combines two tools:

| Tool | Role | When you use it |
|---|---|---|
| **OpenSpec** | Planning. Turns your description into a structured plan (`tasks.md`). | Before building — once per feature |
| **Ralph Wiggum loop** | Building. Picks one task, implements it, commits, stops. Repeat. | During building — automated loop |
| **GitHub Copilot CLI** | The AI engine that powers both. | Both phases |

**Why "Ralph Wiggum"?** Ralph is the kid who does one thing, not three. The loop enforces that: one task, one commit, fresh context. This prevents the AI from going off the rails with a massive context window full of previous mistakes.

**Why fresh context every iteration?** LLMs degrade over long sessions. By restarting after every task, Ralph always starts sharp. The shared state — what's been done, what's next — lives in `tasks.md` on disk, not in the model's memory.

---

## Prerequisites

Install once on your machine:

```powershell
# GitHub Copilot CLI
winget install GitHub.Copilot

# OpenSpec (requires Node.js)
npm install -g @fission-ai/openspec@latest

# GitHub CLI (for publishing)
winget install GitHub.cli
gh auth login
```

You also need an **active GitHub Copilot subscription**.

---

## Creating a New Project

Use the built-in `new-rw-project` skill to scaffold everything automatically.

**Open Copilot CLI from any folder:**

```powershell
copilot
```

**Then type:**

```
Use the new-rw-project skill
```

Copilot will ask you:
- **Project name** — kebab-case, e.g. `my-todo-app`
- **Project type** — `p5js` or `blazor-aspire`
- **Visibility** — `public` or `private`

The skill creates `C:\data\<projectname>\` and sets up:
- `AGENTS.md` — project conventions (auto-loaded by Copilot CLI)
- `loop.ps1` — the Ralph loop script
- `.github/agents/ralph.agent.md` — the Ralph build agent
- `.github/skills/openspec-*/` — OpenSpec planning skills
- Git repo initialized + published to GitHub

**Close Copilot CLI** (Ctrl+C or `/exit`), then navigate to your project:

```powershell
cd C:\data\<projectname>
```

---

## Phase 1 — Planning with OpenSpec

OpenSpec turns your plain-English description into a structured plan that Ralph can execute.

### Step 1 — Open Copilot CLI in your project folder

```powershell
cd C:\data\<projectname>
copilot
```

### Step 2 — Describe your feature

Type this in Copilot CLI (adapt the description to your feature):

```
Use the /openspec-propose skill to propose a new change.
I want to build: <your description here>
```

**Example:**
```
Use the /openspec-propose skill to propose a new change.
I want to build a todo app where users can add, complete, and delete todos.
Todos should be stored in localStorage. Dark theme, minimal design.
```

OpenSpec will:
1. Ask a few clarifying questions
2. Generate a structured plan in `openspec/changes/<feature-name>/`:
   ```
   openspec/changes/<feature-name>/
   ├── proposal.md    <- what and why
   ├── specs/         <- detailed requirements
   ├── design.md      <- technical approach
   └── tasks.md       <- the checklist Ralph will execute  <-- THIS IS THE PLAN
   ```

### Step 3 — Review and edit the plan

**Close Copilot CLI** (Ctrl+C or `/exit`).

Open `openspec/changes/<feature-name>/tasks.md` and read it carefully:

```
- [ ] Create index.html with p5.js CDN import
- [ ] Implement addTodo() function in sketch.js
- [ ] Render todo list on canvas
- [ ] Implement completeTodo() with strikethrough
- [ ] Implement deleteTodo() with trash icon
- [ ] Persist todos to localStorage
```

You are in charge of this list. You can:
- ✅ Add tasks you think are missing
- ✏️ Rephrase tasks to be clearer
- 🗑️ Remove tasks you don't need
- 📌 Add dependency hints: `*(requires: X already done)*`

> **Tip:** The quality of `tasks.md` directly determines the quality of what Ralph builds.
> Vague tasks = vague code. Specific tasks = specific code.

---

## Phase 2 — Building with the Ralph Loop

Once `tasks.md` is ready, start the loop. **No Copilot CLI needed — the loop handles it.**

### Step 1 — Start the loop

```powershell
.\loop.ps1
```

Or with a maximum number of iterations:

```powershell
.\loop.ps1 5    # stop after 5 tasks, continue manually later
```

### What the loop does — one full iteration

```
1. loop.ps1 reads tasks.md → shows the next open task as a preview
2. loop.ps1 starts: copilot --experimental --yolo --agent ralph --prompt "implement the next task"
3. Ralph agent:
   a. Reads proposal.md and specs/ to understand requirements
   b. Reads ALL existing source files (never assumes what's there)
   c. Implements the task — minimal, working code
   d. Validates: build + tests, or syntax check for p5.js
   e. Updates tasks.md: marks task as done (- [x])
   f. Makes ONE git commit: "feat: <summary> [task-N]"
   g. Stops
4. loop.ps1 pushes to GitHub
5. loop.ps1 repeats for the next task
```

### Step 2 — Watch it run

You don't need to do anything during the loop. But you can watch:
- The terminal shows which task is being worked on and how many remain
- Git commits appear on GitHub in real time
- You can open the app while it builds (for p5.js: `npx serve .` in a second terminal)

### Step 3 — Stop if something goes wrong

Press **Ctrl+C** to stop the loop at any time.

Then:
1. Check what Ralph did: `git log --oneline -5`
2. Edit `tasks.md` if a task needs to be split or rephrased
3. Edit the code directly if Ralph made a mistake
4. Restart the loop: `.\loop.ps1`

---

## Tracking Progress

### In tasks.md

The source of truth is `tasks.md`. Open it any time:

```
- [x] Create index.html with p5.js CDN import       <- done
- [x] Implement addTodo() function                   <- done
- [ ] Render todo list on canvas                     <- next up
- [ ] Implement completeTodo() with strikethrough    <- pending
- [ ] Implement deleteTodo()                         <- pending
```

The loop also prints remaining task count in its output:

```
══════════ LOOP 3  (4 tasks remaining) ══════════
```

### In git log

Every completed task = one commit. Check the history:

```powershell
git log --oneline
```

Output:
```
a1b2c3d feat: render todo list on canvas [task-3]
e4f5g6h feat: implement addTodo() [task-2]
i7j8k9l feat: create index.html with p5.js CDN import [task-1]
```

### On GitHub

All commits are pushed after every task. Go to your repo's commit history to see the full timeline.

---

## Adding a New Feature or Bug Fix

### Small fix — add directly to tasks.md

Open `openspec/changes/<feature-name>/tasks.md` and add a line:

```
- [ ] Fix: completed todos reappear after page refresh
```

Then run `.\loop.ps1` — Ralph picks it up.

### New feature — create a new change with OpenSpec

```powershell
cd C:\data\<projectname>
copilot
```

```
Use the /openspec-propose skill to propose a new change.
I want to add: <description of the new feature>
```

OpenSpec creates a new folder `openspec/changes/<new-feature-name>/` with its own `tasks.md`.

**Close Copilot CLI**, review `tasks.md`, then `.\loop.ps1`.

> The loop automatically picks up tasks from **all** open changes (all `tasks.md` files not in `archive/`).

---

## Phase 3 — Archiving When Done

When all tasks in a change are checked off (`- [x]`), archive the change to keep the workspace clean.

### When to archive

Archive when:
- ✅ All tasks in a change are done (`- [x]`)
- ✅ The feature works end-to-end
- ✅ Everything is committed and pushed

Do **not** archive if there are still open tasks — even one.

### How to archive

Open Copilot CLI in your project folder:

```powershell
copilot
```

Then type:

```
Use the /openspec-archive-change skill to archive the <feature-name> change
```

OpenSpec moves the folder from `openspec/changes/<feature-name>/` to `openspec/archive/<feature-name>/`.

The archived specs are preserved for future reference — they document *why* certain decisions were made.

### After archiving

```powershell
# Commit the archive operation
git add -A
git commit -m "chore: archive <feature-name> change"
git push
```

---

## Tuning Ralph When Things Go Wrong

The Ralph Wiggum loop is "tuned like a guitar." When Ralph goes off track, add guardrails.

### Ralph is bundling multiple tasks

Add this to `.github/agents/ralph.agent.md` invariants:

```
- **9990** -- Pick the FIRST unchecked task in tasks.md. Do not choose based on importance.
```

### Ralph ignores existing code

Check invariant 9998. If it keeps happening, add a step to the Workflow section:

```
3. **Investigate** -- Run a file listing first: list all source files. Read each one completely before writing anything.
```

### Ralph uses wrong conventions (e.g. wrong variable names for p5.js)

Add the specific violation to `AGENTS.md` under "Operational Learnings":

```
## Operational Learnings
- [2026-04-10] Ralph used `width` as a variable name — p5.js reserved. Always use `canvasW` instead.
```

### Ralph makes the same mistake repeatedly

Add an explicit "never do X" invariant to `ralph.agent.md`:

```
- **9989** -- Never use `document.getElementById` for p5.js canvas operations. Use p5 API only.
```

---

## Quick Reference

### First time — new project

```powershell
copilot
# → "Use the new-rw-project skill"
# → answer questions
# → Ctrl+C / exit

cd C:\data\<projectname>
```

### Start a new feature

```powershell
copilot
# → "Use the /openspec-propose skill. I want to build: <description>"
# → review generated tasks.md
# → Ctrl+C / exit

# Edit tasks.md if needed, then:
.\loop.ps1
```

### Check progress

```powershell
# In tasks.md:
cat openspec\changes\<feature>\tasks.md

# In git:
git log --oneline
```

### Archive a finished feature

```powershell
copilot
# → "Use the /openspec-archive-change skill to archive the <feature-name> change"
# → Ctrl+C / exit

git add -A && git commit -m "chore: archive <feature-name>" && git push
```

### The loop commands

```powershell
.\loop.ps1          # run until all tasks done
.\loop.ps1 3        # run max 3 iterations
# Ctrl+C            # stop at any time
```

---

## File Map

```
C:\data\
├── README.md                        <- this file
│
├── ralph-template\                  <- template for new projects (do not edit directly)
│   ├── AGENTS.md                    <- blazor-aspire conventions template
│   ├── loop.ps1                     <- the Ralph loop script
│   └── .github\
│       └── agents\
│           └── ralph.agent.md       <- Ralph build agent instructions
│
└── <your-project>\
    ├── AGENTS.md                    <- auto-loaded by Copilot CLI every session
    ├── loop.ps1                     <- run this to build
    ├── .github\
    │   ├── agents\
    │   │   └── ralph.agent.md       <- Ralph's instructions (tune this when Ralph misbehaves)
    │   └── skills\
    │       └── openspec-propose\    <- OpenSpec planning skill
    └── openspec\
        ├── changes\
        │   └── <feature>\
        │       ├── proposal.md      <- what and why
        │       ├── specs\           <- detailed requirements
        │       ├── design.md        <- technical approach
        │       └── tasks.md         <- THE PLAN (edit this, Ralph reads this)
        └── archive\
            └── <done-feature>\      <- completed changes, kept for reference
```

---

## Links

- [Ralph Wiggum loop — original concept](https://github.com/ghuntley/how-to-ralph-wiggum)
- [OpenSpec documentation](https://openspec.pro)
- [GitHub Copilot CLI docs](https://docs.github.com/en/copilot/how-tos/copilot-cli)
