# Palette's Journal

## 2024-05-22 - Accessibility in Audio Interfaces
**Learning:** Audio interfaces (like scream analyzers) often lack screen reader support for real-time data. Visual bars need ARIA equivalents like `role="progressbar"` or live regions to communicate volume/intensity to non-sighted users.
**Action:** When visualizing audio data, always include a semantic HTML element (meter/progress) or ARIA attributes that reflect the current state, potentially using `aria-live` for significant threshold changes.
