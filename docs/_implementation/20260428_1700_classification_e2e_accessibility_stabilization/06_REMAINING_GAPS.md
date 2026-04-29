# 06_REMAINING_GAPS.md

## Accessibility
- **Screen Reader Testing:** While ARIA labels and semantic structures have been improved, a full session with a screen reader (e.g., NVDA or VoiceOver) is recommended for complex data tables.
- **Color Contrast:** Some status badges use relatively light backgrounds; a contrast audit might suggest darkening the text or border colors further.
- **Keyboard Shortcut Help:** Adding a `?` keyboard shortcut to display available global shortcuts would be a valuable UX improvement.

## E2E Testing
- **Cross-Browser Coverage:** Current tests primarily run on Chromium. Expanding to Firefox and WebKit would ensure consistent accessibility behavior (especially focus rings and focus traps).
- **Concurrency:** Running multiple workers for E2E tests might reveal subtle race conditions in the mocked API responses if not carefully isolated.

## AI Classification
- **Batch Size Performance:** Testing classification with very large frameworks (>500 indicators) may require backend optimization or progress polling in the UI.
- **Human Review Detail:** Currently, bulk approval is binary. Providing a "Review Panel" that lets operators quickly cycle through indicators with full context without opening individual drawers could speed up the finalization phase.
