# CLAUDE.md - Coding Principles

## Core Values

### 1. Don't Reinvent the Wheel
- **Always use established libraries** instead of writing custom implementations
- Prefer official SDKs over raw API calls (e.g., use `resend` package, not `fetch`)
- Check npm/deno for existing solutions before implementing from scratch
- If a library exists and is well-maintained, use it

### 2. Avoid useEffect
- **Never use `useEffect` without explicit permission**
- Always ask before adding a useEffect hook
- Prefer alternatives:
  - React Query's `useQuery`/`useMutation` for data fetching
  - Event handlers for user interactions
  - `useSyncExternalStore` for external state
  - Refs for DOM manipulation
- If useEffect is truly necessary, explain why and get approval first

### 3. Read Documentation First
- **Always read official docs before implementing**
- Download full documentation or `llms.txt` to `docs/` folder for reference
- Check for:
  - Official examples
  - Best practices
  - Files with .md, .mdx and other human-readable extensions
- Reference docs in implementation decisions

## Implementation Checklist

Before writing code:
- [ ] Is there a library for this?
- [ ] Have I read the official documentation?
- [ ] Have I downloaded docs for future reference?
- [ ] Am I avoiding useEffect? If not, have I asked permission?

## Documentation Storage

Store downloaded documentation in:
```
docs/
├── resend/           # Resend API docs
├── supabase/         # Supabase docs
├── tanstack-query/   # React Query docs
└── [library-name]/   # Other library docs
```
