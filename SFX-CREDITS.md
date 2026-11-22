# SFX (turno y ganador) — créditos y licencia

- **Cambio de turno:** "Confirmation 1" (0,3 s) — **Kenney**
  - Fuente: <https://opengameart.org/content/interface-sounds> (Interface Sounds)
  - Licencia: **CC0** (dedicada al dominio público; atribución voluntaria, pero se agradece).
  - Nota: el fichero original es OGG; se transcodificó a MP3 con `ffmpeg` para mantener coherencia con el resto de `assets/sounds/`.

- **Ganador:** "Round End" (1,7 s) — **qubodup**
  - Fuente: <https://opengameart.org/content/oldschool-win-and-die-jump-and-run-sounds>
  - Licencia: **CC0** (dedicada al dominio público; atribución voluntaria, pero se agradece).
  - Nota: el fichero original es WAV; se transcodificó a MP3 con `ffmpeg`.

- **Nivel:** ambos normalizados a **−16 LUFS** (los anteriores estaban entre −14,4 y −22,1 LUFS; ahora son coherentes entre sí y con los tics del timer).

## Sustitución por otros sonidos

1. Reemplaza `public/assets/sounds/turn.mp3` / `winner.mp3` por tus ficheros (conserva los nombres, o actualiza las rutas en `src/app/core/services/timer-sound.service.ts`).
2. Verifica que la licencia permita empaquetarlos en un producto **AGPL v3** (CC0 / CC-BY con atribución aquí son seguras).
3. Deben ser cortos (< 3 s) y no taparse entre sí: el de turno suena al inicio de cada turno y el de ganador al final de la partida.
