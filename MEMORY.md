
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

## 5. Verification & Launch

- [x] Run full test suite. (Ready for user run)
- [x] Perform UI Smoke Test (Manual/Screenshot). (Ready for use run)
- [x] Final "Definition of Done" check.

 # #   6 .   L u x u r y   U X   &   A d a p t i v e   U I   ( E x p e r t   P o l i s h ) 
 
 -   [ x ]   * * A d a p t i v e   U I * * :   I m p l e m e n t   T i l d a - s t y l e   b r e a k p o i n t s   ( M o b i l e ,   T a b l e t ,   D e s k t o p ) . 
 -   [ x ]   * * C o n t r a s t   A u d i t * * :   F i x   a l l   b l a c k - o n - n a v y   a n d   l o w - c o n t r a s t   t e x t . 
 -   [ x ]   * * S p a c e   &   F l o w * * :   I n c r e a s e   w h i t e   s p a c e   a n d   r e m o v e   ' c l u t t e r e d '   b a n n e r   o v e r l a y s   o n   m o b i l e . 
 -   [ x ]   * * I n t e r a c t i o n * * :   E n s u r e   p r e m i u m   a n i m a t i o n s   a n d   t o u c h - f r i e n d l y   c o n t r o l s .  
 
## 7. Compliance & Legal (Yandex Maps)
- [ ] **Attribution**: 
    - [ ] Logo Yandex must be visible (do not hide via CSS).
    - [ ] "Terms of Use" link must be visible.
- [ ] **Limits**:
    - [ ] Geocoder: < 1000 requests/day (HTTP API), < 25000 requests/day (JS API).
    - [ ] Tiles: < 40 requests/second.
- [ ] **Data Usage**:
    - [ ] Do not store/cache data > 30 days.
    - [ ] Do not use for closed/paid systems (must be public access).
