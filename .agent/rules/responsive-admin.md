# Mobile Admin UX Standard

> [!IMPORTANT]
> **Принцип №1**: На мобильных устройствах (< 768px) не существует колонок. Весь интерфейс должен быть **строго вертикальным (1 колонка)**.

## 1. Grid Systems
Все CSS Grid классы (`formGrid2`, `formGrid3`, `formGrid4`) на мобильных должны превращаться в `grid-template-columns: 1fr`.
Никаких исключений. Если контент не помещается — скролл (но не горизонтальный, а вертикальный стек).

### CSS implementation pattern:
```css
@media (max-width: 768px) {
  .formGrid2,
  .formGrid3,
  .formGrid4,
  .formRow {
    grid-template-columns: 1fr !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 16px !important;
    width: 100% !important;
    min-width: 0 !important; /* Fix flex child overflow */
  }
}
```

## 2. Text & Inputs
- **Inputs**: `font-size: 16px` (чтобы iOS не зумил).
- **Labels**: `word-break: break-word`.
- **Buttons**: `width: 100%`, `white-space: normal`, `height: auto` (разрешить многострочность).

## 3. Containers
- **Padding**: Максимум `12px` или `16px`. `32px` — запрещено.
- **Overflow**: `overflow-x: hidden` на `body` и главном контейнере.
- **Box Sizing**: `border-box` глобально для мобильной секции.
