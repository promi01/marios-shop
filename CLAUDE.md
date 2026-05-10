<!-- GSD:project-start source:PROJECT.md -->
## Project

**Marios Shop**

Στατικό e-shop-style site για το προσωπικό στοκ αρωμάτων του Μάριου. Αντί για ένα Google Drive link με φωτογραφίες, μοιράζεται ένα URL σε ένα Facebook group όπου οι φίλοι/follower μπορούν να περιηγηθούν στη συλλογή, να φτιάξουν "καλάθι" και να αντιγράψουν την παραγγελία ως καθαρό κείμενο για να την στείλουν στο Messenger.

**Core Value:** Ένας επισκέπτης από Facebook (κυρίως κινητό) μπορεί σε <30 δευτερόλεπτα να βρει αρώματα που τον ενδιαφέρουν, να φτιάξει λίστα παραγγελίας, και να την αντιγράψει για Messenger — χωρίς εγγραφή, χωρίς πληρωμή, χωρίς τριβή.

### Constraints

- **Tech stack:** Next.js 15 (App Router) + TypeScript, Tailwind CSS, shadcn/ui — επιλέχθηκε από τον owner
- **Deploy:** Vercel με `output: 'export'` (zero backend) — προϋπόθεση για το cost (free tier) και τη φιλοσοφία no-ops
- **Γλώσσα UI:** Ελληνικά — στοχευμένο κοινό
- **Mobile-first:** ~90% κινητό από Facebook
- **Στυλ:** minimal, λευκό background, Inter/Geist typography. Όχι gradients, όχι emoji στο UI, όχι bling
- **Storage:** μόνο localStorage (key: `marios-shop-cart`) — όχι cookies, όχι backend persistence
- **Privacy:** Vercel Analytics είναι aggregate-only — όχι PII tracking
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
