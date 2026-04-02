# General Coding Standards for Shelivery MVP

## 🧱 Circular Dependency Prevention

- **Top-Level Imports:** All imports must be at the top of the file. No lazy `require` or bottom-of-file imports.
- **Leaf-Component Rule:** Components in `/components` must NEVER import from `/app` (routes/screens).
- **Logic Extraction:** If a component needs data/types from a screen, move that data/type to a shared `/src/store` or `/src/types` directory.
- **Layout Isolation:** Never export constants from `_layout.tsx`.

- **Code separation** You should only code in `/apps/mobile` folder

## Core Principles

### 1. Single Responsibility Principle

- Each component, function, and file should have one clear responsibility
- Keep components focused on a single UI concern
- Separate business logic from presentation logic

### 2. Modularity & Reusability

- Create reusable components that can be composed together
- Extract common patterns into custom hooks
- Use composition over inheritance
- Build atomic design components (atoms → molecules → organisms)

### 3. DRY (Don't Repeat Yourself)

- Extract common logic into utility functions
- Create shared components for repeated UI patterns
- Use constants for repeated values (API endpoints, error messages)
- Implement shared types and interfaces

### 4. Naming Conventions

- **Files**: kebab-case for pages, PascalCase for components
- **Variables/Functions**: camelCase
- **Components**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase with descriptive names

### 5. Code Organization

- Group related functionality together
- Use index.ts files for clean imports
- Separate concerns: data fetching, state management, UI rendering
- Keep file sizes manageable (< 200 lines when possible)

## File Structure Guidelines

### Component Structure

```typescript
// Component definition
// Props interface
// Component implementation
// Default export
// Named exports for sub-components if needed
```

### Hook Structure

```typescript
// Import dependencies
// Type definitions
// Hook implementation with clear return type
// Export
```

### Page Structure (App Router)

```typescript
// Server Component by default
// Client Component only when necessary
// Clear separation of data fetching and rendering
```

## Error Handling

- Use TypeScript strict mode
- Implement proper error boundaries
- Handle loading and error states consistently
- Provide meaningful error messages to users

## Performance Guidelines

- Use React.memo() for expensive components
- Implement proper dependency arrays in useEffect
- Avoid unnecessary re-renders
- Optimize bundle size with proper imports
- Use Suspense for code splitting

## Testing Standards

- Write tests for complex business logic
- Test user interactions and edge cases
- Use descriptive test names
- Mock external dependencies appropriately

## Documentation

- Add JSDoc comments for complex functions
- Document component props and expected behavior
- Maintain README files for major features
- Keep inline comments concise and relevant
