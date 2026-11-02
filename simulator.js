/**
 * TP-Link EAP Virtual Wireless Lab & Simulator - Core Engine
 * Multi-device Packet Tracer architecture, virtual device shells,
 * full form configurability across all 23 EAP web pages.
 */

(function(window) {
  'use strict';

  // =========================================================================
  // Canvas Constants & Initial Layout
  // =========================================================================
  const AP_CANVAS_X = 200;
  const AP_CANVAS_Y = 130;

  // =========================================================================
  // Default Initial State
  // =========================================================================
  const DEFAULT_STATE = {
    session: 'admin',
    users: {
      'admin': 'admin'
    },
    device: {
      name: 'EAP115-30-68-93-BA-7F-A8',
      model: 'EAP115 v4.0',
      mac: '30:68:93:BA:7F:A8',
      ip: '192.168.0.254',
      mask: '255.255.255.0',
      gateway: '192.168.0.1',
      dns: '192.168.0.1',
      connType: 'dynamic', // 'dynamic' or 'static'
      uptimeSec: 1680,
      cpu: 4,
      mem: 41,
      led: true,
      port0: '100Mbps - FD'
    },
    wireless: {
      radio24: true,
      channel: 6,
      chanWidth: 'Auto',
      mode: 'b/g/n mixed',
      rate: '300.0Mbps',
      txPower: 19,
      ssids: [
        {
          id: 1,
          name: 'TP-Link_2.4GHz_BA7FA8',
          vlan: 0,
          bcast: true,
          sec: 'None',
          pass: '',
          guest: false,
          txBytes: 36531373,
          rxBytes: 2863110
        }
      ],
      macFilter: {
        enabled: false,
        rule: 'Deny', // 'Allow' or 'Deny'
        list: [
          { id: 1, mac: 'DC:A6:32:9F:11:22', desc: 'Rogue-Device' }
        ]
      }
    },
    router: {
      ip: '192.168.0.1',
      wanOnline: true,
      dhcpEnabled: true,
      dhcpStart: '192.168.0.100',
      dhcpEnd: '192.168.0.200',
      allowedVlans: '0, 1, 10, 20'
    },
    // Multi-device Packet Tracer list
    clients: [
      {
        id: 'dev-1',
        name: 'Pixel 8 Pro',
        type: 'phone',
        mac: 'A4:5E:60:1B:7C:D2',
        x: 100,
        y: 80,
        distance: 3,
        wifiEnabled: true,
        connectedSSID: null,
        ipConfig: 'dhcp',
        ip: null,
        subnet: '255.255.255.0',
        gateway: null,
        dns: null,
        connTime: 0,
        txBytes: 0,
        rxBytes: 0,
        status: 'disconnected',
        lastError: null,
        cliHistory: []
      },
      {
        id: 'dev-2',
        name: 'ThinkPad X1',
        type: 'laptop',
        mac: '00:E0:4C:81:92:44',
        x: 290,
        y: 80,
        distance: 5,
        wifiEnabled: true,
        connectedSSID: null,
        ipConfig: 'dhcp',
        ip: null,
        subnet: '255.255.255.0',
        gateway: null,
        dns: null,
        connTime: 0,
        txBytes: 0,
        rxBytes: 0,
        status: 'disconnected',
        lastError: null,
        cliHistory: []
      },
      {
        id: 'dev-3',
        name: 'SmartCam 1080p',
        type: 'iot',
        mac: 'F8:1A:67:B2:3C:80',
        x: 120,
        y: 190,
        distance: 7,
        wifiEnabled: true,
        connectedSSID: null,
        ipConfig: 'dhcp',
        ip: null,
        subnet: '255.255.255.0',
        gateway: null,
        dns: null,
        connTime: 0,
        txBytes: 0,
        rxBytes: 0,
        status: 'disconnected',
        lastError: null,
        cliHistory: []
      }
    ],
    logs: [
      { id: 1, time: getFormattedTime(120), type: 'SYSTEM', level: 'INFO', msg: 'System initialized successfully' },
      { id: 2, time: getFormattedTime(90), type: 'DEV_IP_C', level: 'WARNING', msg: 'The LAN IP address/mask of [ap:30-68-93-BA-7F-A8] is 192.168.0.254/255.255.255.0' },
      { id: 3, time: getFormattedTime(60), type: 'WIRELESS', level: 'INFO', msg: 'Wireless 2.4GHz radio started on channel 6' },
      { id: 4, time: getFormattedTime(10), type: 'AUTH', level: 'INFO', msg: 'Administrator login from web management' }
    ],
    forms: {}
  };

  function getFormattedTime(secondsAgo = 0) {
    const d = new Date(Date.now() - secondsAgo * 1000);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  // =========================================================================
  // State Storage with localStorage
  // =========================================================================
  let memStorage = {};
  function storageGet(k) {
    try {
      const v = localStorage.getItem(k);
      return v !== null ? v : memStorage[k];
    } catch(e) {
      return memStorage[k];
    }
  }

  function storageSet(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch(e) {
      memStorage[k] = v;
    }
  }

  const STORAGE_KEY = 'eap_lab_pt_v3';
  let state = loadInitialState();

  function loadInitialState() {
    try {
      const saved = storageGet(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Object.assign({}, DEFAULT_STATE, parsed, {
          device: Object.assign({}, DEFAULT_STATE.device, parsed.device),
          wireless: Object.assign({}, DEFAULT_STATE.wireless, parsed.wireless),
          router: Object.assign({}, DEFAULT_STATE.router, parsed.router),
          clients: (parsed.clients && parsed.clients.length) ? parsed.clients : DEFAULT_STATE.clients,
          logs: (parsed.logs && parsed.logs.length) ? parsed.logs : DEFAULT_STATE.logs,
          forms: parsed.forms || {}
        });
      }
    } catch (e) {
      console.warn('Failed to load state from storage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  function persistState() {
    storageSet(STORAGE_KEY, JSON.stringify(state));
  }

  function resetState() {
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    persistState();
    triggerSync();
  }

  // =========================================================================
  // RF Path Loss & Physics
  // =========================================================================
  function calcDistance(x, y) {
    const dx = x - AP_CANVAS_X;
    const dy = y - AP_CANVAS_Y;
    const px = Math.hypot(dx, dy);
    // 1 meter = ~5.5 pixels
    return Math.max(1, Math.min(40, Math.round(px / 5.5)));
  }

  function calcRSSI(distanceMeters) {
    const d = Math.max(1, Number(distanceMeters) || 1);
    // Free Space Path Loss at 2.4GHz
    const rssi = Math.round(-35 - (21 * Math.log10(d)));
    return Math.max(-95, Math.min(-30, rssi));
  }

  function getSignalBars(rssi) {
    if (rssi >= -55) return 4;
    if (rssi >= -67) return 3;
    if (rssi >= -78) return 2;
    if (rssi >= -86) return 1;
    return 0;
  }

  function calcRate(rssi) {
    if (rssi >= -55) return '300.0 Mbps';
    if (rssi >= -65) return '216.7 Mbps';
    if (rssi >= -75) return '144.4 Mbps';
    if (rssi >= -82) return '72.2 Mbps';
    if (rssi >= -86) return '36.0 Mbps';
    return '11.0 Mbps';
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function formatUptime(seconds) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const pad = n => String(n).padStart(2, '0');
    return `${d} days ${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  function addSysLog(type, level, msg) {
    const entry = {
      id: state.logs.length + 1,
      time: getFormattedTime(0),
      type: type || 'SYSTEM',
      level: level || 'INFO',
      msg: msg
    };
    state.logs.unshift(entry);
    if (state.logs.length > 50) state.logs.pop();
    persistState();
    triggerSync();
  }

  // =========================================================================
  // Connection Handshake Engine
  // =========================================================================
  function attemptConnect(clientId, ssidName, password) {
    const client = state.clients.find(c => c.id === clientId);
    if (!client) return { status: 'fail', error: 'Dispositivo no encontrado' };

    if (!client.wifiEnabled) {
      client.status = 'disconnected';
      client.lastError = 'El adaptador Wi-Fi del dispositivo está apagado';
      persistState();
      triggerSync();
      return { status: 'fail', error: client.lastError };
    }

    const rssi = calcRSSI(client.distance);

    // 1. EAP Radio check
    if (!state.wireless.radio24) {
      addSysLog('WIRELESS', 'WARNING', `Client ${client.name} (${client.mac}) failed to associate: 2.4GHz radio is OFF`);
      client.status = 'fail';
      client.lastError = 'Radio 2.4GHz de la EAP apagada';
      client.connectedSSID = null;
      persistState();
      triggerSync();
      return { status: 'fail', error: client.lastError };
    }

    // 2. Distance & Signal Threshold
    if (rssi < -85) {
      addSysLog('WIRELESS', 'WARNING', `Client ${client.name} (${client.mac}) out of range (${rssi} dBm)`);
      client.status = 'fail';
      client.lastError = `Señal demasiado débil (${rssi} dBm, distancia ${client.distance}m)`;
      client.connectedSSID = null;
      persistState();
      triggerSync();
      return { status: 'fail', error: client.lastError };
    }

    // 3. SSID Check (Real EAP configuration)
    const ssid = state.wireless.ssids.find(s => s.name === ssidName);
    if (!ssid) {
      addSysLog('AUTH', 'WARNING', `Client ${client.name} requested non-existent SSID "${ssidName}"`);
      client.status = 'fail';
      client.lastError = `Red Wi-Fi "${ssidName}" no encontrada`;
      client.connectedSSID = null;
      persistState();
      triggerSync();
      return { status: 'fail', error: client.lastError };
    }

    // 4. MAC Filtering Check (Real EAP configuration)
    const mf = state.wireless.macFilter;
    if (mf.enabled) {
      const inList = mf.list.some(m => m.mac.toUpperCase() === client.mac.toUpperCase());
      const blocked = (mf.rule === 'Deny' && inList) || (mf.rule === 'Allow' && !inList);
      if (blocked) {
        addSysLog('SECURITY', 'WARNING', `Client ${client.name} (${client.mac}) rejected by MAC Filter (${mf.rule})`);
        client.status = 'blocked';
        client.lastError = `Acceso denegado por Filtrado MAC de la EAP (${mf.rule})`;
        client.connectedSSID = null;
        persistState();
        triggerSync();
        return { status: 'blocked', error: client.lastError };
      }
    }

    // 5. WPA Security Check
    if (ssid.sec !== 'None') {
      if (!password || password !== ssid.pass) {
        addSysLog('AUTH', 'WARNING', `Client ${client.name} failed authentication on "${ssidName}": Incorrect password`);
        client.status = 'fail';
        client.lastError = 'Contraseña inalámbrica incorrecta';
        client.connectedSSID = null;
        persistState();
        triggerSync();
        return { status: 'fail', error: client.lastError };
      }
    }

    // 6. VLAN Trunk Check on Router
    if (ssid.vlan && ssid.vlan > 0) {
      const allowed = state.router.allowedVlans.split(',').map(v => v.trim());
      if (!allowed.includes(String(ssid.vlan))) {
        addSysLog('VLAN', 'WARNING', `Client ${client.name} VLAN ${ssid.vlan} not allowed on trunk router port`);
        client.status = 'noip';
        client.lastError = `VLAN ${ssid.vlan} no enrutada en el troncal: sin IP`;
        client.connectedSSID = ssidName;
        client.ip = '169.254.' + Math.floor(Math.random() * 250 + 1) + '.' + Math.floor(Math.random() * 250 + 1);
        persistState();
        triggerSync();
        return { status: 'noip', error: client.lastError };
      }
    }

    // 7. DHCP or Static IP
    if (client.ipConfig === 'static' && client.ip) {
      client.gateway = client.gateway || state.router.ip;
      client.dns = client.dns || state.router.ip;
    } else {
      if (!state.router.dhcpEnabled) {
        addSysLog('DHCP', 'WARNING', `Client ${client.name} associated with "${ssidName}" but Router DHCP is disabled: No IP address`);
        client.status = 'noip';
        client.lastError = 'Router sin DHCP: Sin dirección IP válida (APIPA 169.254.x.x)';
        client.connectedSSID = ssidName;
        client.ip = '169.254.88.' + Math.floor(Math.random() * 200 + 10);
        persistState();
        triggerSync();
        return { status: 'noip', error: client.lastError };
      }
      const clientIdx = state.clients.indexOf(client);
      client.ip = `192.168.0.${105 + (clientIdx >= 0 ? clientIdx : 1)}`;
      client.gateway = state.router.ip;
      client.dns = state.router.ip;
    }

    client.connectedSSID = ssidName;
    client.connTime = 0;
    client.txBytes = 150000 + Math.floor(Math.random() * 60000);
    client.rxBytes = 850000 + Math.floor(Math.random() * 180000);

    // 8. WAN Internet Access Check
    if (!state.router.wanOnline) {
      addSysLog('AUTH', 'INFO', `Client ${client.name} associated (${client.ip}), WAN DOWN`);
      client.status = 'noinet';
      client.lastError = 'Conectado a la LAN, pero la WAN (Internet) está inactiva';
    } else {
      addSysLog('AUTH', 'INFO', `Client ${client.name} associated to "${ssidName}" [IP: ${client.ip}, RSSI: ${rssi} dBm]`);
      client.status = 'connected';
      client.lastError = null;
    }

    // Add traffic to SSID
    ssid.rxBytes = (ssid.rxBytes || 0) + client.txBytes;
    ssid.txBytes = (ssid.txBytes || 0) + client.rxBytes;

    persistState();
    triggerSync();
    return { status: client.status, ip: client.ip };
  }

  function disconnectClient(clientId) {
    const client = state.clients.find(c => c.id === clientId);
    if (!client) return;
    if (client.connectedSSID) {
      addSysLog('AUTH', 'INFO', `Client ${client.name} (${client.mac}) disconnected from "${client.connectedSSID}"`);
    }
    client.status = 'disconnected';
    client.connectedSSID = null;
    client.ip = null;
    client.gateway = null;
    client.dns = null;
    client.lastError = null;
    persistState();
    triggerSync();
  }

  function reevaluateAllClients() {
    state.clients.forEach(c => {
      if (c.status === 'connected' || c.status === 'noinet' || c.status === 'noip') {
        const ssid = c.connectedSSID;
        const targetSSID = state.wireless.ssids.find(s => s.name === ssid);
        const pass = targetSSID ? targetSSID.pass : '';
        attemptConnect(c.id, ssid, pass);
      }
    });
  }

  // =========================================================================
  // Multi-Device Management (Packet Tracer Style)
  // =========================================================================
  function addDevice(name, type, mac) {
    const id = 'dev-' + Date.now();
    const finalMac = mac || ('52:54:00:' + Array.from({length:3}, () => Math.floor(Math.random()*256).toString(16).padStart(2,'0').toUpperCase()).join(':'));
    
    // Position around AP randomly in 30-180px radius
    const angle = Math.random() * Math.PI * 2;
    const radius = 60 + Math.random() * 100;
    const x = Math.round(AP_CANVAS_X + Math.cos(angle) * radius);
    const y = Math.round(AP_CANVAS_Y + Math.sin(angle) * radius);

    const newDev = {
      id: id,
      name: name || ('Dispositivo-' + (state.clients.length + 1)),
      type: type || 'phone',
      mac: finalMac,
      x: Math.max(30, Math.min(370, x)),
      y: Math.max(30, Math.min(230, y)),
      distance: calcDistance(x, y),
      wifiEnabled: true,
      connectedSSID: null,
      ipConfig: 'dhcp',
      ip: null,
      subnet: '255.255.255.0',
      gateway: null,
      dns: null,
      connTime: 0,
      txBytes: 0,
      rxBytes: 0,
      status: 'disconnected',
      lastError: null,
      cliHistory: []
    };

    state.clients.push(newDev);
    addSysLog('SYSTEM', 'INFO', `New simulated device added: ${newDev.name} (${newDev.mac})`);
    persistState();
    triggerSync();
    return newDev;
  }

  function removeDevice(clientId) {
    const idx = state.clients.findIndex(c => c.id === clientId);
    if (idx >= 0) {
      const removed = state.clients.splice(idx, 1)[0];
      addSysLog('SYSTEM', 'INFO', `Device removed: ${removed.name} (${removed.mac})`);
      persistState();
      triggerSync();
    }
  }

  function updateDevicePosition(clientId, x, y) {
    const client = state.clients.find(c => c.id === clientId);
    if (!client) return;
    client.x = Math.max(20, Math.min(380, x));
    client.y = Math.max(20, Math.min(240, y));
    client.distance = calcDistance(client.x, client.y);
    persistState();
    triggerSync();

    // Recheck distance threshold
    if (client.status === 'connected' && calcRSSI(client.distance) < -85) {
      reevaluateAllClients();
    }
  }

  // =========================================================================
  // Interactive Terminal / CLI Engine (Packet Tracer Style)
  // =========================================================================
  function executeCliCommand(clientId, cmdLine) {
    const client = state.clients.find(c => c.id === clientId);
    if (!client) return 'Error: Dispositivo no encontrado.';

    const raw = cmdLine.trim();
    if (!raw) return '';
    const parts = raw.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const rssi = calcRSSI(client.distance);

    if (cmd === 'help') {
      return `Comandos disponibles en la consola de ${client.name}:
  ipconfig / ifconfig       Muestra la configuración IP y estado de red
  ping <ip/host>            Envía paquetes ICMP a una dirección IP
  tracert <ip/host>         Muestra la ruta de saltos hacia el destino
  netsh wlan show           Muestra detalles de la interfaz Wi-Fi 802.11
  curl <url>                Realiza una petición HTTP a un servidor
  clear                     Limpia el terminal de la pantalla`;
    }

    if (cmd === 'ipconfig' || cmd === 'ifconfig') {
      if (client.status === 'disconnected') {
        return `Adaptador de red inalámbrica Wi-Fi:
   Estado de los medios. . . . . : Medios desconectados
   Dirección física. . . . . . . : ${client.mac}`;
      }
      return `Adaptador de red inalámbrica Wi-Fi:
   Sufijo DNS específico para la conexión. . : lan
   Dirección IPv4. . . . . . . . . . . . . . : ${client.ip || '169.254.x.x'}
   Máscara de subred . . . . . . . . . . . . : ${client.subnet || '255.255.255.0'}
   Puerta de enlace predeterminada . . . . . : ${client.gateway || '0.0.0.0'}
   Servidor DNS. . . . . . . . . . . . . . . : ${client.dns || '0.0.0.0'}
   Dirección física (MAC). . . . . . . . . . : ${client.mac}
   SSID Conectado. . . . . . . . . . . . . . : ${client.connectedSSID}`;
    }

    if (cmd === 'netsh') {
      if (client.status === 'disconnected') {
        return 'La interfaz de red inalámbrica no está asociada a ningún punto de acceso.';
      }
      return `Nombre de interfaz: Wi-Fi
   Descripción            : 802.11n Wireless Network Adapter
   GUID                   : {a1b2c3d4-e5f6-7890-1234-56789abcdef0}
   Dirección física       : ${client.mac}
   Estado                 : Conectado
   SSID                   : ${client.connectedSSID}
   BSSID                  : ${state.device.mac}
   Tipo de red            : Infraestructura
   Tipo de radio          : 802.11n (2.4 GHz)
   Autenticación          : WPA2-Personal
   Cifrado                : CCMP (AES)
   Canal                  : ${state.wireless.channel}
   Velocidad de recepción : ${calcRate(rssi)}
   Velocidad de transm.   : ${calcRate(rssi)}
   Señal                  : ${Math.max(10, Math.min(100, Math.round((rssi + 100) * 1.4)))}% (${rssi} dBm)`;
    }

    if (cmd === 'ping') {
      const target = args[0] || state.router.ip;
      if (client.status === 'disconnected') {
        return `Haciendo ping a ${target} con 32 bytes de datos:
Error general: el adaptador de red está desconectado.`;
      }

      if (target === state.device.ip || target === state.router.ip) {
        if (client.status === 'noip') {
          return `Haciendo ping a ${target} con 32 bytes de datos:
Tiempo de espera agotado para esta solicitud.
Tiempo de espera agotado para esta solicitud.
Paquetes: enviados = 2, recibidos = 0, perdidos = 2 (100% perdidos)`;
        }
        const lat = Math.round(1 + Math.random() * 2 + client.distance * 0.15);
        return `Haciendo ping a ${target} con 32 bytes de datos:
Respuesta desde ${target}: bytes=32 tiempo=${lat}ms TTL=64
Respuesta desde ${target}: bytes=32 tiempo=${lat+1}ms TTL=64
Respuesta desde ${target}: bytes=32 tiempo=${lat}ms TTL=64
Respuesta desde ${target}: bytes=32 tiempo=${lat+1}ms TTL=64
Estadísticas de ping para ${target}:
    Paquetes: enviados = 4, recibidos = 4, perdidos = 0 (0% perdidos),
Tiempos aproximados de ida y vuelta en milisegundos:
    Mínimo = ${lat}ms, Máximo = ${lat+1}ms, Media = ${lat}ms`;
      }

      if (target === '8.8.8.8' || target === 'google.com' || target === '1.1.1.1') {
        if (!state.router.wanOnline) {
          return `Haciendo ping a ${target} con 32 bytes de datos:
Respuesta desde ${state.router.ip}: Host de destino inaccesible (Enlace WAN caído).
Respuesta desde ${state.router.ip}: Host de destino inaccesible.
Paquetes: enviados = 2, recibidos = 0, perdidos = 2 (100% perdidos)`;
        }
        const lat = Math.round(14 + Math.random() * 6 + client.distance * 0.2);
        return `Haciendo ping a ${target} [8.8.8.8] con 32 bytes de datos:
Respuesta desde 8.8.8.8: bytes=32 tiempo=${lat}ms TTL=117
Respuesta desde 8.8.8.8: bytes=32 tiempo=${lat+2}ms TTL=117
Respuesta desde 8.8.8.8: bytes=32 tiempo=${lat+1}ms TTL=117
Respuesta desde 8.8.8.8: bytes=32 tiempo=${lat}ms TTL=117
Estadísticas de ping para ${target}:
    Paquetes: enviados = 4, recibidos = 4, perdidos = 0 (0% perdidos)`;
      }

      return `Haciendo ping a ${target} con 32 bytes de datos:
Tiempo de espera agotado para esta solicitud.
Paquetes: enviados = 1, recibidos = 0, perdidos = 1 (100% perdidos)`;
    }

    if (cmd === 'tracert' || cmd === 'traceroute') {
      const target = args[0] || '8.8.8.8';
      if (client.status === 'disconnected') return 'Error: Sin conexión de red.';
      if (!state.router.wanOnline && (target === '8.8.8.8' || target.includes('.'))) {
        return `Traza a la dirección ${target} sobre un máximo de 30 saltos:
  1     1 ms     1 ms     1 ms  ${state.router.ip}
  2     *        *        *     Tiempo de espera agotado (WAN caída).
Traza completa.`;
      }
      return `Traza a la dirección ${target} sobre un máximo de 30 saltos:
  1     1 ms     1 ms     1 ms  ${state.router.ip} [Gateway Local]
  2    12 ms    11 ms    13 ms  10.0.0.1 [Router ISP Core]
  3    15 ms    14 ms    15 ms  ${target}
Traza completa.`;
    }

    if (cmd === 'curl') {
      const url = args[0] || `http://${state.device.ip}`;
      if (client.status === 'disconnected') return 'curl: (6) Could not resolve host (red desconectada)';
      if (url.includes(state.device.ip)) {
        return `HTTP/1.1 200 OK
Server: TP-Link EAP Embedded Web Server / RomPager 4.51
Content-Type: text/html
Connection: close

<!DOCTYPE html><html><head><title>TP-Link EAP Management</title></head>
<body><h1>Bienvenido a TP-Link EAP</h1><p>Dispositivo en línea: ${state.device.name}</p></body></html>`;
      }
      if (url.includes(state.router.ip)) {
        return `HTTP/1.1 200 OK
Server: Gateway Router HTTPd
Content-Type: text/plain

Router Gateway 192.168.0.1 OK. DHCP: ${state.router.dhcpEnabled ? 'ON' : 'OFF'}, WAN: ${state.router.wanOnline ? 'UP' : 'DOWN'}`;
      }
      if (!state.router.wanOnline) return 'curl: (7) Failed to connect to host: Network unreachable (WAN Down)';
      return `HTTP/1.1 200 OK
Content-Type: text/html

<!doctype html><html><head><title>Google</title></head><body><h1>Internet Accessible</h1></body></html>`;
    }

    return `'${cmd}' no se reconoce como un comando interno o externo. Escriba 'help' para ver los comandos disponibles.`;
  }

  // =========================================================================
  // Reactive Sync Subscriptions & Ticking
  // =========================================================================
  const syncListeners = [];
  function onSync(fn) { syncListeners.push(fn); }
  function triggerSync() {
    syncListeners.forEach(fn => {
      try { fn(state); } catch(e) { console.error('Sync listener error:', e); }
    });
  }

  setInterval(() => {
    state.device.uptimeSec++;
    state.device.cpu = Math.max(2, Math.min(18, Math.round(state.device.cpu + (Math.random() * 2 - 1))));

    let changed = false;
    state.clients.forEach(c => {
      if (c.status === 'connected') {
        c.connTime++;
        c.txBytes += Math.floor(Math.random() * 140 + 20);
        c.rxBytes += Math.floor(Math.random() * 520 + 80);
        changed = true;
      }
    });

    if (changed && Math.random() < 0.2) {
      persistState();
    }
  }, 1000);

  // =========================================================================
  // IFRAME BRIDGE ENGINE
  // Injected into every page inside the iframe.
  // Makes EVERY form, combobox, checkbox, input and table fully functional!
  // =========================================================================
  function getIframeEngineScript() {
    return '(' + function() {
      const topWin = window.parent;
      const EAP = topWin.EAPEngine;
      if (!EAP) return;

      const pageIdx = window.__PAGE_INDEX !== undefined ? window.__PAGE_INDEX : 0;
      const d = document;

      function $(sel, ctx) { return (ctx || d).querySelector(sel); }
      function $$(sel, ctx) { return Array.from((ctx || d).querySelectorAll(sel)); }
      function esc(str) {
        return String(str || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      }

      function showTplToast(msg) {
        let p = $('.form-prompt');
        if (!p) {
          p = d.createElement('div');
          p.className = 'form-prompt successed';
          p.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99999;background:rgba(40,40,40,0.85);color:#fff;padding:12px 24px;border-radius:4px;font:bold 13px Arial;display:flex;align-items:center;gap:10px;box-shadow:0 4px 16px rgba(0,0,0,0.3);';
          p.innerHTML = '<span style="color:#39e36b;font-size:16px;">✔</span><span>' + (msg || 'Operation succeeded') + '</span>';
          d.body.appendChild(p);
        } else {
          p.className = 'form-prompt successed';
          p.style.display = 'block';
        }
        setTimeout(() => { if (p) p.style.display = 'none'; }, 1500);
      }

      // -------------------------------------------------------------------
      // 1. UNIVERSAL FORM & COMBOBOX & CHECKBOX HANDLER (ALL 23 PAGES)
      // -------------------------------------------------------------------
      function initUniversalFormControls() {
        // Handle all Combobox dropdown toggles
        d.addEventListener('click', function(e) {
          const sw = e.target.closest('.combobox-text, .combobox-switch');
          const allWraps = $$('.combobox-list-wrap');

          if (!sw) {
            // Close any open combobox if clicking outside
            if (!e.target.closest('.combobox-list-wrap')) {
              allWraps.forEach(w => w.style.display = 'none');
            }
          } else {
            e.preventDefault();
            const container = sw.closest('.combobox-container');
            const wrap = $('.combobox-list-wrap', container);
            if (wrap) {
              const isOpen = wrap.style.display === 'block';
              allWraps.forEach(w => w.style.display = 'none');
              wrap.style.display = isOpen ? 'none' : 'block';
            }
          }

          // Handle Combobox item selection
          const li = e.target.closest('li.combobox-list');
          if (li) {
            e.preventDefault();
            const container = li.closest('.combobox-container');
            const textEl = $('.combobox-text', container);
            const valInput = $('input.combobox-value', container);
            const optText = ($('.text', li) || li).textContent.trim();
            const optVal = ($('input.combobox-checkbox', li) || {}).value || optText;

            if (textEl) textEl.value = optText;
            if (valInput) valInput.value = optVal;

            $$('li.combobox-list', container).forEach(item => item.classList.remove('selected'));
            li.classList.add('selected');

            const wrap = li.closest('.combobox-list-wrap');
            if (wrap) wrap.style.display = 'none';
          }

          // Handle Checkbox clicks
          const chkLabel = e.target.closest('label.checkbox-label');
          if (chkLabel && !chkLabel.dataset.handledCustom) {
            e.preventDefault();
            const isChecked = chkLabel.classList.toggle('checked');
            const input = $('input[type=checkbox]', chkLabel);
            if (input) input.checked = isChecked;
          }

          // Handle Radio clicks
          const radioLabel = e.target.closest('label.radio-label');
          if (radioLabel) {
            e.preventDefault();
            const groupName = ($('input[type=radio]', radioLabel) || {}).name;
            if (groupName) {
              $$(`label.radio-label input[name="${groupName}"]`).forEach(r => {
                const parent = r.closest('label.radio-label');
                if (parent) parent.classList.remove('checked');
                r.checked = false;
              });
            }
            radioLabel.classList.add('checked');
            const myRadio = $('input[type=radio]', radioLabel);
            if (myRadio) myRadio.checked = true;
          }
        }, true);

        // Handle Save / Submit buttons across ALL pages
        d.addEventListener('click', function(e) {
          const btn = e.target.closest('button.button-button');
          if (!btn) return;
          const txt = btn.textContent.toLowerCase();
          if (txt.includes('save') || txt.includes('apply') || txt.includes('confirm') || txt.includes('ok')) {
            saveCurrentPageForm();
            showTplToast('Configuration saved successfully');
          }
        }, true);
      }

      function saveCurrentPageForm() {
        const s = EAP.getState();
        s.forms = s.forms || {};
        const formData = {};

        $$('input.text-text, input[type=password], input[type=number]').forEach(inp => {
          if (inp.id || inp.name) formData[inp.id || inp.name] = inp.value;
        });
        $$('label.checkbox-label').forEach((lbl, i) => {
          formData['chk_' + (lbl.id || i)] = lbl.classList.contains('checked');
        });
        $$('.combobox-container').forEach((cc, i) => {
          const t = $('.combobox-text', cc);
          if (t) formData['combo_' + (cc.id || i)] = t.value;
        });

        s.forms[pageIdx] = formData;

        // Specific parameter extractions:
        // Wireless Settings
        const radToggle = $('#wireless-bset-status');
        if (radToggle) {
          const lbl = radToggle.closest('label.checkbox-label');
          if (lbl) s.wireless.radio24 = lbl.classList.contains('checked');
        }
        const chanEl = $('#wireless-bset-channel');
        if (chanEl && chanEl.value) {
          const ch = parseInt(chanEl.value);
          if (!isNaN(ch)) s.wireless.channel = ch;
        }

        // MAC Filtering
        const mfToggle = $('#mac-filtering-enable');
        if (mfToggle) {
          const lbl = mfToggle.closest('label.checkbox-label');
          if (lbl) s.wireless.macFilter.enabled = lbl.classList.contains('checked');
        }

        // Network IP Settings
        const ipInp = $('#ipAddress') || $('#fallbackIp');
        if (ipInp && ipInp.value) s.device.ip = ipInp.value.trim();
        const maskInp = $('#subnetMask') || $('#fallbackMask');
        if (maskInp && maskInp.value) s.device.mask = maskInp.value.trim();

        EAP.persistState();
        EAP.reevaluateAllClients();
      }

      function restoreCurrentPageForm() {
        const s = EAP.getState();
        const formData = (s.forms || {})[pageIdx];
        if (!formData) return;

        Object.keys(formData).forEach(k => {
          const val = formData[k];
          const inp = $('#' + k) || $(`input[name="${k}"]`);
          if (inp && (inp.type === 'text' || inp.type === 'password' || inp.type === 'number')) {
            inp.value = val;
          }
        });
      }

      // -------------------------------------------------------------------
      // 2. TOP MENU NAVIGATION HOOKS
      // -------------------------------------------------------------------
      function initNavigation() {
        const menuLinks = $$('#top-menu a');
        menuLinks.forEach(a => {
          a.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const li = a.closest('li');
            if (!li) return;
            const text = a.textContent.trim();

            if (li.classList.contains('fst')) {
              const targetIdx = topWin.EAP_PAGES.findIndex(p => p.g.toLowerCase() === text.toLowerCase());
              if (targetIdx >= 0) topWin.navigateToPage(targetIdx);
            } else {
              const topLi = li.closest('li.fst');
              const groupName = topLi ? topLi.querySelector(':scope > a .text').textContent.trim() : '';
              const targetIdx = topWin.EAP_PAGES.findIndex(p =>
                p.g.toLowerCase() === groupName.toLowerCase() &&
                p.n.toLowerCase() === text.toLowerCase()
              );
              if (targetIdx >= 0) topWin.navigateToPage(targetIdx);
            }
          }, true);
        });
      }

      // -------------------------------------------------------------------
      // 3. PAGE 0: STATUS -> DEVICE
      // -------------------------------------------------------------------
      function initPageDevice() {
        if (pageIdx !== 0) return;
        const s = EAP.getState();

        const setName = $('#device_name');
        if (setName) setName.value = s.device.name;

        const setMac = $('#device_mac');
        if (setMac) setMac.value = s.device.mac;

        const setIp = $('#device_ip');
        if (setIp) setIp.value = s.device.ip;

        const setMask = $('#device_mask');
        if (setMask) setMask.value = s.device.mask;

        const setPort = $('#device_port0');
        if (setPort) setPort.value = s.device.port0;

        const uptimeEl = $('#device_uptime');
        if (uptimeEl) {
          uptimeEl.value = EAP.formatUptime(s.device.uptimeSec);
          setInterval(() => {
            const curState = EAP.getState();
            if (uptimeEl) uptimeEl.value = EAP.formatUptime(curState.device.uptimeSec);
          }, 1000);
        }

        const timeEl = $('#device_time');
        if (timeEl) {
          setInterval(() => {
            const now = new Date();
            const pad = n => String(n).padStart(2, '0');
            if (timeEl) timeEl.value = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
          }, 1000);
        }
      }

      // -------------------------------------------------------------------
      // 4. PAGE 1: STATUS -> WIRELESS
      // -------------------------------------------------------------------
      function initPageWirelessStatus() {
        if (pageIdx !== 1) return;
        const s = EAP.getState();

        const radEn = $('#radio_enable');
        if (radEn) radEn.value = s.wireless.radio24 ? 'Enable' : 'Disable';

        const radChan = $('#radio_channel');
        if (radChan) radChan.value = s.wireless.channel + '   / 2437MHz';

        const radRate = $('#radio_rate');
        if (radRate) radRate.value = s.wireless.rate;

        const radPower = $('#radio_power');
        if (radPower) radPower.value = s.wireless.txPower + 'dBm';

        const grid = $('#ssidListGrid');
        if (grid) {
          const tbody = $('.grid-content-data', grid);
          if (tbody) {
            tbody.innerHTML = s.wireless.ssids.map((z, i) => {
              const clientsOnSSID = s.clients.filter(c => c.connectedSSID === z.name && (c.status === 'connected' || c.status === 'noinet')).length;
              return `
                <tr class="grid-content-tr grid-content-tr-${i+1}" data-key="${i+1}" style="display: table-row;">
                  <td class="grid-content-td grid-content-td-0 grid-content-td-row-numberer fst"><span class="grid-row-numberer content">${i+1}</span></td>
                  <td class="grid-content-td grid-content-td-1 grid-content-td-SSID"><span class="content">${esc(z.name)}</span></td>
                  <td class="grid-content-td grid-content-td-2 grid-content-td-clients"><span class="content"><b>${clientsOnSSID}</b></span></td>
                  <td class="grid-content-td grid-content-td-3 grid-content-td-Radio"><span class="content">2.4GHz</span></td>
                  <td class="grid-content-td grid-content-td-4 grid-content-td-security"><span class="content">${esc(z.sec)}</span></td>
                  <td class="grid-content-td grid-content-td-5"><span class="content">Disable</span></td>
                  <td class="grid-content-td grid-content-td-6"><span class="content">${z.vlan || 0}</span></td>
                  <td class="grid-content-td grid-content-td-7"><span class="content">${z.guest ? 'Enable' : 'Disable'}</span></td>
                  <td class="grid-content-td grid-content-td-8"><span class="content">${z.txBytes || 0}</span></td>
                  <td class="grid-content-td grid-content-td-9 lst"><span class="content">${z.rxBytes || 0}</span></td>
                </tr>
              `;
            }).join('');
          }
        }
      }

      // -------------------------------------------------------------------
      // 5. PAGE 2: STATUS -> CLIENT LIST (ALL SIMULATED CLIENTS)
      // -------------------------------------------------------------------
      function initPageClientStatus() {
        if (pageIdx !== 2) return;
        const grid = $('#clientUserListGrid');
        if (!grid) return;
        const tbody = $('.grid-content-data', grid);
        if (!tbody) return;

        function renderClients() {
          const s = EAP.getState();
          const connectedClients = s.clients.filter(c => c.status === 'connected' || c.status === 'noinet');

          if (connectedClients.length === 0) {
            tbody.innerHTML = `
              <tr class="grid-content-tr empty" style="display: table-row;">
                <td class="grid-content-td grid-content-td-0">--</td>
                <td class="grid-content-td grid-content-td-1">--</td>
                <td class="grid-content-td grid-content-td-2">--</td>
                <td class="grid-content-td grid-content-td-3">--</td>
                <td class="grid-content-td grid-content-td-4">--</td>
                <td class="grid-content-td grid-content-td-5">--</td>
                <td class="grid-content-td grid-content-td-6">--</td>
                <td class="grid-content-td grid-content-td-7">--</td>
                <td class="grid-content-td grid-content-td-8">--</td>
                <td class="grid-content-td grid-content-td-9">--</td>
                <td class="grid-content-td grid-content-td-10">--</td>
                <td class="grid-content-td grid-content-td-11 lst">--</td>
              </tr>
            `;
            return;
          }

          tbody.innerHTML = connectedClients.map((c, i) => {
            const rssi = EAP.calcRSSI(c.distance);
            const rate = EAP.calcRate(rssi);
            const activeTime = EAP.formatUptime(c.connTime || 1);
            return `
              <tr class="grid-content-tr" style="display: table-row;">
                <td class="grid-content-td grid-content-td-0 fst"><span class="content">${i+1}</span></td>
                <td class="grid-content-td grid-content-td-1"><span class="content"><b>${esc(c.name)}</b></span></td>
                <td class="grid-content-td grid-content-td-2"><span class="content">${c.ip || '--'}</span></td>
                <td class="grid-content-td grid-content-td-3"><span class="content">${c.mac}</span></td>
                <td class="grid-content-td grid-content-td-4"><span class="content">2.4G</span></td>
                <td class="grid-content-td grid-content-td-5"><span class="content">${esc(c.connectedSSID)}</span></td>
                <td class="grid-content-td grid-content-td-6"><span class="content">${activeTime}</span></td>
                <td class="grid-content-td grid-content-td-7"><span class="content">${c.txBytes || 0}</span></td>
                <td class="grid-content-td grid-content-td-8"><span class="content">${c.rxBytes || 0}</span></td>
                <td class="grid-content-td grid-content-td-9"><span class="content">${rssi}</span></td>
                <td class="grid-content-td grid-content-td-10"><span class="content">${rate}</span></td>
                <td class="grid-content-td grid-content-td-11 lst">
                  <a href="#" class="btn-disconnect" data-client="${c.id}" style="color:#d9534f;margin-right:8px;font-weight:600;text-decoration:none;">Desconectar</a>
                  <a href="#" class="btn-block-client" data-mac="${c.mac}" style="color:#e67e22;font-weight:600;text-decoration:none;">Bloquear</a>
                </td>
              </tr>
            `;
          }).join('');
        }

        renderClients();

        grid.addEventListener('click', function(e) {
          const btnDisc = e.target.closest('.btn-disconnect');
          if (btnDisc) {
            e.preventDefault();
            EAP.disconnectClient(btnDisc.dataset.client);
            renderClients();
            showTplToast('Cliente desconectado');
            return;
          }

          const btnBlock = e.target.closest('.btn-block-client');
          if (btnBlock) {
            e.preventDefault();
            const mac = btnBlock.dataset.mac;
            const s = EAP.getState();
            s.wireless.macFilter.enabled = true;
            s.wireless.macFilter.rule = 'Deny';
            if (!s.wireless.macFilter.list.some(m => m.mac === mac)) {
              s.wireless.macFilter.list.push({ id: Date.now(), mac: mac, desc: 'Bloqueado vía Lista de Clientes' });
            }
            EAP.persistState();
            EAP.reevaluateAllClients();
            renderClients();
            showTplToast('MAC bloqueada y cliente expulsado');
            return;
          }

          const refreshBtn = e.target.closest('.btn-refresh');
          if (refreshBtn) {
            e.preventDefault();
            renderClients();
            showTplToast('Refrescado');
          }
        });
      }

      // -------------------------------------------------------------------
      // 6. PAGE 3: WIRELESS -> WIRELESS SETTINGS
      // -------------------------------------------------------------------
      function initPageWirelessSettings() {
        if (pageIdx !== 3) return;
        const s = EAP.getState();

        const radToggle = $('#wireless-bset-status');
        if (radToggle) {
          const chkLabel = radToggle.closest('label.checkbox-label');
          if (chkLabel) {
            chkLabel.dataset.handledCustom = '1';
            chkLabel.classList.toggle('checked', s.wireless.radio24);
            chkLabel.onclick = function(e) {
              e.preventDefault();
              s.wireless.radio24 = !chkLabel.classList.contains('checked');
              chkLabel.classList.toggle('checked', s.wireless.radio24);
              EAP.persistState();
              if (!s.wireless.radio24) EAP.reevaluateAllClients();
              showTplToast(s.wireless.radio24 ? 'Radio 2.4GHz Activada' : 'Radio 2.4GHz Desactivada');
            };
          }
        }

        const grid = $('#wireless-ssid-grid');
        if (!grid) return;
        const tbody = $('.grid-content-data', grid);
        if (!tbody) return;

        function renderSSIDs() {
          const curState = EAP.getState();
          tbody.innerHTML = curState.wireless.ssids.map((z, i) => `
            <tr class="grid-content-tr grid-content-tr-${i+1}" data-key="${i+1}" style="display: table-row;">
              <td class="grid-content-td grid-content-td-0 grid-content-td-row-numberer fst"><span class="grid-row-numberer content">${i+1}</span></td>
              <td class="grid-content-td grid-content-td-1"><span class="content"><b>${esc(z.name)}</b></span></td>
              <td class="grid-content-td grid-content-td-2"><span class="content">${z.vlan || 0}</span></td>
              <td class="grid-content-td grid-content-td-3"><span class="content">${z.bcast ? 'Enable' : 'Disable'}</span></td>
              <td class="grid-content-td grid-content-td-4"><span class="content">${esc(z.sec)}</span></td>
              <td class="grid-content-td grid-content-td-5"><span class="content">${z.guest ? 'Enable' : 'Disable'}</span></td>
              <td class="grid-content-td grid-content-td-6 lst">
                <a class="grid-content-btn grid-content-btn-edit btn-edit" data-act="edit" data-idx="${i}" href="#" style="margin-right:10px;"><span class="icon"></span><span class="text">Edit</span></a>
                <a class="grid-content-btn grid-content-btn-delete btn-delete" data-act="del" data-idx="${i}" href="#"><span class="icon"></span><span class="text">Delete</span></a>
              </td>
            </tr>
          `).join('');
        }

        renderSSIDs();

        function openSSIDModal(editIdx) {
          const curState = EAP.getState();
          const isEdit = editIdx >= 0;
          const current = isEdit ? curState.wireless.ssids[editIdx] : {
            name: '',
            vlan: 0,
            bcast: true,
            sec: 'None',
            pass: '',
            guest: false
          };

          const overlay = d.createElement('div');
          overlay.className = 'tpl-modal-overlay';
          overlay.innerHTML = `
            <div class="tpl-modal" style="width: 440px;">
              <div class="tpl-modal-header">
                <span>${isEdit ? 'Edit SSID' : 'Add SSID'}</span>
                <button type="button" class="tpl-modal-close" id="modal-close-x">&times;</button>
              </div>
              <div class="tpl-modal-body">
                <div class="tpl-form-group">
                  <label>SSID Name:</label>
                  <input type="text" id="m_ssid_name" class="tpl-form-control" value="${esc(current.name)}" placeholder="Max 32 caracteres">
                </div>
                <div class="tpl-form-group">
                  <label>SSID Broadcast:</label>
                  <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                    <input type="checkbox" id="m_ssid_bcast" ${current.bcast ? 'checked' : ''}> Habilitar emisión
                  </label>
                </div>
                <div class="tpl-form-group">
                  <label>Security Mode:</label>
                  <select id="m_ssid_sec" class="tpl-form-control">
                    <option value="None" ${current.sec === 'None' ? 'selected' : ''}>None (Abierta)</option>
                    <option value="WPA-Personal" ${current.sec !== 'None' ? 'selected' : ''}>WPA-Personal / WPA2-PSK</option>
                  </select>
                </div>
                <div class="tpl-form-group" id="m_sec_row" style="${current.sec === 'None' ? 'display:none;' : ''}">
                  <label>Wireless Password:</label>
                  <input type="text" id="m_ssid_pass" class="tpl-form-control" value="${esc(current.pass)}" placeholder="8 a 63 caracteres">
                </div>
                <div class="tpl-form-group">
                  <label>VLAN ID (0-4094):</label>
                  <input type="number" id="m_ssid_vlan" class="tpl-form-control" min="0" max="4094" value="${current.vlan || 0}">
                </div>
                <div class="tpl-form-group">
                  <label>Guest Network:</label>
                  <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                    <input type="checkbox" id="m_ssid_guest" ${current.guest ? 'checked' : ''}> Red de Invitados
                  </label>
                </div>
                <div id="m_error_msg" style="color:#d9534f;font-size:12px;min-height:16px;"></div>
              </div>
              <div class="tpl-modal-footer">
                <button type="button" class="sim-btn" id="m_btn_cancel">Cancel</button>
                <button type="button" class="sim-btn primary" id="m_btn_ok">OK</button>
              </div>
            </div>
          `;
          d.body.appendChild(overlay);

          const secSelect = $('#m_ssid_sec', overlay);
          const secRow = $('#m_sec_row', overlay);
          secSelect.onchange = function() {
            secRow.style.display = secSelect.value === 'None' ? 'none' : 'flex';
          };

          $('#modal-close-x', overlay).onclick = () => overlay.remove();
          $('#m_btn_cancel', overlay).onclick = () => overlay.remove();

          $('#m_btn_ok', overlay).onclick = function() {
            const nameVal = $('#m_ssid_name', overlay).value.trim();
            const bcastVal = $('#m_ssid_bcast', overlay).checked;
            const secVal = secSelect.value;
            const passVal = $('#m_ssid_pass', overlay).value;
            const vlanVal = parseInt($('#m_ssid_vlan', overlay).value) || 0;
            const guestVal = $('#m_ssid_guest', overlay).checked;

            const errEl = $('#m_error_msg', overlay);
            if (!nameVal) {
              errEl.textContent = 'El nombre del SSID es obligatorio.';
              return;
            }
            if (secVal !== 'None' && (passVal.length < 8 || passVal.length > 63)) {
              errEl.textContent = 'La contraseña debe tener entre 8 y 63 caracteres.';
              return;
            }

            const newEntry = {
              id: isEdit ? current.id : Date.now(),
              name: nameVal,
              bcast: bcastVal,
              sec: secVal,
              pass: secVal === 'None' ? '' : passVal,
              vlan: vlanVal,
              guest: guestVal,
              txBytes: isEdit ? current.txBytes : 0,
              rxBytes: isEdit ? current.rxBytes : 0
            };

            if (isEdit) {
              curState.wireless.ssids[editIdx] = newEntry;
              EAP.addSysLog('WIRELESS', 'INFO', `SSID "${nameVal}" updated`);
            } else {
              if (curState.wireless.ssids.length >= 8) {
                errEl.textContent = 'Máximo 8 SSIDs permitidos.';
                return;
              }
              curState.wireless.ssids.push(newEntry);
              EAP.addSysLog('WIRELESS', 'INFO', `New SSID "${nameVal}" created`);
            }

            EAP.persistState();
            EAP.reevaluateAllClients();
            overlay.remove();
            renderSSIDs();
            showTplToast('SSID settings saved');
          };
        }

        const addBtn = $('.operation-btn.btn-add', grid);
        if (addBtn) {
          addBtn.onclick = function(e) {
            e.preventDefault();
            openSSIDModal(-1);
          };
        }

        grid.addEventListener('click', function(e) {
          const btn = e.target.closest('[data-act]');
          if (!btn) return;
          e.preventDefault();
          const act = btn.dataset.act;
          const idx = parseInt(btn.dataset.idx);

          if (act === 'edit') {
            openSSIDModal(idx);
          } else if (act === 'del') {
            const curState = EAP.getState();
            if (curState.wireless.ssids.length <= 1) {
              alert('Debe existir al menos 1 SSID activo.');
              return;
            }
            if (confirm(`¿Eliminar el SSID "${curState.wireless.ssids[idx].name}"?`)) {
              const rem = curState.wireless.ssids.splice(idx, 1);
              EAP.addSysLog('WIRELESS', 'WARNING', `SSID "${rem[0].name}" deleted`);
              EAP.persistState();
              EAP.reevaluateAllClients();
              renderSSIDs();
              showTplToast('SSID deleted');
            }
          }
        });
      }

      // -------------------------------------------------------------------
      // 7. PAGE 6: WIRELESS -> MAC FILTERING
      // -------------------------------------------------------------------
      function initPageMacFiltering() {
        if (pageIdx !== 6) return;
        const grid = $('#mac_addr_grid');
        if (!grid) return;
        grid.style.display = 'block';

        const s = EAP.getState();
        const mfToggle = $('#mac-filtering-enable');
        if (mfToggle) {
          const chkLabel = mfToggle.closest('label.checkbox-label');
          if (chkLabel) {
            chkLabel.dataset.handledCustom = '1';
            chkLabel.classList.toggle('checked', s.wireless.macFilter.enabled);
            chkLabel.onclick = function(e) {
              e.preventDefault();
              s.wireless.macFilter.enabled = !chkLabel.classList.contains('checked');
              chkLabel.classList.toggle('checked', s.wireless.macFilter.enabled);
              EAP.persistState();
              EAP.reevaluateAllClients();
              showTplToast(s.wireless.macFilter.enabled ? 'Filtrado MAC Activado' : 'Filtrado MAC Desactivado');
            };
          }
        }

        const tbody = $('.grid-content-data', grid);
        if (!tbody) return;

        function renderMacList() {
          const curState = EAP.getState();
          const list = curState.wireless.macFilter.list;
          if (list.length === 0) {
            tbody.innerHTML = `
              <tr class="grid-content-tr" style="display: table-row;">
                <td colspan="3" style="text-align:center;padding:12px;color:#888;">(No hay direcciones MAC en la lista)</td>
              </tr>
            `;
            return;
          }

          tbody.innerHTML = list.map((m, i) => `
            <tr class="grid-content-tr" style="display: table-row;">
              <td class="grid-content-td grid-content-td-0 fst"><span class="content">${i+1}</span></td>
              <td class="grid-content-td grid-content-td-1"><span class="content"><b>${m.mac}</b> (${esc(m.desc || 'Dispositivo')})</span></td>
              <td class="grid-content-td grid-content-td-2 lst">
                <a href="#" class="btn-del-mac" data-idx="${i}" style="color:#d9534f;font-weight:600;text-decoration:none;">Delete</a>
              </td>
            </tr>
          `).join('');
        }

        renderMacList();

        const addBtn = $('.operation-btn.btn-add', grid);
        if (addBtn) {
          addBtn.onclick = function(e) {
            e.preventDefault();
            const modal = d.createElement('div');
            modal.className = 'tpl-modal-overlay';
            modal.innerHTML = `
              <div class="tpl-modal" style="width: 400px;">
                <div class="tpl-modal-header">
                  <span>Add MAC Address</span>
                  <button type="button" class="tpl-modal-close" id="modal-close-mac">&times;</button>
                </div>
                <div class="tpl-modal-body">
                  <div class="tpl-form-group">
                    <label>MAC Address:</label>
                    <input type="text" id="m_mac_val" class="tpl-form-control" placeholder="AA:BB:CC:DD:EE:FF">
                  </div>
                  <div class="tpl-form-group">
                    <label>Description:</label>
                    <input type="text" id="m_mac_desc" class="tpl-form-control" placeholder="Ej: Portátil de prueba">
                  </div>
                  <div id="m_mac_err" style="color:#d9534f;font-size:12px;min-height:16px;"></div>
                </div>
                <div class="tpl-modal-footer">
                  <button type="button" class="sim-btn" id="m_btn_mac_cancel">Cancel</button>
                  <button type="button" class="sim-btn primary" id="m_btn_mac_ok">OK</button>
                </div>
              </div>
            `;
            d.body.appendChild(modal);

            $('#modal-close-mac', modal).onclick = () => modal.remove();
            $('#m_btn_mac_cancel', modal).onclick = () => modal.remove();

            $('#m_btn_mac_ok', modal).onclick = function() {
              let val = $('#m_mac_val', modal).value.trim().toUpperCase().replace(/-/g, ':');
              const desc = $('#m_mac_desc', modal).value.trim();
              const errEl = $('#m_mac_err', modal);

              if (!/^([0-9A-F]{2}:){5}[0-9A-F]{2}$/.test(val)) {
                errEl.textContent = 'Formato MAC inválido (use AA:BB:CC:DD:EE:FF).';
                return;
              }

              const curState = EAP.getState();
              if (curState.wireless.macFilter.list.some(m => m.mac === val)) {
                errEl.textContent = 'Esta MAC ya está en la lista.';
                return;
              }

              curState.wireless.macFilter.list.push({ id: Date.now(), mac: val, desc: desc || 'Dispositivo' });
              EAP.addSysLog('SECURITY', 'INFO', `MAC ${val} added to filter`);
              EAP.persistState();
              EAP.reevaluateAllClients();
              modal.remove();
              renderMacList();
              showTplToast('MAC added');
            };
          };
        }

        grid.addEventListener('click', function(e) {
          const btn = e.target.closest('.btn-del-mac');
          if (!btn) return;
          e.preventDefault();
          const idx = parseInt(btn.dataset.idx);
          const curState = EAP.getState();
          const rem = curState.wireless.macFilter.list.splice(idx, 1);
          EAP.addSysLog('SECURITY', 'INFO', `MAC ${rem[0].mac} removed from filter`);
          EAP.persistState();
          EAP.reevaluateAllClients();
          renderMacList();
          showTplToast('MAC removed');
        });
      }

      // -------------------------------------------------------------------
      // 8. PAGE 11: MANAGEMENT -> SYSTEM LOG
      // -------------------------------------------------------------------
      function initPageSystemLog() {
        if (pageIdx !== 11) return;
        const grid = $('#folderGrid');
        if (!grid) return;
        const tbody = $('.grid-content-data', grid);
        if (!tbody) return;

        function renderLogs() {
          const s = EAP.getState();
          tbody.innerHTML = s.logs.map((log, i) => `
            <tr class="grid-content-tr grid-content-tr-key-${i}" data-key="key-${i}" style="display: table-row;">
              <td class="grid-content-td grid-content-td-0 fst"><span class="content">${s.logs.length - i}</span></td>
              <td class="grid-content-td grid-content-td-1"><span class="content">${log.time}</span></td>
              <td class="grid-content-td grid-content-td-2"><span class="content"><b>${log.type}</b></span></td>
              <td class="grid-content-td grid-content-td-3"><span class="content" style="color:${log.level === 'WARNING' ? '#e67e22' : log.level === 'ERROR' ? '#d9534f' : '#27ae60'}">${log.level}</span></td>
              <td class="grid-content-td grid-content-td-4 lst"><span class="content">${esc(log.msg)}</span></td>
            </tr>
          `).join('');
        }

        renderLogs();

        const refBtn = $('.operation-btn.btn-refresh', grid);
        if (refBtn) {
          refBtn.onclick = function(e) {
            e.preventDefault();
            renderLogs();
            showTplToast('Logs refreshed');
          };
        }
      }

      // -------------------------------------------------------------------
      // 9. PAGE 20: SYSTEM -> REBOOT / RESET
      // -------------------------------------------------------------------
      function initPageReboot() {
        if (pageIdx !== 20) return;
        const rebootBtn = $('#reboot');
        if (rebootBtn) {
          rebootBtn.onclick = function(e) {
            e.preventDefault();
            topWin.triggerRebootSequence();
          };
        }
        const resetBtn = $('#reset');
        if (resetBtn) {
          resetBtn.onclick = function(e) {
            e.preventDefault();
            if (confirm('¿Restablecer la EAP a los valores predeterminados de fábrica?')) {
              EAP.resetState();
              topWin.triggerRebootSequence(true);
            }
          };
        }
      }

      // -------------------------------------------------------------------
      // 10. PAGE 21: SYSTEM -> BACKUP & RESTORE
      // -------------------------------------------------------------------
      function initPageBackupRestore() {
        if (pageIdx !== 21) return;
        const backupBtn = $('#backup_btn') || $('button[name="backup"]');
        if (backupBtn) {
          backupBtn.onclick = function(e) {
            e.preventDefault();
            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(EAP.getState(), null, 2));
            const dl = d.createElement('a');
            dl.setAttribute('href', dataStr);
            dl.setAttribute('download', `EAP_Backup_Config_${Date.now()}.json`);
            d.body.appendChild(dl);
            dl.click();
            dl.remove();
            showTplToast('Configuración exportada en JSON');
          };
        }
      }

      // Run all initializations
      initUniversalFormControls();
      initNavigation();
      initPageDevice();
      initPageWirelessStatus();
      initPageClientStatus();
      initPageWirelessSettings();
      initPageMacFiltering();
      initPageSystemLog();
      initPageReboot();
      initPageBackupRestore();
      restoreCurrentPageForm();

    }.toString() + ')()';
  }

  // =========================================================================
  // Public Simulator API
  // =========================================================================
  window.EAPEngine = {
    AP_POS: { x: AP_CANVAS_X, y: AP_CANVAS_Y },
    getState: () => state,
    persistState: persistState,
    resetState: resetState,
    calcDistance: calcDistance,
    calcRSSI: calcRSSI,
    getSignalBars: getSignalBars,
    calcRate: calcRate,
    formatBytes: formatBytes,
    formatUptime: formatUptime,
    addSysLog: addSysLog,
    attemptConnect: attemptConnect,
    disconnectClient: disconnectClient,
    reevaluateAllClients: reevaluateAllClients,
    addDevice: addDevice,
    removeDevice: removeDevice,
    updateDevicePosition: updateDevicePosition,
    executeCliCommand: executeCliCommand,
    onSync: onSync,
    triggerSync: triggerSync,
    getIframeEngineScript: getIframeEngineScript
  };

})(window);
