# Manual Swap Verification — "Don't Ask Again" + "Are You Sure?" UI Update

## Changes Made

### Files Modified

#### [index.html](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/D_MEX%20PROTOCOL/frontend/index.html)
- Added a **"Don't ask again"** checkbox (`#dont-ask-checkbox`) inside the existing ATM-style swap verification modal, positioned below the action buttons
- Added an entirely new **"Are you sure?"** modal (`#skip-verify-modal`) with:
  - Red warning triangle icon
  - "You have disabled manual swap verification" subtitle
  - A **consequences box** listing 4 specific risks of skipping verification:
    1. No visual preview of swap details
    2. No opportunity to catch input errors
    3. On-chain transactions are irreversible
    4. Loss of pre-flight confirmation step
  - "Go Back" button (re-enables verification)
  - "⚠ Proceed Without Verification" danger button (red)
  - Reminder that verification can be re-enabled in Guardian AI Settings

#### [styles.css](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/D_MEX%20PROTOCOL/frontend/styles.css)
- `.dont-ask-row` — styled checkbox row with hover effect
- `.skip-verify-content`, `.skip-verify-header`, `.skip-verify-icon` — danger-themed modal header
- `.skip-verify-warning`, `.skip-warn-title`, `.skip-warn-list` — red-bordered consequences panel
- `.danger-btn` — red button styling with hover glow
- `.skip-verify-restore` — help text footer

#### [app.js](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/D_MEX%20PROTOCOL/frontend/app.js)
- Modified `proposeBtn` click handler to check `localStorage.getItem('dmex_skip_swap_verify')` and route to either the verification modal or the bypass warning
- `verify-confirm` handler now persists checkbox state to `localStorage`
- New `showSkipVerifyWarning()` function opens the "Are you sure?" modal
- `skip-verify-cancel` handler re-enables verification, unchecks the box, and opens the normal verification modal
- `skip-verify-confirm` handler proceeds directly to `executeSwapCommit()`
- All actions are logged to the terminal for audit trail

## User Flow

```
User clicks "Propose Intent"
├── First time (or verification ON):
│   └── ATM-style Verification Modal opens
│       ├── ☐ "Don't ask again" checkbox
│       ├── "Cancel" → closes
│       └── "✓ Confirm & Execute Swap" → saves pref → executes
│
└── "Don't ask again" was checked previously:
    └── "Are You Sure?" Warning Modal opens
        ├── Shows 4 consequences of skipping
        ├── "Go Back" → re-enables verification, opens verify modal
        └── "⚠ Proceed Without Verification" → executes directly
```

## Persistence
- Preference stored in `localStorage` under key `dmex_skip_swap_verify`
- Checkbox state is restored on page load
- "Go Back" in the warning modal automatically resets the preference
