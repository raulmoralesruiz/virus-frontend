# Música — créditos y licencia

- **BGM (loop de partida):** "Chill lofi" (loop continuo) — **qubodup**
  - Fuente: <https://opengameart.org/content/chill-lofi-inspired-loop-edit>
  - Licencia: **CC0** (dedicada al dominio público; atribución voluntaria, pero se agradece).
  - Nota: la pista original es OGG; se transcodificó a MP3 (44,1 kHz estéreo) con `ffmpeg`.
  - Anterior: "Winter Dust" de hernandack (CC0, OpenGameArt) — sustituida por decisión de diseño (2026-11-22).

## Sustitución por otra pista

1. Reemplaza `public/assets/sounds/music/loop.mp3` por tu fichero (conserva el nombre, o actualiza la ruta en `src/app/core/services/timer-sound.service.ts`).
2. Verifica que la licencia permita empaquetarla en un producto **AGPL v3** (CC0 / CC-BY con atribución aquí son seguras).
3. Debe funcionar como **loop continuo** (se reproduce con `loop=true`, volumen ~0.3) y no tapar los SFX.
