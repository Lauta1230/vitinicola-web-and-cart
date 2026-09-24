# La Vinícola Mendoza — Catálogo Premium

**Demo Maestra BlackXProyect — FASE 1**

Vinoteca · Peatonal Sarmiento 110, Ciudad de Mendoza  
Instagram: https://www.instagram.com/lavinicola_mdz · Maps: https://maps.app.goo.gl/ZWBNoPtNnWTM5qQu8

---

## Estado Fase 1 — Catálogo Digital Premium

**Fuente de verdad:** `data/inventario-carta.json` (661 registros, 659 OK + 2 DUDOSO fuera de catálogo)  
**Carta:** Octubre — 14 páginas (12 con vinos), precios ARS, extracción literal sin invención.

**Visible en catálogo:** **659 vinos** de **113 bodegas**  
**No visibles:** VIN-053 y VIN-145 (DUDOSO) hasta confirmación del establecimiento  
**Build:** `npm run build` ✅ · `npm run check` ✅ (tsc --noEmit)

---

## Stack

- React 19 + TypeScript + Vite 8
- CSS custom properties (tokens), mobile-first
- Sin dependencias externas de UI

## Estructura

```
src/
  data/
    business.ts      // config La Vinícola
    catalog.ts       // allWines (659 OK), groupedByBodega, bodegaList
  components/
    Header.tsx       // sticky, Maps + IG
    Hero.tsx         // LA VINÍCOLA Mendoza + CTAs
    SearchBar.tsx    // búsqueda instantánea nombre/bodega
    WineryExplorer.tsx // 113 bodegas: sheet + buscador + chips destacadas (sin 113 chips)
    Catalog.tsx      // agrupado por bodega o grilla plana filtrada
    WineCard.tsx     // nombre + bodega + precio + añada
    WineSheet.tsx    // bottom sheet premium, compartir WA
    Footer.tsx
  hooks/
    useDebounce.ts
  utils/
    formatPrice.ts   // $ 52.800
    search.ts        // normalize + filter
  styles/
    tokens.css
    global.css
  App.tsx
  main.tsx
data/
  inventario-carta.json  // fuente de verdad
  inventario-carta.csv   // validación Sheets
  schema-carta.json
docs/
  ANALISIS-CARTA-VINICOLA-MENDOZA.md
  INVENTARIO-PREVIEW.md
```

## Desarrollo

```bash
npm install
npm run dev    # http://localhost:5173  (host 0.0.0.0, allowedHosts: true para preview Arena)
npm run build  # tsc -b + vite build
npm run check  # tsc --noEmit
npm run preview
```

**Preview Arena:** https://5173-{sandboxId}.e2b.app (Vite con `allowedHosts: true` para proxy)

## Reglas de datos

- Solo `data/inventario-carta.json` (659 OK). No se inventan cepas, añadas, volúmenes, alcohol, puntajes, maridajes, imágenes, promos.
- `precio` se muestra exactamente como `$ 52.800` (ARS). No hay USD/BRL todavía (Fase 2).
- WineCard sin foto inventada: monograma editorial + tipografía.
- WineSheet con espacios reservados para Fase 3-7 pero sin placeholders vacíos visibles.

## Validación Fase 1

- 661 registros en inventario ✔
- 659 OK visibles ✔
- 2 DUDOSO ocultos ✔
- Nombres y precios intactos ✔
- Búsqueda instantánea funciona (ej: "Quimera" → 2) ✔
- Navegación 113 bodegas sin barra inmanejable ✔
- WineSheet abre/cierra, compartir WA ✔
- Responsive 320/375/390/430 + tablet/desktop ✔
- Sin `scrollIntoView` (solo `window.scrollTo` y `scrollLeft` en carrusel) ✔
- Build y check sin errores ✔

## Próximas fases (no implementadas)

- Fase 2: ES/PT/EN + ARS/BRL/USD
- Fase 3: Filtros cepa/estilo
- Fase 4: Rango precio + ocasión
- Fase 5: Packs y cajas
- Fase 6: Sommelier + maridaje
- Fase 7: Carrito + WhatsApp + hotel
- Fase 8: Branding dinámico ?local=
- Fase 9: QA + PWA + deploy

---

Demo Maestra BlackXProyect · Mendoza · 2026-09-24
