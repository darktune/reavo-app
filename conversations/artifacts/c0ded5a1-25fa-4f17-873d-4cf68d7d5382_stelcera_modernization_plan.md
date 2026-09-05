# STELCERA Terminal Modernization Plan

This document outlines the systematic, production-ready implementation plan to modernize the STELCERA Trading Terminal into a premium, institutional-grade, responsive platform, incorporating all requested visual aesthetics and functional features.

---

## 1. Core Visual Pillars (Inspired by `STELCERA.pdf`)
- **Cinematic Deep Black**: Use AMOLED-grade black (`#000000`) for the canvas background and core containers.
- **Luxury Gold Accents**: High-end elements, cursor tools, active badges, and highlight events styled in `#FFD700`.
- **Glowing Neon Indicators**: Emerald green (`#089981`) for bullish, Ruby red (`#f23645`) for bearish, with dynamic CSS shadow glows.
- **Glassmorphism Panels**: Glassmorphism wrappers (`backdrop-filter: blur(20px); background: rgba(10, 10, 10, 0.7); border: 1px solid rgba(255,255,255,0.06)`).

---

## 2. Expanded Feature Architecture

### A. Candlesticks Mode (The "Blocks / Candles" Toggle)
- Add a toggle button in the main chart header to switch between **Blocks** (Signal Block staircase) and **Candles** (Classical Candlesticks with high/low wicks).
- Implement standard candlestick wick rendering on the canvas in `app.js` using historical candle data.
- Fetch real or mock OHLC candle history for the active symbol on timeframe changes so that the chart renders authentic candles.

### B. Chart Header controls & Timeframes
- Add timeframe selector buttons directly to the header: `1m`, `5m`, `15m`, `1h`, `4h`, `1d`.
- Add an **Indicators** dropdown button. Supported overlays:
  - **SMA 20 & SMA 50**: Styled as glowing neon lines.
  - **EMA 9 & EMA 21**: Precision short-term averages.
  - **Bollinger Bands**: Standard deviation band overlays on the canvas.
  - **RSI (14) & MACD**: Interactive split panes rendered below the main grid.
  - **Volume Profile**: Glowing horizontal volume histogram blocks anchored to price levels on the left.

### C. Advanced Drawings & Object Tree
- Supported tools in the left toolbar:
  - **Cursor / None**: Interactive hover tool.
  - **Trendline**: Two-click draggable neon lines.
  - **Brush**: Multi-point brush sketches.
  - **Horizontal Line**: Infinite horizontal support/resistance lines.
  - **Vertical Line**: Timeframe marker lines.
  - **Fibonacci Retracement**: Click-and-drag retracement grid (`0.0%`, `23.6%`, `38.2%`, `50.0%`, `61.8%`, `100.0%`).
  - **Rectangle**: Support/resistance zone highlights.
- Create an **Object Tree** side-panel tab to manage drawn elements (visible, lock, delete toggles).

### D. Market Replay Mode
- Add a Replay Bar to the header.
- When enabled, it allows the user to click on the chart to "rewind" to a historical block index.
- Displays a floating replay bar: `⏪ Rewind`, `⏯ Play/Pause`, `⏩ Forward`, and Replay Speed (`1x`, `2x`, `5x`).
- Animates the price progression step-by-step from the rewind point.

### E. Sentiment Analysis Panel
- Add a dedicated panel showing:
  - **Consensus Price Targets**: Dynamic buy/hold/sell target values.
  - **Technical Gauges**: Oscillators and Moving Averages summary meters (Strong Buy, Buy, Neutral, Sell).
  - **Real-Time News Feed**: Live crypto news articles with sentiment badges (Bullish, Bearish).

### F. Watchlist, Screeners & Alerts
- **Watchlist**: Beautiful sidebar listing BTC/USDT, ETH/USDT, SOL/USDT, DOGE/USDT, and pump.fun memecoins (WIF, BONK) with 24h prices and volumes.
- **Screener**: Performance tables for all supported pairs.
- **Alerts**: Custom alerts manager. Support price crossing, RSI overbought/oversold, and EMA crossover. Triggers beautiful in-app neon modals and notifications!

### G. AI Assistant & Suggestions
- Tab in the right sidebar offering:
  - **Market Summary**: Automated AI market summaries based on the current price pattern and indicators.
  - **Trade Advisor**: Analyzes user's active/past trades, win rates, and offers actionable suggestions to improve decisions.

### H. Performance, Seasonals & Technicals Panel
- **Seasonals**: Average monthly returns of the active asset.
- **Technicals**: Advanced metrics table showing RSI values, MACD lines, Stochastic levels, and EMAs.

---

## 3. Immediate Implementation Steps

1. **Backend Integration Enhancements**:
   - Update `backend/state.py` to hold `sim_paused` and `sim_speed` attributes.
   - Update `backend/services/market.py` to make the simulated feed respect the pause and speed states.
   - Update `backend/main.py` WS message router to support `set_sim_paused` and `set_sim_speed` actions.
2. **Client-Side Simulation Sync**:
   - Update `backend_bridge.js` to expose `setSimPaused(paused)` and `setSimSpeed(speed)`.
   - Update `app.js` and `index.html` simulation controls to send WS messages, ensuring buttons react instantly.
3. **Expand HTML & CSS Structure**:
   - Insert new panels, timeframe selector, replay controls, indicators selector, and sidebar tabs in `index.html`.
   - Write style classes in `style.css` for the AMOLED theme, glassmorphic cards, alerts, news, gauges, and AI panels.
4. **Implement Candlesticks, Indicators & Drawing Rendering**:
   - Write rendering functions in `app.js` to draw wicks, candles, SMA/EMA curves, Bollinger Bands, Volume Profile, Fibonacci grids, and active drawings.
5. **Implement Watchlist, News, Replay, and AI Assist JS Logic**:
   - Add frontend modules for replay execution, drawing mouse handlers, indicators calculation, alerts triggering, and simulated AI summaries.

Let's begin!
