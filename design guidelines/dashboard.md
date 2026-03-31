# Dashboard Design System

A design system for building distinctive, data-dense interfaces that demand attention. Not another generic admin template.

---

## Philosophy

Most dashboard templates are interchangeable. They're built on the same foundations, follow the same patterns, and produce the same results: **forgettable interfaces that blend into everything else.**

This system is different.

We believe dashboards should have **point of view**. They should feel intentional, distinctive, and crafted. A metric shouldn't just display—it should tell a story. A table shouldn't just list—it should enable action.

### Our Three Pillars

**1. Density With Purpose**

Whitespace is a tool, not a requirement. Information-dense interfaces can be beautiful when organized with care. Don't add padding just because someone told you to.

**2. Data as Narrative**

Numbers aren't just values—they're stories. Show deltas, trends, and context. Help users understand not just what happened, but what it means.

**3. Action at Point of Need**

Every interactive element should be where users expect it. Power users need shortcuts; casual users need guidance. Support both without overwhelming either.

---

## Layout Patterns

### The Dashboard Shell

```tsx
<div className="flex min-h-screen bg-[#FAFAF9]">
  {/* Fixed sidebar, 280px */}
  <aside className="fixed left-0 top-0 w-[280px] h-screen border-r border-[#E7E5E4] bg-white">
    {/* Logo, navigation, user */}
  </aside>

  {/* Main content area */}
  <main className="ml-[280px] flex-1">
    {/* Top bar */}
    <header className="h-16 border-b border-[#E7E5E4] flex items-center px-6 bg-white">
      {/* Breadcrumbs, search, actions */}
    </header>

    {/* Page content */}
    <div className="p-6">{/* Dashboard content */}</div>
  </main>
</div>
```

### Widget Grid Pattern

```tsx
{/* Top metrics - 4 column grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <MetricCard title="Revenue" value="$124,500" change="+12%" positive />
  <MetricCard title="Users" value="8,432" change="+5%" positive />
  <MetricCard title="Orders" value="1,234" change="-2%" positive={false} />
  <MetricCard title="Conversion" value="3.2%" change="+0.8%" positive />
</div>

{/* Charts - 2 column grid */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
  <ChartCard title="Revenue Trend" />
  <ChartCard title="User Growth" />
</div>
```

### Data Table with Toolbar

```tsx
<div className="bg-white border border-[#E7E5E4] rounded-[2px]">
  {/* Toolbar */}
  <div className="flex items-center justify-between p-4 border-b border-[#E7E5E4]">
    <div className="flex items-center gap-3">
      <SearchInput placeholder="Search..." />
      <FilterDropdown options={statusOptions} />
    </div>
    <div className="flex items-center gap-2">
      <ExportButton />
      <PrimaryButton>Add Item</PrimaryButton>
    </div>
  </div>

  {/* Table */}
  <table className="w-full">
    <thead className="bg-[#F5F5F4]">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-medium text-[#78716C] uppercase">Name</th>
        <th className="px-4 py-3 text-left text-xs font-medium text-[#78716C] uppercase">Status</th>
        <th className="px-4 py-3 text-right text-xs font-medium text-[#78716C] uppercase">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-[#E7E5E4]">
      {rows.map((row) => (
        <tr key={row.id} className="hover:bg-[#FAFAF9]">
          <td className="px-4 py-3 text-sm text-[#1C1917]">{row.name}</td>
          <td className="px-4 py-3">
            <StatusBadge>{row.status}</StatusBadge>
          </td>
          <td className="px-4 py-3 text-right">
            <ActionMenu />
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  {/* Pagination */}
  <div className="flex items-center justify-between p-4 border-t border-[#E7E5E4]">
    <span className="text-sm text-[#78716C]">Showing 1-10 of 100</span>
    <Pagination />
  </div>
</div>
```

---

## Components

### Metric Card

```tsx
<div className="bg-white border border-[#E7E5E4] rounded-[2px] p-6">
  <div className="flex items-center justify-between">
    <span className="text-xs font-medium text-[#78716C] uppercase tracking-wider">{title}</span>
    <span className={cn('text-xs font-medium', positive ? 'text-[#059669]' : 'text-[#DC2626]')}>
      {change}
    </span>
  </div>
  <p className="text-2xl font-semibold text-[#1C1917] mt-2">{value}</p>
  {subtitle && <p className="text-xs text-[#78716C] mt-1">{subtitle}</p>}
</div>
```

### Chart Container

```tsx
<div className="bg-white border border-[#E7E5E4] rounded-[2px]">
  <div className="flex items-center justify-between p-4 border-b border-[#E7E5E4]">
    <h3 className="text-sm font-semibold text-[#1C1917]">{title}</h3>
    <div className="flex items-center gap-2">
      <ChartFilter active="7d" />
    </div>
  </div>
  <div className="p-4">{/* Chart */}</div>
</div>
```

### Status Badge

```tsx
const statusStyles = {
  active: 'bg-[#DCFCE7] text-[#059669]',
  pending: 'bg-[#FEF3C7] text-[#D97706]',
  inactive: 'bg-[#F5F5F4] text-[#78716C]',
  error: 'bg-[#FEE2E2] text-[#DC2626]',
};

<span
  className={cn(
    'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-[2px]',
    statusStyles[status],
  )}
>
  {label}
</span>
```

### Data Table Row

```tsx
<tr className="group hover:bg-[#FAFAF9] transition-colors">
  <td className="px-4 py-3">
    <div className="flex items-center gap-3">
      <Avatar src={user.avatar} />
      <div>
        <p className="text-sm font-medium text-[#1C1917]">{user.name}</p>
        <p className="text-xs text-[#78716C]">{user.email}</p>
      </div>
    </div>
  </td>
  <td className="px-4 py-3 text-sm text-[#1C1917]">{row.date}</td>
  <td className="px-4 py-3">
    <StatusBadge status={row.status} />
  </td>
  <td className="px-4 py-3 text-right">
    <ActionDropdown items={actions} />
  </td>
</tr>
```

### Sidebar Navigation Item

```tsx
<NavItem
  href="/analytics"
  icon={<ChartIcon />}
  label="Analytics"
  active={pathname === '/analytics'}
  badge="new"
/>
```

### Date Range Picker

```tsx
<div className="flex items-center gap-2">
  <button className="px-3 py-1.5 text-sm rounded-[2px] bg-[#EA580C] text-white">7d</button>
  <button className="px-3 py-1.5 text-sm rounded-[2px] text-[#78716C] hover:bg-[#F5F5F4]">30d</button>
  <button className="px-3 py-1.5 text-sm rounded-[2px] text-[#78716C] hover:bg-[#F5F5F4]">90d</button>
  <button className="px-3 py-1.5 text-sm rounded-[2px] text-[#78716C] hover:bg-[#F5F5F4]">Custom</button>
</div>
```

### Search Input

```tsx
<div className="relative">
  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
  <input
    type="text"
    placeholder="Search..."
    className="w-64 h-9 pl-9 pr-3 bg-white border border-[#E7E5E4] rounded-[2px] text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1C1917] outline-none"
  />
</div>
```

### Pagination

```tsx
<div className="flex items-center gap-1">
  <button className="w-8 h-8 flex items-center justify-center text-[#78716C] hover:bg-[#F5F5F4] rounded-[2px]">
    <ChevronLeftIcon className="w-4 h-4" />
  </button>
  {[1, 2, 3, 4, 5].map((page) => (
    <button
      key={page}
      className={cn(
        'w-8 h-8 flex items-center justify-center text-sm rounded-[2px]',
        page === 1 ? 'bg-[#1C1917] text-white' : 'text-[#78716C] hover:bg-[#F5F5F4]',
      )}
    >
      {page}
    </button>
  ))}
  <button className="w-8 h-8 flex items-center justify-center text-[#78716C] hover:bg-[#F5F5F4] rounded-[2px]">
    <ChevronRightIcon className="w-4 h-4" />
  </button>
</div>
```

---

## Common Dashboard Views

### Analytics Dashboard

1. **Top metrics** (4 cards): Revenue, Users, Sessions, Conversion
2. **Primary chart**: Line chart showing key metric over time
3. **Secondary charts**: Two-column grid with bar/pie charts
4. **Recent activity**: Compact feed or table below

### User Management

1. **Search + filters** bar at top
2. **Data table** with sortable columns
3. **Bulk actions** toolbar (appears on selection)
4. **Row actions**: Edit, Delete, Suspend

### Settings Dashboard

1. **Sidebar navigation** for categories
2. **Section header** with description
3. **Form fields** in card layout
4. **Save/Cancel** action bar fixed at bottom

### Orders Management

1. **Filters bar**: Date, Status, Search
2. **Order table**: ID, Customer, Total, Status, Date
3. **Quick actions**: View, Fulfill, Cancel
4. **Status timeline** for order details

---

## Filtering Patterns

### Date Range Picker

- Presets: Today, 7d, 30d, 90d, YTD, Custom
- Calendar picker for custom range

### Multi-Select Filters

- Dropdown with search
- Selected count badge
- Clear all option

### Quick Filters

- Toggle buttons for common filters
- Active state clearly visible
- Keyboard accessible

### Saved Filters

- Save frequently used combinations
- Quick access dropdown
- Share with team

---

## Best Practices

### Do

- Use consistent spacing (8px baseline)
- Show loading skeletons during data fetch
- Empty states with helpful CTAs
- Confirmation dialogs for destructive actions
- Toast notifications for async success/failure
- Show relative timestamps ("2 hours ago")
- Pagination for large tables
- Keyboard shortcuts for power users

### Don't

- Overload with too many charts on one page
- Use 3D charts or unnecessary decorations
- Show raw timestamps without formatting
- Allow tables to grow indefinitely
- Put all actions in dropdowns
- Use color as sole indicator of state
- Show raw numbers without context (show deltas)

### Accessibility

- All interactive elements keyboard accessible
- ARIA labels for icon-only buttons
- Role="table" for data tables
- Focus indicators visible
- Color not sole indicator of state
- Screen reader announcements for dynamic content

---

## Color Palette

| Role    | Color                  | Usage                       |
| ------- | ---------------------- | --------------------------- |
| Canvas  | Off-white `#FAFAF9`    | Primary background          |
| Ink     | Charcoal `#1C1917`     | Primary text                |
| Accent  | Burnt Orange `#EA580C` | Primary actions, highlights |
| Muted   | Warm Gray `#78716C`    | Secondary text, borders     |
| Surface | White `#FFFFFF`        | Cards, elevated surfaces    |

### Status Colors

| State   | Color     | Background |
| ------- | --------- | ---------- |
| Success | `#059669` | `#ECFDF5`  |
| Warning | `#D97706` | `#FFFBEB`  |
| Error   | `#DC2626` | `#FEF2F2`  |
| Info    | `#0284C7` | `#F0F9FF`  |

---

## Spacing System

```
xs:  4px    Tight connections
sm:  8px    Default component spacing
md:  16px   Standard padding
lg:  24px   Section spacing
xl:  32px   Page margins
xxl: 48px   Full sections
```

---

## Typography

```
Display    48px / 600    Headlines
H1         36px / 600    Page titles
H2         24px / 600    Section headers
H3         18px / 600    Card titles
Body       15px / 400    General text
Small      13px / 400    Secondary text
Label      11px / 500    Labels, badges (uppercase)
```

---

## Stack

| Layer   | Technology            |
| ------- | --------------------- |
| Styling | Tailwind CSS          |
| Charts  | Recharts / Tremor     |
| Tables  | TanStack Table        |
| State   | Zustand               |
| Forms   | React Hook Form + Zod |
| Date    | date-fns              |

---

## The End

> "Good dashboards are as little dashboard as possible."

Less, but better. Every metric should tell a story. Every interaction should feel natural. Build dashboards worth using.

---

_Dashboard Design System v1.0_
