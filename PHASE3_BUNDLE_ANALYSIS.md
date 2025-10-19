# Phase 3: Bundle Analysis & Optimization Report

## Current Bundle Sizes (Baseline)

### @asakaa/core (v0.7.0)
- **ESM**: 20.08 KB
- **CJS**: 20.16 KB
- **Types**: 17.18 KB
- **Status**: ✅ Excellent (150% better than 50KB target)

### @asakaa/board (v0.6.0)
- **ESM**: 198.07 KB (~193 KB)
- **CJS**: 215.21 KB (~210 KB)
- **CSS**: 61.11 KB
- **Types**: 74.71 KB
- **Total (ESM + CSS)**: ~254 KB uncompressed
- **Status**: ⚠️ Needs optimization (target <100KB gzipped)

## Dependency Analysis

### Heavy Dependencies (Potential Issues)

1. **recharts** (^3.2.1) - ~400KB
   - Usage: Charts component for analytics
   - Impact: CRITICAL - largest dependency
   - Strategy: Make lazy-loaded, optional export

2. **framer-motion** (^11.11.0) - ~100KB
   - Usage: Animations throughout UI
   - Impact: HIGH - second largest
   - Strategy: Replace with lighter CSS animations or make optional

3. **@dnd-kit/core** + **@dnd-kit/sortable** (~50KB combined)
   - Usage: Core drag-and-drop functionality
   - Impact: MEDIUM - essential but optimizable
   - Strategy: Keep (core feature), optimize usage

4. **jotai** (^2.10.0) - ~10KB
   - Usage: Legacy state management (v0.6.0)
   - Impact: LOW but removable
   - Strategy: **REMOVE** - replaced by @asakaa/core

5. **html2canvas** (^1.4.1) + **jspdf** (^3.0.3) - ~150KB combined
   - Usage: PDF export feature
   - Impact: HIGH - large but infrequent use
   - Strategy: Make lazy-loaded, optional export

6. **AI SDKs** (@ai-sdk/anthropic, @ai-sdk/openai) - ~80KB
   - Usage: AI features
   - Impact: MEDIUM - optional feature
   - Strategy: Already peer dependency (optional)

### Lighter Dependencies (Keep)
- **@tanstack/react-virtual** (~15KB) - Virtual scrolling, good for performance
- **cmdk** (~10KB) - Command palette
- **clsx** + **tailwind-merge** (~5KB) - Utility classes
- **class-variance-authority** (~5KB) - Component variants
- **zod** (~25KB) - Already in core, needed for validation

## Optimization Opportunities

### 1. Code Splitting & Lazy Loading

#### High Priority Components to Lazy Load:
- **Charts** (recharts ~400KB)
- **PDF Export** (html2canvas + jspdf ~150KB)
- **CardDetailModal** (~30KB with dependencies)
- **CommandPalette** (cmdk ~10KB)
- **BulkOperations** (~15KB)

**Estimated Savings**: ~600KB from initial bundle

#### Implementation Plan:
```typescript
// Before (eager loading)
import { Charts } from './components/Charts'

// After (lazy loading)
const Charts = React.lazy(() => import('./components/Charts'))
```

### 2. Remove Legacy Dependencies

#### Jotai Removal (Phase 2 completion)
- **Current**: jotai still in dependencies (~10KB)
- **Target**: Remove after refactoring all components to use @asakaa/core
- **Estimated Savings**: ~10KB

### 3. Optimize Animations

#### Replace framer-motion with CSS (~100KB savings)
- **Current**: framer-motion for all animations
- **Proposal**:
  - Keep for drag-and-drop only (essential)
  - Replace UI animations with CSS transitions
  - Make framer-motion a peer dependency (optional)

**Estimated Savings**: ~70KB (keeping only essential parts)

### 4. Tree-Shaking Audit

#### Ensure Optimal Imports:
```typescript
// Bad (imports entire library)
import _ from 'lodash'

// Good (tree-shakeable)
import { debounce } from 'lodash-es'

// Better (no dependency)
const debounce = (fn, ms) => { /* native impl */ }
```

### 5. Virtual Scrolling Implementation

**Already have dependency**: @tanstack/react-virtual (~15KB)

**Implementation needed**:
- Card lists with >100 cards
- Column lists with >20 columns
- Activity logs with >50 entries

**Performance Target**: 60fps with 10,000+ cards

## Proposed Bundle Size Targets

### After Phase 3 Optimizations:

| Package | Current | Target | Strategy |
|---------|---------|--------|----------|
| **@asakaa/core** | 20KB | 20KB | ✅ Already optimal |
| **@asakaa/board (core)** | 254KB | <80KB | Code splitting + tree-shaking |
| **@asakaa/board (with charts)** | 254KB | <150KB | Lazy load charts |
| **@asakaa/board (full)** | 254KB | <200KB | Lazy load all heavy features |
| **Gzipped (core bundle)** | ~70KB | **<30KB** | **Primary target** |

### Bundle Breakdown Strategy:

1. **Core Bundle** (~80KB uncompressed):
   - Board component
   - Column/Card components
   - Basic drag-and-drop
   - @asakaa/core
   - @dnd-kit

2. **Feature Chunks** (lazy loaded):
   - `charts.chunk.js` (~400KB) - Analytics charts
   - `pdf.chunk.js` (~150KB) - PDF export
   - `modal.chunk.js` (~30KB) - Card detail modal
   - `bulk.chunk.js` (~15KB) - Bulk operations
   - `command.chunk.js` (~10KB) - Command palette

## Performance Benchmarks to Create

### 1. Bundle Size Benchmark
- Measure gzipped sizes
- Compare v0.6.0 vs v0.7.0
- Track per-component sizes

### 2. Runtime Performance
- Initial load time (Time to Interactive)
- Drag-and-drop FPS (target: 60fps)
- Large dataset (10,000 cards)
- Memory usage profiling

### 3. Tree-Shaking Effectiveness
- Test with sample app
- Verify unused code elimination
- Document optimal import patterns

## Next Steps

1. ✅ **Create this analysis** (DONE)
2. ⏳ Implement lazy loading for heavy components
3. ⏳ Remove Jotai dependency
4. ⏳ Optimize framer-motion usage
5. ⏳ Implement virtual scrolling
6. ⏳ Create benchmark suite
7. ⏳ Measure and document improvements

## Success Metrics

- [x] Core package <50KB ✅ (20KB - **150% better**)
- [ ] Board core bundle <100KB gzipped (target: <30KB)
- [ ] Support 10,000+ cards at 60fps
- [ ] Time to Interactive <2s
- [ ] Memory usage <80MB for 10k cards
- [ ] Tree-shaking verified (unused code eliminated)

---

**Generated**: 2025-10-19
**Phase**: 3 of 5
**Status**: Analysis complete, optimization in progress
