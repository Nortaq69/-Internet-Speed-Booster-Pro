const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const si = require('systeminformation');
const PowerShell = require('node-powershell');
const ping = require('ping');
const speedTest = require('speedtest-net');
const regedit = require('regedit');

let mainWindow;
let ps = new PowerShell({
  executionPolicy: 'Bypass',
  noProfile: true
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    titleBarStyle: 'hidden',
    frame: false,
    show: false,
    backgroundColor: '#0a0a0a'
  });

  mainWindow.loadFile('tool.html');
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers for network optimization
ipcMain.handle('get-network-info', async () => {
  try {
    const networkInterfaces = await si.networkInterfaces();
    const networkStats = await si.networkStats();
    const networkConnections = await si.networkConnections();
    
    return {
      interfaces: networkInterfaces,
      stats: networkStats,
      connections: networkConnections
    };
  } catch (error) {
    console.error('Error getting network info:', error);
    return { error: error.message };
  }
});

ipcMain.handle('optimize-dns', async () => {
  try {
    const dnsServers = [
      '8.8.8.8', '8.8.4.4', // Google DNS
      '1.1.1.1', '1.0.0.1', // Cloudflare DNS
      '208.67.222.222', '208.67.220.220', // OpenDNS
      '9.9.9.9', '149.112.112.112' // Quad9 DNS
    ];

    const commands = [
      'netsh interface ip set dns "Wi-Fi" static 8.8.8.8',
      'netsh interface ip add dns "Wi-Fi" 8.8.4.4 index=2',
      'netsh interface ip set dns "Ethernet" static 8.8.8.8',
      'netsh interface ip add dns "Ethernet" 8.8.4.4 index=2',
      'ipconfig /flushdns',
      'ipconfig /registerdns'
    ];

    for (const command of commands) {
      await new Promise((resolve, reject) => {
        exec(command, { shell: 'cmd' }, (error, stdout, stderr) => {
          if (error) console.log(`Command error: ${error}`);
          resolve();
        });
      });
    }

    return { success: true, message: 'DNS optimization completed' };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('optimize-tcp', async () => {
  try {
    const tcpOptimizations = [
      'netsh int tcp set global autotuninglevel=normal',
      'netsh int tcp set global chimney=enabled',
      'netsh int tcp set global dca=enabled',
      'netsh int tcp set global netdma=enabled',
      'netsh int tcp set global ecncapability=enabled',
      'netsh int tcp set global timestamps=disabled',
      'netsh int tcp set global rss=enabled',
      'netsh int tcp set global maxsynretransmissions=2',
      'netsh int tcp set global initialRto=2000',
      'netsh int tcp set global rsc=enabled'
    ];

    for (const command of tcpOptimizations) {
      await new Promise((resolve) => {
        exec(command, { shell: 'cmd' }, (error) => {
          if (error) console.log(`TCP optimization error: ${error}`);
          resolve();
        });
      });
    }

    return { success: true, message: 'TCP optimization completed' };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('optimize-registry', async () => {
  try {
    const registryOptimizations = [
      {
        key: 'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters',
        values: {
          'Tcp1323Opts': 1,
          'TcpMaxDupAcks': 2,
          'SackOpts': 1,
          'DefaultTTL': 64,
          'TcpTimedWaitDelay': 30,
          'MaxUserPort': 65534,
          'MaxFreeTcbs': 65536,
          'MaxHashTableSize': 65536,
          'EnableWsd': 0,
          'EnableICMPRedirect': 0
        }
      },
      {
        key: 'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces',
        values: {
          'TcpAckFrequency': 1,
          'TCPNoDelay': 1
        }
      }
    ];

    for (const optimization of registryOptimizations) {
      for (const [name, value] of Object.entries(optimization.values)) {
        try {
          await new Promise((resolve) => {
            exec(`reg add "${optimization.key}" /v ${name} /t REG_DWORD /d ${value} /f`, 
              { shell: 'cmd' }, (error) => {
                if (error) console.log(`Registry error: ${error}`);
                resolve();
              });
          });
        } catch (error) {
          console.log(`Registry optimization error: ${error}`);
        }
      }
    }

    return { success: true, message: 'Registry optimization completed' };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('optimize-wifi', async () => {
  try {
    const wifiOptimizations = [
      'netsh wlan set autoconfig enabled=no',
      'netsh wlan set blockednetworks display=show',
      'netsh wlan show networks mode=bssid',
      'netsh wlan set profileparameter name="*" connectionmode=auto'
    ];

    for (const command of wifiOptimizations) {
      await new Promise((resolve) => {
        exec(command, { shell: 'cmd' }, (error) => {
          if (error) console.log(`WiFi optimization error: ${error}`);
          resolve();
        });
      });
    }

    return { success: true, message: 'WiFi optimization completed' };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('optimize-cache', async () => {
  try {
    const cacheCommands = [
      'ipconfig /flushdns',
      'ipconfig /release',
      'ipconfig /renew',
      'netsh winsock reset',
      'netsh int ip reset',
      'del /q /s %temp%\\*',
      'del /q /s %systemroot%\\temp\\*'
    ];

    for (const command of cacheCommands) {
      await new Promise((resolve) => {
        exec(command, { shell: 'cmd' }, (error) => {
          if (error) console.log(`Cache optimization error: ${error}`);
          resolve();
        });
      });
    }

    return { success: true, message: 'Cache optimization completed' };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('run-speed-test', async () => {
  try {
    const test = speedTest({ maxTime: 5000 });
    
    return new Promise((resolve, reject) => {
      test.on('data', (data) => {
        resolve({
          success: true,
          download: data.speeds.download,
          upload: data.speeds.upload,
          ping: data.server.ping,
          isp: data.client.isp
        });
      });

      test.on('error', (error) => {
        reject({ error: error.message });
      });
    });
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('ping-host', async (event, host) => {
  try {
    const result = await ping.promise.probe(host, {
      timeout: 10,
      extra: ['-c', '4']
    });

    return {
      success: true,
      host: host,
      alive: result.alive,
      time: result.time,
      min: result.min,
      max: result.max,
      avg: result.avg,
      packetLoss: result.packetLoss
    };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('get-system-info', async () => {
  try {
    const cpu = await si.cpu();
    const mem = await si.mem();
    const os = await si.osInfo();
    const network = await si.networkInterfaces();
    
    return {
      cpu: cpu,
      memory: mem,
      os: os,
      network: network
    };
  } catch (error) {
    return { error: error.message };
  }
});

// Window control handlers
ipcMain.handle('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) mainWindow.close();
}); 