# AI Agent Instructions for Project Collaboration

## Project Overview
This is a React TypeScript application built with Vite, focusing on resume building functionality. The project uses modern React patterns and Radix UI components through shadcn/ui for consistent UI components.

## Architecture & Structure

### Key Directories
- `/src/components/ui/`: Reusable UI components based on shadcn/ui and Radix
- `/src/contexts/`: React context providers (e.g., `AuthContext.tsx` for authentication)
- `/src/pages/`: Main route components
- `/src/hooks/`: Custom React hooks
- `/src/lib/`: Utility functions and shared code

### Design System
- All colors are defined in HSL format in `src/index.css`
- Theme variables follow the pattern `--{category}-{property}` (e.g., `--sidebar-background`)
- Dark mode support is built-in using the `.dark` class variant

## Development Workflow

### Setup & Running
```bash
# Install dependencies
bun install

# Development server at port 8080
bun run dev

# Production build
bun run build
```

### Key Patterns

1. **Authentication**
   - User state management via `AuthContext`
   - Local storage persistence for user session
   - Example usage:
   ```typescript
   const { user, login, logout } = useContext(AuthContext);
   ```

2. **Component Organization**
   - UI components are isolated in `/components/ui/`
   - Layout components (Header, Footer) in `/components/`
   - Page components in `/pages/`

3. **Path Aliases**
   - `@/` alias points to the `src` directory
   - Use for imports: `import { Button } from "@/components/ui/button"`

## Common Tasks

1. **Adding New UI Components**
   - Place in `/src/components/ui/`
   - Follow shadcn/ui patterns for consistency
   - Use HSL colors from the design system

2. **Handling Authentication**
   - Use `AuthContext` for user state
   - Update `AuthContext.tsx` for new auth features
   - Remember to handle onboarding state via `onboardingComplete` flag

3. **Styling**
   - Use Tailwind classes for styling
   - Follow CSS custom properties for colors
   - Reference `index.css` for theme variables

## Project-Specific Notes
- Component development uses Radix UI primitives with shadcn/ui styling
- Type safety is enforced through TypeScript
- Development mode includes component tagging via `lovable-tagger`