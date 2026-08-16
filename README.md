<div align="center">

<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

  <h1>AgendaDigital</h1>

  <p>Agenda digital personal con calendario, tareas, hábitos, notas, recordatorios diarios y sincronización en la nube.</p>

</div>

## 📲 Descargar / Instalar

### Android
- **APK**: descarga `app-debug.apk` desde la [Release v1.0.0](https://github.com/Domi197669/Agenda-Digital/releases/tag/v1.0.0) e instálala en tu dispositivo.
- **PWA**: abre la versión web en Chrome y usa el menú **"Añadir a la pantalla de inicio"**.

### iOS (iPhone / iPad)
1. Abre la [PWA de AgendaDigital](https://domi197669.github.io/Agenda-Digital/pwa/) en **Safari**.
2. Pulsa el botón **Compartir** (cuadrado con flecha hacia arriba).
3. Selecciona **"Agregar a la pantalla de inicio"**.
4. La app quedará instalada como una app nativa, con soporte offline y notificaciones.

> La PWA funciona en cualquier navegador moderno (Chrome, Safari, Edge, Firefox) y es instalable en Android e iOS.

## ✨ Funciones

- 📅 **Agenda**: calendario mensual, franja de 7 días, búsqueda y filtros por categoría.
- ✅ **Tareas**: lista de pendientes con seguimiento de progreso diario.
- 🔥 **Hábitos**: rachas diarias y metas semanales.
- 📝 **Notas**: notas fijadas, colores y categorías.
- ☁️ **Nube**: sincronización simulada, notificaciones y exportación de respaldo JSON.
- 📴 **Offline**: funciona sin conexión a internet (service worker).

## 🧑‍💻 Desarrollo

- **App nativa Android**: Kotlin + Jetpack Compose + Room (código en este repositorio).
- **PWA multiplataforma**: HTML/CSS/JS en la carpeta [`/pwa`](./pwa), con manifest y service worker.
