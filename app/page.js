'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin, Phone, Clock, Search, Shield, Zap,
  ExternalLink, AlertCircle, Plus, X, Stethoscope, Radio
} from 'lucide-react';

const TRANSLATIONS = {
  en: {
    title: "EthioCare",
    tagline: "Neighborhood Health & Clinic Finder",
    searchPlaceholder: "Search hospital, clinic, pharmacy or landmark...",
    citySelect: "Select City",
    subCitySelect: "Sub-City (Kifle Ketema)",
    allTypes: "All Types",
    openNow: "Open Now (EAT)",
    twentyFourSeven: "24/7 Service",
    cbhiAccepted: "CBHI",
    findNearestSOS: "Emergency 24/7 SOS",
    emergencyHotlines: "Emergency Hotlines",
    callNow: "Call",
    directions: "Get Route",
    close: "Close"
  },
  am: {
    title: "ኢትዮ-ኬር",
    tagline: "የአካባቢዎ የጤና ተቋማትና መድኃኒት ቤቶች መፈለጊያ",
    searchPlaceholder: "ሆስፒታል፣ ክሊኒክ፣ ፋርማሲ ወይም የታወቀ ቦታ ይፈልጉ...",
    citySelect: "ከተማ ይምረጡ",
    subCitySelect: "ክፍለ ከተማ ይምረጡ",
    allTypes: "ሁሉም አይነቶች",
    openNow: "አሁን ክፍት",
    twentyFourSeven: "24/7 ሙሉ ቀንና ሌሊት",
    cbhiAccepted: "የማህበረሰብ ጤና መድህን (CBHI)",
    findNearestSOS: "አስቸኳይ 24/7 ድንገተኛ",
    emergencyHotlines: "የአደጋ ጊዜ ስልኮች",
    callNow: "ይደውሉ",
    directions: "አቅጣጫ አሳይ",
    close: "ዝጋ"
  },
  om: {
    title: "Ito-Keer",
    tagline: "Barbaada Buufata Fayyaa fi Faarmaasii Naannoo",
    searchPlaceholder: "Hospitaala, kilinika, faarmaasii ykn iddoo beekamaa barbaadi...",
    citySelect: "Magaalaa Filadhu",
    subCitySelect: "Kifla Magaalaa",
    allTypes: "Gosa Hunda",
    openNow: "Amma Banaa",
    twentyFourSeven: "Tajaajila 24/7",
    cbhiAccepted: "Wabii Fayyaa (CBHI)",
    findNearestSOS: "Balaa Ariifachiisaa 24/7",
    emergencyHotlines: "Lakkoofsota Balaa",
    callNow: "Bilbili",
    directions: "Kallattii",
    close: "Cufi"
  }
};

const ADDIS_SUBCITIES = [
  "Bole", "Kirkos", "Yeka", "Lideta", "Arada", "Gullele", 
  "Addis Ketema", "Nifas Silk-Lafto", "Kolfe Keranio", "Akaky Kaliti", "Lemi Kura"
];

const EMERGENCY_HOTLINES = [
  { code: "907", name: "Addis Ababa Fire & Emergency Ambulance", desc: "የአዲስ አበባ አምቡላንስና አደጋ መቆጣጠሪያ" },
  { code: "8877", name: "Ethiopian Red Cross Ambulance", desc: "የኢትዮጵያ ቀይ መስቀል ማህበር አምቡላንስ" },
  { code: "911", name: "Federal Police Emergency", desc: "ፌዴራል ፖሊስ አስቸኳይ ድንገተኛ ጥሪ" },
  { code: "8335", name: "EPHI Health Guidance Helpline", desc: "የህብረተሰብ ጤና ኢንስቲትዩት የጤና መረጃ" }
];

export default function HomePage() {
  const [lang, setLang] = useState('en');
  const t = TRANSLATIONS[lang];

  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('Addis Ababa');
  const [subCityFilter, setSubCityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [filter247, setFilter247] = useState(false);
  const [filterCBHI, setFilterCBHI] = useState(false);
  const [filterOpenNow, setFilterOpenNow] = useState(false);

  const [showHotlines, setShowHotlines] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef({});

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cityFilter) params.append('city', cityFilter);
      if (subCityFilter !== 'all') params.append('subCity', subCityFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (filter247) params.append('is24_7', 'true');
      if (filterCBHI) params.append('cbhi', 'true');
      if (filterOpenNow) params.append('openNow', 'true');
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/facilities?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setFacilities(json.data || []);
      }
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [cityFilter, subCityFilter, typeFilter, filter247, filterCBHI, filterOpenNow]);

  // Leaflet map setup
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;
    const L = require('leaflet');

    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current, { zoomControl: false }).setView([9.0182, 38.7525], 13);
      L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19
      }).addTo(leafletMap.current);
    }

    // Clear old markers
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
          setSelectedFacility(fac);
          leafletMap.current.flyTo([fac.latitude, fac.longitude], 15);
        });

      markersRef.current[fac.id] = marker;
    });

    if (facilities.length > 0 && !selectedFacility) {
      const group = L.featureGroup(Object.values(markersRef.current));
      leafletMap.current.fitBounds(group.getBounds().pad(0.2));
    }
  }, [facilities]);

  const triggerSOS = () => {
    setTypeFilter('pharmacy');
    setFilter247(true);
    setFilterOpenNow(true);
    showToast("SOS Mode: Showing open 24/7 night pharmacies");
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-emerald-500 text-xs font-semibold flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-emerald-800 text-white px-4 py-2.5 flex items-center justify-between shadow-md z-20">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-600 p-2 rounded-lg text-white">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight leading-none">{t.title}</h1>
            <p className="text-[11px] text-emerald-200 hidden sm:block">{t.tagline}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerSOS}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">{t.findNearestSOS}</span>
          </button>

          <button
            onClick={() => setShowHotlines(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-xs font-semibold"
          >
            <Phone className="w-3 h-3" />
            <span>907 / 8877</span>
          </button>

          <div className="flex bg-emerald-950 rounded-lg p-0.5 text-xs font-medium">
            {['en', 'am', 'om'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-0.5 rounded ${lang === l ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-300'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-full md:w-[420px] bg-white border-r border-slate-200 flex flex-col z-10 shadow">
          {/* Search & Filters */}
          <div className="p-3 border-b border-slate-100 space-y-2 bg-slate-50/60">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchFacilities()}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={cityFilter}
                onChange={(e) => {
                  setCityFilter(e.target.value);
                  setSubCityFilter('all');
                }}
                className="bg-white border border-slate-200 text-xs rounded-md p-1.5 focus:outline-none"
              >
                <option value="Addis Ababa">Addis Ababa</option>
                <option value="Adama">Adama</option>
                <option value="Hawassa">Hawassa</option>
              </select>

              <select
                value={subCityFilter}
                onChange={(e) => setSubCityFilter(e.target.value)}
                disabled={cityFilter !== 'Addis Ababa'}
                className="bg-white border border-slate-200 text-xs rounded-md p-1.5 focus:outline-none disabled:opacity-50"
              >
                <option value="all">{t.subCitySelect}</option>
                {ADDIS_SUBCITIES.map((sc) => (
                  <option key={sc} value={sc}>{sc}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-1.5 pt-0.5">
              <button
                onClick={() => setFilter247(!filter247)}
                className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                  filter247 ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                24/7
              </button>
              <button
                onClick={() => setFilterCBHI(!filterCBHI)}
                className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                  filterCBHI ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                {t.cbhiAccepted}
              </button>
              <button
                onClick={() => setFilterOpenNow(!filterOpenNow)}
                className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                  filterOpenNow ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                {t.openNow}
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading facilities...</div>
            ) : facilities.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <AlertCircle className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                <p className="text-xs font-semibold">No facilities found</p>
              </div>
            ) : (
              facilities.map((fac) => {
                const name = lang === 'am' ? fac.name_am : lang === 'om' ? fac.name_om : fac.name_en;
                const landmark = lang === 'am' ? fac.landmark_am : fac.landmark_en;
                const isSelected = selectedFacility?.id === fac.id;

                return (
                  <div
                    key={fac.id}
                    onClick={() => {
                      setSelectedFacility(fac);
                      if (leafletMap.current && fac.latitude && fac.longitude) {
                        leafletMap.current.flyTo([fac.latitude, fac.longitude], 15);
                      }
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition ${
                      isSelected ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500' : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        fac.type === 'public_hospital' ? 'bg-red-100 text-red-800' :
                        fac.type === 'pharmacy' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {fac.type.replace('_', ' ')}
                      </span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${fac.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        {fac.isOpen ? 'Open Now' : 'Closed'}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-xs mt-1 leading-snug">{name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{fac.sub_city ? `${fac.sub_city}, ` : ''}{fac.city} • {landmark}</span>
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                      <a
                        href={`tel:${fac.phone_primary}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        {fac.phone_primary}
                      </a>
                      <div className="flex gap-1">
                        {fac.accepts_cbhi && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] px-1 py-0.5 rounded font-bold">
                            CBHI
                          </span>
                        )}
                        {fac.is_24_7 && (
                          <span className="bg-red-50 text-red-700 border border-red-200 text-[9px] px-1 py-0.5 rounded font-bold">
                            24/7
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Map */}
        <main className="flex-1 h-full relative">
          <div ref={mapRef} className="w-full h-full" />

          {selectedFacility && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white p-4 rounded-xl shadow-xl border border-slate-200 z-20">
              <div className="flex justify-between items-start">
                <h2 className="font-bold text-sm text-slate-900">
                  {lang === 'am' ? selectedFacility.name_am : selectedFacility.name_en}
                </h2>
                <button onClick={() => setSelectedFacility(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{selectedFacility.landmark_en}</span>
              </p>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-100">
                <a
                  href={`tel:${selectedFacility.phone_primary}`}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-center py-1.5 rounded-lg text-xs font-bold"
                >
                  {t.callNow}
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.latitude},${selectedFacility.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-center py-1.5 rounded-lg text-xs font-bold"
                >
                  {t.directions}
                </a>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Hotlines Modal */}
      {showHotlines && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">{t.emergencyHotlines}</h3>
              <button onClick={() => setShowHotlines(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {EMERGENCY_HOTLINES.map((h) => (
                <div key={h.code} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{h.name}</h4>
                    <p className="text-[10px] text-slate-500">{h.desc}</p>
                  </div>
                  <a
                    href={`tel:${h.code}`}
                    className="px-2.5 py-1 bg-red-600 text-white font-bold text-xs rounded-md shadow hover:bg-red-700"
                  >
                    {h.code}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}