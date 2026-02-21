# UI Coding Standards

## Component Library

**Only shadcn/ui components must be used.** Do not create custom components under any circumstances.

All shadcn/ui components live in `src/components/ui/` and must be imported from there:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
```

To add a component that is not yet in the project:

```bash
npx shadcn@latest add <component-name>
```

Never build a replacement for a component that already exists in shadcn/ui (e.g. do not hand-roll a dialog, dropdown, or table).

## Available Components

The following shadcn/ui components are currently installed:

| Component | Import path |
|-----------|-------------|
| AlertDialog | `@/components/ui/alert-dialog` |
| Button | `@/components/ui/button` |
| Calendar | `@/components/ui/calendar` |
| Card | `@/components/ui/card` |
| Dialog | `@/components/ui/dialog` |
| DropdownMenu | `@/components/ui/dropdown-menu` |
| Form | `@/components/ui/form` |
| Input | `@/components/ui/input` |
| Label | `@/components/ui/label` |
| Popover | `@/components/ui/popover` |
| Select | `@/components/ui/select` |
| Table | `@/components/ui/table` |

## Styling

- Use **Tailwind CSS v4** utility classes for layout and spacing.
- Use `cn()` from `src/lib/utils.ts` when merging conditional class names:

```tsx
import { cn } from "@/lib/utils";

<div className={cn("p-4", isActive && "bg-primary")} />
```

- Use shadcn design tokens (`text-muted-foreground`, `bg-destructive`, `border`, etc.) instead of arbitrary colour values to stay consistent with the theme.

## Date Formatting

All dates must be formatted using **date-fns**. The standard display format is:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

Use the `do MMM yyyy` format token:

```tsx
import { format } from "date-fns";

format(date, "do MMM yyyy"); // "1st Sep 2025"
```

Do not use `toLocaleDateString`, `Intl.DateTimeFormat`, or any other date formatting library.
