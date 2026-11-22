# SFX (turno, ganador y tics de timer) — créditos y licencia

- **Cambio de turno:** "Confirmation 1" (0,3 s) — **Kenney**
  - Fuente: <https://opengameart.org/content/interface-sounds> (Interface Sounds)
  - Licencia: **CC0** (dedicada al dominio público; atribución voluntaria, pero se agradece).
  - Nota: el fichero original es OGG; se transcodificó a MP3 con `ffmpeg` para mantener coherencia con el resto de `assets/sounds/`.

- **Ganador:** "Round End" (1,7 s) — **qubodup**
  - Fuente: <https://opengameart.org/content/oldschool-win-and-die-jump-and-run-sounds>
  - Licencia: **CC0** (dedicada al dominio público; atribución voluntaria, pero se agradece).
  - Nota: el fichero original es WAV; se transcodificó a MP3 con `ffmpeg`.

- **Tic de aviso (≤ 10 s):** "Clock tick 0" (0,34 s) — **IgnasD**
  - Fuente: <https://opengameart.org/content/clock-tick-0>
  - Licencia: **CC0** (dedicada al dominio público; atribución voluntaria, pero se agradece).
  - Sustituye al bip sintetizado anterior en `timer/warning.mp3`.

- **Tic de crítico (≤ 5 s):** "Selection beep" (0,16 s) — **cosmac**
  - Fuente: <https://opengameart.org/content/selection-beep>
  - Licencia: **CC0** (dedicada al dominio público; atribución voluntaria, pero se agradece).
  - Sustituye al bip sintetizado anterior en `timer/critical.mp3`.

- **Nivel:** todos normalizados a **−16 LUFS** (antes: turno −14,4 LUFS, ganador −22,1 LUFS, aviso −28,8 LUFS y crítico −17,6 LUFS; ahora son coherentes entre sí).

## Sustitución por otros sonidos

1. Reemplaza `public/assets/sounds/turn.mp3` / `winner.mp3` por tus ficheros (conserva los nombres, o actualiza las rutas en `src/app/core/services/timer-sound.service.ts`).
2. Verifica que la licencia permita empaquetarlos en un producto **AGPL v3** (CC0 / CC-BY con atribución aquí son seguras).
3. Deben ser cortos (< 3 s) y no taparse entre sí: el de turno suena al inicio de cada turno y el de ganador al final de la partida.
