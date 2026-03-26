# Home Screen Redesign — Design Spec

**Date:** 2026-03-26
**Status:** Approved
**Scope:** `src/app/index.tsx` only — no changes to tool modules, registry, or routing

---

## Summary

Replace the current horizontal-list layout with a 2-column square-tile grid. Each tile shows only the tool icon (52px, accent color) and the tool name. The grid is dynamic — renders exactly as many tiles as there are enabled tools, with no "Wkrótce" placeholder in production.

---

## Visual Design

| Token | Value |
|---|---|
| Card background | `colors.surface` |
| Card border | `colors.border` (1px) |
| Card border hover | `colors.accentBorder` |
| Card border-radius | `radius.lg` (16px) |
| Card aspect ratio | 1:1 (square) |
| Top accent line | 2px, `colors.accentBorder`, top edge |
| Icon size | 52px, `colors.accent` |
| Name font | 14px, weight 600, `colors.text`, centered |
| Pressed state | background `colors.accentDim` |
| Grid gap | `spacing.sm` (8px) |
| Grid padding | `spacing.lg` (24px) horizontal |

The 2px top accent line is a decorative border on the top edge of each card (replaces the left-side accent bar from the old layout).

---

## Architecture

Single file change: `src/app/index.tsx`.

- Replace `FlatList` with a plain `View` wrapping a `View` grid (2 columns via `flexWrap: 'wrap'` or explicit width calc).
- Each card is a `TouchableOpacity` with `activeOpacity={0.75}`.
- Icon rendered via `<Ionicons name={item.icon} size={52} color={colors.accent} />` — same icon names already stored in `ToolDefinition.icon`.
- No new props needed on `ToolDefinition` — `id`, `name`, `icon`, `routePrefix`, `enabled` are sufficient.
- Card width: `(screenWidth - 2 * spacing.lg - spacing.sm) / 2` using `Dimensions.get('window').width`.

---

## Behavior

- Tap navigates to `/(tools){item.routePrefix}` — identical to current implementation.
- Grid is dynamic: renders `getEnabledTools()` results, no hardcoded placeholders.
- `ScrollView` wraps the grid (replaces `FlatList`) to handle future growth beyond 4 tools.
- Header ("CBT Toolkit" + subtitle + section label) remains unchanged.

---

## Tests

No new test file needed — `index.tsx` has no business logic. Existing snapshot/render tests (if any) will need updating. The screen is covered by the CI export check.

---

## Out of scope

- Per-tool accent colors
- Tool descriptions on cards
- Badge with record count
- "Wkrótce" placeholder tiles
- Any changes outside `src/app/index.tsx`
