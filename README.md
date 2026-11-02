# 📡 TP-Link EAP Virtual Wireless Lab & Simulator

> **Simulador interactivo y completo de Punto de Acceso TP-Link EAP (EAP115 / EAP225) con Laboratorio Virtual de Red, Clientes Wi-Fi, Topología interactiva y Diagnóstico en tiempo real.**
>
> 🚀 **100% compatible con GitHub Pages y ejecución local sin servidor.**

---

## 🌟 Características Principales

### 1. 🖥️ Interfaz Web EAP Original Completa (23 Páginas)
Se conserva íntegro el HTML, CSS y diseño corporativo original del firmware de TP-Link EAP, abarcando todas las categorías:
- **Status**: Device Information (tiempo de actividad, CPU, memoria, IP/MAC, puertos), Wireless (SSID list, tráfico de radio y LAN en vivo), Client (tabla de clientes conectados en tiempo real).
- **Wireless**: Wireless Settings (interruptor Radio 2.4GHz, gestión de SSIDs con modales auténticos), Portal de autenticación, VLANs, Filtrado MAC (lista blanca/negra en caliente), Scheduler, QoS, Rogue AP Detection.
- **Management**: Network (DHCP dinámico / IP estática), System Log (Syslog con eventos en vivo), Web Server, Management Access, Control de LEDs, SSH, SNMP.
- **System**: Cuentas de usuario y contraseñas, Controller Settings, Configuración de hora y NTP, Reboot & Factory Reset (con barra de progreso animada), Backup & Restore (exportación e importación de JSON).

### 2. 📱 Laboratorio Virtual de Clientes Wi-Fi
- **Simulación Multi-Dispositivo**:
  - 📱 **Pixel 8 Pro** (Smartphone)
  - 💻 **ThinkPad X1** (Portátil de trabajo)
  - 📹 **SmartCam 1080p** (Cámara de seguridad IoT)
  - 🕵️ **Unknown Scanner** (Cliente sospechoso para pruebas de seguridad)
  - ➕ Posibilidad de añadir clientes personalizados con nombre y dirección MAC propia.
- **Escáner Wi-Fi en Tiempo Real**:
  - Detecta SSIDs emitidos por la EAP y redes vecinas simuladas.
  - Indicador de barras de señal y estado de seguridad (Abierta o WPA2-Personal).
- **Handshake de Conexión Realista**:
  - Comprobación de estado de radio 2.4GHz de la EAP.
  - Validación de contraseña WPA2.
  - Comprobación de reglas de filtrado MAC (Allow / Deny).
  - Comprobación de VLAN en el enlace troncal del router.
  - Asignación de IP dinámica mediante servidor DHCP virtual o APIPA.
  - Verificación de enlace WAN a Internet.
- **Modelo de Propagación RF y Distancia**:
  - Control deslizante de distancia (1 a 40 metros).
  - Cálculo de pérdida de trayectoria en espacio libre (FSPL) en dBm (-35 dBm a -92 dBm).
  - Reducción dinámica de la tasa de enlace (de 300 Mbps a 11 Mbps) y desconexión por señal débil (< -85 dBm).
- **Herramientas de Diagnóstico Integradas**:
  - **Ping Utility**: Ping al Router Gateway (`192.168.0.1`), a la EAP (`192.168.0.254`) o a Internet (`8.8.8.8`) con cálculo de latencia realista (ms) y pérdidas de paquetes.
  - **Speedtest**: Medición interactiva de ancho de banda de descarga y subida según la calidad de la señal.

### 3. 🖧 Topología de Red y Gateway Router
- Diagrama SVG interactivo en tiempo real:  
  `[Internet / Cloud] <===> [Router Gateway] <---(LAN PoE)---> [TP-Link EAP] <···(Wi-Fi)···> [Clientes Conectados]`
- Controles interactivos del Router:
  - **Enlace WAN**: Activar o desactivar para simular caídas de proveedor de Internet (ISP).
  - **Servidor DHCP**: Activar o desactivar para probar fallos de asignación de IP.
  - **VLANs Troncales**: Definir IDs de VLANs permitidas en el enlace (ej: `0, 1, 10, 20`).
  - **IP del Gateway**: Personalizable.

### 4. 🎯 Escenarios Prácticos de Aprendizaje (1-Click Presets)
1. **Entorno Estándar SOHO**: Red segura con WPA2, DHCP activo y clientes en cobertura óptima.
2. **Red de Invitados con VLAN 20**: Segmentación de tráfico corporativo e invitados con aislamiento de VLAN.
3. **Auditoría de Seguridad MAC**: Demostración de listas negras (Deny) y listas blancas (Allow).
4. **Caída de Enlace WAN**: La red local Wi-Fi funciona correctamente pero no hay salida a Internet.
5. **Límite de Cobertura y Señal Débil**: Dispositivo en el límite de cobertura (35 metros) experimentando degradación y cortes.

---

## 🚀 Despliegue en GitHub Pages (Paso a Paso)

Este proyecto está diseñado específicamente para funcionar sin servidores ni dependencias de backend:

1. **Sube los archivos a tu repositorio de GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit: TP-Link EAP Virtual Wireless Lab"
   git push origin main
   ```
2. **Activa GitHub Pages**:
   - En tu repositorio de GitHub, haz clic en **Settings** (Configuración).
   - En el menú lateral izquierdo, haz clic en **Pages**.
   - En la sección **Build and deployment > Branch**:
     - Selecciona la rama: `main` (o `master`).
     - Selecciona la carpeta: `/(root)`.
     - Haz clic en **Save** (Guardar).
3. **¡Listo!** En unos 30 segundos, tu simulador estará disponible públicamente en:
   `https://<tu-usuario>.github.io/<nombre-del-repo>/`

---

## 💻 Uso Local (Sin Conexión a Internet)

Para abrirlo en tu computadora local:
- Simplemente haz doble clic en `index.html` (o ábrelo con cualquier navegador: Chrome, Firefox, Edge, Safari, Brave).
- No requiere instalar Node.js, Python ni servidores locales.

---

## 📂 Estructura del Proyecto

```text
├── index.html           # Punto de entrada principal para GitHub Pages y navegadores
├── simulator.js         # Motor de simulación, lógica RF, estados y puente con el iframe
├── simulator.css        # Hoja de estilos con la estética corporativa TP-Link Omada / EAP
├── eap_pages.js         # Colección estructurada de las 23 páginas HTML originales de la EAP
├── EAP_completo.html    # Versión standalone todo-en-uno auto-contenida
└── README.md            # Documentación completa y guía de laboratorio
```

---

## 🔑 Credenciales de Acceso por Defecto

- **Usuario:** `admin`
- **Contraseña:** `admin`
*(Las credenciales pueden modificarse desde la sección **System > User Account** y se guardan localmente en el navegador).*

---

## 🛠️ Tecnologías Empleadas

- HTML5, CSS3 moderno (Variables CSS, Flexbox, Grid, Animaciones SVG).
- JavaScript Vanilla ES6+ (Sin frameworks pesados, carga instantánea).
- LocalStorage API (Persistencia de configuración, logs y clientes).
- SVG Vectorial Dinámico para diagramas de topología y cobertura.

---

## 📄 Licencia

Desarrollado para fines educativos, formación técnica en redes (CCNA, CWNA, MTCNA), laboratorios académicos y divulgación.
