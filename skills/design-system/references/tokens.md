# Design tokens

The full `globals.css` token set and the Tailwind config that maps it, referenced from SKILL.md §Design Tokens.

## Contents

- CSS Custom Properties
- Tailwind Config Integration

## CSS Custom Properties
```css
/* globals.css */
:root {
 /* Colors - Semantic */
 --background: 0 0% 100%;
 --foreground: 222.2 84% 4.9%;
 --card: 0 0% 100%;
 --card-foreground: 222.2 84% 4.9%;
 --popover: 0 0% 100%;
 --popover-foreground: 222.2 84% 4.9%;
 --primary: 221.2 83.2% 53.3%;
 --primary-foreground: 210 40% 98%;
 --secondary: 210 40% 96.1%;
 --secondary-foreground: 222.2 47.4% 11.2%;
 --muted: 210 40% 96.1%;
 --muted-foreground: 215.4 16.3% 46.9%;
 --accent: 210 40% 96.1%;
 --accent-foreground: 222.2 47.4% 11.2%;
 --destructive: 0 84.2% 60.2%;
 --destructive-foreground: 210 40% 98%;
 --border: 214.3 31.8% 91.4%;
 --input: 214.3 31.8% 91.4%;
 --ring: 221.2 83.2% 53.3%;

 /* Spacing */
 --spacing-xs: 0.25rem;
 --spacing-sm: 0.5rem;
 --spacing-md: 1rem;
 --spacing-lg: 1.5rem;
 --spacing-xl: 2rem;

 /* Border Radius */
 --radius: 0.5rem;
 --radius-sm: calc(var(--radius) - 4px);
 --radius-lg: calc(var(--radius) + 4px);

 /* Shadows */
 --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
 --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
 --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
 --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

 /* Animation */
 --duration-fast: 150ms;
 --duration-normal: 200ms;
 --duration-slow: 300ms;
 --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
 --ease-in: cubic-bezier(0.4, 0, 1, 1);
 --ease-out: cubic-bezier(0, 0, 0.2, 1);
 --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dark {
 --background: 222.2 84% 4.9%;
 --foreground: 210 40% 98%;
 /* ... dark mode overrides */
}
```

## Tailwind Config Integration
```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
 content: ['./src/**/*.{ts,tsx}'],
 darkMode: 'class',
 theme: {
 extend: {
 colors: {
 border: 'hsl(var(--border))',
 input: 'hsl(var(--input))',
 ring: 'hsl(var(--ring))',
 background: 'hsl(var(--background))',
 foreground: 'hsl(var(--foreground))',
 primary: {
 DEFAULT: 'hsl(var(--primary))',
 foreground: 'hsl(var(--primary-foreground))',
 },
 secondary: {
 DEFAULT: 'hsl(var(--secondary))',
 foreground: 'hsl(var(--secondary-foreground))',
 },
 destructive: {
 DEFAULT: 'hsl(var(--destructive))',
 foreground: 'hsl(var(--destructive-foreground))',
 },
 muted: {
 DEFAULT: 'hsl(var(--muted))',
 foreground: 'hsl(var(--muted-foreground))',
 },
 accent: {
 DEFAULT: 'hsl(var(--accent))',
 foreground: 'hsl(var(--accent-foreground))',
 },
 },
 borderRadius: {
 lg: 'var(--radius-lg)',
 md: 'var(--radius)',
 sm: 'var(--radius-sm)',
 },
 boxShadow: {
 sm: 'var(--shadow-sm)',
 DEFAULT: 'var(--shadow)',
 md: 'var(--shadow-md)',
 lg: 'var(--shadow-lg)',
 },
 transitionDuration: {
 fast: 'var(--duration-fast)',
 normal: 'var(--duration-normal)',
 slow: 'var(--duration-slow)',
 },
 },
 },
}

export default config
```
