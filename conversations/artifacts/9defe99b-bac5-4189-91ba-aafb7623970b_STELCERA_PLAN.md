# STELCERA Trading Terminal Modernization - Implementation Plan

This implementation plan outlines the structural, visual, and behavioral modifications required to complete the production-ready modernization of the **STELCERA Trading Terminal**.

---

## 1. Priority 1: Viewport & Camera Alignment (Fix the Blank Chart)

### Problem Diagnosis
During initial WebSocket connection and loading, the DOM container for the canvas has not yet completed its layout pass, resulting in `wrapper.clientWidth` and `wrapper.clientHeight` reading as `0` or minimal values. This causes `centerCamera()` and `centerCameraX()` to lock offsets to incorrect settings, making the active blocks render completely out of bounds.

### Action Plan
1. **app.js**: Patch `centerCamera()` and `centerCameraX()` to safeguard against zero-dimension layout states. If the wrapper width or height is evaluated as `0` or less than `100px`, we schedule a retry after a short delay (e.g., `50ms` using `setTimeout`).
2. **backend_bridge.js**: Update `applyBlocks()` to ensure that camera alignment runs inside a guaranteed delay loop (100ms) on initial load, allowing the DOM to settle and accurately center the latest block column (`blocks.length - 1`) horizontally and vertically with a 5-block safety margin on the right.

---

## 2. Priority 2: Visual & Dynamic Block Styling (Masterplan Aesthetic)

### Problem Diagnosis
1. While the grid canvas renders correctly, active signal blocks are flat and lack premium dark-mode institutional-grade aesthetics.
2. Clicking a block triggers calls to `showPopup()` for `#tradePopup` and `#tradeAmountPopup`, which are completely missing from `index.html` and `style.css`. This leads to JavaScript runtime errors and breaks canvas interactions.

### Action Plan
1. **app.js (drawChart)**: Add custom high-end neon glowing outlines for active signal blocks:
   * **BUY (Green)**: Fill with `#089981`, stroke with `#0af5cd`, apply `shadowColor = '#0af5cd'` and `shadowBlur = 12`.
   * **SELL (Red)**: Fill with `#f23645`, stroke with `#ff4d5a`, apply `shadowColor = '#ff4d5a'` and `shadowBlur = 12`.
   * **Selected (Yellow)**: Solid `#FFD700` fill with glowing yellow stroke and a high-blur yellow shadow (`shadowBlur = 15`).
   * **Hover**: Highlight blocks with a distinct `#FFD700` border and shadow on mouse hover.
2. **index.html**: Insert structural markup for `#tradePopup` and `#tradeAmountPopup` before the closing body tags.
   * `#tradePopup` will feature quick action buttons: **BUY**, **SELL**, and **Close**.
   * `#tradeAmountPopup` will feature input field `#tapAmountInput` (renamed from `#tradeAmountInput` to prevent duplicate DOM IDs with the right panel), entry price preview, available balance, and execution triggers.
3. **style.css**: Add custom CSS rules for the popups to fit them into the sleek, TradingView-inspired dark-theme glassmorphism system:
   * `.trade-popup`: Absolute positioning, custom backdrop-blur, rounded borders, and sleek hover state transitions.
   * `.amount-popup-modal`: A centrally-positioned, floating responsive modal box with high-end glass backdrop-blur and vibrant indicator borders matching the active trade direction (green/red).
4. **app.js (Popups integration)**: Adjust references in `openAmountPopup` and click executors to map to `#tapAmountInput` to ensure a clean separation from the right Order panel.

---

## 3. Priority 3: Interactive Stop-Loss & Limit Order Lines

### Problem Diagnosis
While the stop-loss lines can be rendered, they need to feel highly interactive and premium. Panning the grid or clicking blocks must keep lines synchronized, and the mouse drag loop must be extremely smooth and responsive.

### Action Plan
1. **app.js (drawChart)**: Render the stop-loss line as a thick, glowing horizontal blue line (`#2962ff`, `lineWidth = 2`) with a beautiful dashed pattern (`setLineDash([6, 6])`) and an interactive right-aligned handle labeled `STOP LOSS` with the active price.
2. **app.js (Drag Event Listeners)**: Polish dragging logic in mouse move/up listeners to ensure it updates the local stop loss row level immediately on drag and dispatches the corresponding `/set-stop` POST request to sync with the backend.

---

## 4. Priority 4: 1-8 Block Follow Trail Stop-Loss Automation

### Problem Diagnosis
The backend trailing stop-loss tracking logic has a critical mathematical sign error in `update_trailing_stop()`:
* For **BUY** trades, it subtracts the trail distance from the highest block: `self.stop_loss_row = row - self.trail_blocks`. Because row numbers decrease as price increases, this places the stop loss row *above* the highest price, causing immediate stop-loss triggers!
* For **SELL** trades, it adds the trail distance: `self.stop_loss_row = row + self.trail_blocks`. This places the stop loss row *below* the lowest price, causing immediate stop-loss triggers!

### Action Plan
1. **backend/state.py (update_trailing_stop)**: Fix the calculation signs:
   * **BUY**: Stop loss row must be *below* the highest block (which means a HIGHER row number): `self.stop_loss_row = row + self.trail_blocks`.
   * **SELL**: Stop loss row must be *above* the lowest block (which means a LOWER row number): `self.stop_loss_row = row - self.trail_blocks`.
2. **app.js & UI**: Verify that selecting trailing stop options in the right pane updates state correctly and sends trailing configuration parameters (`trailing_stop = true`, `trail_offset = N`) to the backend upon order placement.

---

## 5. Verification Plan
* Use the **browser subagent** to visit `http://127.0.0.1:8000/`.
* Confirm the infinite diagonal block staircase renders beautifully and centers correctly.
* Perform interactive manual buy/sell orders, click blocks to open popups, drag stop-loss lines on the canvas, and verify trailing stop automated updates as new staircase blocks generate.
