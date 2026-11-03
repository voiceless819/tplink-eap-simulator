# 📡 TP-Link EAP Virtual Wireless Lab & Simulator (Packet Tracer Style)

> **Simulador interactivo y completo de Punto de Acceso TP-Link EAP (EAP115 / EAP225) con Laboratorio Multi-Dispositivo tipo Cisco Packet Tracer, Topología interactiva con arrastre, Consola CLI, Navegador Web, Escáner Wi-Fi y Diagnóstico.**
>
> 🚀 **100% compatible con GitHub Pages y ejecución local sin servidores.**

---

## 🌟 Novedades y Características Principales

### 1. 🖧 Laboratorio Multi-Dispositivo (Estilo Cisco Packet Tracer)
- **Lienzo Gráfico Interactivo (Canvas SVG)**:
  - Muestra el Router Gateway, el cable PoE LAN, la EAP con sus anillos de cobertura de 2.4 GHz y todos los dispositivos conectados.
  - **Arrastrar y Soltar (Drag & Drop)**: Puedes arrastrar libremente cualquier dispositivo por el lienzo para alejarlo o acercarlo a la EAP.
  - **Física RF en Tiempo Real**: Al mover un dispositivo, su distancia (metros), potencia de señal estimada (RSSI en dBm) y tasa de enlace (Mbps) se recalculan automáticamente según el modelo de pérdida de trayectoria (*Free Space Path Loss*).
  - Si alejas un dispositivo más allá del radio de cobertura (>35 metros o < -85 dBm), la señal se degrada y pierde la conexión.
- **2 o Más Dispositivos Simultáneos**:
  - Añade todos los dispositivos que quieras con el botón **➕ Añadir Dispositivo** (Smartphones, Portátiles/Laptops, Tablets, Cámaras IoT o PCs de escritorio).
  - Varios dispositivos pueden estar asociados simultáneamente a la misma red o a redes distintas (ej: unos en la red corporativa y otros en la red de invitados).
  - En la interfaz web de la EAP (**Status > Client**), **todos los clientes conectados aparecen listados en tiempo real** en la tabla oficial de TP-Link.

### 2. 📱 Dispositivo Virtual Totalmente Usable (Móvil / Portátil)
Al seleccionar cualquier dispositivo del lienzo, se abre su pantalla interactiva con 4 aplicaciones de prueba:
- 📶 **Gestor Wi-Fi**:
  - Interruptor de encendido/apagado del adaptador Wi-Fi.
  - Escaneo continuo de redes que detecta los SSIDs configurados en la EAP en tiempo real.
  - Diálogo de conexión que pide la contraseña WPA2 si la red es segura.
  - Soporte para conectar a redes con SSID oculto.
  - Información de conexión: IP asignada, Puerta de enlace, DNS, RSSI en dBm y botón de desconexión.
- 💻 **Consola Terminal (CMD / CLI)**:
  - Línea de comandos interactiva donde puedes ejecutar:
    - `ipconfig` / `ifconfig`: Muestra la IP, máscara de subred, gateway, DNS y MAC.
    - `ping <ip>`: Envía paquetes ICMP al Router (`192.168.0.1`), a la EAP (`192.168.0.254`) o a Internet (`8.8.8.8`) mostrando tiempos de respuesta reales (ms).
    - `tracert <ip>` / `traceroute <ip>`: Realiza la traza de saltos hasta el destino.
    - `netsh wlan show`: Información técnica del enlace 802.11n, canal, cifrado AES, señal y velocidad.
    - `curl <url>`: Realiza peticiones HTTP al servidor web de la EAP o a servidores externos.
    - `help` / `clear`: Ayuda y limpieza de pantalla.
- 🌐 **Navegador Web Integrado**:
  - Permite navegar a `http://192.168.0.254` para comprobar la respuesta HTTP del servidor web de la EAP, a `http://192.168.0.1` para el Router o a sitios web de Internet.
- ⚡ **Speedtest**:
  - Mide la velocidad real de subida y bajada en función de la atenuación RF y distancia del dispositivo a la antena.

### 3. 🖥️ Las Configuraciones Reales se hacen dentro de la Web de la EAP
**La página web de la EAP es la fuente de la verdad del simulador.** Todas las 23 páginas son totalmente configurables:
- **Wireless Settings (Página 3)**:
  - El interruptor de la Radio 2.4GHz apaga o enciende la emisión física. Si se apaga, los dispositivos pierden la señal inmediatamente.
  - Tabla de SSIDs con modales auténticos de TP-Link: crear, editar y eliminar redes (nombre SSID, emisión visible/oculta, clave WPA2, ID de VLAN y aislamiento de invitados).
- **Client List (Página 2)**:
  - Muestra todos los dispositivos conectados con su Hostname, IP DHCP, MAC, RSSI y velocidad.
  - Botón **Desconectar** y botón **Bloquear** (envía la MAC directamente a la lista negra del filtrado MAC y expulsa al cliente).
- **Filtrado MAC (Página 6)**:
  - Activa la regla *Deny* (lista negra) o *Allow* (lista blanca). Si un dispositivo viola la regla configurada, se le deniega el acceso al instante.
- **Gestión IP de Red (Página 10)**:
  - Cambia la IP de la EAP (ej. a `192.168.1.50`). El cambio se refleja en el estado, en el ping de los dispositivos y en la topología.
- **Syslog en Vivo (Página 11)**:
  - Registro de auditoría en tiempo real con eventos de autenticación, DHCP, expulsiones y cambios de configuración.
- **Reboot & Reset (Página 20)**:
  - Barra de progreso auténtica de reinicio que desconecta a los clientes y reinicia los servicios.
- **Backup & Restore (Página 21)**:
  - Descarga e importa copias de seguridad de la configuración en JSON.


## 💻 Uso Local (Sin Conexión)

- Abre directamente `index.html` en cualquier navegador web moderno (Chrome, Edge, Firefox, Safari).
- No requiere instalar dependencias, servidores web ni entornos de ejecución adicionales.

---

## 📂 Estructura del Proyecto

```text
├── index.html           # Interfaz principal optimizada para GitHub Pages
├── simulator.js         # Motor Packet Tracer multi-dispositivo, CLI, RF y puente iframe
├── simulator.css        # Hoja de estilos con la estética corporativa de TP-Link
├── eap_pages.js         # Repositorio estructurado con las 23 páginas originales de la EAP
├── EAP_completo.html    # Versión 'todo en uno' auto-contenida en un único fichero
└── README.md            # Documentación completa
```

---

## 🔑 Credenciales por Defecto

- **Usuario:** `admin`
- **Contraseña:** `admin`  
*(Se pueden modificar desde la sección **System > User Account** y persisten localmente).*
