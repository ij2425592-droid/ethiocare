'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function MapComponent({ facilities, selectedFacility, onSelectFacility }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current, { zoomControl: false }).setView([9.0182, 38.7525], 13);
      L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19
      }).addTo(leafletMap.current);
    }

    // Clear existing markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    facilities.forEach((fac) => {
      if (!fac.latitude || !fac.longitude) return;

      const color = fac.type === 'public_hospital' ? '#dc2626' :
                    fac.type === 'pharmacy' ? '#16a34a' : '#2563eb';

      const customHtml = `
        <div style="background-color: ${color}; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); cursor: pointer;">
          <span style="color: white; font-size: 15px;">
            ${fac.type === 'pharmacy' ? '💊' : fac.type === 'public_hospital' ? '🏥' : '🩺'}
          </span>
        </div>
      `;

      const icon = L.divIcon({
        html: customHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker([fac.latitude, fac.longitude], { icon })
        .addTo(leafletMap.current)
        .on('click', () => {
          onSelectFacility(fac);
          leafletMap.current.flyTo([fac.latitude, fac.longitude], 15);
        });

      markersRef.current[fac.id] = marker;
    });

    if (facilities.length > 0 && !selectedFacility) {
      const group = L.featureGroup(Object.values(markersRef.current));
      leafletMap.current.fitBounds(group.getBounds().pad(0.2));
    }
  }, [facilities]);

  useEffect(() => {
    if (selectedFacility && leafletMap.current && selectedFacility.latitude && selectedFacility.longitude) {
      leafletMap.current.flyTo([selectedFacility.latitude, selectedFacility.longitude], 15);
    }
  }, [selectedFacility]);

  return <div ref={mapRef} className="w-full h-full" />;
}