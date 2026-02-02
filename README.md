# Virus Frontend

Cliente web para el juego de cartas Virus.

Este repositorio contiene la interfaz de usuario desarrollada en Angular, encargada de visualizar el estado del juego y permitir la interacción del jugador en tiempo real.

## 🛠️ Tech Stack

-   **Framework**: Angular (Latest)
-   **WebSocket**: Socket.IO Client
-   **Lenguaje**: TypeScript

## 📁 Rol en el Sistema

El frontend es la capa de presentación. Sus responsabilidades incluyen:
-   Conexión con el backend mediante Socket.IO.
-   Renderizado reactivo del tablero, cartas y estado de los jugadores.
-   Animaciones y feedback visual de las acciones.
-   Gestión de la lógica de UI (drag & drop, selección de cartas).

## 🚀 Instalación Rápida

Requisitos: Node.js (v18+) y pnpm (recomendado).

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd virus-frontend

# Instalar dependencias
pnpm install
```

## 📜 Scripts Disponibles

| Script | Descripción |
| :--- | :--- |
| `pnpm start` | Inicia el servidor de desarrollo en `http://localhost:4200`. |
| `pnpm build` | Compila la aplicación para producción en `dist/`. |
| `pnpm test` | Ejecuta las pruebas unitarias (Karma/Jasmine). |

## ⚙️ Variables de Entorno

La configuración se maneja a través de los archivos `src/environments/`:

-   `production`: Indica si es entorno de producción.
-   `socketUrl`: URL del servidor de Socket.IO.
-   `baseUrl`: URL base para la API REST.

## 📚 Documentación

La documentación completa, incluyendo guías de componentes y eventos, se encuentra centralizada en:

👉 [**Virus Documentation**](https://virusdocs.raulmorales.eu) (Enlace relativo o URL al repo de docs)

## 🤝 Guía para Contribuir

1.  Asegúrate de seguir las reglas de linting del proyecto.
2.  Para cambios visuales, verifica la responsividad.
3.  Sigue el flujo estándar de PR (Fork -> Branch -> PR).

## 📄 Licencia

Este proyecto está bajo la licencia **GNU AGPLv3**. Consulta el archivo `LICENSE` para más detalles.

> **Disclaimer**: Este es un proyecto open source desarrollado por fans y para fans. No tiene afiliación con Tranjis Games. El arte y diseño original pertenecen a sus respectivos creadores.
