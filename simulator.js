/**
 * TP-Link EAP Virtual Wireless Lab & Simulator - Core Engine
 * Complete standalone simulation, state manager, and iframe bridge.
 * Fully compatible with GitHub Pages and offline browser execution.
 */

(function(window) {
  'use strict';

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
      uptimeSec: 1540,
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
    clients: [
      {
        id: 'phone',
        name: 'Pixel 8 Pro',
        type: 'phone',
        mac: 'A4:5E:60:1B:7C:D2',
        distance: 3,
        connectedSSID: null,
        ip: null,
        gateway: null,
        dns: null,
        connTime: 0,
        txBytes: 0,
        rxBytes: 0,
        status: 'disconnected', // 'connected', 'noinet', 'noip', 'disconnected', 'blocked', 'fail'
        lastError: null
      },
      {
        id: 'laptop',
        name: 'ThinkPad X1',
        type: 'laptop',
        mac: '00:E0:4C:81:92:44',
        distance: 6,
        connectedSSID: null,
        ip: null,
        gateway: null,
        dns: null,
        connTime: 0,
        txBytes: 0,
        rxBytes: 0,
        status: 'disconnected',
        lastError: null
      },
      {
        id: 'camera',
        name: 'SmartCam 1080p',
        type: 'iot',
        mac: 'F8:1A:67:B2:3C:80',
        distance: 9,
        connectedSSID: null,
        ip: null,
        gateway: null,
        dns: null,
        connTime: 0,
        txBytes: 0,
        rxBytes: 0,
        status: 'disconnected',
        lastError: null
      },
      {
        id: 'rogue',
        name: 'Unknown Scanner',
        type: 'rogue',
        mac: 'DC:A6:32:9F:11:22',
        distance: 14,
        connectedSSID: null,
        ip: null,
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
  // Simulator State Store (localStorage with memory fallback)
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

  function storageRemove(k) {
    try {
      localStorage.removeItem(k);
    } catch(e) {
      delete memStorage[k];
    }
  }

  const STORAGE_KEY = 'eap_lab_state_v2';
  let state = loadInitialState();

  function loadInitialState() {
    try {
      const saved = storageGet(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Deep merge with default state to ensure backward compatibility
        return Object.assign({}, DEFAULT_STATE, parsed, {
          device: Object.assign({}, DEFAULT_STATE.device, parsed.device),
          wireless: Object.assign({}, DEFAULT_STATE.wireless, parsed.wireless),
          router: Object.assign({}, DEFAULT_STATE.router, parsed.router),
          clients: (parsed.clients && parsed.clients.length) ? parsed.clients : DEFAULT_STATE.clients,
          logs: (parsed.logs && parsed.logs.length) ? parsed.logs : DEFAULT_STATE.logs
        });
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
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
  // RF & Path Loss Calculations
  // =========================================================================
  function calcRSSI(distanceMeters) {
    const d = Math.max(1, Number(distanceMeters) || 1);
    // Free Space Path Loss (FSPL) approximation at 2.4 GHz
    // RSSI = -36 - 20*log10(d) with minor environment factor
    const rssi = Math.round(-35 - (22 * Math.log10(d)));
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

  // =========================================================================
  // System Log Generator
  // =========================================================================
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
  // Simulation Network Engine: Connection Handshake
  // =========================================================================
  function attemptConnect(clientId, ssidName, password) {
    const client = state.clients.find(c => c.id === clientId);
    if (!client) return { status: 'fail', error: 'Cliente no encontrado' };

    const rssi = calcRSSI(client.distance);

    // 1. Check EAP Radio
    if (!state.wireless.radio24) {
      addSysLog('WIRELESS', 'WARNING', `Client ${client.name} (${client.mac}) connection failed: 2.4GHz radio is disabled`);
      client.status = 'fail';
      client.lastError = 'Radio 2.4GHz apagada en la EAP';
      client.connectedSSID = null;
      persistState();
      triggerSync();
      return { status: 'fail', error: client.lastError };
    }

    // 2. Check Signal Strength (Distance)
    if (rssi < -85) {
      addSysLog('WIRELESS', 'WARNING', `Client ${client.name} (${client.mac}) connection failed: Signal too weak (${rssi} dBm)`);
      client.status = 'fail';
      client.lastError = `Señal insuficiente (${rssi} dBm, >${client.distance}m)`;
      client.connectedSSID = null;
      persistState();
      triggerSync();
      return { status: 'fail', error: client.lastError };
    }

    // 3. Find SSID
    const ssid = state.wireless.ssids.find(s => s.name === ssidName);
    if (!ssid) {
      addSysLog('AUTH', 'WARNING', `Client ${client.name} requested unknown SSID "${ssidName}"`);
      client.status = 'fail';
      client.lastError = `Red "${ssidName}" no encontrada`;
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
        addSysLog('SECURITY', 'WARNING', `Client ${client.name} (${client.mac}) BLOCKED by MAC Filtering (${mf.rule} policy)`);
        client.status = 'blocked';
        client.lastError = `Rechazado por Filtrado MAC (Regla: ${mf.rule})`;
        client.connectedSSID = null;
        persistState();
        triggerSync();
        return { status: 'blocked', error: client.lastError };
      }
    }

    // 5. Security & Password Check
    if (ssid.sec !== 'None') {
      if (!password || password !== ssid.pass) {
        addSysLog('AUTH', 'WARNING', `Client ${client.name} (${client.mac}) failed WPA2 authentication on "${ssidName}": Wrong password`);
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
        addSysLog('VLAN', 'WARNING', `Client ${client.name} assigned to VLAN ${ssid.vlan}, but VLAN is not tagged on router trunk!`);
        client.status = 'noip';
        client.lastError = `VLAN ${ssid.vlan} aislada: sin ruta ni DHCP en el router`;
        client.connectedSSID = ssidName;
        client.ip = '169.254.' + Math.floor(Math.random() * 250 + 1) + '.' + Math.floor(Math.random() * 250 + 1);
        persistState();
        triggerSync();
        return { status: 'noip', error: client.lastError };
      }
    }

    // 7. DHCP Lease Check
    if (!state.router.dhcpEnabled) {
      addSysLog('DHCP', 'WARNING', `Client ${client.name} (${client.mac}) associated with "${ssidName}" but Router DHCP is disabled: No IP address`);
      client.status = 'noip';
      client.lastError = 'Router sin DHCP: Sin dirección IP válida (APIPA)';
      client.connectedSSID = ssidName;
      client.ip = '169.254.120.45';
      persistState();
      triggerSync();
      return { status: 'noip', error: client.lastError };
    }

    // 8. Assign IP from DHCP Pool
    const clientIdx = state.clients.indexOf(client);
    client.ip = `192.168.0.${105 + clientIdx}`;
    client.gateway = state.router.ip;
    client.dns = state.router.ip;
    client.connectedSSID = ssidName;
    client.connTime = 0;
    client.txBytes = 145000 + Math.floor(Math.random() * 50000);
    client.rxBytes = 890000 + Math.floor(Math.random() * 150000);

    // 9. Internet WAN Check
    if (!state.router.wanOnline) {
      addSysLog('AUTH', 'INFO', `Client ${client.name} (${client.mac}) associated, DHCP lease: ${client.ip}. WAN is DOWN.`);
      client.status = 'noinet';
      client.lastError = 'Conectado a la LAN, pero la WAN (Internet) está caída';
    } else {
      addSysLog('AUTH', 'INFO', `Client ${client.name} (${client.mac}) associated to "${ssidName}" with IP ${client.ip} [OK - Online]`);
      client.status = 'connected';
      client.lastError = null;
    }

    // Increment SSID client counters & traffic
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
      addSysLog('AUTH', 'INFO', `Client ${client.name} (${client.mac}) disassociated from "${client.connectedSSID}"`);
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
  // Diagnostic Tools: Ping & Speed Test
  // =========================================================================
  function runPing(clientId, target) {
    const client = state.clients.find(c => c.id === clientId);
    if (!client || client.status === 'disconnected') {
      return { ok: false, error: 'Dispositivo desconectado de la red' };
    }

    // Ping Gateway / EAP
    if (target === state.router.ip || target === state.device.ip) {
      if (client.status === 'noip') {
        return { ok: false, error: 'Sin IP asignada (Tiempo de espera agotado)' };
      }
      const lat = Math.round(1 + Math.random() * 3 + (client.distance * 0.2));
      return {
        ok: true,
        target: target,
        time: lat,
        ttl: 64,
        msg: `Respuesta desde ${target}: bytes=32 tiempo=${lat}ms TTL=64`
      };
    }

    // Ping Internet (e.g. 8.8.8.8)
    if (target === '8.8.8.8' || target === 'google.com') {
      if (client.status === 'noip') return { ok: false, error: 'Tiempo de espera agotado (Sin IP)' };
      if (!state.router.wanOnline) return { ok: false, error: 'Host de destino inaccesible (Enlace WAN caído)' };
      const lat = Math.round(14 + Math.random() * 8 + (client.distance * 0.3));
      return {
        ok: true,
        target: target,
        time: lat,
        ttl: 118,
        msg: `Respuesta desde ${target}: bytes=32 tiempo=${lat}ms TTL=118`
      };
    }

    return { ok: false, error: 'Host desconocido' };
  }

  function runSpeedtest(clientId) {
    const client = state.clients.find(c => c.id === clientId);
    if (!client || client.status === 'disconnected') {
      return { ok: false, error: 'Dispositivo desconectado' };
    }
    if (!state.router.wanOnline) {
      return { ok: false, error: 'Sin conexión a Internet (WAN inactiva)' };
    }
    const rssi = calcRSSI(client.distance);
    let down = 0;
    let up = 0;
    if (rssi >= -55) {
      down = Math.round(270 + Math.random() * 25);
      up = Math.round(90 + Math.random() * 10);
    } else if (rssi >= -68) {
      down = Math.round(180 + Math.random() * 30);
      up = Math.round(65 + Math.random() * 15);
    } else if (rssi >= -78) {
      down = Math.round(95 + Math.random() * 20);
      up = Math.round(35 + Math.random() * 10);
    } else {
      down = Math.round(25 + Math.random() * 15);
      up = Math.round(8 + Math.random() * 5);
    }

    // Add traffic
    client.rxBytes += down * 1024 * 1024;
    client.txBytes += up * 1024 * 512;
    persistState();

    return {
      ok: true,
      down: down,
      up: up,
      ping: Math.round(12 + Math.random() * 5)
    };
  }

  // =========================================================================
  // Scenarios (1-Click Lab Presets)
  // =========================================================================
  const SCENARIOS = {
    standard: {
      name: 'Entorno Estándar SOHO',
      desc: 'Configuración estándar con WPA2-Personal, DHCP activo y clientes en rango óptimo.',
      apply: function() {
        state.wireless.radio24 = true;
        state.wireless.ssids = [{
          id: 1,
          name: 'TP-Link_2.4GHz_BA7FA8',
          vlan: 0,
          bcast: true,
          sec: 'WPA-Personal',
          pass: 'password123',
          guest: false,
          txBytes: 25000000,
          rxBytes: 3200000
        }];
        state.wireless.macFilter.enabled = false;
        state.router.wanOnline = true;
        state.router.dhcpEnabled = true;
        state.router.allowedVlans = '0, 1, 10, 20';
        state.clients[0].distance = 3;
        state.clients[1].distance = 5;
        persistState();
        attemptConnect('phone', 'TP-Link_2.4GHz_BA7FA8', 'password123');
        addSysLog('SYSTEM', 'INFO', 'Escenario "Entorno Estándar SOHO" aplicado');
      }
    },
    guestVlan: {
      name: 'Red de Invitados con VLAN 20',
      desc: 'Dos SSIDs: Corporativo (VLAN 10) e Invitados (VLAN 20). Prueba de aislamiento.',
      apply: function() {
        state.wireless.radio24 = true;
        state.wireless.ssids = [
          { id: 1, name: 'Empresa_Corp', vlan: 10, bcast: true, sec: 'WPA-Personal', pass: 'corp2026', guest: false, txBytes: 15000000, rxBytes: 2000000 },
          { id: 2, name: 'Empresa_Invitados', vlan: 20, bcast: true, sec: 'None', pass: '', guest: true, txBytes: 5000000, rxBytes: 800000 }
        ];
        state.wireless.macFilter.enabled = false;
        state.router.wanOnline = true;
        state.router.dhcpEnabled = true;
        state.router.allowedVlans = '0, 1, 10, 20';
        persistState();
        attemptConnect('laptop', 'Empresa_Corp', 'corp2026');
        attemptConnect('phone', 'Empresa_Invitados', '');
        addSysLog('VLAN', 'INFO', 'Escenario "Red de Invitados con VLAN 20" aplicado');
      }
    },
    macSecurity: {
      name: 'Auditoría de Seguridad MAC',
      desc: 'Lista negra / blanca activa. Verifica cómo se bloquean dispositivos no autorizados.',
      apply: function() {
        state.wireless.radio24 = true;
        state.wireless.macFilter.enabled = true;
        state.wireless.macFilter.rule = 'Deny';
        state.wireless.macFilter.list = [
          { id: 1, mac: 'DC:A6:32:9F:11:22', desc: 'Dispositivo Sospechoso' }
        ];
        state.router.wanOnline = true;
        state.router.dhcpEnabled = true;
        persistState();
        reevaluateAllClients();
        addSysLog('SECURITY', 'WARNING', 'Escenario "Auditoría de Seguridad MAC" aplicado: Lista Deny activa');
      }
    },
    wanOutage: {
      name: 'Caída de Enlace WAN (Sin Internet)',
      desc: 'El router pierde el enlace WAN con el ISP. La LAN WiFi sigue operativa pero sin salida.',
      apply: function() {
        state.router.wanOnline = false;
        persistState();
        reevaluateAllClients();
        addSysLog('SYSTEM', 'WARNING', 'Escenario "Caída de Enlace WAN" aplicado: WAN caída');
      }
    },
    rfLimit: {
      name: 'Límite de Cobertura y Señal Débil',
      desc: 'Dispositivo alejado a 35 metros con atenuación extrema (-87 dBm).',
      apply: function() {
        state.clients[0].distance = 35;
        persistState();
        reevaluateAllClients();
        addSysLog('WIRELESS', 'WARNING', 'Escenario "Límite de Cobertura": Cliente movido a 35m');
      }
    }
  };

  // =========================================================================
  // Reactive Sync Listeners
  // =========================================================================
  const syncListeners = [];
  function onSync(fn) {
    syncListeners.push(fn);
  }
  function triggerSync() {
    syncListeners.forEach(fn => {
      try { fn(state); } catch(e) { console.error('Sync listener error:', e); }
    });
  }

  // Live Timer: Uptime increment & traffic flow
  setInterval(() => {
    state.device.uptimeSec++;
    // Minor variations in CPU/Mem
    state.device.cpu = Math.max(2, Math.min(18, Math.round(state.device.cpu + (Math.random() * 2 - 1))));

    // Active clients increment time and background packets
    let hasTraffic = false;
    state.clients.forEach(c => {
      if (c.status === 'connected') {
        c.connTime++;
        c.txBytes += Math.floor(Math.random() * 120 + 20);
        c.rxBytes += Math.floor(Math.random() * 450 + 60);
        hasTraffic = true;
      }
    });

    if (hasTraffic && Math.random() < 0.2) {
      persistState();
    }
  }, 1000);

  // =========================================================================
  // IFRAME BRIDGE ENGINE
  // This function is stringified and injected directly into each EAP page.
  // It intercepts DOM elements, binds TP-Link styled modals, populates grids,
  // and keeps the page perfectly in sync with the Simulator State Store.
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
      // 1. TOP MENU NAVIGATION HOOKS
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
              // Top-level item: find first page matching group
              const targetIdx = topWin.EAP_PAGES.findIndex(p => p.g.toLowerCase() === text.toLowerCase());
              if (targetIdx >= 0) topWin.navigateToPage(targetIdx);
            } else {
              // Submenu item: find page matching group + name
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
      // 2. PAGE 0: STATUS -> DEVICE
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
          // Live tick
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
      // 3. PAGE 1: STATUS -> WIRELESS
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

        // Render SSID List Grid
        const grid = $('#ssidListGrid');
        if (grid) {
          const tbody = $('.grid-content-data', grid);
          if (tbody) {
            tbody.innerHTML = s.wireless.ssids.map((z, i) => {
              const clientsOnSSID = s.clients.filter(c => c.connectedSSID === z.name).length;
              return `
                <tr class="grid-content-tr grid-content-tr-${i+1}" data-key="${i+1}" style="display: table-row;">
                  <td class="grid-content-td grid-content-td-0 grid-content-td-row-numberer fst"><span class="grid-row-numberer content">${i+1}</span></td>
                  <td class="grid-content-td grid-content-td-1 grid-content-td-SSID"><span class="content">${esc(z.name)}</span></td>
                  <td class="grid-content-td grid-content-td-2 grid-content-td-clients"><span class="content">${clientsOnSSID}</span></td>
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

        // Live Traffic update
        setInterval(() => {
          const curState = EAP.getState();
          let totTx = 0, totRx = 0;
          curState.wireless.ssids.forEach(z => {
            totTx += (z.txBytes || 0);
            totRx += (z.rxBytes || 0);
          });
          const rxPackets = $('#traffic_rx_packets');
          if (rxPackets) rxPackets.value = Math.floor(totRx / 140);
          const rxBytes = $('#traffic_rx_bytes');
          if (rxBytes) rxBytes.value = totRx;
        }, 1000);
      }

      // -------------------------------------------------------------------
      // 4. PAGE 2: STATUS -> CLIENT LIST
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

        // Handle Disconnect & Block clicks
        grid.addEventListener('click', function(e) {
          const btnDisc = e.target.closest('.btn-disconnect');
          if (btnDisc) {
            e.preventDefault();
            const cid = btnDisc.dataset.client;
            EAP.disconnectClient(cid);
            renderClients();
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
              s.wireless.macFilter.list.push({ id: Date.now(), mac: mac, desc: 'Blocked via Client List' });
            }
            EAP.persistState();
            EAP.reevaluateAllClients();
            renderClients();
            showTplToast('MAC Blocked & Disconnected');
            return;
          }

          const refreshBtn = e.target.closest('.btn-refresh');
          if (refreshBtn) {
            e.preventDefault();
            renderClients();
            showTplToast('Refreshed');
          }
        });
      }

      // -------------------------------------------------------------------
      // 5. PAGE 3: WIRELESS -> WIRELESS SETTINGS
      // -------------------------------------------------------------------
      function initPageWirelessSettings() {
        if (pageIdx !== 3) return;
        const s = EAP.getState();

        // 2.4GHz Radio Switch
        const radToggle = $('#wireless-bset-status');
        if (radToggle) {
          const chkLabel = radToggle.closest('label.checkbox-label');
          if (chkLabel) {
            chkLabel.classList.toggle('checked', s.wireless.radio24);
            chkLabel.onclick = function(e) {
              e.preventDefault();
              s.wireless.radio24 = !chkLabel.classList.contains('checked');
              chkLabel.classList.toggle('checked', s.wireless.radio24);
              EAP.persistState();
              if (!s.wireless.radio24) {
                EAP.reevaluateAllClients();
              }
              showTplToast(s.wireless.radio24 ? 'Radio 2.4GHz Activada' : 'Radio 2.4GHz Desactivada');
            };
          }
        }

        // SSID Grid
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

        // TP-Link Modal for Add/Edit SSID
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
                    <input type="checkbox" id="m_ssid_guest" ${current.guest ? 'checked' : ''}> Aislar invitados
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
              errEl.textContent = 'El nombre de SSID es obligatorio.';
              return;
            }
            if (nameVal.length > 32) {
              errEl.textContent = 'El SSID no puede superar 32 caracteres.';
              return;
            }
            if (secVal !== 'None' && (passVal.length < 8 || passVal.length > 63)) {
              errEl.textContent = 'La contraseña WPA debe tener entre 8 y 63 caracteres.';
              return;
            }
            if (vlanVal < 0 || vlanVal > 4094) {
              errEl.textContent = 'El VLAN ID debe estar entre 0 y 4094.';
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
                errEl.textContent = 'Límite alcanzado: máximo 8 SSIDs permitidos.';
                return;
              }
              curState.wireless.ssids.push(newEntry);
              EAP.addSysLog('WIRELESS', 'INFO', `New SSID "${nameVal}" created (VLAN ${vlanVal})`);
            }

            EAP.persistState();
            EAP.reevaluateAllClients();
            overlay.remove();
            renderSSIDs();
            showTplToast('SSID settings saved');
          };
        }

        // Hook authentic Add Button
        const addBtn = $('.operation-btn.btn-add', grid);
        if (addBtn) {
          addBtn.onclick = function(e) {
            e.preventDefault();
            openSSIDModal(-1);
          };
        }

        // Hook Edit / Delete in table
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
              alert('Debe haber al menos 1 SSID activo en la EAP.');
              return;
            }
            if (confirm(`¿Desea eliminar la red SSID "${curState.wireless.ssids[idx].name}"?`)) {
              const removed = curState.wireless.ssids.splice(idx, 1);
              EAP.addSysLog('WIRELESS', 'WARNING', `SSID "${removed[0].name}" deleted`);
              EAP.persistState();
              EAP.reevaluateAllClients();
              renderSSIDs();
              showTplToast('SSID deleted');
            }
          }
        });
      }

      // -------------------------------------------------------------------
      // 6. PAGE 6: WIRELESS -> MAC FILTERING
      // -------------------------------------------------------------------
      function initPageMacFiltering() {
        if (pageIdx !== 6) return;
        const grid = $('#mac_addr_grid');
        if (!grid) return;

        grid.style.display = 'block'; // Make grid visible
        const s = EAP.getState();

        // Enable Switch
        const mfToggle = $('#mac-filtering-enable');
        if (mfToggle) {
          const chkLabel = mfToggle.closest('label.checkbox-label');
          if (chkLabel) {
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

        // Hook Add MAC Modal
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
                    <input type="text" id="m_mac_desc" class="tpl-form-control" placeholder="Ej: Laptop Personal">
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
                errEl.textContent = 'Esta dirección MAC ya está en la lista.';
                return;
              }

              curState.wireless.macFilter.list.push({ id: Date.now(), mac: val, desc: desc || 'Dispositivo' });
              EAP.addSysLog('SECURITY', 'INFO', `MAC ${val} added to filtering list`);
              EAP.persistState();
              EAP.reevaluateAllClients();
              modal.remove();
              renderMacList();
              showTplToast('MAC added to filter');
            };
          };
        }

        // Delete MAC
        grid.addEventListener('click', function(e) {
          const btn = e.target.closest('.btn-del-mac');
          if (!btn) return;
          e.preventDefault();
          const idx = parseInt(btn.dataset.idx);
          const curState = EAP.getState();
          const removed = curState.wireless.macFilter.list.splice(idx, 1);
          EAP.addSysLog('SECURITY', 'INFO', `MAC ${removed[0].mac} removed from filter`);
          EAP.persistState();
          EAP.reevaluateAllClients();
          renderMacList();
          showTplToast('MAC removed');
        });
      }

      // -------------------------------------------------------------------
      // 7. PAGE 10: MANAGEMENT -> NETWORK (IP SETTINGS)
      // -------------------------------------------------------------------
      function initPageNetwork() {
        if (pageIdx !== 10) return;
        const s = EAP.getState();

        const ipInput = $('#ipAddress') || $('#fallbackIp');
        if (ipInput) ipInput.value = s.device.ip;

        const maskInput = $('#subnetMask') || $('#fallbackMask');
        if (maskInput) maskInput.value = s.device.mask;

        const gwInput = $('#fallbackGateway') || $('#gateway');
        if (gwInput) gwInput.value = s.device.gateway;

        const saveBtn = $('#submit_ipsetting') || $('button[name="submit_ipsetting"]');
        if (saveBtn) {
          saveBtn.onclick = function(e) {
            e.preventDefault();
            if (ipInput && ipInput.value) s.device.ip = ipInput.value.trim();
            if (maskInput && maskInput.value) s.device.mask = maskInput.value.trim();
            if (gwInput && gwInput.value) s.device.gateway = gwInput.value.trim();
            EAP.addSysLog('DEV_IP_C', 'WARNING', `LAN IP of AP changed to ${s.device.ip}/${s.device.mask}`);
            EAP.persistState();
            showTplToast('IP Settings Saved');
          };
        }
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
            if (confirm('¿Restablecer la EAP a los valores predeterminados de fábrica? Todos los ajustes personalizados se borrarán.')) {
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
            const dlAnchor = d.createElement('a');
            dlAnchor.setAttribute('href', dataStr);
            dlAnchor.setAttribute('download', `EAP_Backup_Config_${Date.now()}.json`);
            d.body.appendChild(dlAnchor);
            dlAnchor.click();
            dlAnchor.remove();
            showTplToast('Backup exported');
          };
        }
      }

      // Initialize all hooks
      initNavigation();
      initPageDevice();
      initPageWirelessStatus();
      initPageClientStatus();
      initPageWirelessSettings();
      initPageMacFiltering();
      initPageNetwork();
      initPageSystemLog();
      initPageReboot();
      initPageBackupRestore();

    }.toString() + ')()';
  }

  // =========================================================================
  // Public Simulator API
  // =========================================================================
  window.EAPEngine = {
    getState: () => state,
    persistState: persistState,
    resetState: resetState,
    calcRSSI: calcRSSI,
    getSignalBars: getSignalBars,
    calcRate: calcRate,
    formatBytes: formatBytes,
    formatUptime: formatUptime,
    addSysLog: addSysLog,
    attemptConnect: attemptConnect,
    disconnectClient: disconnectClient,
    reevaluateAllClients: reevaluateAllClients,
    runPing: runPing,
    runSpeedtest: runSpeedtest,
    scenarios: SCENARIOS,
    onSync: onSync,
    triggerSync: triggerSync,
    getIframeEngineScript: getIframeEngineScript
  };

})(window);
