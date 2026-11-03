/**
 * TP-Link EAP Virtual Wireless Lab & Simulator - Core Engine
 * Multi-device Packet Tracer architecture, virtual device shells,
 * unconfigured-by-default Router with GUI + Cisco IOS CLI,
 * visual PDU packet tracer, and full configurability across all 23 EAP pages.
 */

(function(window) {
  'use strict';

  // =========================================================================
  // Canvas Constants & Node Coordinates (ViewBox 480 x 280)
  // =========================================================================
  const ISP_POS = { x: 42, y: 55 };
  const ROUTER_POS = { x: 115, y: 140 };
  const AP_CANVAS_X = 250;
  const AP_CANVAS_Y = 140;

  // =========================================================================
  // Default Initial State
  // - Session is null (defaults to Login screen, no spoilers)
  // - Router starts UNCONFIGURED (LAN down, no IP, DHCP off, WAN off)
  // =========================================================================
  const DEFAULT_STATE = {
    session: null,
    users: {
      'admin': 'admin'
    },
    device: {
      name: 'EAP115-30-68-93-BA-7F-A8',
      model: 'EAP115',
      firmware: '5.0.5 Build 20220427 Rel. 42838(4555)',
      hardware: '4.0',
      mac: '30:68:93:BA:7F:A8',
      connType: 'dynamic', // 'dynamic' or 'static'
      useFallback: true,
      fallbackIp: '192.168.0.254',
      fallbackMask: '255.255.255.0',
      fallbackGw: '192.168.0.1',
      ip: '192.168.0.254',
      mask: '255.255.255.0',
      gateway: '192.168.0.1',
      dns: '8.8.8.8',
      dns2: '8.8.4.4',
      uptimeSec: 142,
      cpu: 3,
      mem: 48,
      led: true,
      locating: false,
      sshEnabled: true,
      sshPort: 22,
      httpPort: 80,
      httpsPort: 443,
      port0: '100Mbps - FD'
    },
    wireless: {
      radio24: true,
      channel: 6,
      chanWidth: 'Auto',
      mode: 'b/g/n mixed',
      rate: '300.0Mbps',
      txPower: 20,
      radio5: true,
      channel5: 36,
      chanWidth5: '80MHz',
      mode5: 'a/n/ac mixed',
      rate5: '866.7Mbps',
      txPower5: 23,
      ssids: [
        {
          id: 1,
          name: 'TP-Link_2.4GHz_BA7FA8',
          band: '2.4GHz',
          vlan: 0,
          bcast: true,
          sec: 'None',
          pass: '',
          guest: false,
          rateLimitDown: 0,
          rateLimitUp: 0,
          txBytes: 1842100,
          rxBytes: 642310
        },
        {
          id: 2,
          name: 'TP-Link_5GHz_BA7FA8',
          band: '5GHz',
          vlan: 0,
          bcast: true,
          sec: 'None',
          pass: '',
          guest: false,
          rateLimitDown: 0,
          rateLimitUp: 0,
          txBytes: 924120,
          rxBytes: 312400
        }
      ],
      portal: {
        enabled: false,
        ssid: 'TP-Link_2.4GHz_BA7FA8',
        authType: 'Password', // 'None', 'Password', 'LocalUser'
        username: 'guest',
        password: '123456',
        title: 'Bienvenido al Portal Wi-Fi TP-Link',
        redirectUrl: 'http://google.com'
      },
      macFilter: {
        enabled: false,
        rule: 'Deny', // 'Allow' or 'Deny'
        list: [
          { id: 1, mac: 'DC:A6:32:9F:11:22', desc: 'Rogue-Device' }
        ]
      },
      rogueAp: {
        enabled: false,
        detected: [],
        trusted: []
      }
    },
    // Router starts UNCONFIGURED by default as requested!
    router: {
      hostname: 'Router0',
      lanEnabled: false,       // Interface Gig0/0 down by default
      ip: '',                  // No IP configured on Gig0/0 yet
      mask: '255.255.255.0',
      wanOnline: false,        // Interface Gig0/1 (WAN) down by default
      wanIp: '84.120.45.18',
      dhcpEnabled: false,      // DHCP server disabled by default
      dhcpStart: '192.168.0.100',
      dhcpEnd: '192.168.0.200',
      dhcpDns: '8.8.8.8',
      allowedVlans: '1',       // Only default VLAN 1 until trunk is configured
      cliMode: 'user'          // 'user', 'priv', 'config', 'int_g0_0', 'int_g0_1', 'dhcp'
    },
    clients: [
      {
        id: 'dev-1',
        name: 'Pixel 8 Pro',
        type: 'phone',
        mac: 'A4:5E:60:1B:7C:D2',
        x: 185,
        y: 65,
        distance: 4,
        wifiEnabled: true,
        connectedSSID: null,
        connectedBand: '2.4GHz',
        portalAuthenticated: false,
        ipConfig: 'dhcp', // 'dhcp' or 'static'
        staticIp: '192.168.0.50',
        staticMask: '255.255.255.0',
        staticGw: '192.168.0.1',
        staticDns: '8.8.8.8',
        ip: null,
        subnet: '255.255.255.0',
        gateway: null,
        dns: null,
        connTime: 0,
        txBytes: 0,
        rxBytes: 0,
        status: 'disconnected',
        lastError: null
      },
      {
        id: 'dev-2',
        name: 'ThinkPad X1',
        type: 'laptop',
        mac: '00:E0:4C:81:92:44',
        x: 355,
        y: 80,
        distance: 6,
        wifiEnabled: true,
        connectedSSID: null,
        connectedBand: '2.4GHz',
        portalAuthenticated: false,
        ipConfig: 'dhcp',
        staticIp: '192.168.0.51',
        staticMask: '255.255.255.0',
        staticGw: '192.168.0.1',
        staticDns: '8.8.8.8',
        ip: null,
        subnet: '255.255.255.0',
        gateway: null,
        dns: null,
        connTime: 0,
        txBytes: 0,
        rxBytes: 0,
        status: 'disconnected',
        lastError: null
      },
      {
        id: 'dev-3',
        name: 'SmartCam IoT',
        type: 'iot',
        mac: 'F8:1A:67:B2:3C:80',
        x: 345,
        y: 215,
        distance: 7,
        wifiEnabled: true,
        connectedSSID: null,
        connectedBand: '2.4GHz',
        portalAuthenticated: false,
        ipConfig: 'dhcp',
        staticIp: '192.168.0.52',
        staticMask: '255.255.255.0',
        staticGw: '192.168.0.1',
        staticDns: '8.8.8.8',
        ip: null,
        subnet: '255.255.255.0',
        gateway: null,
        dns: null,
        connTime: 0,
        txBytes: 0,
        rxBytes: 0,
        status: 'disconnected',
        lastError: null
      }
    ],
    logs: [
      { id: 1, time: getFormattedTime(140), type: 'SYSTEM', level: 'INFO', msg: 'System initialized successfully (EAP115 v4.0)' },
      { id: 2, time: getFormattedTime(115), type: 'DHCP_C', level: 'WARNING', msg: 'No DHCP server response on LAN; falling back to static IP 192.168.0.254/255.255.255.0' },
      { id: 3, time: getFormattedTime(90), type: 'WIRELESS', level: 'INFO', msg: 'Wireless 2.4GHz radio started on channel 6 (300.0Mbps)' },
      { id: 4, time: getFormattedTime(85), type: 'WIRELESS', level: 'INFO', msg: 'Wireless 5GHz radio started on channel 36 (866.7Mbps)' }
    ],
    forms: {}
  };

  function getFormattedTime(secondsAgo = 0) {
    const d = new Date(Date.now() - secondsAgo * 1000);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  // =========================================================================
  // State Storage with localStorage & sessionStorage
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

  const STORAGE_KEY = 'eap_lab_pt_v5';
  let state = loadInitialState();

  function loadInitialState() {
    try {
      const saved = storageGet(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = Object.assign({}, DEFAULT_STATE, parsed, {
          users: parsed.users || Object.assign({}, DEFAULT_STATE.users),
          device: Object.assign({}, DEFAULT_STATE.device, parsed.device),
          wireless: Object.assign({}, DEFAULT_STATE.wireless, parsed.wireless),
          router: Object.assign({}, DEFAULT_STATE.router, parsed.router),
          clients: (parsed.clients && parsed.clients.length) ? parsed.clients : JSON.parse(JSON.stringify(DEFAULT_STATE.clients)),
          logs: (parsed.logs && parsed.logs.length) ? parsed.logs : JSON.parse(JSON.stringify(DEFAULT_STATE.logs)),
          forms: parsed.forms || {}
        });
        // Always start on Login screen when opening the page fresh unless logged in during this tab session
        try {
          merged.session = sessionStorage.getItem('eap_active_session') || null;
        } catch (e) {
          merged.session = null;
        }
        return merged;
      }
    } catch (e) {
      console.warn('Failed to load state from storage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  function persistState() {
    try {
      if (state.session) {
        sessionStorage.setItem('eap_active_session', state.session);
      } else {
        sessionStorage.removeItem('eap_active_session');
      }
    } catch(e) {}
    storageSet(STORAGE_KEY, JSON.stringify(state));
  }

  function resetState() {
    try { sessionStorage.removeItem('eap_active_session'); } catch(e) {}
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
    return Math.max(1, Math.min(40, Math.round(px / 5.2)));
  }

  function calcRSSI(distanceMeters, band) {
    const d = Math.max(1, Number(distanceMeters) || 1);
    const txBoost = ((band === '5GHz' ? state.wireless.txPower5 : state.wireless.txPower) - 20) * 0.8;
    const baseLoss = band === '5GHz' ? -39 : -34;
    const factor = band === '5GHz' ? 23 : 20.5;
    const rssi = Math.round(baseLoss + txBoost - (factor * Math.log10(d)));
    return Math.max(-95, Math.min(-28, rssi));
  }

  function getSignalBars(rssi) {
    if (rssi >= -55) return 4;
    if (rssi >= -67) return 3;
    if (rssi >= -78) return 2;
    if (rssi >= -85) return 1;
    return 0;
  }

  function calcRate(rssi, band) {
    if (band === '5GHz') {
      if (rssi >= -55) return '866.7 Mbps';
      if (rssi >= -65) return '585.0 Mbps';
      if (rssi >= -75) return '390.0 Mbps';
      if (rssi >= -82) return '195.0 Mbps';
      return '86.7 Mbps';
    }
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
    if (state.logs.length > 60) state.logs.pop();
    persistState();
    triggerSync();
  }

  function sameSubnet(ip1, ip2, mask) {
    if (!ip1 || !ip2) return false;
    const p1 = ip1.split('.').map(Number);
    const p2 = ip2.split('.').map(Number);
    const pm = (mask || '255.255.255.0').split('.').map(Number);
    if (p1.length !== 4 || p2.length !== 4 || pm.length !== 4) return false;
    for (let i = 0; i < 4; i++) {
      if ((p1[i] & pm[i]) !== (p2[i] & pm[i])) return false;
    }
    return true;
  }

  // =========================================================================
  // Connection Handshake Engine (Respects Unconfigured Router & Static IP)
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

    // 1. SSID Check
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

    const band = ssid.band || '2.4GHz';
    const rssi = calcRSSI(client.distance, band);

    // 2. EAP Radio check for target band
    if (band === '5GHz' && !state.wireless.radio5) {
      addSysLog('WIRELESS', 'WARNING', `Client ${client.name} (${client.mac}) failed to associate: 5GHz radio is OFF`);
      client.status = 'fail';
      client.lastError = 'Radio 5GHz de la EAP apagada';
      client.connectedSSID = null;
      persistState();
      triggerSync();
      return { status: 'fail', error: client.lastError };
    }
    if (band !== '5GHz' && !state.wireless.radio24) {
      addSysLog('WIRELESS', 'WARNING', `Client ${client.name} (${client.mac}) failed to associate: 2.4GHz radio is OFF`);
      client.status = 'fail';
      client.lastError = 'Radio 2.4GHz de la EAP apagada';
      client.connectedSSID = null;
      persistState();
      triggerSync();
      return { status: 'fail', error: client.lastError };
    }

    // 3. Distance & Signal Threshold
    if (rssi < -85) {
      addSysLog('WIRELESS', 'WARNING', `Client ${client.name} (${client.mac}) out of range (${rssi} dBm)`);
      client.status = 'fail';
      client.lastError = `Señal insuficiente (${rssi} dBm a ${client.distance}m). Acerca el dispositivo al AP.`;
      client.connectedSSID = null;
      persistState();
      triggerSync();
      return { status: 'fail', error: client.lastError };
    }

    // 4. MAC Filtering Check
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
        addSysLog('AUTH', 'WARNING', `Client ${client.name} failed authentication on "${ssidName}": Incorrect PSK`);
        client.status = 'fail';
        client.lastError = 'Contraseña inalámbrica WPA/WPA2 incorrecta';
        client.connectedSSID = null;
        persistState();
        triggerSync();
        return { status: 'fail', error: client.lastError };
      }
    }

    client.connectedSSID = ssidName;
    client.connectedBand = band;

    // Captive Portal check
    if (state.wireless.portal && state.wireless.portal.enabled && state.wireless.portal.ssid === ssidName) {
      if (state.wireless.portal.authType === 'None') {
        client.portalAuthenticated = true;
      }
    } else {
      client.portalAuthenticated = true;
    }

    // 6. VLAN Trunk Check on Router (when VLAN > 0)
    if (ssid.vlan && ssid.vlan > 0) {
      const allowed = (state.router.allowedVlans || '').split(',').map(v => v.trim());
      if (!state.router.lanEnabled || !allowed.includes(String(ssid.vlan))) {
        addSysLog('VLAN', 'WARNING', `Client ${client.name} tagged on VLAN ${ssid.vlan}, but Router trunk does not allow VLAN ${ssid.vlan}`);
        client.status = 'noip';
        client.lastError = `VLAN ${ssid.vlan} bloqueada o no permitida en el puerto troncal del Router (Allowed VLANs: ${state.router.allowedVlans || 'ninguna'})`;
        client.ip = '169.254.' + Math.floor(Math.random() * 200 + 10) + '.' + Math.floor(Math.random() * 200 + 10);
        persistState();
        triggerSync();
        return { status: 'noip', error: client.lastError, ip: client.ip };
      }
    }

    // 7. IP Assignment: Static IP vs DHCP from Router
    if (client.ipConfig === 'static' && client.staticIp) {
      client.ip = client.staticIp;
      client.subnet = client.staticMask || '255.255.255.0';
      client.gateway = client.staticGw || '';
      client.dns = client.staticDns || '';
    } else {
      // Client uses DHCP -> Requires Router LAN up + Router IP + Router DHCP enabled
      if (!state.router.lanEnabled || !state.router.ip || !state.router.dhcpEnabled) {
        addSysLog('DHCP', 'WARNING', `Client ${client.name} associated with "${ssidName}" but DHCP Discover timed out (Router unconfigured/DHCP OFF)`);
        client.status = 'noip';
        client.ip = '169.254.10.' + (10 + state.clients.indexOf(client));
        client.subnet = '255.255.0.0';
        client.gateway = '0.0.0.0';
        client.dns = '0.0.0.0';
        client.lastError = 'Sin respuesta DHCP (Router desconfigurado). Configura el Router o asigna una IP Estática (192.168.0.x) en el dispositivo.';
        persistState();
        triggerSync();
        return { status: 'noip', error: client.lastError, ip: client.ip };
      }

      // Assign DHCP IP in Router's subnet
      const baseParts = (state.router.dhcpStart || state.router.ip || '192.168.0.100').split('.');
      const prefix = baseParts.slice(0, 3).join('.');
      const startHost = parseInt(baseParts[3], 10) || 100;
      const clientIdx = Math.max(0, state.clients.indexOf(client));
      client.ip = `${prefix}.${startHost + clientIdx + 1}`;
      client.subnet = state.router.mask || '255.255.255.0';
      client.gateway = state.router.ip;
      client.dns = state.router.dhcpDns || state.router.ip;
    }

    client.connTime = client.connTime || 1;
    client.txBytes = (client.txBytes || 0) + 48200;
    client.rxBytes = (client.rxBytes || 0) + 194500;

    // 8. Check Gateway & WAN status
    const routerReachable = state.router.lanEnabled && state.router.ip && sameSubnet(client.ip, state.router.ip, client.subnet);
    if (!routerReachable) {
      addSysLog('AUTH', 'INFO', `Client ${client.name} associated to "${ssidName}" with Static IP ${client.ip} (Local LAN only, Router down)`);
      client.status = 'noinet';
      client.lastError = 'Conectado en LAN local a la EAP (Router desconfigurado / Sin salida a Internet)';
    } else if (!state.router.wanOnline) {
      addSysLog('AUTH', 'INFO', `Client ${client.name} associated (${client.ip}), Router LAN OK but WAN link is DOWN`);
      client.status = 'noinet';
      client.lastError = 'Conectado al Router LAN, pero la interfaz WAN (Internet) está apagada';
    } else {
      addSysLog('AUTH', 'INFO', `Client ${client.name} associated to "${ssidName}" [IP: ${client.ip}, RSSI: ${rssi} dBm]`);
      client.status = 'connected';
      client.lastError = null;
    }

    ssid.rxBytes = (ssid.rxBytes || 0) + 14200;
    ssid.txBytes = (ssid.txBytes || 0) + 64800;

    persistState();
    triggerSync();
    return { status: client.status, ip: client.ip, error: client.lastError };
  }

  function disconnectClient(clientId) {
    const client = state.clients.find(c => c.id === clientId);
    if (!client) return;
    if (client.connectedSSID) {
      addSysLog('AUTH', 'INFO', `Client ${client.name} (${client.mac}) disconnected from "${client.connectedSSID}"`);
    }
    client.status = 'disconnected';
    client.connectedSSID = null;
    client.portalAuthenticated = false;
    if (client.ipConfig === 'dhcp') {
      client.ip = null;
      client.gateway = null;
      client.dns = null;
    }
    client.lastError = null;
    persistState();
    triggerSync();
  }

  function reevaluateAllClients() {
    state.clients.forEach(c => {
      if (c.connectedSSID || c.status === 'connected' || c.status === 'noinet' || c.status === 'noip') {
        const ssidName = c.connectedSSID || (state.wireless.ssids[0] && state.wireless.ssids[0].name);
        const targetSSID = state.wireless.ssids.find(s => s.name === ssidName);
        if (!targetSSID) {
          disconnectClient(c.id);
        } else {
          attemptConnect(c.id, ssidName, targetSSID.pass);
        }
      }
    });
  }

  // =========================================================================
  // Multi-Device Management (Packet Tracer Style)
  // =========================================================================
  function addDevice(name, type, mac) {
    const id = 'dev-' + Date.now();
    const finalMac = mac || ('52:54:00:' + Array.from({length:3}, () => Math.floor(Math.random()*256).toString(16).padStart(2,'0').toUpperCase()).join(':'));

    const angle = Math.random() * Math.PI * 2;
    const radius = 65 + Math.random() * 90;
    const x = Math.round(AP_CANVAS_X + Math.cos(angle) * radius);
    const y = Math.round(AP_CANVAS_Y + Math.sin(angle) * radius);
    const idx = state.clients.length + 1;

    const newDev = {
      id: id,
      name: name || ('Dispositivo-' + idx),
      type: type || 'phone',
      mac: finalMac,
      x: Math.max(155, Math.min(445, x)),
      y: Math.max(30, Math.min(245, y)),
      distance: calcDistance(x, y),
      wifiEnabled: true,
      connectedSSID: null,
      connectedBand: '2.4GHz',
      portalAuthenticated: false,
      ipConfig: 'dhcp',
      staticIp: `192.168.0.${50 + idx}`,
      staticMask: '255.255.255.0',
      staticGw: '192.168.0.1',
      staticDns: '8.8.8.8',
      ip: null,
      subnet: '255.255.255.0',
      gateway: null,
      dns: null,
      connTime: 0,
      txBytes: 0,
      rxBytes: 0,
      status: 'disconnected',
      lastError: null
    };

    state.clients.push(newDev);
    addSysLog('SYSTEM', 'INFO', `New simulated device added to topology: ${newDev.name} (${newDev.mac})`);
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
    client.x = Math.max(30, Math.min(455, x));
    client.y = Math.max(25, Math.min(250, y));
    client.distance = calcDistance(client.x, client.y);
    persistState();
    triggerSync();

    if ((client.status === 'connected' || client.status === 'noinet') && calcRSSI(client.distance, client.connectedBand) < -85) {
      reevaluateAllClients();
    }
  }

  // =========================================================================
  // Packet Tracer Visual PDU Simulation (Hop-by-Hop ICMP Ping)
  // =========================================================================
  function simulatePDU(sourceClientId, targetType) {
    const client = state.clients.find(c => c.id === sourceClientId);
    if (!client) return { ok: false, reason: 'Dispositivo origen no existe', hops: [] };

    const hops = [];
    // Check L2 association
    if (client.status === 'disconnected' || !client.connectedSSID) {
      return {
        ok: false,
        reason: `${client.name} no está conectado a ninguna red Wi-Fi (Capa 2 desconectada).`,
        hops: [{ from: client.name, to: 'TP-Link EAP', x1: client.x, y1: client.y, x2: AP_CANVAS_X, y2: AP_CANVAS_Y, ok: false, detail: 'Sin asociación 802.11' }]
      };
    }

    // Check valid IP
    const hasValidIp = client.ip && !client.ip.startsWith('169.254.');
    if (!hasValidIp) {
      return {
        ok: false,
        reason: `${client.name} tiene IP APIPA (${client.ip || '0.0.0.0'}) porque el Router está desconfigurado (sin DHCP) y no tiene IP Estática.`,
        hops: [{ from: client.name, to: 'TP-Link EAP', x1: client.x, y1: client.y, x2: AP_CANVAS_X, y2: AP_CANVAS_Y, ok: false, detail: 'Fallo Capa 3: Origen sin IP válida (APIPA)' }]
      };
    }

    // Target 1: Ping EAP (192.168.0.254)
    if (targetType === 'eap') {
      const inSameSub = sameSubnet(client.ip, state.device.ip, client.subnet);
      hops.push({
        from: client.name,
        to: 'TP-Link EAP',
        x1: client.x, y1: client.y,
        x2: AP_CANVAS_X, y2: AP_CANVAS_Y,
        ok: inSameSub,
        detail: inSameSub ? `ICMP Echo Request (${client.ip} → ${state.device.ip})` : `Subred distinta (${client.ip} vs ${state.device.ip})`
      });
      if (inSameSub) {
        hops.push({
          from: 'TP-Link EAP',
          to: client.name,
          x1: AP_CANVAS_X, y1: AP_CANVAS_Y,
          x2: client.x, y2: client.y,
          ok: true,
          detail: `ICMP Echo Reply (${state.device.ip} → ${client.ip}) TTL=64`
        });
      }
      return {
        ok: inSameSub,
        reason: inSameSub ? `PDU exitosa: ${client.name} (${client.ip}) ↔ EAP (${state.device.ip})` : `PDU descartada: ${client.ip} no está en la subred de la EAP (${state.device.ip})`,
        hops: hops
      };
    }

    // Hop 1: Client -> EAP
    hops.push({
      from: client.name,
      to: 'TP-Link EAP',
      x1: client.x, y1: client.y,
      x2: AP_CANVAS_X, y2: AP_CANVAS_Y,
      ok: true,
      detail: `802.11 Data Frame hacia Gateway`
    });

    // Target 2: Ping Router (192.168.0.1)
    if (targetType === 'router') {
      const routerUp = state.router.lanEnabled && Boolean(state.router.ip) && sameSubnet(client.ip, state.router.ip, client.subnet);
      hops.push({
        from: 'TP-Link EAP',
        to: state.router.hostname,
        x1: AP_CANVAS_X, y1: AP_CANVAS_Y,
        x2: ROUTER_POS.x, y2: ROUTER_POS.y,
        ok: routerUp,
        detail: routerUp ? `802.3 Ethernet (${client.ip} → ${state.router.ip})` : `Interfaz Gi0/0 del Router apagada o sin IP en la subred`
      });
      if (routerUp) {
        hops.push({
          from: state.router.hostname,
          to: client.name,
          x1: ROUTER_POS.x, y1: ROUTER_POS.y,
          x2: client.x, y2: client.y,
          ok: true,
          detail: `ICMP Echo Reply desde ${state.router.ip} (TTL=255)`
        });
      }
      return {
        ok: routerUp,
        reason: routerUp ? `PDU exitosa: ${client.name} ↔ ${state.router.hostname} (${state.router.ip})` : `PDU fallida en ${state.router.hostname}: Interfaz LAN Gi0/0 desconfigurada o apagada.`,
        hops: hops
      };
    }

    // Target 3: Ping Internet / ISP (8.8.8.8)
    const routerLanOk = state.router.lanEnabled && Boolean(state.router.ip) && sameSubnet(client.ip, state.router.ip, client.subnet) && client.gateway === state.router.ip;
    hops.push({
      from: 'TP-Link EAP',
      to: state.router.hostname,
      x1: AP_CANVAS_X, y1: AP_CANVAS_Y,
      x2: ROUTER_POS.x, y2: ROUTER_POS.y,
      ok: routerLanOk,
      detail: routerLanOk ? `Enrutando paquete hacia Gateway ${state.router.ip}` : `Fallo: Gateway ${client.gateway || 'ninguno'} inalcanzable o Router Gi0/0 apagado`
    });

    if (!routerLanOk) {
      return {
        ok: false,
        reason: `PDU descartada: El Router (${state.router.hostname}) está desconfigurado o el dispositivo no tiene puerta de enlace válida.`,
        hops: hops
      };
    }

    const wanOk = Boolean(state.router.wanOnline);
    hops.push({
      from: state.router.hostname,
      to: 'ISP Cloud (8.8.8.8)',
      x1: ROUTER_POS.x, y1: ROUTER_POS.y,
      x2: ISP_POS.x, y2: ISP_POS.y,
      ok: wanOk,
      detail: wanOk ? `NAT Overload (${client.ip} → ${state.router.wanIp} → 8.8.8.8)` : `Interfaz WAN Gi0/1 caída (Destination Host Unreachable)`
    });

    if (wanOk) {
      hops.push({
        from: 'ISP Cloud (8.8.8.8)',
        to: client.name,
        x1: ISP_POS.x, y1: ISP_POS.y,
        x2: client.x, y2: client.y,
        ok: true,
        detail: `ICMP Echo Reply desde 8.8.8.8 (TTL=117)`
      });
    }

    return {
      ok: wanOk,
      reason: wanOk ? `PDU exitosa hasta Internet (8.8.8.8) vía NAT en ${state.router.hostname}` : `PDU descartada en ${state.router.hostname}: El enlace WAN (Gi0/1) hacia el ISP está desactivado.`,
      hops: hops
    };
  }

  // =========================================================================
  // Interactive Client Terminal / CLI Engine
  // =========================================================================
  function executeCliCommand(clientId, cmdLine) {
    const client = state.clients.find(c => c.id === clientId);
    if (!client) return 'Error: Dispositivo no encontrado.';

    const raw = cmdLine.trim();
    if (!raw) return '';
    const parts = raw.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    const rssi = calcRSSI(client.distance, client.connectedBand);

    if (cmd === 'help') {
      return `Comandos de diagnóstico disponibles en ${client.name}:
  ipconfig [/all | /renew | /release]  Configuración IP y cliente DHCP
  ping <ip/host>                       Envía paquetes ICMP Echo a un host
  tracert <ip/host>                    Traza la ruta de saltos (TTL)
  arp -a                               Muestra la tabla caché ARP (IP <-> MAC)
  nslookup <dominio>                   Consulta registros al servidor DNS
  netsh wlan show [interfaces|networks] Estado de tarjeta Wi-Fi 802.11 y escaneo
  ssh <usuario>@<ip>                   Inicia sesión SSH en la EAP (${state.device.ip})
  curl <url>                           Petición HTTP de prueba
  clear / cls                          Limpia la consola`;
    }

    if (cmd === 'ipconfig' || cmd === 'ifconfig') {
      const sub = (args[0] || '').toLowerCase();
      if (sub === '/release') {
        if (client.ipConfig === 'static') return 'Error: El adaptador usa IP Estática. Cambia a DHCP primero.';
        client.ip = '0.0.0.0';
        client.gateway = '0.0.0.0';
        persistState();
        triggerSync();
        return `Configuración IP de Windows\n\nAdaptador de LAN inalámbrica Wi-Fi:\n   Dirección IPv4 liberada correctamente.`;
      }
      if (sub === '/renew') {
        if (client.ipConfig === 'static') return 'El adaptador tiene configurada una IP Estática: ' + client.staticIp;
        if (!client.connectedSSID) return 'Error: El medio está desconectado. Conéctate a una red Wi-Fi primero.';
        const ssidObj = state.wireless.ssids.find(s => s.name === client.connectedSSID);
        const res = attemptConnect(client.id, client.connectedSSID, ssidObj ? ssidObj.pass : '');
        if (res.status === 'noip') {
          return `Configuración IP de Windows\n\nError al renovar la interfaz Wi-Fi: No se puede contactar con ningún servidor DHCP (Tiempo de espera agotado).\nDirección de autoconfiguración APIPA asignada: ${client.ip}`;
        }
        return `Configuración IP de Windows\n\nAdaptador de LAN inalámbrica Wi-Fi:\n   Dirección IPv4. . . . . . . . . . . . . . : ${client.ip}\n   Máscara de subred . . . . . . . . . . . . : ${client.subnet}\n   Puerta de enlace predeterminada . . . . . : ${client.gateway}`;
      }

      if (client.status === 'disconnected') {
        return `Configuración IP de Windows\n\nAdaptador de LAN inalámbrica Wi-Fi:\n   Estado de los medios. . . . . : Medios desconectados\n   Dirección física (MAC). . . . : ${client.mac}`;
      }
      return `Configuración IP de Windows\n\nAdaptador de LAN inalámbrica Wi-Fi:
   Sufijo DNS específico para la conexión. . : lab.local
   Modo de configuración IP. . . . . . . . . : ${client.ipConfig === 'static' ? 'Estática (Manual)' : 'DHCP Dinámico'}
   Dirección física (MAC). . . . . . . . . . : ${client.mac}
   Dirección IPv4. . . . . . . . . . . . . . : ${client.ip || '169.254.0.1'}
   Máscara de subred . . . . . . . . . . . . : ${client.subnet || '255.255.255.0'}
   Puerta de enlace predeterminada . . . . . : ${client.gateway || '0.0.0.0'}
   Servidor DNS. . . . . . . . . . . . . . . : ${client.dns || '0.0.0.0'}
   SSID Asociado . . . . . . . . . . . . . . : ${client.connectedSSID} (${client.connectedBand || '2.4GHz'})`;
    }

    if (cmd === 'arp') {
      if (client.status === 'disconnected' || !client.ip) {
        return 'No se encontraron entradas ARP.';
      }
      let out = `Interfaz: ${client.ip} --- 0x2\n  Dirección de Internet  Dirección física      Tipo\n`;
      if (sameSubnet(client.ip, state.device.ip, client.subnet)) {
        out += `  ${state.device.ip.padEnd(22)} ${state.device.mac.replace(/:/g, '-').toLowerCase()}     dinámico\n`;
      }
      if (state.router.lanEnabled && state.router.ip && sameSubnet(client.ip, state.router.ip, client.subnet)) {
        out += `  ${state.router.ip.padEnd(22)} 00-d0-ba-14-88-01     dinámico\n`;
      }
      out += `  255.255.255.255        ff-ff-ff-ff-ff-ff     estático`;
      return out;
    }

    if (cmd === 'nslookup') {
      const host = args[0] || 'google.com';
      if (client.status === 'disconnected' || !state.router.lanEnabled || !state.router.wanOnline) {
        return `DNS request timed out.\n    timeout was 2 seconds.\nServidor:  UnKnown\n*** Request to UnKnown timed-out`;
      }
      return `Servidor:  dns.google\nAddress:  ${client.dns || '8.8.8.8'}\n\nRespuesta no autoritativa:\nNombre:  ${host}\nAddress: 142.250.184.14`;
    }

    if (cmd === 'ssh') {
      const target = args[0] || '';
      if (!target.includes(state.device.ip)) {
        return `Uso: ssh <usuario>@${state.device.ip}`;
      }
      if (!state.device.sshEnabled) {
        return `ssh: connect to host ${state.device.ip} port ${state.device.sshPort}: Connection refused (SSH Server disabled on EAP)`;
      }
      if (client.status === 'disconnected' || !sameSubnet(client.ip, state.device.ip, client.subnet)) {
        return `ssh: connect to host ${state.device.ip} port ${state.device.sshPort}: Network is unreachable`;
      }
      const userPart = target.split('@')[0] || 'admin';
      return `Conectado a TP-Link ${state.device.model} SSHD (Puerto ${state.device.sshPort})\n Autenticado en sesión CLI embebida como '${userPart}':\n [${state.device.name}]# show system-info\n  Model        : ${state.device.model} v${state.device.hardware}\n  Firmware     : ${state.device.firmware}\n  MAC Address  : ${state.device.mac}\n  IP Address   : ${state.device.ip}/${state.device.mask}\n  Uptime       : ${formatUptime(state.device.uptimeSec)}\nConexión cerrada.`;
    }

    if (cmd === 'netsh') {
      if ((args[2] || '').toLowerCase() === 'networks') {
        const nets = state.wireless.ssids.filter(s => s.bcast).map((s, idx) =>
          `SSID ${idx + 1} : ${s.name}\n    Tipo de red             : Infraestructura\n    Autenticación           : ${s.sec}\n    Banda / Canal           : ${s.band || '2.4GHz'} (Canal ${s.band === '5GHz' ? state.wireless.channel5 : state.wireless.channel})`
        ).join('\n\n');
        return `Interfaz Wi-Fi: ${state.wireless.ssids.length} redes visibles\n\n` + (nets || 'Ninguna red visible.');
      }
      if (client.status === 'disconnected') {
        return 'La interfaz de red inalámbrica no está asociada a ningún punto de acceso.';
      }
      return `Nombre de interfaz: Wi-Fi
   Descripción            : 802.11ac Wireless LAN Card
   Dirección física       : ${client.mac}
   Estado                 : Conectado
   SSID                   : ${client.connectedSSID}
   BSSID                  : ${state.device.mac}
   Tipo de radio          : ${client.connectedBand === '5GHz' ? '802.11ac (5 GHz)' : '802.11n (2.4 GHz)'}
   Canal                  : ${client.connectedBand === '5GHz' ? state.wireless.channel5 : state.wireless.channel}
   Velocidad Rx / Tx      : ${calcRate(rssi, client.connectedBand)}
   Señal                  : ${Math.max(10, Math.min(100, Math.round((rssi + 100) * 1.4)))}% (${rssi} dBm)`;
    }

    if (cmd === 'ping') {
      const target = args[0] || state.device.ip;
      if (client.status === 'disconnected') {
        return `Haciendo ping a ${target} con 32 bytes de datos:\nPING: fallo en la transmisión. Error general (Adaptador Wi-Fi desconectado).`;
      }

      // Ping EAP
      if (target === state.device.ip) {
        if (!sameSubnet(client.ip, state.device.ip, client.subnet)) {
          return `Haciendo ping a ${target} desde ${client.ip || '0.0.0.0'}:\nTiempo de espera agotado para esta solicitud.\nTiempo de espera agotado para esta solicitud.\n(Pista: Tu dispositivo tiene IP ${client.ip}. Configura el DHCP del Router o pon una IP Estática 192.168.0.x en Config IP).`;
        }
        const lat = Math.round(1 + Math.random() * 2 + client.distance * 0.15);
        return `Haciendo ping a ${target} con 32 bytes de datos:\nRespuesta desde ${target}: bytes=32 tiempo=${lat}ms TTL=64\nRespuesta desde ${target}: bytes=32 tiempo=${lat+1}ms TTL=64\nRespuesta desde ${target}: bytes=32 tiempo=${lat}ms TTL=64\nRespuesta desde ${target}: bytes=32 tiempo=${lat}ms TTL=64\n\nEstadísticas de ping para ${target}:\n    Paquetes: enviados = 4, recibidos = 4, perdidos = 0 (0% perdidos)`;
      }

      // Ping Router
      if (target === state.router.ip || target === '192.168.0.1') {
        if (!state.router.lanEnabled || !state.router.ip || !sameSubnet(client.ip, state.router.ip, client.subnet)) {
          return `Haciendo ping a ${target} con 32 bytes de datos:\nTiempo de espera agotado para esta solicitud.\nTiempo de espera agotado para esta solicitud.\n(Nota: El Router viene desconfigurado por defecto. Activa su interfaz Gi0/0 e IP 192.168.0.1 en la pestaña Router).`;
        }
        const lat = Math.round(2 + Math.random() * 2 + client.distance * 0.15);
        return `Haciendo ping a ${target} con 32 bytes de datos:\nRespuesta desde ${target}: bytes=32 tiempo=${lat}ms TTL=255\nRespuesta desde ${target}: bytes=32 tiempo=${lat}ms TTL=255\nRespuesta desde ${target}: bytes=32 tiempo=${lat+1}ms TTL=255\nRespuesta desde ${target}: bytes=32 tiempo=${lat}ms TTL=255\n\nEstadísticas de ping para ${target}:\n    Paquetes: enviados = 4, recibidos = 4, perdidos = 0 (0% perdidos)`;
      }

      // Ping another client
      const peer = state.clients.find(c => c.ip === target && (c.status === 'connected' || c.status === 'noinet'));
      if (peer) {
        const curSsid = state.wireless.ssids.find(s => s.name === client.connectedSSID);
        if (curSsid && curSsid.guest) {
          return `Haciendo ping a ${target} (${peer.name}):\nTiempo de espera agotado (Aislamiento de Red de Invitados / Guest Network activo en la EAP).`;
        }
        if (sameSubnet(client.ip, peer.ip, client.subnet)) {
          return `Haciendo ping a ${target} [${peer.name}] con 32 bytes de datos:\nRespuesta desde ${target}: bytes=32 tiempo=3ms TTL=128\nRespuesta desde ${target}: bytes=32 tiempo=4ms TTL=128\n    Paquetes: enviados = 2, recibidos = 2, perdidos = 0 (0% perdidos)`;
        }
      }

      // Ping Internet
      if (target === '8.8.8.8' || target === 'google.com' || target === '1.1.1.1') {
        if (!state.router.lanEnabled || !state.router.ip || client.gateway !== state.router.ip) {
          return `Haciendo ping a ${target} con 32 bytes de datos:\nPING: fallo en la transmisión. Sin puerta de enlace válida (Router desconfigurado).`;
        }
        if (!state.router.wanOnline) {
          return `Haciendo ping a ${target} con 32 bytes de datos:\nRespuesta desde ${state.router.ip}: Host de destino inaccesible (Interfaz WAN Gi0/1 caída).\nPaquetes: enviados = 2, recibidos = 0, perdidos = 2 (100% perdidos)`;
        }
        const lat = Math.round(14 + Math.random() * 5 + client.distance * 0.2);
        return `Haciendo ping a ${target} [8.8.8.8] con 32 bytes de datos:\nRespuesta desde 8.8.8.8: bytes=32 tiempo=${lat}ms TTL=117\nRespuesta desde 8.8.8.8: bytes=32 tiempo=${lat+1}ms TTL=117\nRespuesta desde 8.8.8.8: bytes=32 tiempo=${lat}ms TTL=117\nRespuesta desde 8.8.8.8: bytes=32 tiempo=${lat+2}ms TTL=117\n\nEstadísticas de ping para ${target}:\n    Paquetes: enviados = 4, recibidos = 4, perdidos = 0 (0% perdidos)`;
      }

      return `Haciendo ping a ${target} con 32 bytes de datos:\nTiempo de espera agotado para esta solicitud.\nPaquetes: enviados = 1, recibidos = 0, perdidos = 1 (100% perdidos)`;
    }

    if (cmd === 'tracert' || cmd === 'traceroute') {
      const target = args[0] || '8.8.8.8';
      if (client.status === 'disconnected') return 'Error: Sin conexión de red.';
      if (target === state.device.ip && sameSubnet(client.ip, state.device.ip, client.subnet)) {
        return `Traza a ${target} sobre un máximo de 30 saltos:\n  1     1 ms     1 ms     1 ms  ${state.device.ip} [${state.device.name}]\nTraza completa.`;
      }
      if (!state.router.lanEnabled || !state.router.ip || !sameSubnet(client.ip, state.router.ip, client.subnet)) {
        return `Traza a ${target}:\n  1     *        *        *     Tiempo de espera agotado (Router desconfigurado).`;
      }
      if (!state.router.wanOnline) {
        return `Traza a ${target}:\n  1     1 ms     1 ms     1 ms  ${state.router.ip} [${state.router.hostname}]\n  2  ${state.router.ip} informa: Host de destino inaccesible (WAN Gi0/1 apagada).`;
      }
      return `Traza a la dirección ${target} sobre un máximo de 30 saltos:\n  1     1 ms     1 ms     1 ms  ${state.router.ip} [${state.router.hostname}]\n  2     9 ms     8 ms     9 ms  ${state.router.wanIp} [ISP Edge]\n  3    15 ms    14 ms    15 ms  ${target}\nTraza completa.`;
    }

    if (cmd === 'curl') {
      const url = args[0] || `http://${state.device.ip}`;
      if (client.status === 'disconnected') return 'curl: (6) Could not resolve host (red desconectada)';
      if (url.includes(state.device.ip)) {
        if (!sameSubnet(client.ip, state.device.ip, client.subnet)) {
          return `curl: (7) Failed to connect to ${state.device.ip}: No route to host (Revisa tu IP: ${client.ip})`;
        }
        return `HTTP/1.1 200 OK\nServer: TP-Link EAP Web Server\nContent-Type: text/html\n\n<!DOCTYPE html><html><head><title>${state.device.model}</title></head><body><h1>TP-Link EAP Management Console</h1></body></html>`;
      }
      if (!state.router.lanEnabled || !state.router.wanOnline) return 'curl: (7) Failed to connect to host: Network unreachable';
      return `HTTP/1.1 200 OK\nContent-Type: text/html\n\n<!doctype html><html><head><title>Google</title></head><body><h1>200 OK Internet</h1></body></html>`;
    }

    return `'${cmd}' no se reconoce como un comando interno o externo. Escriba 'help' para ver la lista de comandos.`;
  }

  // =========================================================================
  // Interactive Router Cisco IOS CLI Engine
  // =========================================================================
  function getRouterPrompt() {
    const h = state.router.hostname || 'Router';
    const m = state.router.cliMode || 'user';
    if (m === 'user') return `${h}>`;
    if (m === 'priv') return `${h}#`;
    if (m === 'config') return `${h}(config)#`;
    if (m === 'int_g0_0' || m === 'int_g0_1') return `${h}(config-if)#`;
    if (m === 'dhcp') return `${h}(dhcp-config)#`;
    return `${h}>`;
  }

  function executeRouterCli(cmdLine) {
    const raw = cmdLine.trim();
    if (!raw) return '';
    const low = raw.toLowerCase();
    const parts = raw.split(/\s+/);
    const r = state.router;

    if (low === '?' || low === 'help') {
      return `Comandos Cisco IOS disponibles (modo actual: ${r.cliMode}):
  enable                               Entra en modo EXEC privilegiado (#)
  configure terminal (o conf t)        Entra en modo de configuración global
  hostname <nombre>                    Cambia el nombre del Router
  interface g0/0                       Configura la interfaz LAN (hacia la EAP)
    ip address 192.168.0.1 255.255.255.0   Asigna IP y máscara a Gi0/0
    no shutdown                            Enciende la interfaz
    switchport trunk allowed vlan 1,10,20  Permite VLANs en el troncal
  interface g0/1                       Configura la interfaz WAN (hacia el ISP)
    ip address dhcp / no shutdown          Conecta la salida WAN a Internet
  ip dhcp pool LAN                     Habilita el servidor DHCP del Router
  no service dhcp                      Deshabilita el servidor DHCP
  show ip interface brief              Resumen de interfaces e IPs
  show running-config                  Muestra la configuración activa
  show ip dhcp binding                 Muestra concesiones DHCP activas
  exit / end                           Sale del submodo actual`;
    }

    if (low === 'enable' || low === 'en') {
      r.cliMode = 'priv';
      persistState();
      return '';
    }

    if (low === 'disable') {
      r.cliMode = 'user';
      persistState();
      return '';
    }

    if (low === 'end') {
      r.cliMode = 'priv';
      persistState();
      return '%SYS-5-CONFIG_I: Configured from console by console';
    }

    if (low === 'exit') {
      if (r.cliMode === 'int_g0_0' || r.cliMode === 'int_g0_1' || r.cliMode === 'dhcp') r.cliMode = 'config';
      else if (r.cliMode === 'config') r.cliMode = 'priv';
      else r.cliMode = 'user';
      persistState();
      return '';
    }

    if (low.startsWith('conf')) {
      if (r.cliMode === 'user') return '% Invalid input: Write "enable" first.';
      r.cliMode = 'config';
      persistState();
      return 'Enter configuration commands, one per line. End with CNTL/Z.';
    }

    if (low.startsWith('sh ip int') || low.startsWith('show ip int')) {
      const g0Ip = r.ip || 'unassigned';
      const g0St = r.lanEnabled ? 'up                    up' : 'administratively down down';
      const g1Ip = r.wanOnline ? r.wanIp : 'unassigned';
      const g1St = r.wanOnline ? 'up                    up' : 'administratively down down';
      return `Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     ${g0Ip.padEnd(15)} YES manual ${g0St}
GigabitEthernet0/1     ${g1Ip.padEnd(15)} YES DHCP   ${g1St}`;
    }

    if (low.startsWith('sh run') || low.startsWith('show run')) {
      return `Building configuration...\nCurrent configuration:\n!\nhostname ${r.hostname}\n!\n${r.dhcpEnabled ? `service dhcp\nip dhcp pool LAN\n network 192.168.0.0 ${r.mask}\n default-router ${r.ip || '192.168.0.1'}\n dns-server ${r.dhcpDns}` : 'no service dhcp'}\n!\ninterface GigabitEthernet0/0\n description LAN_TRUNK_TO_EAP\n ${r.ip ? `ip address ${r.ip} ${r.mask}` : 'no ip address'}\n switchport mode trunk\n switchport trunk allowed vlan ${r.allowedVlans}\n ${r.lanEnabled ? 'no shutdown' : 'shutdown'}\n!\ninterface GigabitEthernet0/1\n description WAN_TO_ISP\n ${r.wanOnline ? `ip address dhcp\n no shutdown` : 'no ip address\n shutdown'}\n!\nend`;
    }

    if (low.startsWith('sh ip dhcp bind') || low.startsWith('show ip dhcp bind')) {
      const leases = state.clients.filter(c => c.ipConfig === 'dhcp' && c.ip && !c.ip.startsWith('169.254.'));
      if (!leases.length) return 'IP address       Client-ID/              Lease expiration        Type\n                 Hardware address\n(No active DHCP bindings)';
      return 'IP address       Client-ID/              Lease expiration        Type\n                 Hardware address\n' +
        leases.map(c => `${c.ip.padEnd(16)} ${c.mac.padEnd(23)} Infinite                Automatic`).join('\n');
    }

    if (low === 'wr' || low.startsWith('write') || low.startsWith('copy run')) {
      persistState();
      return 'Building configuration...\n[OK]';
    }

    // Global Config & Submodes
    if (r.cliMode === 'config' || r.cliMode === 'int_g0_0' || r.cliMode === 'int_g0_1' || r.cliMode === 'dhcp') {
      if (low.startsWith('hostname ') && parts[1]) {
        r.hostname = parts[1];
        persistState();
        triggerSync();
        return '';
      }
      if (low === 'int g0/0' || low === 'interface g0/0' || low === 'interface gigabitethernet0/0' || low === 'interface gigabitethernet 0/0') {
        r.cliMode = 'int_g0_0';
        persistState();
        return '';
      }
      if (low === 'int g0/1' || low === 'interface g0/1' || low === 'interface gigabitethernet0/1' || low === 'interface gigabitethernet 0/1') {
        r.cliMode = 'int_g0_1';
        persistState();
        return '';
      }
      if (low.startsWith('ip dhcp pool') || low === 'service dhcp') {
        r.dhcpEnabled = true;
        r.cliMode = 'dhcp';
        addSysLog('DHCP', 'INFO', 'Router DHCP Server enabled via IOS CLI');
        persistState();
        reevaluateAllClients();
        triggerSync();
        return '';
      }
      if (low === 'no service dhcp') {
        r.dhcpEnabled = false;
        persistState();
        reevaluateAllClients();
        triggerSync();
        return '';
      }
    }

    if (r.cliMode === 'int_g0_0') {
      if (low.startsWith('ip address ') && parts.length >= 4) {
        r.ip = parts[2];
        r.mask = parts[3];
        persistState();
        reevaluateAllClients();
        triggerSync();
        return '';
      }
      if (low === 'no shutdown' || low === 'no shut') {
        r.lanEnabled = true;
        if (!r.ip) r.ip = '192.168.0.1';
        addSysLog('ROUTER', 'INFO', `%LINK-3-UPDOWN: Interface GigabitEthernet0/0, changed state to up (${r.ip})`);
        persistState();
        reevaluateAllClients();
        triggerSync();
        return `%LINK-3-UPDOWN: Interface GigabitEthernet0/0, changed state to up\n%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0, changed state to up`;
      }
      if (low === 'shutdown' || low === 'shut') {
        r.lanEnabled = false;
        addSysLog('ROUTER', 'WARNING', `%LINK-5-CHANGED: Interface GigabitEthernet0/0, changed state to administratively down`);
        persistState();
        reevaluateAllClients();
        triggerSync();
        return `%LINK-5-CHANGED: Interface GigabitEthernet0/0, changed state to administratively down`;
      }
      if (low.startsWith('switchport trunk allowed vlan ')) {
        r.allowedVlans = parts.slice(4).join(' ');
        persistState();
        reevaluateAllClients();
        triggerSync();
        return '';
      }
    }

    if (r.cliMode === 'int_g0_1') {
      if (low === 'ip address dhcp') {
        return '';
      }
      if (low === 'no shutdown' || low === 'no shut') {
        r.wanOnline = true;
        addSysLog('ROUTER', 'INFO', `%LINK-3-UPDOWN: Interface GigabitEthernet0/1 (WAN), changed state to up (${r.wanIp})`);
        persistState();
        reevaluateAllClients();
        triggerSync();
        return `%LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to up\n%DHCP-6-ADDRESS_ASSIGN: Interface GigabitEthernet0/1 assigned DHCP address ${r.wanIp}`;
      }
      if (low === 'shutdown' || low === 'shut') {
        r.wanOnline = false;
        persistState();
        reevaluateAllClients();
        triggerSync();
        return `%LINK-5-CHANGED: Interface GigabitEthernet0/1, changed state to administratively down`;
      }
    }

    if (r.cliMode === 'dhcp') {
      if (low.startsWith('network ') || low.startsWith('default-router ') || low.startsWith('dns-server ')) {
        if (low.startsWith('dns-server ') && parts[1]) r.dhcpDns = parts[1];
        r.dhcpEnabled = true;
        persistState();
        reevaluateAllClients();
        triggerSync();
        return '';
      }
    }

    return `% Invalid input detected at '^' marker. Write '?' for help.`;
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
    const activeConn = state.clients.filter(c => c.status === 'connected' || c.status === 'noinet').length;
    state.device.cpu = Math.max(1, Math.min(45, Math.round(2 + activeConn * 3 + Math.random() * 4)));
    state.device.mem = Math.max(38, Math.min(78, Math.round(46 + activeConn * 2 + (Math.random() * 2 - 1))));

    let changed = false;
    state.clients.forEach(c => {
      if (c.status === 'connected' || c.status === 'noinet') {
        c.connTime = (c.connTime || 0) + 1;
        c.txBytes = (c.txBytes || 0) + Math.floor(Math.random() * 180 + 30);
        c.rxBytes = (c.rxBytes || 0) + Math.floor(Math.random() * 640 + 90);
        changed = true;
      }
    });

    if (changed && Math.random() < 0.25) {
      persistState();
    }
  }, 1000);

  // =========================================================================
  // IFRAME BRIDGE ENGINE (ALL 23 TP-LINK EAP PAGES)
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

      function showTplToast(msg, isError) {
        let p = $('#tpl-custom-toast');
        if (!p) {
          p = d.createElement('div');
          p.id = 'tpl-custom-toast';
          p.style.cssText = 'position:fixed;top:45%;left:50%;transform:translate(-50%,-50%);z-index:99999;background:rgba(35,47,53,0.94);color:#fff;padding:12px 24px;border-radius:4px;font:bold 13px Arial,sans-serif;display:flex;align-items:center;gap:10px;box-shadow:0 6px 20px rgba(0,0,0,0.35);transition:opacity 0.2s;';
          d.body.appendChild(p);
        }
        p.innerHTML = `<span style="color:${isError ? '#f43f5e' : '#4acbd6'};font-size:16px;">${isError ? '✖' : '✔'}</span><span>${esc(msg || 'Operation succeeded')}</span>`;
        p.style.display = 'flex';
        clearTimeout(p._timer);
        p._timer = setTimeout(() => { if (p) p.style.display = 'none'; }, 1700);
      }

      // -------------------------------------------------------------------
      // 1. UNIVERSAL FORM, COMBOBOX, RADIO, CHECKBOX & HEADER HANDLER
      // -------------------------------------------------------------------
      function initUniversalFormControls() {
        // Update header device name & hook native TP-Link Logout button (#top-control-logout)
        const s = EAP.getState();
        const devNameHeader = $('#devname');
        if (devNameHeader) devNameHeader.textContent = s.device.name;

        const nativeLogout = $('#top-control-logout');
        if (nativeLogout) {
          nativeLogout.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (confirm('Are you sure you want to log out?')) {
              if (topWin.triggerLogout) topWin.triggerLogout();
            }
          }, true);
        }

        const nativeHelp = $('#top-control-help');
        if (nativeHelp) {
          nativeHelp.addEventListener('click', function(e) {
            e.preventDefault();
            showTplToast('TP-Link EAP Standalone Web Management Simulator');
          }, true);
        }

        d.addEventListener('click', function(e) {
          const sw = e.target.closest('.combobox-text, .combobox-switch');
          const allWraps = $$('.combobox-list-wrap');

          if (!sw) {
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

          const chkLabel = e.target.closest('label.checkbox-label');
          if (chkLabel && !chkLabel.dataset.handledCustom) {
            e.preventDefault();
            const isChecked = chkLabel.classList.toggle('checked');
            const input = $('input[type=checkbox]', chkLabel);
            if (input) input.checked = isChecked;
          }

          const radioLabel = e.target.closest('label.radio-label');
          if (radioLabel && !radioLabel.dataset.handledCustom) {
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

        // Generic Save / Apply buttons
        d.addEventListener('click', function(e) {
          const btn = e.target.closest('button.button-button');
          if (!btn || btn.dataset.handledCustom) return;
          const txt = btn.textContent.trim().toLowerCase();
          if (txt === 'save' || txt === 'apply' || txt === 'ok' || txt === 'confirm') {
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
        $$('#top-menu a').forEach(a => {
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
      // 3. PAGE 0: STATUS -> DEVICE (Live CPU/Memory Bars & Device Info)
      // -------------------------------------------------------------------
      function initPageDevice() {
        if (pageIdx !== 0) return;

        function updateDeviceStatus() {
          const s = EAP.getState();
          const setVal = (sel, v) => { const el = $(sel); if (el) el.value = v; };
          setVal('#device_name', s.device.name);
          setVal('#device_model', s.device.model);
          setVal('#device_firmware', s.device.firmware);
          setVal('#device_hardware', s.device.hardware);
          setVal('#device_mac', s.device.mac);
          setVal('#device_ip', s.device.ip);
          setVal('#device_mask', s.device.mask);
          setVal('#device_port0', s.device.port0);
          setVal('#device_uptime', EAP.formatUptime(s.device.uptimeSec));

          const now = new Date();
          const pad = n => String(n).padStart(2, '0');
          setVal('#device_time', `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);

          // Update CPU & Memory progress bars
          const cpuInput = $('#device_cpu');
          if (cpuInput) {
            const wrap = cpuInput.closest('.progressbar-container');
            if (wrap) {
              const bar = $('.progressbar-value', wrap);
              const txt = $('.progressbar-percentage', wrap);
              if (bar) bar.style.width = Math.round((s.device.cpu / 100) * 210) + 'px';
              if (txt) txt.textContent = s.device.cpu + '%';
            }
          }
          const memInput = $('#device_memory');
          if (memInput) {
            const wrap = memInput.closest('.progressbar-container');
            if (wrap) {
              const bar = $('.progressbar-value', wrap);
              const txt = $('.progressbar-percentage', wrap);
              if (bar) bar.style.width = Math.round((s.device.mem / 100) * 210) + 'px';
              if (txt) txt.textContent = s.device.mem + '%';
            }
          }
        }

        // Allow editing Device Name if user double-clicks or edits #device_name
        const nameEl = $('#device_name');
        if (nameEl) {
          nameEl.removeAttribute('readonly');
          nameEl.style.border = '1px dashed transparent';
          nameEl.title = 'Haz clic para editar el nombre del dispositivo y presiona Enter';
          nameEl.addEventListener('focus', () => { nameEl.style.borderColor = '#4acbd6'; });
          nameEl.addEventListener('blur', () => {
            nameEl.style.borderColor = 'transparent';
            const s = EAP.getState();
            if (nameEl.value.trim()) {
              s.device.name = nameEl.value.trim();
              EAP.persistState();
              EAP.triggerSync();
              showTplToast('Device Name updated');
            }
          });
        }

        updateDeviceStatus();
        setInterval(updateDeviceStatus, 1000);
      }

      // -------------------------------------------------------------------
      // 4. PAGE 1: STATUS -> WIRELESS (2.4GHz & 5GHz Tabs + Traffic Stats)
      // -------------------------------------------------------------------
      function initPageWirelessStatus() {
        if (pageIdx !== 1) return;
        let currentBand = '2.4GHz';

        function renderWirelessStatus() {
          const s = EAP.getState();
          const is5 = currentBand === '5GHz';
          const setVal = (sel, v) => { const el = $(sel); if (el) el.value = v; };

          setVal('#radio_enable', (is5 ? s.wireless.radio5 : s.wireless.radio24) ? 'Enable' : 'Disable');
          setVal('#radio_channel', is5 ? (s.wireless.channel5 + ' / 5180MHz') : (s.wireless.channel + ' / 2437MHz'));
          setVal('#radio_chanWidth', is5 ? s.wireless.chanWidth5 : s.wireless.chanWidth);
          setVal('#radio_mode', is5 ? s.wireless.mode5 : s.wireless.mode);
          setVal('#radio_rate', is5 ? s.wireless.rate5 : s.wireless.rate);
          setVal('#radio_power', (is5 ? s.wireless.txPower5 : s.wireless.txPower) + 'dBm');

          let totRx = 0, totTx = 0;
          s.wireless.ssids.forEach(z => {
            totRx += (z.rxBytes || 0);
            totTx += (z.txBytes || 0);
          });
          setVal('#traffic_rx_bytes', totRx);
          setVal('#traffic_tx_bytes', totTx);
          setVal('#traffic_rx_packets', Math.round(totRx / 512));
          setVal('#traffic_tx_packets', Math.round(totTx / 512));
          setVal('#lan_traffic_rx_bytes', totRx + 145200);
          setVal('#lan_traffic_tx_bytes', totTx + 298400);

          const grid = $('#ssidListGrid');
          if (grid) {
            const tbody = $('.grid-content-data', grid);
            if (tbody) {
              tbody.innerHTML = s.wireless.ssids.map((z, i) => {
                const clientsOnSSID = s.clients.filter(c => c.connectedSSID === z.name && (c.status === 'connected' || c.status === 'noinet')).length;
                return `
                  <tr class="grid-content-tr grid-content-tr-${i+1}" data-key="${i+1}" style="display: table-row;">
                    <td class="grid-content-td grid-content-td-0 grid-content-td-row-numberer fst"><span class="grid-row-numberer content">${i+1}</span></td>
                    <td class="grid-content-td grid-content-td-1 grid-content-td-SSID"><span class="content"><b>${esc(z.name)}</b></span></td>
                    <td class="grid-content-td grid-content-td-2 grid-content-td-clients"><span class="content"><b>${clientsOnSSID}</b></span></td>
                    <td class="grid-content-td grid-content-td-3 grid-content-td-Radio"><span class="content">${esc(z.band || '2.4GHz')}</span></td>
                    <td class="grid-content-td grid-content-td-4 grid-content-td-security"><span class="content">${esc(z.sec)}</span></td>
                    <td class="grid-content-td grid-content-td-5"><span class="content">${s.wireless.portal.enabled && s.wireless.portal.ssid === z.name ? 'Enable' : 'Disable'}</span></td>
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

        ['#show_settings_2g', '#show_traffic_2g'].forEach(sel => {
          const btn = $(sel);
          if (btn) btn.onclick = () => {
            currentBand = '2.4GHz';
            btn.classList.add('selected');
            const o = $(sel.replace('2g', '5g'));
            if (o) o.classList.remove('selected');
            renderWirelessStatus();
          };
        });
        ['#show_settings_5g', '#show_traffic_5g'].forEach(sel => {
          const btn = $(sel);
          if (btn) btn.onclick = () => {
            currentBand = '5GHz';
            btn.classList.add('selected');
            const o = $(sel.replace('5g', '2g'));
            if (o) o.classList.remove('selected');
            renderWirelessStatus();
          };
        });

        renderWirelessStatus();
      }

      // -------------------------------------------------------------------
      // 5. PAGE 2: STATUS -> CLIENT (User List, Guest List & Blocked List)
      // -------------------------------------------------------------------
      function initPageClientStatus() {
        if (pageIdx !== 2) return;

        function renderAllClientGrids() {
          const s = EAP.getState();
          const allConn = s.clients.filter(c => c.status === 'connected' || c.status === 'noinet');

          const regularClients = allConn.filter(c => {
            const z = s.wireless.ssids.find(x => x.name === c.connectedSSID);
            return !z || !z.guest;
          });
          const guestClients = allConn.filter(c => {
            const z = s.wireless.ssids.find(x => x.name === c.connectedSSID);
            return z && z.guest;
          });

          function fillClientTable(gridId, list) {
            const grid = $(gridId);
            if (!grid) return;
            const tbody = $('.grid-content-data', grid);
            if (!tbody) return;
            if (list.length === 0) {
              tbody.innerHTML = `<tr class="grid-content-tr empty" style="display: table-row;"><td colspan="12" style="text-align:center;padding:10px;color:#999;">No Wireless Clients Connected</td></tr>`;
              return;
            }
            tbody.innerHTML = list.map((c, i) => {
              const rssi = EAP.calcRSSI(c.distance, c.connectedBand);
              const rate = EAP.calcRate(rssi, c.connectedBand);
              const activeTime = EAP.formatUptime(c.connTime || 1);
              return `
                <tr class="grid-content-tr" style="display: table-row;">
                  <td class="grid-content-td grid-content-td-0 fst"><span class="content">${i+1}</span></td>
                  <td class="grid-content-td grid-content-td-1"><span class="content"><b>${esc(c.name)}</b></span></td>
                  <td class="grid-content-td grid-content-td-2"><span class="content">${c.ip || '--'}</span></td>
                  <td class="grid-content-td grid-content-td-3"><span class="content">${c.mac}</span></td>
                  <td class="grid-content-td grid-content-td-4"><span class="content">${c.connectedBand === '5GHz' ? '5G' : '2.4G'}</span></td>
                  <td class="grid-content-td grid-content-td-5"><span class="content">${esc(c.connectedSSID)}</span></td>
                  <td class="grid-content-td grid-content-td-6"><span class="content">${activeTime}</span></td>
                  <td class="grid-content-td grid-content-td-7"><span class="content">${c.txBytes || 0}</span></td>
                  <td class="grid-content-td grid-content-td-8"><span class="content">${c.rxBytes || 0}</span></td>
                  <td class="grid-content-td grid-content-td-9"><span class="content">${rssi}</span></td>
                  <td class="grid-content-td grid-content-td-10"><span class="content">${rate}</span></td>
                  <td class="grid-content-td grid-content-td-11 lst">
                    <a href="#" class="btn-disconnect" data-client="${c.id}" style="color:#d9534f;margin-right:8px;font-weight:600;text-decoration:none;">Kick</a>
                    <a href="#" class="btn-block-client" data-mac="${c.mac}" data-name="${esc(c.name)}" style="color:#e67e22;font-weight:600;text-decoration:none;">Block</a>
                  </td>
                </tr>
              `;
            }).join('');
          }

          fillClientTable('#clientUserListGrid', regularClients);
          fillClientTable('#clientGuestListGrid', guestClients);

          // Blocked Clients Table
          const blockGrid = $('#blockClientListGrid');
          if (blockGrid) {
            const bTbody = $('.grid-content-data', blockGrid);
            if (bTbody) {
              const blockedList = s.wireless.macFilter.enabled && s.wireless.macFilter.rule === 'Deny'
                ? s.wireless.macFilter.list
                : [];
              if (blockedList.length === 0) {
                bTbody.innerHTML = `<tr class="grid-content-tr empty" style="display: table-row;"><td colspan="3" style="text-align:center;padding:10px;color:#999;">No Blocked Clients</td></tr>`;
              } else {
                bTbody.innerHTML = blockedList.map((m, i) => `
                  <tr class="grid-content-tr" style="display: table-row;">
                    <td class="grid-content-td grid-content-td-0 fst"><span class="content">${i+1}</span></td>
                    <td class="grid-content-td grid-content-td-1"><span class="content">${m.mac} (${esc(m.desc || 'Blocked')})</span></td>
                    <td class="grid-content-td grid-content-td-2 lst">
                      <a href="#" class="btn-unblock-client" data-mac="${m.mac}" style="color:#4acbd6;font-weight:600;text-decoration:none;">Unblock</a>
                    </td>
                  </tr>
                `).join('');
              }
            }
          }
        }

        renderAllClientGrids();

        d.addEventListener('click', function(e) {
          const btnDisc = e.target.closest('.btn-disconnect');
          if (btnDisc) {
            e.preventDefault();
            EAP.disconnectClient(btnDisc.dataset.client);
            renderAllClientGrids();
            showTplToast('Client disconnected');
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
              s.wireless.macFilter.list.push({ id: Date.now(), mac: mac, desc: btnBlock.dataset.name || 'Blocked Client' });
            }
            EAP.persistState();
            EAP.reevaluateAllClients();
            renderAllClientGrids();
            showTplToast('MAC added to Block List');
            return;
          }
          const btnUnblock = e.target.closest('.btn-unblock-client');
          if (btnUnblock) {
            e.preventDefault();
            const mac = btnUnblock.dataset.mac;
            const s = EAP.getState();
            s.wireless.macFilter.list = s.wireless.macFilter.list.filter(m => m.mac !== mac);
            EAP.persistState();
            EAP.reevaluateAllClients();
            renderAllClientGrids();
            showTplToast('Client unblocked');
            return;
          }
          if (e.target.closest('.btn-refresh')) {
            e.preventDefault();
            renderAllClientGrids();
            showTplToast('Refreshed');
          }
        });
      }

      // -------------------------------------------------------------------
      // 6. PAGE 3: WIRELESS -> WIRELESS SETTINGS (2.4GHz & 5GHz + SSIDs)
      // -------------------------------------------------------------------
      function initPageWirelessSettings() {
        if (pageIdx !== 3) return;
        let activeBand = '2.4GHz';

        const btn2g = $('#show_2g');
        const btn5g = $('#show_5g');
        const radToggle = $('#wireless-bset-status');

        function syncRadioHeader() {
          const s = EAP.getState();
          const isOn = activeBand === '5GHz' ? s.wireless.radio5 : s.wireless.radio24;
          if (radToggle) {
            const chkLabel = radToggle.closest('label.checkbox-label');
            if (chkLabel) {
              chkLabel.dataset.handledCustom = '1';
              chkLabel.classList.toggle('checked', isOn);
              chkLabel.onclick = function(e) {
                e.preventDefault();
                if (activeBand === '5GHz') s.wireless.radio5 = !s.wireless.radio5;
                else s.wireless.radio24 = !s.wireless.radio24;
                syncRadioHeader();
                EAP.persistState();
                EAP.reevaluateAllClients();
                showTplToast(`Wireless Radio (${activeBand}) ${(activeBand === '5GHz' ? s.wireless.radio5 : s.wireless.radio24) ? 'Enabled' : 'Disabled'}`);
              };
            }
          }
          const txEl = $('#txpower_2g');
          if (txEl) txEl.value = activeBand === '5GHz' ? s.wireless.txPower5 : s.wireless.txPower;
        }

        if (btn2g && btn5g) {
          btn2g.onclick = () => {
            activeBand = '2.4GHz';
            btn2g.classList.add('selected');
            btn5g.classList.remove('selected');
            syncRadioHeader();
            renderSSIDs();
          };
          btn5g.onclick = () => {
            activeBand = '5GHz';
            btn5g.classList.add('selected');
            btn2g.classList.remove('selected');
            syncRadioHeader();
            renderSSIDs();
          };
        }

        syncRadioHeader();

        const grid = $('#wireless-ssid-grid');
        if (!grid) return;
        const tbody = $('.grid-content-data', grid);
        if (!tbody) return;

        function renderSSIDs() {
          const curState = EAP.getState();
          const list = curState.wireless.ssids.map((z, idx) => ({ z, idx })).filter(item => (item.z.band || '2.4GHz') === activeBand);
          if (list.length === 0) {
            tbody.innerHTML = `<tr class="grid-content-tr"><td colspan="7" style="text-align:center;padding:12px;color:#888;">No SSIDs configured on ${activeBand}. Click + Add to create one.</td></tr>`;
            return;
          }
          tbody.innerHTML = list.map((item, rowNum) => {
            const z = item.z;
            const i = item.idx;
            return `
              <tr class="grid-content-tr grid-content-tr-${rowNum+1}" data-key="${rowNum+1}" style="display: table-row;">
                <td class="grid-content-td grid-content-td-0 grid-content-td-row-numberer fst"><span class="grid-row-numberer content">${rowNum+1}</span></td>
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
            `;
          }).join('');
        }

        renderSSIDs();

        function openSSIDModal(editIdx) {
          const curState = EAP.getState();
          const isEdit = editIdx >= 0;
          const current = isEdit ? curState.wireless.ssids[editIdx] : {
            name: '',
            band: activeBand,
            vlan: 0,
            bcast: true,
            sec: 'None',
            pass: '',
            guest: false
          };

          const overlay = d.createElement('div');
          overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:9999;';
          overlay.innerHTML = `
            <div style="width:450px;background:#fff;border-radius:4px;box-shadow:0 10px 28px rgba(0,0,0,0.3);overflow:hidden;font-family:Arial,sans-serif;">
              <div style="background:#4acbd6;color:#fff;padding:10px 16px;font-weight:bold;display:flex;justify-content:space-between;align-items:center;">
                <span>${isEdit ? 'Edit SSID' : 'Add New SSID'} (${esc(current.band || activeBand)})</span>
                <button type="button" id="modal-close-x" style="background:none;border:none;color:#fff;font-size:18px;cursor:pointer;">&times;</button>
              </div>
              <div style="padding:18px 20px;font-size:12px;color:#333;display:flex;flex-direction:column;gap:12px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <label><b>SSID Name:</b></label>
                  <input type="text" id="m_ssid_name" value="${esc(current.name)}" style="width:220px;padding:5px 8px;border:1px solid #ccc;" placeholder="Max 32 characters">
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <label><b>Band:</b></label>
                  <select id="m_ssid_band" style="width:220px;padding:5px 8px;border:1px solid #ccc;">
                    <option value="2.4GHz" ${(current.band || activeBand) === '2.4GHz' ? 'selected' : ''}>2.4GHz</option>
                    <option value="5GHz" ${(current.band || activeBand) === '5GHz' ? 'selected' : ''}>5GHz</option>
                  </select>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <label><b>SSID Broadcast:</b></label>
                  <label style="width:220px;display:flex;align-items:center;gap:6px;cursor:pointer;">
                    <input type="checkbox" id="m_ssid_bcast" ${current.bcast ? 'checked' : ''}> Enable SSID Broadcast
                  </label>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <label><b>Security Mode:</b></label>
                  <select id="m_ssid_sec" style="width:220px;padding:5px 8px;border:1px solid #ccc;">
                    <option value="None" ${current.sec === 'None' ? 'selected' : ''}>None (Open)</option>
                    <option value="WPA-Personal" ${current.sec !== 'None' ? 'selected' : ''}>WPA-Personal / WPA2-PSK</option>
                  </select>
                </div>
                <div id="m_sec_row" style="display:${current.sec === 'None' ? 'none' : 'flex'};justify-content:space-between;align-items:center;">
                  <label><b>Wireless Password:</b></label>
                  <input type="text" id="m_ssid_pass" value="${esc(current.pass)}" style="width:220px;padding:5px 8px;border:1px solid #ccc;" placeholder="8 to 63 ASCII chars">
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <label><b>VLAN ID (0 = Untagged):</b></label>
                  <input type="number" id="m_ssid_vlan" min="0" max="4094" value="${current.vlan || 0}" style="width:220px;padding:5px 8px;border:1px solid #ccc;">
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <label><b>Guest Network (L2 Isolation):</b></label>
                  <label style="width:220px;display:flex;align-items:center;gap:6px;cursor:pointer;">
                    <input type="checkbox" id="m_ssid_guest" ${current.guest ? 'checked' : ''}> Enable Guest Isolation
                  </label>
                </div>
                <div id="m_error_msg" style="color:#d9534f;font-size:12px;min-height:16px;"></div>
              </div>
              <div style="background:#f5f7fa;padding:10px 16px;text-align:right;border-top:1px solid #e5e5e5;">
                <button type="button" id="m_btn_cancel" style="padding:5px 14px;margin-right:8px;cursor:pointer;">Cancel</button>
                <button type="button" id="m_btn_ok" style="padding:5px 18px;background:#4acbd6;color:#fff;border:none;border-radius:3px;font-weight:bold;cursor:pointer;">OK</button>
              </div>
            </div>
          `;
          d.body.appendChild(overlay);

          const secSelect = $('#m_ssid_sec', overlay);
          const secRow = $('#m_sec_row', overlay);
          secSelect.onchange = () => { secRow.style.display = secSelect.value === 'None' ? 'none' : 'flex'; };

          $('#modal-close-x', overlay).onclick = () => overlay.remove();
          $('#m_btn_cancel', overlay).onclick = () => overlay.remove();

          $('#m_btn_ok', overlay).onclick = function() {
            const nameVal = $('#m_ssid_name', overlay).value.trim();
            const bandVal = $('#m_ssid_band', overlay).value;
            const bcastVal = $('#m_ssid_bcast', overlay).checked;
            const secVal = secSelect.value;
            const passVal = $('#m_ssid_pass', overlay).value;
            const vlanVal = parseInt($('#m_ssid_vlan', overlay).value, 10) || 0;
            const guestVal = $('#m_ssid_guest', overlay).checked;
            const errEl = $('#m_error_msg', overlay);

            if (!nameVal) { errEl.textContent = 'SSID Name cannot be empty.'; return; }
            if (secVal !== 'None' && (passVal.length < 8 || passVal.length > 63)) {
              errEl.textContent = 'Password must be between 8 and 63 characters.';
              return;
            }

            const newEntry = {
              id: isEdit ? current.id : Date.now(),
              name: nameVal,
              band: bandVal,
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
              EAP.addSysLog('WIRELESS', 'INFO', `SSID "${nameVal}" (${bandVal}) updated`);
            } else {
              curState.wireless.ssids.push(newEntry);
              EAP.addSysLog('WIRELESS', 'INFO', `New SSID "${nameVal}" (${bandVal}) added`);
            }

            EAP.persistState();
            EAP.reevaluateAllClients();
            overlay.remove();
            renderSSIDs();
            showTplToast('SSID configuration saved');
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
          const idx = parseInt(btn.dataset.idx, 10);

          if (act === 'edit') {
            openSSIDModal(idx);
          } else if (act === 'del') {
            const curState = EAP.getState();
            if (curState.wireless.ssids.length <= 1) {
              showTplToast('At least 1 SSID must remain active', true);
              return;
            }
            if (confirm(`Delete SSID "${curState.wireless.ssids[idx].name}"?`)) {
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
      // 7. PAGE 4: WIRELESS -> PORTAL (Captive Portal Configuration)
      // -------------------------------------------------------------------
      function initPagePortal() {
        if (pageIdx !== 4) return;
        const s = EAP.getState();
        const p = s.wireless.portal;

        const portalChk = $('label.checkbox-label', $('#portal_basic'));
        if (portalChk) {
          portalChk.dataset.handledCustom = '1';
          portalChk.classList.toggle('checked', p.enabled);
          portalChk.onclick = function(e) {
            e.preventDefault();
            p.enabled = !portalChk.classList.contains('checked');
            portalChk.classList.toggle('checked', p.enabled);
          };
        }

        const uInp = $('#username');
        if (uInp) uInp.value = p.username || 'guest';
        const pInp = $('#password');
        if (pInp) pInp.value = p.password || '123456';
        const tInp = $('#portal_title');
        if (tInp) tInp.value = p.title || 'Bienvenido al Portal Wi-Fi TP-Link';
        const rInp = $('#redirUrl');
        if (rInp) rInp.value = p.redirectUrl || 'http://google.com';

        $$('button.button-button').forEach(btn => {
          if (btn.textContent.trim().toLowerCase() === 'save') {
            btn.dataset.handledCustom = '1';
            btn.onclick = function(e) {
              e.preventDefault();
              if (uInp) p.username = uInp.value.trim();
              if (pInp) p.password = pInp.value;
              if (tInp) p.title = tInp.value.trim();
              if (rInp) p.redirectUrl = rInp.value.trim();
              // Reset client portal auth when portal changes
              s.clients.forEach(c => { c.portalAuthenticated = !p.enabled; });
              EAP.addSysLog('PORTAL', 'INFO', `Captive Portal ${p.enabled ? 'enabled' : 'disabled'} (User: ${p.username})`);
              EAP.persistState();
              EAP.triggerSync();
              showTplToast('Captive Portal settings saved');
            };
          }
        });
      }

      // -------------------------------------------------------------------
      // 8. PAGE 5: WIRELESS -> VLAN (Interactive SSID VLAN Table)
      // -------------------------------------------------------------------
      function initPageVlan() {
        if (pageIdx !== 5) return;
        const grid = $('#vlanGrid');
        if (!grid) return;
        const tbody = $('.grid-content-data', grid);
        if (!tbody) return;

        function renderVlanRows() {
          const s = EAP.getState();
          tbody.innerHTML = s.wireless.ssids.map((z, i) => `
            <tr class="grid-content-tr grid-content-tr-key-${i}" data-key="key-${i}" style="display: table-row;">
              <td class="grid-content-td grid-content-td-0 fst"><span class="content">${i+1}</span></td>
              <td class="grid-content-td grid-content-td-1"><span class="content"><b>${esc(z.name)}</b></span></td>
              <td class="grid-content-td grid-content-td-2"><span class="content">${esc(z.band || '2.4GHz')}</span></td>
              <td class="grid-content-td grid-content-td-3">
                <span class="content">${z.vlan > 0 ? '<b style="color:#4acbd6;">Enable</b>' : 'Disable'}</span>
              </td>
              <td class="grid-content-td grid-content-td-4 lst">
                <input type="number" class="vlan-id-input text-text s" data-idx="${i}" min="0" max="4094" value="${z.vlan || 0}" style="width:80px;padding:3px 6px;border:1px solid #ccc;">
                <span style="font-size:11px;color:#888;margin-left:6px;">(0 = Disable, 1-4094 = 802.1Q Tag)</span>
              </td>
            </tr>
          `).join('');
        }

        renderVlanRows();

        const saveBtn = $('#total_save');
        if (saveBtn) {
          saveBtn.dataset.handledCustom = '1';
          saveBtn.onclick = function(e) {
            e.preventDefault();
            const s = EAP.getState();
            $$('.vlan-id-input', tbody).forEach(inp => {
              const idx = parseInt(inp.dataset.idx, 10);
              const val = Math.max(0, Math.min(4094, parseInt(inp.value, 10) || 0));
              if (s.wireless.ssids[idx]) s.wireless.ssids[idx].vlan = val;
            });
            EAP.addSysLog('VLAN', 'INFO', '802.1Q VLAN configuration updated for SSIDs');
            EAP.persistState();
            EAP.reevaluateAllClients();
            renderVlanRows();
            showTplToast('VLAN settings saved');
          };
        }
      }

      // -------------------------------------------------------------------
      // 9. PAGE 6: WIRELESS -> MAC FILTERING
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
              showTplToast(s.wireless.macFilter.enabled ? 'MAC Filtering Enabled' : 'MAC Filtering Disabled');
            };
          }
        }

        const tbody = $('.grid-content-data', grid);
        if (!tbody) return;

        function renderMacList() {
          const curState = EAP.getState();
          const list = curState.wireless.macFilter.list;
          if (list.length === 0) {
            tbody.innerHTML = `<tr class="grid-content-tr" style="display: table-row;"><td colspan="3" style="text-align:center;padding:12px;color:#888;">(MAC Address List is empty)</td></tr>`;
            return;
          }
          tbody.innerHTML = list.map((m, i) => `
            <tr class="grid-content-tr" style="display: table-row;">
              <td class="grid-content-td grid-content-td-0 fst"><span class="content">${i+1}</span></td>
              <td class="grid-content-td grid-content-td-1"><span class="content"><b>${m.mac}</b> (${esc(m.desc || 'Device')})</span></td>
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
            const mac = prompt('Enter MAC Address (format AA:BB:CC:DD:EE:FF):', 'AA:BB:CC:11:22:33');
            if (!mac) return;
            const cleanMac = mac.trim().toUpperCase().replace(/-/g, ':');
            if (!/^([0-9A-F]{2}:){5}[0-9A-F]{2}$/.test(cleanMac)) {
              showTplToast('Invalid MAC address format', true);
              return;
            }
            const desc = prompt('Description (optional):', 'Lab Device') || 'Device';
            const curState = EAP.getState();
            curState.wireless.macFilter.list.push({ id: Date.now(), mac: cleanMac, desc: desc });
            EAP.addSysLog('SECURITY', 'INFO', `MAC ${cleanMac} added to MAC Filter`);
            EAP.persistState();
            EAP.reevaluateAllClients();
            renderMacList();
            showTplToast('MAC address added');
          };
        }

        grid.addEventListener('click', function(e) {
          const btn = e.target.closest('.btn-del-mac');
          if (!btn) return;
          e.preventDefault();
          const idx = parseInt(btn.dataset.idx, 10);
          const curState = EAP.getState();
          curState.wireless.macFilter.list.splice(idx, 1);
          EAP.persistState();
          EAP.reevaluateAllClients();
          renderMacList();
          showTplToast('MAC removed');
        });
      }

      // -------------------------------------------------------------------
      // 10. PAGE 9: WIRELESS -> ROGUE AP DETECTION (Interactive Scan)
      // -------------------------------------------------------------------
      function initPageRogueAp() {
        if (pageIdx !== 9) return;
        const s = EAP.getState();
        const raChk = $('#ra_status');
        if (raChk) {
          const lbl = raChk.closest('label.checkbox-label');
          if (lbl) {
            lbl.dataset.handledCustom = '1';
            lbl.classList.toggle('checked', s.wireless.rogueAp.enabled);
            lbl.onclick = function(e) {
              e.preventDefault();
              s.wireless.rogueAp.enabled = !lbl.classList.contains('checked');
              lbl.classList.toggle('checked', s.wireless.rogueAp.enabled);
              EAP.persistState();
              showTplToast(`Rogue AP Detection ${s.wireless.rogueAp.enabled ? 'Enabled' : 'Disabled'}`);
            };
          }
        }

        const raGrid = $('#raListGrid');
        const taGrid = $('#taListGrid');

        function renderRogueTables() {
          const cur = EAP.getState().wireless.rogueAp;
          if (raGrid) {
            const tbody = $('.grid-content-data', raGrid);
            if (tbody) {
              if (!cur.detected || cur.detected.length === 0) {
                tbody.innerHTML = `<tr class="grid-content-tr"><td colspan="8" style="text-align:center;padding:12px;color:#888;">Click "Scan" to search for nearby Rogue APs</td></tr>`;
              } else {
                tbody.innerHTML = cur.detected.map((ap, i) => `
                  <tr class="grid-content-tr" style="display: table-row;">
                    <td class="grid-content-td grid-content-td-0 fst"><span class="content">${ap.mac}</span></td>
                    <td class="grid-content-td grid-content-td-1"><span class="content"><b>${esc(ap.ssid)}</b></span></td>
                    <td class="grid-content-td grid-content-td-2"><span class="content">${ap.band}</span></td>
                    <td class="grid-content-td grid-content-td-3"><span class="content">${ap.ch}</span></td>
                    <td class="grid-content-td grid-content-td-4"><span class="content">${ap.sec}</span></td>
                    <td class="grid-content-td grid-content-td-5"><span class="content">100ms</span></td>
                    <td class="grid-content-td grid-content-td-6"><span class="content">${ap.rssi} dBm</span></td>
                    <td class="grid-content-td grid-content-td-7 lst">
                      <a href="#" class="btn-trust-ap" data-idx="${i}" style="color:#4acbd6;font-weight:bold;text-decoration:none;">Mark as Known</a>
                    </td>
                  </tr>
                `).join('');
              }
            }
          }
          if (taGrid) {
            const tbody = $('.grid-content-data', taGrid);
            if (tbody && cur.trusted && cur.trusted.length > 0) {
              tbody.innerHTML = cur.trusted.map((ap, i) => `
                <tr class="grid-content-tr" style="display: table-row;">
                  <td class="grid-content-td grid-content-td-0 fst"><span class="content">${ap.mac}</span></td>
                  <td class="grid-content-td grid-content-td-1"><span class="content">${esc(ap.ssid)}</span></td>
                  <td class="grid-content-td grid-content-td-2"><span class="content">${ap.band}</span></td>
                  <td class="grid-content-td grid-content-td-3"><span class="content">${ap.ch}</span></td>
                  <td class="grid-content-td grid-content-td-4"><span class="content">${ap.sec}</span></td>
                  <td class="grid-content-td grid-content-td-5"><span class="content">100ms</span></td>
                  <td class="grid-content-td grid-content-td-6 lst"><span class="content">${ap.rssi} dBm</span></td>
                </tr>
              `).join('');
            }
          }
        }

        renderRogueTables();

        $$('#scan_btn, button.operation-user-defined').forEach(btn => {
          btn.dataset.handledCustom = '1';
          btn.onclick = function(e) {
            e.preventDefault();
            showTplToast('Scanning radio channels for Rogue APs...');
            setTimeout(() => {
              s.wireless.rogueAp.enabled = true;
              s.wireless.rogueAp.detected = [
                { mac: 'E4:F4:C6:11:9A:20', ssid: 'MOVISTAR_Fibra_4F2A', band: '2.4GHz', ch: 1, sec: 'WPA2-PSK', rssi: -62 },
                { mac: '70:4F:57:88:3C:10', ssid: 'Vodafone_Vecinos_5G', band: '5GHz', ch: 44, sec: 'WPA2-PSK', rssi: -71 },
                { mac: 'DE:AD:BE:EF:00:01', ssid: 'TP-Link_Free_EvilTwin', band: '2.4GHz', ch: 6, sec: 'None', rssi: -48 }
              ];
              EAP.addSysLog('SECURITY', 'WARNING', 'Rogue AP scan completed: 3 external APs detected');
              EAP.persistState();
              renderRogueTables();
              showTplToast('Scan complete: 3 Rogue APs found');
            }, 600);
          };
        });

        d.addEventListener('click', function(e) {
          const trustBtn = e.target.closest('.btn-trust-ap');
          if (trustBtn) {
            e.preventDefault();
            const idx = parseInt(trustBtn.dataset.idx, 10);
            const ap = s.wireless.rogueAp.detected.splice(idx, 1)[0];
            if (ap) {
              s.wireless.rogueAp.trusted = s.wireless.rogueAp.trusted || [];
              s.wireless.rogueAp.trusted.push(ap);
              EAP.persistState();
              renderRogueTables();
              showTplToast(`AP "${ap.ssid}" moved to Trusted AP List`);
            }
          }
        });
      }

      // -------------------------------------------------------------------
      // 11. PAGE 10: MANAGEMENT -> NETWORK (Dynamic DHCP / Fallback / Static IP)
      // -------------------------------------------------------------------
      function initPageNetwork() {
        if (pageIdx !== 10) return;
        const s = EAP.getState();

        const radDyn = $('#radio-493911891');
        const radStat = $('#radio-1217465740');
        const boxDyn = $('#ipsetting_dynamic');
        const boxStat = $('#ipsetting_static');

        const fbIp = $('#fallbackIp');
        const fbMask = $('#fallbackMask');
        const fbGw = $('#fallbackGateway');
        const stIp = $('#ipAddress');
        const stMask = $('#netMask');
        const stGw = $('#gateWay');
        const stDns1 = $('#dnsServerA');
        const stDns2 = $('#dnsServerB');

        if (fbIp) fbIp.value = s.device.fallbackIp || '192.168.0.254';
        if (fbMask) fbMask.value = s.device.fallbackMask || '255.255.255.0';
        if (fbGw) fbGw.value = s.device.fallbackGw || '192.168.0.1';
        if (stIp) stIp.value = s.device.ip || '192.168.0.254';
        if (stMask) stMask.value = s.device.mask || '255.255.255.0';
        if (stGw) stGw.value = s.device.gateway || '192.168.0.1';
        if (stDns1) stDns1.value = s.device.dns || '8.8.8.8';
        if (stDns2) stDns2.value = s.device.dns2 || '8.8.4.4';

        function setConnTypeUI(mode) {
          s.device.connType = mode;
          const isStatic = mode === 'static';
          if (radDyn) {
            const l = radDyn.closest('label.radio-label');
            if (l) l.classList.toggle('checked', !isStatic);
            radDyn.checked = !isStatic;
          }
          if (radStat) {
            const l = radStat.closest('label.radio-label');
            if (l) l.classList.toggle('checked', isStatic);
            radStat.checked = isStatic;
          }
          if (boxDyn) boxDyn.style.display = isStatic ? 'none' : 'block';
          if (boxStat) {
            boxStat.style.display = isStatic ? 'block' : 'none';
            $$('.text-container', boxStat).forEach(tc => tc.classList.remove('disabled'));
            $$('input', boxStat).forEach(inp => inp.removeAttribute('disabled'));
          }
        }

        setConnTypeUI(s.device.connType || 'dynamic');

        [radDyn, radStat].forEach(r => {
          if (!r) return;
          const lbl = r.closest('label.radio-label');
          if (lbl) {
            lbl.dataset.handledCustom = '1';
            lbl.onclick = function(e) {
              e.preventDefault();
              setConnTypeUI(r === radStat ? 'static' : 'dynamic');
            };
          }
        });

        const subBtn = $('#submit_ipsetting');
        if (subBtn) {
          subBtn.dataset.handledCustom = '1';
          subBtn.onclick = function(e) {
            e.preventDefault();
            if (s.device.connType === 'static') {
              if (stIp && stIp.value.trim()) s.device.ip = stIp.value.trim();
              if (stMask && stMask.value.trim()) s.device.mask = stMask.value.trim();
              if (stGw && stGw.value.trim()) s.device.gateway = stGw.value.trim();
              if (stDns1 && stDns1.value.trim()) s.device.dns = stDns1.value.trim();
              EAP.addSysLog('NETWORK', 'INFO', `Static IP configured on EAP: ${s.device.ip}/${s.device.mask}`);
            } else {
              if (fbIp && fbIp.value.trim()) s.device.fallbackIp = fbIp.value.trim();
              if (fbMask && fbMask.value.trim()) s.device.fallbackMask = fbMask.value.trim();
              if (fbGw && fbGw.value.trim()) s.device.fallbackGw = fbGw.value.trim();
              s.device.ip = s.device.fallbackIp;
              s.device.mask = s.device.fallbackMask;
              EAP.addSysLog('NETWORK', 'INFO', `Dynamic IP mode enabled (Fallback IP: ${s.device.fallbackIp})`);
            }
            EAP.persistState();
            EAP.triggerSync();
            showTplToast('IP Settings applied successfully');
          };
        }
      }

      // -------------------------------------------------------------------
      // 12. PAGE 11: MANAGEMENT -> SYSTEM LOG
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
      // 13. PAGE 14 (LED Control) & PAGE 15 (SSH)
      // -------------------------------------------------------------------
      function initPageLedAndSsh() {
        const s = EAP.getState();
        if (pageIdx === 14) {
          const ledChk = $('#led_status');
          if (ledChk) {
            const lbl = ledChk.closest('label.checkbox-label');
            if (lbl) {
              lbl.dataset.handledCustom = '1';
              lbl.classList.toggle('checked', s.device.led);
              lbl.onclick = function(e) {
                e.preventDefault();
                s.device.led = !lbl.classList.contains('checked');
                lbl.classList.toggle('checked', s.device.led);
                EAP.persistState();
                EAP.triggerSync();
                showTplToast(`AP Hardware LED ${s.device.led ? 'ON' : 'OFF'}`);
              };
            }
          }
          const locBtn = $('#led_locate_button');
          if (locBtn) {
            locBtn.dataset.handledCustom = '1';
            locBtn.onclick = function(e) {
              e.preventDefault();
              s.device.locating = !s.device.locating;
              EAP.triggerSync();
              showTplToast(s.device.locating ? 'AP Locate Flashing Started' : 'AP Locate Stopped');
            };
          }
        }

        if (pageIdx === 15) {
          const sshChk = $('#sshServerEnable');
          const portInp = $('#serverPort');
          if (portInp) portInp.value = s.device.sshPort || 22;
          if (sshChk) {
            const lbl = sshChk.closest('label.checkbox-label');
            if (lbl) {
              lbl.dataset.handledCustom = '1';
              lbl.classList.toggle('checked', s.device.sshEnabled);
              lbl.onclick = function(e) {
                e.preventDefault();
                s.device.sshEnabled = !lbl.classList.contains('checked');
                lbl.classList.toggle('checked', s.device.sshEnabled);
              };
            }
          }
          const subBtn = $('#submitButton');
          if (subBtn) {
            subBtn.dataset.handledCustom = '1';
            subBtn.onclick = function(e) {
              e.preventDefault();
              if (portInp) s.device.sshPort = parseInt(portInp.value, 10) || 22;
              EAP.addSysLog('SSH', 'INFO', `SSH Server ${s.device.sshEnabled ? 'enabled on port ' + s.device.sshPort : 'disabled'}`);
              EAP.persistState();
              showTplToast('SSH settings saved');
            };
          }
        }
      }

      // -------------------------------------------------------------------
      // 14. PAGE 17: SYSTEM -> USER ACCOUNT (Real Password Change!)
      // -------------------------------------------------------------------
      function initPageUserAccount() {
        if (pageIdx !== 17) return;
        const saveBtn = $('#save');
        if (!saveBtn) return;

        saveBtn.dataset.handledCustom = '1';
        saveBtn.onclick = function(e) {
          e.preventDefault();
          const curU = ($('#curUserName') || {}).value.trim();
          const oldP = ($('#oldPwd') || {}).value;
          const newU = ($('#newUserName') || {}).value.trim();
          const newP = ($('#newPwd') || {}).value;
          const cfmP = ($('#confirmPwd') || {}).value;

          const s = EAP.getState();
          if (!curU || !s.users[curU] || s.users[curU] !== oldP) {
            showTplToast('Old User Name or Old Password is incorrect!', true);
            return;
          }
          if (!newU || !newP) {
            showTplToast('New User Name and New Password cannot be empty!', true);
            return;
          }
          if (newP !== cfmP) {
            showTplToast('Confirm Password does not match New Password!', true);
            return;
          }

          delete s.users[curU];
          s.users[newU] = newP;
          s.session = newU;
          EAP.addSysLog('SYSTEM', 'WARNING', `Administrator credentials updated (New user: "${newU}")`);
          EAP.persistState();
          showTplToast('User Account updated! Use the new credentials on next login.');
        };
      }

      // -------------------------------------------------------------------
      // 15. PAGE 19 (Time), 20 (Reboot/Reset), 21 (Backup/Restore), 22 (Firmware)
      // -------------------------------------------------------------------
      function initPageSystemTools() {
        if (pageIdx === 19) {
          const syncBtn = $('#synPcClock');
          if (syncBtn) {
            syncBtn.dataset.handledCustom = '1';
            syncBtn.onclick = function(e) {
              e.preventDefault();
              const now = new Date();
              const pad = n => String(n).padStart(2, '0');
              const dEl = $('#time_set_date');
              const tEl = $('#time_set_time');
              if (dEl) dEl.value = `${pad(now.getMonth()+1)}/${pad(now.getDate())}/${now.getFullYear()}`;
              if (tEl) tEl.value = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
              showTplToast('Synchronized with PC Clock');
            };
          }
        }

        if (pageIdx === 20) {
          const rebootBtn = $('button#reboot');
          if (rebootBtn) {
            rebootBtn.dataset.handledCustom = '1';
            rebootBtn.onclick = function(e) {
              e.preventDefault();
              topWin.triggerRebootSequence(false);
            };
          }
          const resetBtn = $('button#reset');
          if (resetBtn) {
            resetBtn.dataset.handledCustom = '1';
            resetBtn.onclick = function(e) {
              e.preventDefault();
              if (confirm('Are you sure you want to restore the EAP to factory defaults?')) {
                EAP.resetState();
                topWin.triggerRebootSequence(true);
              }
            };
          }
        }

        if (pageIdx === 21) {
          const backupBtn = $('button#backup');
          if (backupBtn) {
            backupBtn.dataset.handledCustom = '1';
            backupBtn.onclick = function(e) {
              e.preventDefault();
              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(EAP.getState(), null, 2));
              const dl = d.createElement('a');
              dl.setAttribute('href', dataStr);
              dl.setAttribute('download', `EAP115_Config_Backup.json`);
              d.body.appendChild(dl);
              dl.click();
              dl.remove();
              showTplToast('Configuration backup downloaded');
            };
          }
          const restoreBtn = $('button#restore');
          if (restoreBtn) {
            restoreBtn.dataset.handledCustom = '1';
            restoreBtn.onclick = function(e) {
              e.preventDefault();
              if (topWin.triggerImportLabJson) topWin.triggerImportLabJson();
            };
          }
        }

        if (pageIdx === 22) {
          const upgBtn = $('button#upgrade');
          if (upgBtn) {
            upgBtn.dataset.handledCustom = '1';
            upgBtn.onclick = function(e) {
              e.preventDefault();
              const s = EAP.getState();
              s.device.firmware = '5.1.0 Build 20250215 Rel. 61024(4555)';
              EAP.addSysLog('SYSTEM', 'INFO', 'Firmware upgraded to ' + s.device.firmware);
              EAP.persistState();
              topWin.triggerRebootSequence(false);
            };
          }
        }
      }

      // Run all initializations
      initUniversalFormControls();
      initNavigation();
      initPageDevice();
      initPageWirelessStatus();
      initPageClientStatus();
      initPageWirelessSettings();
      initPagePortal();
      initPageVlan();
      initPageMacFiltering();
      initPageRogueAp();
      initPageNetwork();
      initPageSystemLog();
      initPageLedAndSsh();
      initPageUserAccount();
      initPageSystemTools();
      restoreCurrentPageForm();

    }.toString() + ')()';
  }

  // =========================================================================
  // Public Simulator API
  // =========================================================================
  window.EAPEngine = {
    ISP_POS: ISP_POS,
    ROUTER_POS: ROUTER_POS,
    AP_POS: { x: AP_CANVAS_X, y: AP_CANVAS_Y },
    getState: () => state,
    setState: (newState) => { state = Object.assign(state, newState); persistState(); triggerSync(); },
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
    simulatePDU: simulatePDU,
    executeCliCommand: executeCliCommand,
    getRouterPrompt: getRouterPrompt,
    executeRouterCli: executeRouterCli,
    onSync: onSync,
    triggerSync: triggerSync,
    getIframeEngineScript: getIframeEngineScript
  };

})(window);
