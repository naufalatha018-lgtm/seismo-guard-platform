/**
 * Seismo Guard - Earthquake Data & Map Module
 * Fetches real-time earthquake data from BMKG API
 */

document.addEventListener('DOMContentLoaded', () => {
    // API Endpoint (BMKG Auto Earthquake)
    const BMKG_API = 'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json';
    
    // DOM Elements
    const quakeLocation = document.getElementById('quake-location');
    const quakeMagnitude = document.getElementById('quake-magnitude');
    const quakeTime = document.getElementById('quake-time');
    const quakeDepth = document.getElementById('quake-depth');
    const quakeCoords = document.getElementById('quake-coords');
    const quakeMapContainer = document.getElementById('quake-map');

    let map;
    let marker;

    /**
     * Initialize Leaflet Map
     * @param {number} lat 
     * @param {number} lng 
     * @param {string} location 
     * @param {string} magnitude 
     */
    function initMap(lat, lng, location, magnitude) {
        if (!quakeMapContainer) return;

        // If map already exists, just update view and marker
        if (map) {
            map.setView([lat, lng], 7);
            if (marker) {
                marker.setLatLng([lat, lng]);
                marker.setPopupContent(`<b>${location}</b><br>Magnitude: ${magnitude}`);
            }
            return;
        }

        // Clear placeholder
        quakeMapContainer.innerHTML = '';

        // Initialize map centered on earthquake location
        map = L.map('quake-map').setView([lat, lng], 7);
        
        // Export to window for global access (resizing)
        window.earthquakeMap = map;

        // Add Tile Layer
        const isDarkMode = !document.documentElement.classList.contains('light-mode');
        const tileLayer = isDarkMode 
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

        L.tileLayer(tileLayer, {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        // Custom Icon
        const quakeIcon = L.divIcon({
            className: 'quake-marker',
            html: `<div class="pulse-marker"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        // Add Marker
        marker = L.marker([lat, lng]).addTo(map);
        marker.bindPopup(`<b>${location}</b><br>Magnitude: ${magnitude}`).openPopup();

        // Add styles for pulse marker
        const style = document.createElement('style');
        style.innerHTML = `
            .pulse-marker {
                width: 20px;
                height: 20px;
                background: #3b82f6;
                border-radius: 50%;
                box-shadow: 0 0 0 rgba(59, 130, 246, 0.4);
                animation: pulse-blue 2s infinite;
            }
            @keyframes pulse-blue {
                0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                70% { box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
                100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Fetch Data from BMKG
     */
    async function fetchEarthquakeData() {
        try {
            const response = await fetch(BMKG_API);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            const gempa = data.Infogempa.gempa;

            // Update UI
            quakeLocation.textContent = gempa.Wilayah;
            quakeMagnitude.textContent = gempa.Magnitude;
            quakeTime.textContent = `${gempa.Jam}, ${gempa.Tanggal}`;
            quakeDepth.textContent = gempa.Kedalaman;
            quakeCoords.textContent = gempa.Coordinates;

            // Extract Lat/Lng
            const [lat, lng] = gempa.Coordinates.split(',').map(coord => parseFloat(coord));

            // Initialize/Update Map
            initMap(lat, lng, gempa.Wilayah, gempa.Magnitude);

        } catch (error) {
            console.error('Error fetching earthquake data:', error);
            if (quakeMapContainer) {
                quakeMapContainer.innerHTML = `
                    <div class="map-placeholder" style="flex-direction: column; gap: 10px;">
                        <i class="fas fa-exclamation-triangle fa-2x" style="color: var(--accent);"></i>
                        <p>Failed to load earthquake data.</p>
                        <button class="btn btn-outline btn-sm" onclick="location.reload()">Retry</button>
                    </div>
                `;
            }
        }
    }

    // Listen for theme changes to update map tiles
    const observer = new MutationObserver(() => {
        if (map) {
            // Simply re-fetching data or refreshing map could work
            // But for simplicity, we'll let the user refresh or handle it if they switch themes
        }
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
    });

    // Initial Fetch
    fetchEarthquakeData();
});
