# AGENTS.md

This document provides guidelines for agentic coding agents operating in the DataForge repository.

## Build / Lint / Test Commands

- **Development server**: `pnpm dev`
- **Production build**: `pnpm build`
- **Start production server**: `pnpm start`
- **Lint**: `pnpm lint` (ESLint; configuration may be missing)
- **Type checking**: `pnpm exec tsc --noEmit` (TypeScript strict mode)
- **No test framework installed**; consider adding Vitest or Jest if tests are needed.

## Code Style Guidelines

### Imports
- External libraries first, then internal components, then utilities, then types.
- Use `import * as React from 'react'` for React.
- Use named exports for components and utilities.
- Import types with `import type { ... }`.
- Use path alias `@/*` for internal imports (maps to project root).

### Formatting
- Use 2‑space indentation.
- Use single quotes for strings.
- No semicolons (inferred from existing code).
- Trailing commas in multiline structures.
- Keep lines under 100 characters when possible.

### Types
- Use TypeScript with strict mode enabled.
- Prefer `interface` for object shapes, `type` for unions/intersections.
- Use `unknown` instead of `any` for generic data.
- Explicitly type function parameters and return values.
- Use `React.ComponentProps<'element'>` for component props.
- Use `VariantProps<typeof variants>` for CVA variant props.

### Naming Conventions
- Components: PascalCase (e.g., `DataForgeApp`).
- Files: kebab‑case for components (e.g., `data-forge-app.tsx`), kebab‑case for utilities.
- Hooks: `use‑` prefix (e.g., `useIsMobile`).
- Constants: UPPER_SNAKE_CASE for true constants.
- Variables/functions: camelCase.

### Component Patterns
- Client components: add `'use client'` directive at top.
- Use `React.useState`, `React.useEffect`, `React.useRef`, `React.useCallback`, `React.useMemo`.
- Use `React.useRef` with TypeScript generics for DOM element references (e.g., `React.useRef<HTMLDivElement>(null)`).
- Always clean up side effects in `React.useEffect` (event listeners, timers, subscriptions).
- Provide a dependency array for `React.useEffect` to avoid unnecessary re‑runs.
- Use `cn` utility from `@/lib/utils` for class merging.
- Use `cva` (class‑variance‑authority) for component variants (shadcn/ui pattern).
- Use `React.forwardRef` for components that need ref forwarding; combine with `React.useImperativeHandle` when exposing custom methods.
- Use `React.memo` for components that render often with same props to avoid unnecessary re‑renders.
- Export components as named exports (no default exports).

### Error Handling
- Use try/catch for operations that may fail (parsing, DOM access, etc.).
- Return objects with `{ success: boolean; data: unknown; error?: string }` pattern.
- Avoid throwing exceptions; return error objects instead.
- Log errors with `console.error` only when appropriate for debugging.

### Styling
- Tailwind CSS v4 (no config file; uses `@tailwindcss/postcss`).
- Use `cn()` to merge conditional classes.
- Use CSS variables defined in `app/globals.css`.
- Follow shadcn/ui component styling patterns.

### General
- Keep components small and focused.
- Use React Server Components where appropriate (default in Next.js App Router).
- Use `toast` from `sonner` for user notifications.
- Use Lucide React icons.
- Use `structuredClone` for deep cloning objects.

### Testing Recommendations
- No test framework installed; consider adding Vitest for unit testing.
- Place test files adjacent to source files with `.test.ts` suffix (e.g., `parsers.test.ts`).
- Test pure functions (parsers, utilities) and React components with `@testing-library/react`.
- Mock external dependencies (e.g., `yaml`, `papaparse`) in tests.

### Environment Variables
- Store secrets in `.env.local` (gitignored).
- Use `NEXT_PUBLIC_` prefix for client‑side environment variables.
- Access variables via `process.env.NEXT_PUBLIC_*` in client components.

### Deployment
- Deployed on Vercel (see `.vercel/` in gitignore).
- Build command: `pnpm build`.
- Ensure environment variables are set in Vercel dashboard.

### Performance
- Use `React.useMemo` and `React.useCallback` for expensive computations and stable callbacks.
- Avoid unnecessary re‑renders by memoizing components with `React.memo` when needed.
- Use dynamic imports (`next/dynamic`) for heavy components not needed on initial load.

### Accessibility
- Follow WAI‑ARIA guidelines for interactive components.
- Use semantic HTML elements where possible.
- Ensure keyboard navigation and focus management for custom components.

### Internationalization
- UI text is in Chinese; maintain consistency when adding new strings.
- Use a i18n library (e.g., `next-intl`) if multi‑language support is needed.

### Security
- Validate and sanitize user input (especially for data parsing).
- Use `Content‑Security‑Policy` headers in production.
- Keep dependencies updated to avoid known vulnerabilities.

## Existing Rules
- ESLint script exists but configuration may be missing; ensure ESLint is installed if linting is required.

## Project Structure
- `app/` – Next.js App Router pages and layout.
- `components/` – React components (`ui/` for shadcn/ui, `data‑forge/` for app‑specific).
- `lib/` – Utilities (`utils.ts`, `data‑forge/` for core logic).
- `hooks/` – Custom React hooks.
- `styles/` – Global CSS (if any).
- `public/` – Static assets.

### Core Logic (`lib/data-forge/`)
- `parsers.ts` – Data format detection, parsing, and stringification (JSON, YAML, TOML, XML, CSV).
- `types.ts` – TypeScript interfaces for data structures, tree nodes, query results, etc.
- `samples.ts` – Sample data for each supported format (Chinese text).
- Functions return `{ success: boolean; data: unknown; error?: string }` objects for error handling.

### Component Library (`components/ui/`)
- shadcn/ui components (New York style) with Tailwind CSS.
- Use `cva` for variants, `cn` for class merging.
- Components are named exports; use `React.forwardRef` where ref forwarding is needed.
- Follow existing patterns when adding new UI components.

### UI Language
- Interface text is in Chinese (e.g., placeholders, error messages).
- Maintain consistency when adding new user‑facing strings.

## Tips for Agents
- Always run `pnpm exec tsc --noEmit` after making changes to ensure type safety.
- Run `pnpm lint` if ESLint is configured.
- Test changes locally with `pnpm dev`.
- Follow existing patterns in neighboring files.
- Do not introduce new dependencies without checking `package.json`.
- Use `pnpm` as the package manager (lockfile: `pnpm‑lock.yaml`).