# Panel Refactoring Plan

## Overview

Refactor the left and right panel components to use shared styles and consistent naming conventions. Both panels share a common CSS foundation using BEM-style naming (`panel__*`).

---

## Naming Conventions

### Component Names

| Position | Old Name | New Name | Purpose |
|----------|----------|----------|---------|
| Left | `Sidebar` | `EquipmentPanel` | Add equipment to canvas |
| Right | `Toolbar` | `ActionPanel` | Edit actions (clear, undo, etc.) |

**Rationale:**
- Both are "panels" — consistent base terminology
- Prefix describes the *functional domain*, not visual position
- Position is handled by CSS modifiers (`.panel--left`, `.panel--right`)

### CSS Class Structure

```
.panel                    -- shared base styles
.panel--left              -- left-positioned variant
.panel--right             -- right-positioned variant
.panel__header            -- header section
.panel__content           -- scrollable content
.panel__group             -- collapsible group
.panel__item              -- clickable button
.panel__item--danger      -- destructive action variant
```

### File Structure

```
src/
├── index.css                  -- global styles + shared panel styles
├── components/
│   ├── EquipmentPanel/
│   │   ├── EquipmentPanel.tsx
│   │   └── index.ts
│   └── ActionPanel/
│       ├── ActionPanel.tsx
│       └── index.ts
```

**Rationale:** The project convention keeps CSS co-located with components. Shared styles that apply to multiple components go in `src/index.css`, which already contains global CSS variables.

---

## Phase 1: Add Shared Panel Styles to index.css

**Goal:** Add shared panel styles to the existing global stylesheet.

### Steps

1. Add panel classes to `src/index.css`:
   - `.panel` — base container (flex column, 56px width, surface background)
   - `.panel--left` / `.panel--right` — border variants
   - `.panel__header` — header section with icon
   - `.panel__divider` — horizontal separator
   - `.panel__content` — scrollable content area
   - `.panel__group` / `.panel__group-header` / `.panel__group-items` — collapsible groups
   - `.panel__item` — action/equipment buttons
   - `.panel__item--danger` — destructive action variant

---

## Phase 2: Refactor Sidebar → EquipmentPanel

**Goal:** Rename Sidebar to EquipmentPanel and update to use shared panel classes.

### Steps

1. Rename `src/components/Sidebar/` → `src/components/EquipmentPanel/`
2. Rename `Sidebar.tsx` → `EquipmentPanel.tsx`
3. Update class names from `sidebar-*` to `panel__*`
4. Delete `Sidebar.css` (styles now in `index.css`)

### Class Name Mapping

| Old Class | New Class |
|-----------|-----------|
| `.sidebar` | `.panel .panel--left` |
| `.sidebar-logo` | `.panel__header` |
| `.sidebar-logo-icon` | `.panel__header-icon` |
| `.sidebar-divider` | `.panel__divider` |
| `.sidebar-groups` | `.panel__content` |
| `.sidebar-group` | `.panel__group` |
| `.sidebar-group-header` | `.panel__group-header` |
| `.sidebar-group-icon` | `.panel__group-icon` |
| `.sidebar-group-label` | `.panel__group-label` |
| `.sidebar-group-arrow` | `.panel__group-arrow` |
| `.sidebar-group-items` | `.panel__group-items` |
| `.sidebar-item` | `.panel__item` |
| `.sidebar-item-icon` | `.panel__item-icon` |
| `.sidebar-item-label` | `.panel__item-label` |

---

## Phase 3: Create ActionPanel Component

**Goal:** Add right-side panel with editing actions.

### Steps

1. Create `src/components/ActionPanel/ActionPanel.tsx`:
   - Use `.panel .panel--right` as container (styles from index.css)
   - Add action buttons: Clear (🔄)
   - Wire to `useLayoutStore().clearLayout`

2. Create `src/components/ActionPanel/index.ts` — export component

3. Update `src/components/index.ts` — add ActionPanel export, remove Sidebar export

---

## Phase 4: Update App Layout

**Goal:** Integrate both panels into the main layout with new names.

### Steps

1. Update `src/App.tsx`:
   - Replace `Sidebar` import with `EquipmentPanel`
   - Import `ActionPanel`
   - Update JSX to use new component names
   - Rename CSS classes: `app-sidebar` → `app-equipment-panel`, add `app-action-panel`

2. Update `src/App.css`:
   - Rename `.app-sidebar` → `.app-equipment-panel`
   - Add `.app-action-panel` with matching styles

---

## File Summary

| Action | File |
|--------|------|
| Modify | `src/index.css` (add shared panel styles) |
| Rename | `src/components/Sidebar/` → `src/components/EquipmentPanel/` |
| Rename | `Sidebar.tsx` → `EquipmentPanel.tsx` |
| Delete | `Sidebar.css` |
| Create | `src/components/ActionPanel/ActionPanel.tsx` |
| Create | `src/components/ActionPanel/index.ts` |
| Modify | `src/components/index.ts` |
| Modify | `src/App.tsx` |
| Modify | `src/App.css` |
