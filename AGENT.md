# AGENT.md

Ground rules for any AI assistant (Claude, Cursor, Copilot, etc.) working in
this repository. Read this file at the start of every session and follow it
even if the user does not mention it in the current message.

## Collaboration rules

1. **Do not roll back or revert changes** unless the user explicitly asks for
   it. If a previously made change appears unnecessary or incorrect based on
   new information, discuss it with the user first — do not silently revert.

2. **Do not verify changes yourself.** Do not spin up dev servers, run browser
   automation, or otherwise "test" that a fix works after applying it. The
   user prefers to verify manually. This saves tokens and shortens iteration
   cycles.

   Exceptions:
   - You may (and should) run `tsc --noEmit` and `eslint` on files you edit —
     these catch syntax/type errors that would waste user time.
   - You may run non-interactive one-shot scripts the user explicitly asks
     you to run.

3. **After finishing any task or fix, always provide a short step-by-step
   verification guide** for the user. Format it as a numbered list of concrete
   actions the user can take in their app/browser/CLI to confirm the change
   works. Keep it under 6 steps whenever possible.

4. **Do not push to any git remote** (`origin`, `github`, or otherwise) unless
   the user explicitly asks for a push. Committing locally is fine when the
   user asks for a commit, but stop there — never `git push`, `git push
--force`, or otherwise send commits to a remote on your own initiative.

5. **Do not create documentation files** (`*.md`, README updates, etc.)
   unless the user explicitly requests them. This file is the exception —
   it exists because the user asked for it.

## Repo-specific context

- This is a Next.js storefront + AdminJS admin panel monorepo.
- Storefront deploys to **Vercel** (via GitHub git integration and a GitLab
  CI deploy hook).
- Admin deploys to **Render** (via a GitLab CI deploy hook).
- CI/CD lives in `.gitlab-ci.yml`; canonical architecture doc is
  `docs/cicd-pipeline.md` and `docs/universal-app-doc.md`.
- Two git remotes: `origin` = GitLab (primary, drives CI/CD), `github` =
  mirror (drives Vercel git integration). See `docs/cicd-pipeline.md` §1 for
  the full explanation of why both matter.

## When in doubt follow this

Stop and ask the user. A short clarifying question is always cheaper than
undoing a mistake.
