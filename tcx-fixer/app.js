// DOM Elements
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');
const toggleInfoBtn = document.getElementById('toggle-info-btn');
const infoBox = document.getElementById('info-box');

const settingsHeader = document.getElementById('settings-header');
const settingsBody = document.getElementById('settings-body');
const settingsArrow = document.getElementById('settings-arrow');

const windowSlider = document.getElementById('window-slider');
const windowVal = document.getElementById('window-val');
const stopSlider = document.getElementById('stop-slider');
const stopVal = document.getElementById('stop-val');
const threshSlider = document.getElementById('thresh-slider');
const threshVal = document.getElementById('thresh-val');

const batchSection = document.getElementById('batch-section');
const batchCountBadge = document.getElementById('batch-count-badge');
const fileChips = document.getElementById('file-chips');
const downloadAllBtn = document.getElementById('download-all-btn');
const clearAllBtn = document.getElementById('clear-all-btn');

const resultView = document.getElementById('result-view');
const downloadCurrentBtn = document.getElementById('download-current-btn');

// State
let processedFiles = []; // array of { file, name, rawXml, result }
let activeFileIndex = 0;
let leafletMap = null;
let mapPolyline = null;
let mapMarkers = [];
let profileChartInstance = null;
let currentChartTab = 'speed'; // 'speed' | 'hr' | 'alt'

// Settings Toggles
toggleInfoBtn.addEventListener('click', () => {
    infoBox.classList.toggle('hidden');
});

settingsHeader.addEventListener('click', () => {
    settingsBody.classList.toggle('hidden');
    settingsArrow.style.transform = settingsBody.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
});

windowSlider.addEventListener('input', (e) => {
    windowVal.textContent = `${e.target.value} วิ`;
    reprocessCurrentFiles();
});

stopSlider.addEventListener('input', (e) => {
    stopVal.textContent = `${e.target.value} วิ`;
    reprocessCurrentFiles();
});

threshSlider.addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    threshVal.textContent = `${v.toFixed(1)} m/s (${(v * 3.6).toFixed(2)} km/h)`;
    reprocessCurrentFiles();
});

// Drag & Drop Handlers
dropzone.addEventListener('click', () => fileInput.click());

['dragenter', 'dragover'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-active');
    });
});

['dragleave', 'drop'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-active');
    });
});

dropzone.addEventListener('drop', (e) => {
    const files = Array.from(e.dataTransfer.files).filter(f => f.name.toLowerCase().endsWith('.tcx'));
    if (files.length > 0) {
        handleIncomingFiles(files);
    } else {
        alert('กรุณาเลือกไฟล์ที่มีนามสกุล .tcx เท่านั้น');
    }
});

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        handleIncomingFiles(files);
    }
});

clearAllBtn.addEventListener('click', () => {
    processedFiles = [];
    activeFileIndex = 0;
    fileInput.value = '';
    batchSection.classList.add('hidden');
    resultView.classList.add('hidden');
});

// Reprocess when sliders change
function reprocessCurrentFiles() {
    if (processedFiles.length === 0) return;
    const currentOptions = getOptions();
    for (let item of processedFiles) {
        try {
            item.result = TcxEngine.processTcx(item.rawXml, currentOptions);
        } catch (err) {
            console.error(err);
        }
    }
    renderActiveFile();
}

function getOptions() {
    return {
        window: parseInt(windowSlider.value, 10),
        minStopDuration: parseInt(stopSlider.value, 10),
        movingThreshold: parseFloat(threshSlider.value)
    };
}

// Process Incoming Files
async function handleIncomingFiles(files) {
    const options = getOptions();

    for (const file of files) {
        try {
            const text = await readFileText(file);
            const result = TcxEngine.processTcx(text, options);
            
            // Check if already in list
            const existingIndex = processedFiles.findIndex(p => p.name === file.name);
            const fileObj = {
                name: file.name,
                rawXml: text,
                result
            };

            if (existingIndex >= 0) {
                processedFiles[existingIndex] = fileObj;
            } else {
                processedFiles.push(fileObj);
            }
        } catch (err) {
            alert(`เกิดข้อผิดพลาดในการประมวลผลไฟล์ ${file.name}: ${err.message}`);
        }
    }

    if (processedFiles.length > 0) {
        batchSection.classList.remove('hidden');
        resultView.classList.remove('hidden');
        activeFileIndex = processedFiles.length - 1; // show last uploaded
        updateBatchUI();
        renderActiveFile();
    }
}

function readFileText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// Update Batch Section Chips
function updateBatchUI() {
    batchCountBadge.textContent = `${processedFiles.length} ไฟล์`;
    fileChips.innerHTML = '';

    if (processedFiles.length > 1) {
        downloadAllBtn.classList.remove('hidden');
    } else {
        downloadAllBtn.classList.add('hidden');
    }

    processedFiles.forEach((item, idx) => {
        const chip = document.createElement('button');
        const isActive = idx === activeFileIndex;
        chip.className = `px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 flex items-center gap-2 border transition ${
            isActive 
                ? 'bg-orange-50 text-orange-700 border-orange-300 shadow-xs font-semibold' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-xs'
        }`;
        chip.innerHTML = `
            <i class="fa-solid fa-file-waveform ${isActive ? 'text-orange-500' : 'text-slate-400'}"></i>
            <span class="max-w-[140px] truncate">${item.name}</span>
            <span class="text-[10px] text-emerald-600 mono-font font-bold">+${item.result.regainedFormatted}</span>
        `;
        chip.addEventListener('click', () => {
            activeFileIndex = idx;
            updateBatchUI();
            renderActiveFile();
        });
        fileChips.appendChild(chip);
    });
}

// Render Active File Details
function renderActiveFile() {
    const item = processedFiles[activeFileIndex];
    if (!item) return;

    const res = item.result;

    // Highlight bar
    document.getElementById('res-badge-filename').textContent = item.name;
    document.getElementById('res-regained-time').textContent = `+${res.regainedFormatted}`;

    // Stats
    document.getElementById('stat-moving-new').textContent = res.newStats.movingTimeFormatted;
    document.getElementById('stat-moving-orig').textContent = res.origStats.movingTimeFormatted;
    document.getElementById('stat-moving-diff').textContent = `+${res.regainedFormatted} กู้คืน`;

    document.getElementById('stat-pace-new').textContent = res.newStats.paceFormatted;
    document.getElementById('stat-pace-orig').textContent = res.origStats.paceFormatted;

    document.getElementById('stat-dist').textContent = res.newStats.recordedDistKm;
    document.getElementById('stat-elapsed').textContent = res.newStats.totalTimeFormatted;
    document.getElementById('stat-stops-info').textContent = `${res.genuineStops.length} จุดหยุดพักจริง (${res.genuineStops.reduce((a,b)=>a+b.duration,0)} วิ)`;

    // Diagnostics Table
    document.getElementById('diag-pts-orig').textContent = res.origStats.pointCount.toLocaleString();
    document.getElementById('diag-pts-new').textContent = res.newStats.pointCount.toLocaleString();
    document.getElementById('diag-gaps').textContent = `${res.gapCount} จุด (${Math.round(res.totalGapSecs)} วินาที)`;
    document.getElementById('diag-stops-count').textContent = `${res.genuineStops.length} จุด`;
    document.getElementById('diag-stops-preserved').textContent = `${res.genuineStops.length} จุด (${res.genuineStops.reduce((a,b)=>a+b.duration,0)} วินาที)`;
    document.getElementById('diag-tz').textContent = `Offset: ${res.timeOffset}`;

    // Render Map
    renderLeafletMap(res);

    // Render Chart
    renderProfileChart(res);
}

// Render Leaflet Map
function renderLeafletMap(res) {
    const points = res.smoothedPoints;
    if (!points || points.length === 0) return;

    if (!leafletMap) {
        leafletMap = L.map('map', {
            scrollWheelZoom: false
        }).setView([points[0].lat, points[0].lon], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
        }).addTo(leafletMap);
    }

    // Clear previous layer
    if (mapPolyline) {
        leafletMap.removeLayer(mapPolyline);
    }
    mapMarkers.forEach(m => leafletMap.removeLayer(m));
    mapMarkers = [];

    const latlngs = points.map(p => [p.lat, p.lon]);
    mapPolyline = L.polyline(latlngs, {
        color: '#f97316',
        weight: 4,
        opacity: 0.85,
        smoothFactor: 1
    }).addTo(leafletMap);

    // Fit bounds
    leafletMap.fitBounds(mapPolyline.getBounds(), { padding: [30, 30] });

    // Start Marker (Green)
    const startMarker = L.circleMarker([points[0].lat, points[0].lon], {
        radius: 7,
        fillColor: '#10b981',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 1
    }).addTo(leafletMap).bindPopup('<strong>จุดเริ่มต้น</strong>');
    mapMarkers.push(startMarker);

    // End Marker (Red)
    const last = points[points.length - 1];
    const endMarker = L.circleMarker([last.lat, last.lon], {
        radius: 7,
        fillColor: '#ef4444',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 1
    }).addTo(leafletMap).bindPopup('<strong>จุดสิ้นสุด</strong>');
    mapMarkers.push(endMarker);

    // Genuine Stop Markers
    res.genuineStops.forEach((stop, i) => {
        const stopMarker = L.circleMarker([stop.lat, stop.lon], {
            radius: 6,
            fillColor: '#f59e0b',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
        }).addTo(leafletMap).bindPopup(`<strong>จุดหยุดพักจริง #${i+1}</strong><br>หยุดพัก: ${Math.round(stop.duration)} วินาที`);
        mapMarkers.push(stopMarker);
    });

    setTimeout(() => {
        leafletMap.invalidateSize();
    }, 200);
}

// Render Chart.js Profile
function renderProfileChart(res) {
    const ctx = document.getElementById('profileChart').getContext('2d');
    const smoothed = res.smoothedPoints;

    // Prepare sampled data for smooth chart rendering (every 5-10s to keep it fast)
    const step = Math.max(1, Math.floor(smoothed.length / 300));
    const labels = [];
    const dataFixed = [];
    const dataThreshold = [];

    if (currentChartTab === 'speed') {
        // Calculate moving speeds (km/h)
        for (let i = step; i < smoothed.length; i += step) {
            const dt = (smoothed[i].time - smoothed[i - step].time) / 1000;
            const d = TcxEngine.haversine(smoothed[i - step].lat, smoothed[i - step].lon, smoothed[i].lat, smoothed[i].lon);
            const speedKmh = dt > 0 ? (d / dt) * 3.6 : 0;
            const totalSecs = (smoothed[i].time - smoothed[0].time) / 1000;
            labels.push(`${Math.floor(totalSecs / 60)}:${Math.floor(totalSecs % 60).toString().padStart(2, '0')}`);
            dataFixed.push(speedKmh.toFixed(2));
            dataThreshold.push((res.options.movingThreshold * 3.6).toFixed(2));
        }
    } else if (currentChartTab === 'hr') {
        for (let i = 0; i < smoothed.length; i += step) {
            const totalSecs = (smoothed[i].time - smoothed[0].time) / 1000;
            labels.push(`${Math.floor(totalSecs / 60)}:${Math.floor(totalSecs % 60).toString().padStart(2, '0')}`);
            dataFixed.push(smoothed[i].hr || null);
        }
    } else if (currentChartTab === 'alt') {
        for (let i = 0; i < smoothed.length; i += step) {
            const totalSecs = (smoothed[i].time - smoothed[0].time) / 1000;
            labels.push(`${Math.floor(totalSecs / 60)}:${Math.floor(totalSecs % 60).toString().padStart(2, '0')}`);
            dataFixed.push(smoothed[i].alt ? smoothed[i].alt.toFixed(1) : null);
        }
    }

    if (profileChartInstance) {
        profileChartInstance.destroy();
    }

    let datasets = [];
    if (currentChartTab === 'speed') {
        datasets = [
            {
                label: 'ความเร็วหลังซ่อม (km/h)',
                data: dataFixed,
                borderColor: '#f97316',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 0
            },
            {
                label: 'เกณฑ์ Strava Moving (2.88 km/h)',
                data: dataThreshold,
                borderColor: '#ef4444',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            }
        ];
    } else if (currentChartTab === 'hr') {
        datasets = [
            {
                label: 'Heart Rate (bpm)',
                data: dataFixed,
                borderColor: '#ec4899',
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                fill: true,
                tension: 0.2,
                pointRadius: 0
            }
        ];
    } else {
        datasets = [
            {
                label: 'ความสูงชัน Altitude (m)',
                data: dataFixed,
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                fill: true,
                tension: 0.2,
                pointRadius: 0
            }
        ];
    }

    profileChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#334155',
                        font: { family: 'Google Sans', size: 12 }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#64748b', font: { family: 'Google Sans' }, maxTicksLimit: 10 },
                    grid: { color: '#f1f5f9' }
                },
                y: {
                    ticks: { color: '#64748b', font: { family: 'Google Sans' } },
                    grid: { color: '#f1f5f9' }
                }
            }
        }
    });
}

// Chart Tab Switches
['speed', 'hr', 'alt'].forEach(tab => {
    const btn = document.getElementById(`chart-tab-${tab}`);
    btn.addEventListener('click', () => {
        currentChartTab = tab;
        ['speed', 'hr', 'alt'].forEach(t => {
            const b = document.getElementById(`chart-tab-${t}`);
            if (t === tab) {
                b.className = 'px-3 py-1 rounded-lg font-medium text-white bg-orange-600 transition shadow-xs';
            } else {
                b.className = 'px-3 py-1 rounded-lg font-medium text-slate-600 hover:text-slate-900 transition';
            }
        });
        if (processedFiles[activeFileIndex]) {
            renderProfileChart(processedFiles[activeFileIndex].result);
        }
    });
});

// Download Single File
downloadCurrentBtn.addEventListener('click', () => {
    const item = processedFiles[activeFileIndex];
    if (!item) return;

    const baseName = item.name.replace(/\.[^/.]+$/, "");
    const outName = `${baseName}_fixed.tcx`;
    const blob = new Blob([item.result.fixedXml], { type: 'application/vnd.garmin.tcx+xml;charset=utf-8' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = outName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Batch Download as ZIP
downloadAllBtn.addEventListener('click', async () => {
    if (processedFiles.length === 0) return;
    const zip = new JSZip();

    processedFiles.forEach(item => {
        const baseName = item.name.replace(/\.[^/.]+$/, "");
        const outName = `${baseName}_fixed.tcx`;
        zip.file(outName, item.result.fixedXml);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `tcx_strava_fixed_batch_${new Date().toISOString().slice(0,10)}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
