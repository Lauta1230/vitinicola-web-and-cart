# Data — La Vinícola Mendoza — Fuente de Verdad

**Estado:** ✅ COMPLETO PENDIENTE VALIDACIÓN — 661 productos extraídos de Carta LV MDZ_OCTUBRE.pdf

## Archivos

- `inventario-carta.json` — **FUENTE DE VERDAD**. 661 registros literales con metadata, categorías (113 bodegas), páginas, dudosos, inconsistencias. Respeto 100% a nombres y precios visibles.
- `inventario-carta.csv` — Mismo inventario en CSV para validación en Sheets/Excel (id, pagina, categoria, bodega, nombre, precio_texto, precio, estado, notas).
- `schema-carta.json` — JSON Schema para validar estructura.
- `raw/carta_octubre/` — Carpeta para guardar el PDF/JPG original intacto. Las 14 imágenes ya fueron procesadas; si re-subís el PDF original, se copia aquí sin modificar.

## Resumen rápido

- **Total:** 661 (659 OK + 2 DUDOSO)
- **Páginas con vinos:** 2–13 (12 páginas)
- **Categorías:** 113 bodegas alfabéticas
- **Precios:** 660 con precio, 1 sin precio
- **Campos faltantes:** descripción 0%, presentación 0%, añada solo 5/661, cepa embebida en nombre
- **Dudosos:** VIN-053 ($22.200 suelto), VIN-145 (Conscientemente sin precio)
- **Ilegibles:** 0

## Cómo validar

1. Abrí `inventario-carta.csv` en Google Sheets.
2. Filtrá `estado_lectura = DUDOSO`.
3. Verificá `nombre_completo_visible` y `precio_texto_original` contra la imagen de la página indicada.
4. Comentá correcciones por ID (ej: VIN-053 debería ser ...).
5. Una vez validado, se marca `metadata.estado = COMPLETO_VALIDADO`.

## Reglas

- No inventar vinos/bodegas/cepas/precios/añadas.
- Mantener nombres y precios exactamente como aparecen (typos preservados: Cavernet, Rolana, etc.).
- Precios con salto de línea unificados (ej $11.50 +0 → $11.500) con nota.
- No eliminar duplicados sin reportar.

## Próximo paso

Validación humana → luego Demo Maestra (sin traducción/moneda/sommelier/packs hasta validación).

