# Data — La Vinícola Mendoza

Esta carpeta contiene la **fuente de verdad** de la Demo Maestra BlackXProyect.

## Estructura

- `inventario-carta.json` — Inventario normalizado extraído **literal** de la carta. Actualmente vacío (`estado: PENDIENTE_CARTA_NO_LOCALIZADA`) hasta recibir el PDF/JPG.
- `schema-carta.json` — JSON Schema para validar el inventario. Obliga a respetar IDs, páginas y estado de lectura.
- `raw/` — Aquí se guardará el archivo original de la carta **sin modificar** (PDF o imágenes) en cuanto sea re-subido. No se versiona con transformaciones.
- `../docs/ANALISIS-CARTA-VINICOLA-MENDOZA.md` — Informe completo con los 7 puntos solicitados.

## Reglas

- No inventar vinos, bodegas, cepas, precios ni añadas.
- Mantener nombres y precios exactamente como aparecen.
- Marcar `DUDOSO` / `ILEGIBLE` si no puede leerse con seguridad.
- No eliminar duplicados sin antes reportarlos en `inconsistencias`.

## Próximo paso

Re-subir la carta en el chat de Arena. El agente la guardará en `data/raw/` y completará `inventario-carta.json`.
