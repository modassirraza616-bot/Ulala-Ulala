async function showForecast(lat, lon, placeName = "Selected Location") {
  const forecastDays = 7;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation,weathercode,temperature_2m&forecast_days=${forecastDays}&timezone=auto`;
  const response = await fetch(url);
  const data = await response.json();

  const times = data.hourly.time;
  const prec = data.hourly.precipitation;
  const wcode = data.hourly.weathercode;
  const temp = data.hourly.temperature_2m;
  const now = new Date();

  let foundIndex = -1;
  for (let i = 0; i < times.length; i++) {
    if (prec[i] > 0 && new Date(times[i]) > now) {
      foundIndex = i;
      break;
    }
  }

  let html = `<strong>Forecast for ${placeName}</strong><br/>`;

  if (foundIndex === -1) {
    html += `🌤 No rain predicted in next ${forecastDays} days.<br/>`;
  } else {
    const rainTime = new Date(times[foundIndex]);
    const diffMs = rainTime - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remHours = diffHours % 24;

    html += `🌧 Next rain: <b>${prec[foundIndex]} mm</b><br/>`;
    html += `⏳ In ~${diffDays} day(s) ${remHours} hour(s)<br/>`;
    html += `📅 At: ${rainTime.toLocaleString()}<br/>`;
  }

  html += `☁️ Current weather: ${weatherCodeToText((wcode && wcode[0]) ?? null)}<br/>`;
  html += `🌡 Current temperature: ${temp[0]} °C`;

  document.getElementById("forecast-info").innerHTML = html;
}

function weatherCodeToText(code) {
  const map = {
    0: "☀️ Clear sky",
    1: "🌤 Mostly clear",
    2: "⛅ Partly cloudy",
    3: "☁️ Overcast",
    45: "🌫 Fog",
    48: "🌫 Fog with rime",
    51: "🌦 Light drizzle",
    53: "🌦 Moderate drizzle",
    55: "🌧 Dense drizzle",
    61: "🌧 Light rain",
    63: "🌧 Moderate rain",
    65: "🌧 Heavy rain",
    71: "❄️ Light snow",
    73: "❄️ Moderate snow",
    75: "❄️ Heavy snow",
    95: "⛈ Thunderstorm",
    96: "⛈ Thunderstorm + hail",
    99: "⛈ Severe thunderstorm + hail"
  };
  return map[code] || "Unknown";
}

const LANG_STRINGS = {
  en: {
    alertsTitle: "Alerts & Live Feed",
    rightTitle: "SOS & Emergency",
    uploadTitle: "Crowd Reports",
    shelterTitle: "Shelters & Rescue",
    twinTitle: "Digital Twin — Flood Simulation",
    sosButton: "I NEED HELP — SOS",
    simRain: "Volunteer Singup",
    volunteerSignup: "Register",
    predLabel: "AI Prediction",
    leadTime: "Lead time",
    fileNone: "No file chosen",
    reportSent: "Report sent and queued for verification",
    volunteerThanks: "Volunteer registered. We'll contact you.",
    offlineSMS: "If offline, app will open SMS with coordinates.",
    findingShelters: "Finding nearest shelters..."
  },
  hi: {
    alertsTitle: "अलर्ट और लाइव फ़ीड",
    rightTitle: "एसओएस और आपातकाल",
    uploadTitle: "जन रिपोर्ट",
    shelterTitle: "शेल्टर और बचाव",
    twinTitle: "डिजिटल ट्विन — बाढ़ सिमुलेशन",
    sosButton: "मुझे मदद चाहिए — एसओएस",
    simRain: "वॉलंटियर साइनअप",
    volunteerSignup: "पंजीकरण",
    predLabel: "एआई भविष्यवाणी",
    leadTime: "लीड समय",
    fileNone: "कोई फ़ाइल नहीं चुनी गई",
    reportSent: "रिपोर्ट भेज दी गई और सत्यापन के लिए कतार में है",
    volunteerThanks: "वॉलंटियर पंजीकृत। हम आपसे संपर्क करेंगे।",
    offlineSMS: "ऑफ़लाइन होने पर, एप्प एसएमएस के साथ कोऑर्डिनेट खोलेगा।",
    findingShelters: "नज़दीकी शेल्टर खोज रहे हैं..."
  }
};

let LANG = localStorage.getItem('fg_lang') || 'en';
document.getElementById('lang').value = LANG;
document.getElementById('alertLang').value = LANG;
function t(k) { return LANG_STRINGS[LANG][k] || k; }
function applyLanguage() {
  document.getElementById('leftTitle').innerText = t('alertsTitle');
  document.getElementById('rightTitle').innerText = t('rightTitle');
  document.getElementById('uploadTitle').innerText = t('uploadTitle');
  document.getElementById('shelterTitle').innerText = t('shelterTitle');
  document.getElementById('twinTitle').innerText = t('twinTitle');
  document.getElementById('sosBtn').innerText = t('sosButton');
  document.getElementById('simulateRain').innerText = t('simRain');
  document.getElementById('registerVolunteer').innerText = t('volunteerSignup');
  document.getElementById('predictionShort').innerHTML = `${t('predLabel')}: <strong id="predVal">—</strong>`;
  document.getElementById('leadTime').innerText = `${t('leadTime')}: —`;
  document.getElementById('filePreview').innerText = t('fileNone');
}
applyLanguage();

document.getElementById('lang').addEventListener('change', e => {
  LANG = e.target.value;
  localStorage.setItem('fg_lang', LANG);
  document.getElementById('alertLang').value = LANG;
  applyLanguage();
});

// const map = L.map('map', { zoomControl: false }).setView([28.61, 77.30], 11); // sample coords (Lucknow region)
const map = L.map('map'); 

// Default Delhi coordinates
const delhiLat = 28.6139;
const delhiLon = 77.2090;
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19, attribution: '© OpenStreetMap'
}).addTo(map);




// ✅ Add IMD Satellite overlay
L.tileLayer.wms("https://reactjs.imd.gov.in/geoserver/imd/wms", {
  layers: "imd:Satellite_IR1_India",
  format: 'image/png',
  transparent: true,
  attribution: "IMD Satellite"
}).addTo(map);


//LIVE LOCATION
// Try to get user location
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      console.log("User location:", lat, lon);
      map.setView([lat, lon], 12);
      const marker = L.marker([lat, lon], { icon: customIcon })
        .addTo(map)
        .bindPopup("📍 You are here")
        .openPopup();

      setTimeout(() => {
        marker.closePopup();
      }, 3000);
      // Optional circle accuracy
      L.circle([lat, lon], {
        radius: 600, // in meters
        color: "green",
        fillColor: "rgba(99, 60, 255, 1)",
        fillOpacity: 0.2
      }).addTo(map);
    },
    (err) => {
      console.warn("Location not allowed, fallback to Delhi:", err.message);
      map.setView([delhiLat, delhiLon], 12);
    }
  );
} else {
  map.setView([delhiLat, delhiLon], 12);
}



//marker shape

const customIcon = L.icon({
  iconUrl: "location.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38]
});

//Remove Icon of shelters

const shelterZoomThreshold = 10;

map.on("zoomend", () => {
  const currentZoom = map.getZoom();
  if (currentZoom < shelterZoomThreshold) {
    // hide shelters
    if (map.hasLayer(shelterLayer)) {
      map.removeLayer(shelterLayer);
    }
  } else {
    // show shelters
    if (!map.hasLayer(shelterLayer)) {
      map.addLayer(shelterLayer);
    }
  }
});



















// click for weathr
map.on('click', async function (e) {
  const lat = e.latlng.lat;
  const lon = e.latlng.lng;

  renderNearestSensor(lat, lon); // left panel me nearest river sensor dikhayega


  addAlert(`⏳ Fetching rainfall forecast...`, 'low');

  try {
    // Reverse geocode (optional)
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    const geoData = await geoRes.json();
    const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.state || "Unknown";

    // Forecast API (Open-Meteo)
    const forecastDays = 5;    // कितने दिन आगे तक देखना है
    const rainThreshold = 2;  // mm बारिश को मानने की सीमा
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation,weathercode,temperature_2m&forecast_days=${forecastDays}&timezone=auto`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data || !data.hourly) {
      addAlert("⚠ Forecast not available", 'med');
      return;
    }

    const times = data.hourly.time;
    const prec = data.hourly.precipitation;
    const wcode = data.hourly.weathercode;
    const temp = data.hourly.temperature_2m;
    const now = new Date();

    let foundIndex = -1;
    for (let i = 0; i < times.length; i++) {
      const t = new Date(times[i]);
      if (t <= now) continue;
      if ((prec[i] ?? 0) >= rainThreshold) { foundIndex = i; break; }
    }

    let popupHtml = `<strong>Forecast for ${city}</strong><br/>`;

    // if no rain predicted, show current weather (use wcode[0] safely)
    if (foundIndex === -1) {
      popupHtml += `🌤 No rain predicted in next ${forecastDays} days.<br/>`;
      addAlert(`No rain expected at ${city} (next ${forecastDays}d)`, 'low');
      popupHtml += `☁️ Current weather: ${weatherCodeToText((wcode && wcode[0]) ?? null)}`;
      popupHtml += `🌡 Temperature: ${temp[0]} °C`;
    } else {
      const rainTime = new Date(times[foundIndex]);
      const diffMs = rainTime - now;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      const remHours = diffHours % 24;

      popupHtml += `🌧 Next rain: <b>${prec[foundIndex]} mm</b><br/>`;
      popupHtml += `⏳ In ~${diffDays} day(s) ${remHours} hour(s)<br/>`;
      popupHtml += `📅 At: ${rainTime.toLocaleString()}<br/>`;
      popupHtml += `☁️ Weather then: ${weatherCodeToText((wcode && wcode[foundIndex]) ?? null)}`;
      popupHtml += `🌡 Temperature then: ${temp[foundIndex]} °C`;

      addAlert(`🌧 Rain at ${city} in ~${diffDays}d ${remHours}h (${rainTime.toLocaleString()})`, 'med');
    }


    document.getElementById("forecast-info").innerHTML = popupHtml;

  } catch (err) {
    console.error(err);
    addAlert("⚠ Error: " + err.message, 'med');
  }
  showForecast(e.latlng.lat, e.latlng.lng, city);
});

async function searchPlace() {
  const place = document.getElementById("placeInput").value;
  if (!place) return;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.length > 0) {
    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);
    map.flyTo([lat, lon], 12, { duration:1.2});

    // ✅ call common forecast function
    showForecast(lat, lon, place);
  } else {
    alert("Place not found!");
  }
}


// Map layers: flood-prone zones (polygons), sensor markers, shelters
const floodLayer = L.layerGroup().addTo(map);
const sensorLayer = L.layerGroup().addTo(map);
const shelterLayer = L.layerGroup().addTo(map);
const reportLayer = L.layerGroup().addTo(map);

// Add sample flood-prone polygons (static sample)
const samplePolygons = [
  { coords: [[28.62, 77.24], [28.64, 77.27], [28.61, 77.27], [28.60, 77.24]], risk: 'high' },
  { coords: [[28.57, 77.31], [28.56, 77.28], [28.53, 77.30], [28.55, 77.32]], risk: 'med' },
  { coords: [[28.74, 77.21], [28.75, 77.24], [28.72, 77.24],], risk: 'low' }
];
function styleByRisk(r) {
  if (r === 'high') return { color: '#ff0000ff', fillColor: '#ff7b7b', fillOpacity: 0.25 };
  if (r === 'med') return { color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.18 };
  if (r === 'low') return { color: '#0ea5a5', fillColor: '#0ea5a5', fillOpacity: 0.12 };
}
samplePolygons.forEach(p => {
  L.polygon(p.coords, { ...styleByRisk(p.risk), weight: 2 }).addTo(floodLayer);
});

// Sample shelters
const shelters = [
  { id: 1, name: "Truly Help NGO", lat: 28.58, lon: 77.30, capacity: 250, contact: 91221617 },
  { id: 2, name: "Help In Humanity Trust", lat: 28.59, lon: 77.302, capacity: 200, contact: 81200293 },
  { id: 3, name: "Smile India Trust", lat: 28.55, lon: 77.34, capacity: 190, contact: 712758493 },
  { id: 4, name: "SPYM Shelter Home", lat: 28.59, lon: 77.24, capacity: 150, contact: 712758493 },
  { id: 5, name: "Bibharte Ngo", lat: 28.61, lon: 77.28, capacity: 50, contact: 712758493 },
  { id: 6, name: "Flood Control Room", lat: 28.74, lon: 77.22, capacity: 50, contact: 712758493 },
  { id: 7, name: "Aashray Adhikar Abhiyan", lat: 28.62, lon: 77.27, capacity: 50, contact: 712758493 },
  { id: 8, name: "Rain Basera Ashraya Adhikar Abhiyan", lat: 28.65, lon: 77.21, capacity: 50, contact: 712758493 }
];
function populateShelters() {
  const el = document.getElementById('shelterList');
  el.innerHTML = '';
  shelterLayer.clearLayers();
  shelters.forEach(s => {
    const div = document.createElement('div'); div.className = 'item';
    div.innerHTML = `<div style="flex:1"><strong>${s.name}</strong><div class="mini">${s.capacity} capacity</div><div class="mini">${s.contact} contact </div></div>
      <button class="btn" onclick="goTo(${s.lat},${s.lon})">Navigate</button>`;
    el.appendChild(div);
    const marker = L.marker([s.lat, s.lon]).addTo(shelterLayer).bindPopup(`<strong>${s.name}</strong><br/>Capacity: ${s.capacity}<br/>Contact: ${s.contact}`);
  });
}
populateShelters();

function goTo(lat, lon) {
  map.flyTo([lat, lon], 15, { duration: 1.2 });
}

/* -------------------------
   Simulated sensors & alerts
   ------------------------- */
let sensors = [];
function createSimSensors() {
  sensors = [
    { id: 'Delhi Yamuna Gauge', lat: 28.6139, lon: 77.2090, type: 'river-level' },
    { id: 'Mumbai Rain Station', lat: 19.0760, lon: 72.8777, type: 'rain-gauge' },
    { id: 'Kolkata Hooghly Gauge', lat: 22.5726, lon: 88.3639, type: 'river-level' },
    { id: 'Chennai Adyar Station', lat: 13.0827, lon: 80.2707, type: 'river-level' },
    { id: 'Lucknow Gomti Gauge', lat: 26.8467, lon: 80.9462, type: 'river-level' },
    { id: 'Patna Ganga Station', lat: 25.5941, lon: 85.1376, type: 'river-level' },
    { id: 'Guwahati Brahmaputra Gauge', lat: 26.1445, lon: 91.7362, type: 'river-level' }
  ];
  // assign random initial values
  sensors.forEach(s => s.value = Math.round(Math.random() * 80 + 20));
}
createSimSensors();

function nearestRiverSensor(lat, lon) {
  const riverSensors = sensors.filter(s => s.type === 'river-level');
  if (riverSensors.length === 0) return null;

  let nearest = riverSensors[0];
  let minDist = Math.hypot(lat - nearest.lat, lon - nearest.lon);

  riverSensors.forEach(s => {
    const d = Math.hypot(lat - s.lat, lon - s.lon);
    if (d < minDist) {
      minDist = d;
      nearest = s;
    }
  });
  return nearest;
}

function renderSensors() {
  sensorLayer.clearLayers();
  const list = document.getElementById('sensorList'); list.innerHTML = '';
  sensors.forEach(s => {
    const el = document.createElement('div'); el.className = 'item';
    el.innerHTML = `<div style="flex:1"><strong>${s.id}</strong><div class="mini">${s.type} — ${s.value}${s.type === 'rain-gauge' ? ' mm' : ' cm'}</div></div>
      <div class="badge" style="background:rgba(255,255,255,0.03);font-size:12px">${s.value}</div>`;
    list.appendChild(el);
    const icon = L.circleMarker([s.lat, s.lon], { radius: 8, fillColor: '#06b6d4', color: '#021020', weight: 1, fillOpacity: 0.9 }).addTo(sensorLayer)
      .bindPopup(`<strong>${s.id}</strong><br/>${s.type}<br/>value: ${s.value}`);
  });
  // Evaluate alerts based on sensor values (simple rules)
  evaluateAlerts();
}

function renderNearestSensor(lat, lon) {
  const sensor = nearestRiverSensor(lat, lon);
  const list = document.getElementById('sensorList');
  sensorLayer.clearLayers();
  list.innerHTML = '';

  if (!sensor) {
    list.innerHTML = '<div class="item">No river sensor nearby</div>';
    return;
  }

  const el = document.createElement('div'); el.className = 'item';
  el.innerHTML = `<div style="flex:1"><strong>${sensor.id}</strong>
    <div class="mini">${sensor.type} — ${sensor.value} cm</div></div>`;

  list.appendChild(el);

  L.circleMarker([sensor.lat, sensor.lon], {
    radius: 8, fillColor: '#06b6d4', color: '#021020', weight: 1, fillOpacity: 0.9
  }).addTo(sensorLayer)
    .bindPopup(`<strong>${sensor.id}</strong><br/>${sensor.type}<br/>value: ${sensor.value}`);
}


function simulateSensorSpike() {
  sensors.forEach(s => {
    const jump = Math.round(Math.random() * 40 + 40);
    s.value += jump;
  });
  renderSensors();
}
document.getElementById('simulateSensorSpike').addEventListener('click', simulateSensorSpike);

/* Alerts display logic */
function evaluateAlerts() {
  const alertBox = document.getElementById('alertsList'); alertBox.innerHTML = '';
  // if any river-level > 120 => high alert; rain-gauge >80 => medium
  let highest = 'low';
  sensors.forEach(s => {
    if (s.type === 'river-level' && s.value > 130) { highest = 'high'; addAlert(`${s.id} river level critical: ${s.value} cm`, 'high'); }
    else if (s.type === 'river-level' && s.value > 110) { if (highest !== 'high') highest = 'med'; addAlert(`${s.id} river rising: ${s.value} cm`, 'med'); }
    else if (s.type === 'rain-gauge' && s.value > 90) { if (highest === 'low') highest = 'med'; addAlert(`${s.id} heavy rainfall: ${s.value} mm`, 'med'); }
  });
  // AI prediction stub
  const prob = Math.min(99, Math.round((Math.random() * 40) + (highest === 'high' ? 50 : highest === 'med' ? 25 : 5)));
  document.getElementById('predVal').innerText = `${prob}%`;
  document.getElementById('leadTime').innerText = `${Math.round(Math.random() * 8) + 1} hrs`;
  if (highest === 'high') addAlert(`AI Prediction: High flood risk — take action`, 'high');
}

function addAlert(text, level = 'low') {
  const el = document.createElement('div');
  el.className = 'alert-card ' + (level === 'high' ? 'high' : level === 'med' ? 'med' : 'low');
  el.innerHTML = `<div style="flex:1"><strong>${text}</strong><div class="small">${new Date().toLocaleString()}</div></div>`;
  document.getElementById('alertsList').prepend(el);

  updateBanner();  // <-- ensure ye line hai
}


document.getElementById('clearAlerts').addEventListener('click', () => document.getElementById('alertsList').innerHTML = '');

/* Simulate rainfall button */
document.getElementById('simulateRain').addEventListener('click', () => {
  // increase rain sensors randomly
  sensors.forEach(s => {
    if (s.type === 'rain-gauge') s.value += Math.round(Math.random() * 80 + 20);
  });
  renderSensors();
  addAlert('Simulated heavy rain upstream — monitoring', 'med');
});

/* initialize sensors */
createSimSensors();

/* -------------------------
   SOS Flow (Geolocation + SMS fallback)
   ------------------------- */
let lastLocation = null;
function updateLocation() {
  if (!navigator.geolocation) { document.getElementById('locStatus').innerText = 'Geolocation not supported'; return; }
  navigator.geolocation.getCurrentPosition(pos => {
    lastLocation = [pos.coords.latitude, pos.coords.longitude];
    document.getElementById('locStatus').innerText = `Lat: ${lastLocation[0].toFixed(4)}, Lon: ${lastLocation[1].toFixed(4)}`;
  }, err => {
    document.getElementById('locStatus').innerText = 'Permission denied';
  }, { enableHighAccuracy: true, maximumAge: 60000 });
}
updateLocation();
setInterval(updateLocation, 60_000);

if (lastLocation) {
  renderNearestSensor(lastLocation[0], lastLocation[1]);
}


function sendSOS(source = 'manual') {
  const lang = document.getElementById('alertLang').value || LANG;
  const payload = {
    user: 'demo_user',
    time: new Date().toISOString(),
    source,
    lang,
    location: lastLocation || [26.85, 80.94],
    battery: Math.round(Math.random() * 60 + 20),
    note: `${source === 'sim' ? 'Simulated SOS' : 'Manually triggered SOS'}`
  };
  console.log('Sending SOS payload', payload);
  // show local notification
  showLocalNotification('SOS Sent', 'Your SOS has been sent to nearest responders');
  // push to dashboard (simulate)
  addAlert(`SOS: ${payload.note} at ${payload.location[0].toFixed(4)}, ${payload.location[1].toFixed(4)}`, 'high');

  // Try to POST to backend (placeholder)
  fetch('/api/v1/sos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    .then(r => {/* if real backend responds handle accordingly */ })
    .catch(err => {
      // fallback: construct sms link with coordinates (open device SMS if web allows)
      const coords = `${payload.location[0].toFixed(6)},${payload.location[1].toFixed(6)}`;
      const smsBody = encodeURIComponent(`EMERGENCY! Need rescue at coords: ${coords}. Please help!`);
      // On most mobile browsers, opening sms: will open SMS client
      window.location.href = `sms:+911234567890?body=${smsBody}`;
      addAlert(t('offlineSMS'), 'med');
    });
}

document.getElementById('sosBtn').addEventListener('click', () => sendSOS('manual'));
document.getElementById('fakeSos').addEventListener('click', () => sendSOS('sim'));

/* Local notification (browser) */
function showLocalNotification(title, body) {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') { new Notification(title, { body }); }
    else if (Notification.permission !== 'denied') { Notification.requestPermission().then(p => { if (p === 'granted') new Notification(title, { body }); }); }
  }
}

/* -------------------------
   Crowd-sourced uploads with verification (simulated AI)
   ------------------------- */
const pickedFiles = { file: null };
document.getElementById('pickFile').addEventListener('click', () => document.getElementById('fileInput').click());
document.getElementById('fileInput').addEventListener('change', e => {
  const f = e.target.files[0];
  pickedFiles.file = f;
  document.getElementById('filePreview').innerText = f ? `${f.name} (${Math.round(f.size / 1024)} KB)` : t('fileNone');
});
document.getElementById('sendReport').addEventListener('click', async () => {
  if (!pickedFiles.file) { alert(t('fileNone')); return; }
  // Simulate upload & AI verification
  document.getElementById('filePreview').innerText = 'Uploading...';
  await new Promise(r => setTimeout(r, 900));

  // Simulate verification probability
  const score = Math.round(Math.random() * 90 + 10);
  const verified = score > 50;
  const report = { id: Date.now(), name: pickedFiles.file.name, time: new Date().toLocaleString(), verified, score };
  addReportToList(report);
  document.getElementById('filePreview').innerText = t('reportSent');
  addAlert(`Report ${verified ? 'verified' : 'flagged for review'} — Authenticated `, verified ? 'low' : 'med');
  // Send to backend placeholder
  const form = new FormData(); form.append('file', pickedFiles.file); form.append('lat', (lastLocation ? lastLocation[0] : 26.85)); form.append('lon', (lastLocation ? lastLocation[1] : 80.94));
  fetch('/api/v1/reports', { method: 'POST', body: form }).catch(() => {/* ignore for demo */ });
  // reset
  pickedFiles.file = null;
  document.getElementById('fileInput').value = '';
});
function addReportToList(r) {
  const el = document.getElementById('reportList');
  const div = document.createElement('div'); div.className = 'item';
  div.innerHTML = `<div style="flex:1"><strong>${r.name}</strong><div class="mini">${r.time} • score ${r.score}% • ${r.verified ? 'Verified' : 'Pending'}</div></div>
    <div><button class="btn" onclick="viewReport(${r.id})">View</button></div>`;
  el.prepend(div);
  // add marker if verified
  if (r.verified) {

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        console.log("User location:", lat, lon);
        map.setView([lat, lon], 12);

        // Optional circle accuracy
        const mk = L.circleMarker([lat, lon], { radius: 6, fillColor: '#ff7b7b', fillOpacity: 0.9 }).addTo(reportLayer)
          .bindPopup(`${r.name}<br/>Score: ${r.score}%`).openPopup().addTo(map);
      },
      (err) => {
        console.warn("Location not allowed, fallback to Delhi:", err.message);
        map.setView([delhiLat, delhiLon], 12);
      }
    );


  }
}
function viewReport(id) { alert('Open report viewer (demo) — id: ' + id); }

/* -------------------------
   Digital Twin simulation (2D heat overlay + 3D waves)
   ------------------------- */
const twinModal = document.getElementById('twinModal');
document.getElementById('openTwin').addEventListener('click', () => twinModal.classList.add('show'));
document.getElementById('closeTwin').addEventListener('click', () => twinModal.classList.remove('show'));

const twinCanvas = document.getElementById('twinCanvas');
// We'll use a simple canvas overlay + THREE.js for 3D waves
let renderer, scene, camera, waveMesh, animReq;
function initTwin() {
  // create a three.js renderer inside the twinCanvas
  while (twinCanvas.firstChild) twinCanvas.removeChild(twinCanvas.firstChild);
  const w = twinCanvas.clientWidth, h = twinCanvas.clientHeight;
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(w, h);
  twinCanvas.appendChild(renderer.domElement);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000); camera.position.set(0, 30, 60);
  // light
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 50, 50); scene.add(light);
  // plane geometry as simple terrain
  const geometry = new THREE.PlaneGeometry(60, 40, 64, 48);
  const material = new THREE.MeshLambertMaterial({ color: 0x0b4f6c, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
  waveMesh = new THREE.Mesh(geometry, material);
  waveMesh.rotation.x = -Math.PI / 2;
  scene.add(waveMesh);
  animateTwin();
}
function animateTwin() {
  if (!waveMesh) return;
  const t = Date.now() * 0.001;
  waveMesh.geometry.vertices?.forEach(v => {
    // three r157 removed .vertices; use attribute manipulation instead (safe fallback)
  });
  // simpler approach: perturb via vertex shader is complex; instead rotate & color
  waveMesh.rotation.z = Math.sin(t * 0.2) * 0.05;
  renderer.render(scene, camera);
  animReq = requestAnimationFrame(animateTwin);
}

document.getElementById('runSim').addEventListener('click', () => {
  // run a simulated AI+physics job, then draw heat overlay on map and animate 3D small effect
  const rain = document.getElementById('rainIntensity').value;
  const release = document.getElementById('upstreamRelease').value;
  runSimulation(Number(rain), Number(release));
});

function runSimulation(rain, release) {
  // simulate flood spread grid centered on map center
  addAlert(`Running digital twin simulation (rain=${rain}, release=${release})`, 'med');
  // simple algorithm: create concentric polygons with risk based on combined intensity
  const center = map.getCenter();
  const radii = [0.6, 1.2, 2.2]; // degrees ~ for demo only
  floodLayer.clearLayers();
  const severity = Math.min(100, rain * 0.6 + release * 0.06 + Math.random() * 20);
  const colorScale = severity > 70 ? 'high' : severity > 40 ? 'med' : 'low';
  // draw rings (approx circle)
  radii.forEach((r, i) => {
    const points = 32;
    const coords = [];
    for (let p = 0; p < points; p++) {
      const ang = (p / points) * Math.PI * 2;
      const lat = center.lat + Math.sin(ang) * (r * (1 + i * 0.12));
      const lon = center.lng + Math.cos(ang) * (r * (1 + i * 0.12));
      coords.push([lat, lon]);
    }
    L.polygon(coords, { ...styleByRisk(i === 0 ? colorScale : (i === 1 ? 'med' : 'low')), weight: 2 }).addTo(floodLayer);
  });
  // start 3d
  if (!renderer) initTwin();
  cancelAnimationFrame(animReq); animateTwin();
}

/* -------------------------
   Volunteer signup (simple prompt)
   ------------------------- */
document.getElementById('registerVolunteer').addEventListener('click', () => {
  const name = prompt('Volunteer name:');
  const phone = prompt('Phone:');
  if (!name || !phone) return alert('Cancelled');
  addAlert(`Volunteer registered: ${name} (${phone})`, 'low');
  alert(t('volunteerThanks'));
  // send to backend placeholder
  fetch('/api/v1/volunteers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, phone }) }).catch(() => {/* ignore */ });
});

/* -------------------------
   Small utilities & placeholders
   ------------------------- */
document.getElementById('showRoutes').addEventListener('click', () => {
  alert('Evacuation routes: demo overlays. Replace with OSRM / Google Directions integration.');
});
document.getElementById('nearbyShelters').addEventListener('click', () => {
  document.getElementById('alertsList').innerHTML = '';
  addAlert(t('findingShelters'), 'low');
  // center on nearest shelter (find by geodesic distance)
  const cur = lastLocation || [26.85, 80.94];
  let nearest = shelters[0], nd = 99999;
  shelters.forEach(s => {
    const d = Math.hypot(s.lat - cur[0], s.lon - cur[1]);
    if (d < nd) { nd = d; nearest = s; }
  });
  map.flyTo([nearest.lat, nearest.lon], 15);
  addAlert(`Auto-navigation started: ${nearest.name}`, 'low');
});

if ('serviceWorker' in navigator) {
  try {
    navigator.serviceWorker.register('/sw.js').then(() => console.log('SW registered (if exists)'));
  } catch (e) { }
}

applyLanguage();

const banner = document.getElementById('topBanner');

let flashInterval = null;

// Function to update banner text based on alerts
function updateBanner() {
  const alerts = document.querySelectorAll('#alertsList .alert-card');
  let highest = 'normal';
  alerts.forEach(a => {
    if (a.classList.contains('high')) highest = 'high';
    else if (a.classList.contains('med') && highest !== 'high') highest = 'med';
  });

  if (flashInterval) { clearInterval(flashInterval); flashInterval = null; banner.style.opacity = 1; };


  if (highest === 'high') {
    banner.innerText = "⚠️ HIGH ALERT — TAKE IMMEDIATE ACTION!";
    banner.style.backgroundColor = '#dc2626'; // red
    banner.style.color = 'white';

    let visible = true;
    flashInterval = setInterval(() => {
      banner.style.opacity = visible ? 1 : 0.3;
      visible = !visible;
    }, 500);

  } else if (highest === 'med') {
    banner.innerText = "⚠️ Medium alert — stay cautious!";
    banner.style.backgroundColor = '#f59e0b'; // amber
    banner.style.color = 'black';
  } else {
    banner.innerText = LANG === 'hi' ? "सतर्क रहे, सुरक्षित रहे" : "Stay alert, Stay safe";
    banner.style.backgroundColor = '#0ea5a5'; // teal
    banner.style.color = 'white';
  }
}

// Call updateBanner periodically to reflect current alerts
setInterval(updateBanner, 5000);


addAlert('Welcome to FloodGuard Demo — map & features are simulated', 'low');



document.getElementById('volunteerQuickAction').addEventListener('click', () => {
  // sirf registered volunteers ke liye check karna optional
  const isRegistered = true; // real app me backend check kar sakte ho
  if (isRegistered) {
    window.location.href = 'volunteer-actions.html';
  } else {
    alert('❌ Only registered volunteers can access this.');
  }
});

