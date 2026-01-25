# Master Checklist: EstateAnalytics

## 1. Foundation & Rules

- [x] Create core rules (`project`, `design`, `api`, `backend`).
- [x] Setup Agent Workspace (`.agent/rules`, `.agent/workflows`).
- [x] Add `process.md` with Verification Gates.

## 2. Environment & Tooling

- [x] Create `docker-compose.yml`.
- [x] Create `Makefile`.
- [x] Create `README.md`.
- [x] **Verify** CLI commands (`make lint`, `make test`) work without errors. (Added `manage.ps1` for Windows)

## 3. Backend (FastAPI)

- [x] Skeleton (`apps/api`).
- [x] **Dependencies**: Ensure `ruff`, `mypy`, `pytest` are installed and configured.
- [x] **Health Check**: Verify `/healthz` returns 200 via `curl`/test.
- [x] **Middleware**: Request ID, Structured Logging.
- [x] **Tests**: Unit test for `/healthz`.

## 4. Frontend (Next.js)

- [x] Skeleton (`apps/web`).
- [x] **Dependencies**: Ensure `eslint`, `prettier` are working.
- [x] **Integration**: Verify homepage connects to Backend `/healthz`.
- [x] **UI**: Check basic responsiveness.
- [x] **Adaptive UI**: Implement Tilda-style breakpoints (Mobile, Tablet, Desktop).
- [x] **Contrast Audit**: Fix all black-on-navy and low-contrast text.
- [x] **Space & Flow**: Remove 'cluttered' banner overlays on mobile.

## 5. Verification & Launch

- [x] Run full test suite. (Ready for user run)
- [x] Perform UI Smoke Test (Manual/Screenshot). (Ready for use run)
- [x] Final "Definition of Done" check.

## 6. Map & Mobile Navigation (COMPLETE)

- [x] **Zoom Controls**: Implement City/Region/Reset navigation.
- [x] **Auto-Zoom**: Deeper zoom (level 18) when a property is selected.
- [x] **Universal Navigation**: Prev/Next navigation for properties on Mobile & Desktop.
- [x] **Integrated Hub**: Tabs (Info, News, Social) unified across all platforms.
- [x] **Side Panel (Desktop)**: Premium slide-in panel for deep-dive property info.

## 7. Premium Mobile Interactions (COMPLETE) 📱

- [x] **Touch Zones**: 44-48px minimum tap targets (iOS guidelines).
- [x] **Animations**: Staggered menu animations, smooth transitions.
- [x] **Tactile Feedback**: Touch-ripple effects on interactive elements.
- [x] **Safe Area**: Support for devices with notches.

## 8. Z-Index & Stacking Order (COMPLETE) 🎚️

- [x] **Mobile Menu**: Full-screen overlay with z-index 9999.
- [x] **Leaflet Controls**: z-index 400 (below menu, above map).
- [x] **Map Panels**: z-index 300 (fade when popup open).
- [x] **Popup CSS**: `:has()` selector for auto-fading panels.

## 9. Admin Panel Improvements (Active)

- [x] Fix Admin Property Map (Dark Box Issue).
