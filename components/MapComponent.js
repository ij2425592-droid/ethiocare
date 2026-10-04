'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Navigation, Crosshair, ZoomIn, ZoomOut, Phone, Compass } from 'lucide-react';

const TILE_LAYERS = {
  humanitarian: {
    name: 'Health Map (OSM Hot)',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles courtesy of Humanitarian OpenStreetMap Team',
    maxZoom: 19,
  },
  standard: {
    name: 'Standard Street',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
};

export default function MapComponent({
  facilities = [],
  selectedFacility = null,
  onSelectFacility,
  userLocation = null,
  onLocateUser,
  lang = 'en',
}) {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);
  const userCircleRef = useRef(null);
  const activeTileLayerRef = useRef(null);
  const [currentLayerKey, setCurrentLayerKey] = useState('humanitarian');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.container || mapContainerRef.current, {
        zoomControl: false,
        attributionControl: true,
      }).setView([9.0182, 38.7525], 13); // Default Addis Ababa center

      leafletMapRef.current = map;

      // Add base tile layer
      const layerConfig = TILE_LAYERS[currentLayerKey];
      const tileLayer = L.tileLayer(layerConfig.url, {
        attribution: layerConfig.attribution,
        maxZoom: layerConfig.maxZoom,
        subdomains: 'abc',
      }).addTo(map);

      activeTileLayerRef.current = tileLayer;

      // Move attribution control to bottom-right with compact styling
      map.attributionControl.setPosition('bottomright');
    }

    return () => {
      // Map cleanup if needed on unmount
    };
  }, []);

  // Handle Layer Switch
  const switchLayer = (key) => {
    if (!leafletMapRef.current || !TILE_LAYERS[key]) return;
    if (activeTileLayerRef.current) {
      leafletMapRef.current.removeLayer(activeTileLayerRef.current);
    }
    const layerConfig = TILE_LAYERS[key];
    const newLayer = L.tileLayer(layerConfig.url, {
      attribution: layerConfig.attribution,
      maxZoom: layerConfig.maxZoom,
      subdomains: 'abc',
    }).addTo(leafletMapRef.current);

    activeTileLayerRef.current = newLayer;
    setCurrentLayerKey(key);
  };

  // Update Markers when facilities list changes
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    // Clear existing facility markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    facilities.forEach((fac) => {
      if (!fac.latitude || !fac.longitude) return;

      const isSelected = selectedFacility?.id === fac.id;
      const isEmergency = fac.is_24_7 || fac.type === 'ambulance_hub' || fac.type === 'public_hospital';

      // Determine marker colors & icons
      let bgColor = '#dc2626'; // Red
      let ringColor = 'rgba(220, 38, 38, 0.35)';
      let iconEmoji = '🏥';

      if (fac.type === 'pharmacy') {
        bgColor = '#059669'; // Emerald
        ringColor = 'rgba(5, 150, 105, 0.35)';
        iconEmoji = '💊';
      } else if (fac.type === 'private_hospital') {
        bgColor = '#2563eb'; // Blue
        ringColor = 'rgba(37, 99, 235, 0.35)';
        iconEmoji = '🏢';
      } else if (fac.type === 'diagnostic_lab') {
        bgColor = '#d97706'; // Amber
        ringColor = 'rgba(217, 119, 6, 0.35)';
        iconEmoji = '🔬';
      } else if (fac.type === 'ambulance_hub') {
        bgColor = '#be123c'; // Rose
        ringColor = 'rgba(190, 18, 60, 0.45)';
        iconEmoji = '🚑';
      } else if (fac.type === 'clinic') {
        bgColor = '#0d9488'; // Teal
        ringColor = 'rgba(13, 148, 136, 0.35)';
        iconEmoji = '🩺';
      }

      const displayName = lang === 'am' ? fac.name_am : lang === 'om' ? fac.name_om : fac.name_en;
      const displayLandmark = lang === 'am' ? fac.landmark_am : fac.landmark_en;

      const markerHtml = `
        <div class="custom-marker-pin ${isSelected ? 'marker-selected' : ''}" style="
          position: relative;
          width: ${isSelected ? '44px' : '36px'};
          height: ${isSelected ? '44px' : '36px'};
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${bgColor};
          border: 2.5px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 4px 14px rgba(0,0,0,0.35);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        ">
          ${
            isEmergency
              ? `<div style="
                  position: absolute;
                  inset: -6px;
                  border-radius: 50%;
                  background: ${ringColor};
                  animation: markerPulse 2s infinite ease-in-out;
                  z-index: -1;
                "></div>`
              : ''
          }
          <span style="font-size: ${isSelected ? '20px' : '16px'}; line-height: 1;">${iconEmoji}</span>
          ${
            fac.accepts_cbhi
              ? `<div style="
                  position: absolute;
                  bottom: -4px;
                  right: -4px;
                  background: #047857;
                  color: white;
                  font-size: 8px;
                  font-weight: 800;
                  padding: 1px 4px;
                  border-radius: 9999px;
                  border: 1.5px solid white;
                ">CBHI</div>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-map-icon',
        iconSize: isSelected ? [44, 44] : [36, 36],
        iconAnchor: isSelected ? [22, 22] : [18, 18],
        popupAnchor: [0, -22],
      });

      const marker = L.marker([fac.latitude, fac.longitude], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : isEmergency ? 500 : 100,
      }).addTo(map);

      // Bind rich popup
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 max-w-[260px] text-slate-800 font-sans';
      popupContent.innerHTML = `
        <div style="font-family: inherit;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <span style="
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              padding: 2px 6px;
              border-radius: 4px;
              background: ${fac.isOpen ? '#dcfce7' : '#f1f5f9'};
              color: ${fac.isOpen ? '#166534' : '#475569'};
            ">
              ${fac.isOpen ? '● Open Now' : 'Closed'}
            </span>
            ${
              fac.is_24_7
                ? `<span style="font-size: 10px; font-weight: 800; color: #dc2626; background: #fee2e2; padding: 2px 6px; border-radius: 4px;">24/7 ER</span>`
                : ''
            }
          </div>
          <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; line-height: 1.3; margin: 4px 0;">${displayName}</h4>
          <p style="font-size: 11px; color: #64748b; margin-bottom: 8px; line-height: 1.3;">📍 ${displayLandmark || fac.city}</p>
          
          <div style="display: flex; gap: 6px; margin-top: 8px;">
            <a href="tel:${fac.phone_primary}" style="
              flex: 1;
              text-align: center;
              background: #047857;
              color: white;
              font-size: 11px;
              font-weight: 700;
              padding: 6px 8px;
              border-radius: 6px;
              text-decoration: none;
              display: inline-block;
            ">📞 Call</a>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${fac.latitude},${fac.longitude}" target="_blank" rel="noreferrer" style="
              flex: 1;
              text-align: center;
              background: #f1f5f9;
              color: #1e293b;
              font-size: 11px;
              font-weight: 700;
              padding: 6px 8px;
              border-radius: 6px;
              text-decoration: none;
              display: inline-block;
            ">🧭 Route</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 280,
        className: 'custom-leaflet-popup',
      });

      marker.on('click', () => {
        onSelectFacility(fac);
      });

      markersRef.current[fac.id] = marker;
    });

    // If facilities loaded and no specific facility selected, fit view
    if (facilities.length > 0 && !selectedFacility) {
      const group = L.featureGroup(Object.values(markersRef.current));
      if (group.getLayers().length > 0) {
        map.fitBounds(group.getBounds().pad(0.15), { maxZoom: 15 });
      }
    }
  }, [facilities, lang, selectedFacility]);

  // Handle selected facility flyTo & popup open
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !selectedFacility) return;

    if (selectedFacility.latitude && selectedFacility.longitude) {
      map.flyTo([selectedFacility.latitude, selectedFacility.longitude], 15, {
        animate: true,
        duration: 1.2,
      });

      const targetMarker = markersRef.current[selectedFacility.id];
      if (targetMarker) {
        targetMarker.openPopup();
      }
    }
  }, [selectedFacility]);

  // Handle user location marker
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (userLocation && userLocation.lat && userLocation.lng) {
      if (userMarkerRef.current) userMarkerRef.current.remove();
      if (userCircleRef.current) userCircleRef.current.remove();

      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="
            position: relative;
            width: 22px;
            height: 22px;
            background: #2563eb;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 12px rgba(37, 99, 235, 0.8);
          ">
            <div style="
              position: absolute;
              inset: -8px;
              border-radius: 50%;
              background: rgba(37, 99, 235, 0.3);
              animation: userRadarPulse 2s infinite ease-out;
            "></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 2000,
      })
        .addTo(map)
        .bindTooltip('📍 Your Location', { permanent: false, direction: 'top' });

      userCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
        radius: userLocation.accuracy || 150,
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        weight: 1.5,
      }).addTo(map);

      map.flyTo([userLocation.lat, userLocation.lng], 14);
    }
  }, [userLocation]);

  const handleFitAll = () => {
    if (!leafletMapRef.current) return;
    const group = L.featureGroup(Object.values(markersRef.current));
    if (group.getLayers().length > 0) {
      leafletMapRef.current.fitBounds(group.getBounds().pad(0.15));
    }
  };

  const handleZoomIn = () => leafletMapRef.current?.zoomIn();
  const handleZoomOut = () => leafletMapRef.current?.zoomOut();

  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden select-none">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        {/* Layer Switcher */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/80 p-1 flex flex-col gap-1">
          <button
            onClick={() => switchLayer(currentLayerKey === 'humanitarian' ? 'standard' : 'humanitarian')}
            title="Switch Map Tile Style"
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              currentLayerKey === 'humanitarian'
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-slate-50 text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline text-[11px] font-bold">
              {currentLayerKey === 'humanitarian' ? 'Health Map' : 'Standard'}
            </span>
          </button>
        </div>

        {/* Locate User Button */}
        {onLocateUser && (
          <button
            onClick={onLocateUser}
            title="Locate My Current GPS Position"
            className="p-2.5 bg-white/95 hover:bg-emerald-50 backdrop-blur-md text-slate-800 hover:text-emerald-700 rounded-xl shadow-lg border border-slate-200/80 transition flex items-center justify-center group"
          >
            <Crosshair className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
          </button>
        )}

        {/* Zoom Controls & Fit */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/80 flex flex-col overflow-hidden">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-2 hover:bg-slate-100 text-slate-700 border-b border-slate-100 transition flex items-center justify-center"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-2 hover:bg-slate-100 text-slate-700 border-b border-slate-100 transition flex items-center justify-center"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleFitAll}
            title="Fit All Facilities in View"
            className="p-2 hover:bg-slate-100 text-slate-700 transition flex items-center justify-center"
          >
            <Compass className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Map Marker Legend Floating Bar */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-md rounded-xl px-3 py-1.5 shadow-md border border-slate-200/80 hidden md:flex items-center gap-3 text-[11px] text-slate-700 font-semibold">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
          <span>Public Hospital</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
          <span>Private Hospital</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
          <span>24/7 Pharmacy</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block"></span>
          <span>Specialty Clinic</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span>
          <span>Diagnostics / Lab</span>
        </div>
      </div>
    </div>
  );
}