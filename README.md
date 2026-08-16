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
- ☁️ **Nube**: sincroniza de verdad con **tu nube personal** (Google Drive o WebDAV), notificaciones y exportación de respaldo JSON.
- 📴 **Offline**: funciona sin conexión a internet (service worker).

## ☁️ Sincronización con tu nube personal

En la pestaña **Nube → "Mi Nube Personal"** puedes conectar tu propia nube y sincronizar todos tus datos (agenda, tareas, hábitos y notas) entre dispositivos. La configuración se guarda en tu dispositivo.

### Google Drive
1. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com/).
2. Activa las APIs **Google Drive API** y **Google Picker API**.
3. Crea una **API Key** (credenciales → API keys) y copia su valor.
4. Configura la **pantalla de consentimiento OAuth** y crea un **OAuth Client ID** de tipo *Web*.
5. En el Client ID, añade a *Authorized JavaScript origins* tu dominio: `https://domi197669.github.io`.
6. En la app: pega la **API Key** y el **Client ID**, pulsa **"Elegir archivo en Drive"** (o **"Crear archivo de respaldo"**) y autoriza el acceso.

### WebDAV (Nextcloud, ownCloud, Synology, etc.)
1. En la app selecciona el proveedor **WebDAV**.
2. Indica la **URL del archivo** de respaldo, por ejemplo (Nextcloud):
   `https://tudominio/remote.php/dav/files/usuario/AgendaDigital/agendadigital.json`
3. Escribe tu **usuario** y **contraseña** (en Nextcloud se recomienda una contraseña de app).
4. Pulsa **"Guardar y conectar"**. La carpeta padre debe existir y permitir escritura.

### Sincronizar
- **Subir datos**: sube tus datos locales a tu nube.
- **Descargar datos**: descarga el respaldo de tu nube y reemplaza los datos locales (pide confirmación).
- La **auto-sincronización** sube los cambios automáticamente tras cada edición si está activa.

## 🧑‍💻 Desarrollo

- **App nativa Android**: Kotlin + Jetpack Compose + Room (código en este repositorio).
- **PWA multiplataforma**: HTML/CSS/JS en la carpeta [`/pwa`](./pwa), con manifest y service worker.
