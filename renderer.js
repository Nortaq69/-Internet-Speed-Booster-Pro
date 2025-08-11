// Global variables
let currentSpeed = 0;
let boostLevel = 0;
let isOptimizing = false;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadNetworkInfo();
    startRealTimeUpdates();
});

// Initialize the application
function initializeApp() {
    console.log('🚀 Internet Speed Booster Pro initialized');
    
    // Set up electron API
    if (typeof require !== 'undefined') {
        const { ipcRenderer } = require('electron');
        window.electronAPI = {
            invoke: (channel, data) => ipcRenderer.invoke(channel, data)
        };
    }
    
    // Initialize boost level
    updateBoostLevel(0);
    
    // Show welcome message
    showStatus('Internet Speed Booster Pro loaded successfully!', 'success');
}

// Set up event listeners
function setupEventListeners() {
    // Title bar buttons
    document.getElementById('minimizeBtn').addEventListener('click', () => {
        window.electronAPI.invoke('minimize-window');
    });
    
    document.getElementById('maximizeBtn').addEventListener('click', () => {
        window.electronAPI.invoke('maximize-window');
    });
    
    document.getElementById('closeBtn').addEventListener('click', () => {
        window.electronAPI.invoke('close-window');
    });
    
    // Optimization card hover effects
    document.querySelectorAll('.optimization-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Load network information
async function loadNetworkInfo() {
    try {
        const networkInfo = await window.electronAPI.invoke('get-network-info');
        
        if (networkInfo.error) {
            throw new Error(networkInfo.error);
        }
        
        displayNetworkInterfaces(networkInfo.interfaces);
        displayConnectionStatus(networkInfo.stats, networkInfo.connections);
        
    } catch (error) {
        console.error('Error loading network info:', error);
        showStatus('Failed to load network information', 'error');
    }
}

// Display network interfaces
function displayNetworkInterfaces(interfaces) {
    const container = document.getElementById('networkInterfaces');
    
    if (!interfaces || interfaces.length === 0) {
        container.innerHTML = '<div class="error">No network interfaces found</div>';
        return;
    }
    
    let html = '';
    interfaces.forEach(iface => {
        if (iface.operstate === 'up') {
            html += `
                <div class="interface-item">
                    <div class="interface-name">${iface.iface}</div>
                    <div class="interface-details">
                        <span class="detail">IP: ${iface.ip4 || 'N/A'}</span>
                        <span class="detail">MAC: ${iface.mac || 'N/A'}</span>
                        <span class="detail">Speed: ${iface.speed || 'N/A'} Mbps</span>
                    </div>
                </div>
            `;
        }
    });
    
    container.innerHTML = html || '<div class="no-data">No active network interfaces</div>';
}

// Display connection status
function displayConnectionStatus(stats, connections) {
    const container = document.getElementById('connectionStatus');
    
    if (!stats || stats.length === 0) {
        container.innerHTML = '<div class="error">No connection data available</div>';
        return;
    }
    
    const activeConnections = connections.filter(conn => conn.state === 'ESTABLISHED');
    
    let html = `
        <div class="connection-summary">
            <div class="summary-item">
                <span class="label">Active Connections:</span>
                <span class="value">${activeConnections.length}</span>
            </div>
            <div class="summary-item">
                <span class="label">Total Connections:</span>
                <span class="value">${connections.length}</span>
            </div>
        </div>
    `;
    
    // Show top connections by data usage
    if (activeConnections.length > 0) {
        html += '<div class="top-connections">';
        html += '<h5>Top Active Connections:</h5>';
        
        activeConnections.slice(0, 5).forEach(conn => {
            html += `
                <div class="connection-item">
                    <div class="conn-info">
                        <span class="conn-name">${conn.peeraddress}:${conn.peerport}</span>
                        <span class="conn-type">${conn.type}</span>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// Run optimization
async function runOptimization(type) {
    if (isOptimizing) {
        showStatus('Optimization already in progress...', 'warning');
        return;
    }
    
    isOptimizing = true;
    const card = document.querySelector(`[data-optimization="${type}"]`);
    const statusElement = card.querySelector('.card-status');
    const button = card.querySelector('.optimize-btn');
    
    try {
        // Update UI
        statusElement.textContent = 'Optimizing...';
        statusElement.style.color = '#ffa726';
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        showProgress(`Running ${type.toUpperCase()} optimization...`);
        
        // Run optimization
        const result = await window.electronAPI.invoke(`optimize-${type}`);
        
        if (result.error) {
            throw new Error(result.error);
        }
        
        // Success
        statusElement.textContent = 'Completed';
        statusElement.style.color = '#4ecdc4';
        showStatus(`${type.toUpperCase()} optimization completed successfully!`, 'success');
        
        // Update boost level
        const boostIncrease = Math.floor(Math.random() * 15) + 5;
        updateBoostLevel(boostLevel + boostIncrease);
        
    } catch (error) {
        console.error(`Error in ${type} optimization:`, error);
        statusElement.textContent = 'Failed';
        statusElement.style.color = '#ff6b6b';
        showStatus(`${type.toUpperCase()} optimization failed: ${error.message}`, 'error');
    } finally {
        // Reset UI
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-play"></i>';
        hideProgress();
        isOptimizing = false;
    }
}

// Run mega boost (all optimizations)
async function runMegaBoost() {
    if (isOptimizing) {
        showStatus('Optimization already in progress...', 'warning');
        return;
    }
    
    isOptimizing = true;
    const card = document.querySelector('.mega-boost');
    const statusElement = card.querySelector('.card-status');
    const button = card.querySelector('.optimize-btn');
    
    try {
        // Update UI
        statusElement.textContent = 'MEGA BOOSTING...';
        statusElement.style.color = '#ffa726';
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        showProgress('Running MEGA BOOST optimization...');
        
        // Run all optimizations
        const result = await window.electronAPI.invoke('optimize-all');
        
        if (result.error) {
            throw new Error(result.error);
        }
        
        // Success
        statusElement.textContent = 'MEGA BOOST COMPLETE!';
        statusElement.style.color = '#4ecdc4';
        showStatus('MEGA BOOST completed! All optimizations applied successfully!', 'success');
        
        // Update boost level significantly
        const boostIncrease = Math.floor(Math.random() * 30) + 20;
        updateBoostLevel(boostLevel + boostIncrease);
        
        // Update all individual optimization statuses
        document.querySelectorAll('.card-status').forEach(status => {
            if (status.id !== 'megaBoostStatus') {
                status.textContent = 'Completed';
                status.style.color = '#4ecdc4';
            }
        });
        
    } catch (error) {
        console.error('Error in mega boost:', error);
        statusElement.textContent = 'MEGA BOOST FAILED';
        statusElement.style.color = '#ff6b6b';
        showStatus(`MEGA BOOST failed: ${error.message}`, 'error');
    } finally {
        // Reset UI
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-bolt"></i>';
        hideProgress();
        isOptimizing = false;
    }
}

// Run speed test
async function runSpeedTest() {
    const button = document.querySelector('.test-btn');
    const results = document.getElementById('speedTestResults');
    
    try {
        // Update UI
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
        results.style.opacity = '0.5';
        
        showStatus('Running speed test...', 'info');
        
        // Run test
        const testResult = await window.electronAPI.invoke('run-speed-test');
        
        if (testResult.error) {
            throw new Error(testResult.error);
        }
        
        // Update results
        document.getElementById('downloadSpeed').textContent = `${testResult.download.toFixed(2)} Mbps`;
        document.getElementById('uploadSpeed').textContent = `${testResult.upload.toFixed(2)} Mbps`;
        document.getElementById('testPing').textContent = `${testResult.ping.toFixed(0)} ms`;
        document.getElementById('ispInfo').textContent = testResult.isp || 'Unknown';
        
        // Update current speed display
        currentSpeed = testResult.download;
        document.getElementById('currentSpeed').textContent = `${currentSpeed.toFixed(1)} Mbps`;
        
        showStatus('Speed test completed!', 'success');
        
    } catch (error) {
        console.error('Speed test error:', error);
        showStatus(`Speed test failed: ${error.message}`, 'error');
    } finally {
        // Reset UI
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-play"></i> Start Test';
        results.style.opacity = '1';
    }
}

// Run ping test
async function runPingTest() {
    const host = document.getElementById('pingHost').value || '8.8.8.8';
    const button = document.querySelector('.ping-btn');
    const results = document.getElementById('pingResults');
    
    try {
        // Update UI
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        results.style.opacity = '0.5';
        
        showStatus(`Pinging ${host}...`, 'info');
        
        // Run ping
        const pingResult = await window.electronAPI.invoke('ping-test', host);
        
        if (pingResult.error) {
            throw new Error(pingResult.error);
        }
        
        // Update results
        document.getElementById('pingStatus').textContent = pingResult.alive ? 'Online' : 'Offline';
        document.getElementById('pingStatus').style.color = pingResult.alive ? '#4ecdc4' : '#ff6b6b';
        document.getElementById('pingAvg').textContent = `${pingResult.avg.toFixed(1)} ms`;
        document.getElementById('packetLoss').textContent = `${pingResult.packetLoss.toFixed(1)}%`;
        
        // Update ping display
        document.getElementById('pingValue').textContent = `${pingResult.avg.toFixed(0)} ms`;
        
        showStatus(`Ping test completed for ${host}`, 'success');
        
    } catch (error) {
        console.error('Ping test error:', error);
        showStatus(`Ping test failed: ${error.message}`, 'error');
    } finally {
        // Reset UI
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-paper-plane"></i>';
        results.style.opacity = '1';
    }
}

// Update boost level
function updateBoostLevel(newLevel) {
    boostLevel = Math.min(newLevel, 100);
    document.getElementById('boostLevel').textContent = `${boostLevel}%`;
    
    // Add visual effect
    const boostElement = document.getElementById('boostLevel');
    boostElement.style.transform = 'scale(1.2)';
    setTimeout(() => {
        boostElement.style.transform = 'scale(1)';
    }, 200);
}

// Show progress bar
function showProgress(message) {
    const container = document.getElementById('progressContainer');
    const text = document.getElementById('progressText');
    
    text.textContent = message;
    container.style.display = 'block';
    
    // Animate progress
    const fill = document.getElementById('progressFill');
    let progress = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
        }
        fill.style.width = `${progress}%`;
    }, 200);
}

// Hide progress bar
function hideProgress() {
    const container = document.getElementById('progressContainer');
    const fill = document.getElementById('progressFill');
    
    fill.style.width = '0%';
    setTimeout(() => {
        container.style.display = 'none';
    }, 300);
}

// Show status message
function showStatus(message, type = 'info') {
    const container = document.getElementById('statusContainer');
    const messageElement = document.getElementById('statusMessage');
    
    // Set message and type
    messageElement.textContent = message;
    messageElement.className = `status-message ${type}`;
    
    // Show message
    container.style.display = 'block';
    setTimeout(() => {
        messageElement.classList.add('show');
    }, 100);
    
    // Hide after 5 seconds
    setTimeout(() => {
        messageElement.classList.remove('show');
        setTimeout(() => {
            container.style.display = 'none';
        }, 300);
    }, 5000);
}

// Start real-time updates
function startRealTimeUpdates() {
    // Update network info every 30 seconds
    setInterval(() => {
        if (!isOptimizing) {
            loadNetworkInfo();
        }
    }, 30000);
    
    // Simulate speed fluctuations
    setInterval(() => {
        if (currentSpeed > 0) {
            const variation = (Math.random() - 0.5) * 2; // ±1 Mbps
            const newSpeed = Math.max(0, currentSpeed + variation);
            document.getElementById('currentSpeed').textContent = `${newSpeed.toFixed(1)} Mbps`;
        }
    }, 5000);
}

// Add CSS for additional styling
const additionalStyles = `
    .interface-item {
        background: rgba(255, 255, 255, 0.05);
        padding: 10px;
        border-radius: 8px;
        margin-bottom: 10px;
        border: 1px solid rgba(0, 212, 255, 0.2);
    }
    
    .interface-name {
        font-weight: 600;
        color: #00d4ff;
        margin-bottom: 5px;
    }
    
    .interface-details {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }
    
    .detail {
        background: rgba(0, 212, 255, 0.1);
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 0.8em;
    }
    
    .connection-summary {
        margin-bottom: 15px;
    }
    
    .summary-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
    }
    
    .label {
        color: #b0b0b0;
    }
    
    .value {
        color: #ffffff;
        font-weight: 600;
    }
    
    .top-connections h5 {
        color: #00d4ff;
        margin-bottom: 10px;
        font-size: 0.9em;
    }
    
    .connection-item {
        background: rgba(255, 255, 255, 0.05);
        padding: 8px;
        border-radius: 6px;
        margin-bottom: 5px;
        border: 1px solid rgba(0, 212, 255, 0.1);
    }
    
    .conn-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .conn-name {
        color: #ffffff;
        font-size: 0.8em;
    }
    
    .conn-type {
        color: #4ecdc4;
        font-size: 0.7em;
        background: rgba(78, 205, 196, 0.1);
        padding: 2px 6px;
        border-radius: 8px;
    }
    
    .error {
        color: #ff6b6b;
        font-style: italic;
    }
    
    .no-data {
        color: #b0b0b0;
        font-style: italic;
    }
    
    .status-message.success {
        border-color: #4ecdc4;
        color: #4ecdc4;
    }
    
    .status-message.error {
        border-color: #ff6b6b;
        color: #ff6b6b;
    }
    
    .status-message.warning {
        border-color: #ffa726;
        color: #ffa726;
    }
    
    .status-message.info {
        border-color: #00d4ff;
        color: #00d4ff;
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet); 