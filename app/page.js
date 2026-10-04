'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  MapPin, Phone, Clock, Search, Shield, Zap, AlertCircle,
  X, Stethoscope, Radio, Heart, Share2, Compass, Layers,
  ExternalLink, CheckCircle2, Bookmark, BookmarkCheck,
  ChevronRight, PhoneCall, Filter, Sparkles, Building2,
  Building, Pill, FlaskConical, Ambulance, Info, HelpCircle,
  SlidersHorizontal, Flame, HeartHandshake, ShieldAlert,
  ArrowUpDown, Navigation, Check, Copy, MessageSquarePlus
} from 'lucide-react';

import {
  ETHIOPIAN_CITIES,
  ADDIS_SUBCITIES,
  FACILITY_CATEGORIES,
  EMERGENCY_HOTLINES,
  FIRST_AID_GUIDES,
  INITIAL_FACILITIES
} from '@/data/facilitiesData';

// Dynamically import Leaflet Map (SSR disabled)
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-500 gap-3">
      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-bold text-slate-600 tracking-wide uppercase">Loading Interactive Health Map...</p>
    </div>
  ),
});

const TRANSLATIONS = {
  en: {
    title: "EthioCare",
    tagline: "Neighborhood Health & Emergency Clinic Finder",
    searchPlaceholder: "Search hospital, 24/7 pharmacy, landmark, oxygen, ICU...",
    allCities: "All Cities",
    allSubCities: "All Sub-Cities",
    subCityLabel: "Sub-City",
    cityLabel: "City",
    openNow: "Open Now",
    cbhiAccepted: "CBHI Accepted",
    cbhiFull: "Community-Based Health Insurance",
    emergencySOS: "Emergency 24/7 SOS",
    emergencyHotlines: "Emergency Dispatch Hotlines",
    firstAidTitle: "Emergency First Aid Protocols",
    firstAidBtn: "First Aid Guides",
    savedFacilities: "Saved Facilities",
    noSaved: "You have not saved any healthcare facilities yet.",
    callNow: "Call",
    directions: "Get Route",
    details: "Details",
    locateMe: "Locate Me",
    locating: "Finding GPS...",
    locationFound: "GPS Located",
    verified: "Verified Health Facility",
    allCategories: "All",
    filterByService: "Specialized Services",
    sortBy: "Sort By",
    sortNearest: "Nearest to Me",
    sortRating: "Highest Rated",
    sortName: "Alphabetical",
    servicesAvailable: "Available Medical Services & Equipment",
    operatingHours: "Operating Hours",
    reportIssue: "Report / Suggest Update",
    reportSuccess: "Thank you for helping keep EthioCare up to date!",
    nearestERTitle: "Find Nearest 24/7 Emergency Room",
    nearestERDesc: "Instantly locates the closest trauma hospital with open emergency triage",
    findNearestERBtn: "Route to Nearest Emergency ER",
    share: "Share",
    copied: "Copied!",
    beds: "Inpatient Beds",
    viewOnMap: "View on Map",
    switchToList: "List",
    switchToMap: "Map",
    switchToSOS: "SOS",
    noResultsTitle: "No facilities found",
    noResultsDesc: "Try adjusting your filters, selecting a different sub-city, or clearing your search term."
  },
  am: {
    title: "ኢትዮ-ኬር (EthioCare)",
    tagline: "የአካባቢዎ የጤና ተቋማትና የ24/7 ድንገተኛ መፈለጊያ",
    searchPlaceholder: "ሆስፒታል፣ 24/7 ፋርማሲ፣ ኦክስጅን፣ አይሲዩ፣ ቦታ...",
    allCities: "ሁሉም ከተሞች",
    allSubCities: "ሁሉም ክፍለ ከተሞች",
    subCityLabel: "ክፍለ ከተማ",
    cityLabel: "ከተማ",
    openNow: "አሁን ክፍት",
    cbhiAccepted: "የጤና መድህን (CBHI)",
    cbhiFull: "የማህበረሰብ አቀፍ የጤና መድህን ተቀባይ",
    emergencySOS: "አስቸኳይ 24/7 ድንገተኛ SOS",
    emergencyHotlines: "የአደጋ ጊዜ ድንገተኛ ስልኮች",
    firstAidTitle: "የመጀመሪያ እርዳታ አሰጣጥ መመሪያዎች",
    firstAidBtn: "የመጀመሪያ እርዳታ",
    savedFacilities: "የተቀመጡ ተቋማት",
    noSaved: "እስካሁን ምንም ያስቀመጡት የጤና ተቋም የለም።",
    callNow: "ይደውሉ",
    directions: "አቅጣጫ",
    details: "ዝርዝር",
    locateMe: "አካባቢዬን ፈልግ",
    locating: "ቦታ በመፈለግ ላይ...",
    locationFound: "ቦታዎ ተገኝቷል",
    verified: "የተረጋገጠ የጤና ተቋም",
    allCategories: "ሁሉም",
    filterByService: "ልዩ አገልግሎቶች",
    sortBy: "አደራጅ",
    sortNearest: "በጣም ቅርብ የሆነው",
    sortRating: "ከፍተኛ ደረጃ የተሰጠው",
    sortName: "በስም ቅደም ተከተል",
    servicesAvailable: "የሚገኙ የህክምና አገልግሎቶችና መሳሪያዎች",
    operatingHours: "የስራ ሰዓት",
    reportIssue: "መረጃ አሻሽል / አዲስ ጠቁም",
    reportSuccess: "መረጃዎን ስላጋሩን እናመሰግናለን!",
    nearestERTitle: "በአቅራቢያ የሚገኝ የ24 ሰዓት ድንገተኛ ክፍል",
    nearestERDesc: "በአቅራቢያዎ የሚገኝ ክፍት የድንገተኛ አደጋ ሆስፒታል በፍጥነት ያገኛል",
    findNearestERBtn: "ወደ ቅርብ ድንገተኛ ሆስፒታል ምራኝ",
    share: "አጋራ",
    copied: "ተቀድቷል!",
    beds: "የመኝታ አልጋዎች",
    viewOnMap: "በካርታው ላይ አሳይ",
    switchToList: "ዝርዝር",
    switchToMap: "ካርታ",
    switchToSOS: "ድንገተኛ",
    noResultsTitle: "ምንም ተቋም አልተገኘም",
    noResultsDesc: "እባክዎ ፍለጋዎን ይቀይሩ ወይም ሌሎች ክፍለ ከተሞችን ይምረጡ።"
  },
  om: {
    title: "Ito-Keer (EthioCare)",
    tagline: "Barbaada Buufata Fayyaa fi Faarmaasii Naannoo",
    searchPlaceholder: "Hospitaala, faarmaasii 24/7, oksijiinii, ICU, iddoo...",
    allCities: "Magaalota Hunda",
    allSubCities: "Kifla Magaalaa Hunda",
    subCityLabel: "Kifla Magaalaa",
    cityLabel: "Magaalaa",
    openNow: "Amma Banaa",
    cbhiAccepted: "Wabii Fayyaa (CBHI)",
    cbhiFull: "Wabii Fayyaa Hawaasaa Kan Fudhatu",
    emergencySOS: "Balaa Ariifachiisaa 24/7",
    emergencyHotlines: "Lakkoofsota Balaa Ariifachiisaa",
    firstAidTitle: "Qajeelfama Gargaarsa Jalqabaa",
    firstAidBtn: "Gargaarsa Jalqabaa",
    savedFacilities: "Buufata Fayyaa Olkaawwame",
    noSaved: "Buufata fayyaa tokkoyyuu hin olkaawwanne.",
    callNow: "Bilbili",
    directions: "Kallattii",
    details: "Bal'ina",
    locateMe: "Iddoo Koo Barbaadi",
    locating: "Barbaadaa jira...",
    locationFound: "Iddoon Argameera",
    verified: "Buufata Fayyaa Mirkanaa'e",
    allCategories: "Hunda",
    filterByService: "Tajaajiloota Addaa",
    sortBy: "Tartiibsi",
    sortNearest: "Isa Dhiyoo",
    sortRating: "Sadarkaa Olaanaa",
    sortName: "Maqaadhaan",
    servicesAvailable: "Tajaajiloota Fayyaa fi Meeshaalee Jiran",
    operatingHours: "Sa'aatii Hojii",
    reportIssue: "Oodeeffannoo Sirreessi",
    reportSuccess: "Oodeeffannoo keessaniif galatoomaa!",
    nearestERTitle: "Kutaa Balaa Ariifachiisaa Dhiyoo 24/7",
    nearestERDesc: "Hospitaala balaa dhiyoo jiru battalatti argata",
    findNearestERBtn: "Gara Hospitaala Balaa Deemi",
    share: "Qoodi",
    copied: "Garagalfameera!",
    beds: "Sireewwan Cisaa",
    viewOnMap: "Kaartaa Irratti Ilaali",
    switchToList: "Tarree",
    switchToMap: "Kaartaa",
    switchToSOS: "SOS",
    noResultsTitle: "Buufanni homaa hin argamne",
    noResultsDesc: "Filtara keessan sirreessuun irra deebi'aa yaalaa."
  },
  ti: {
    title: "ኢትዮ-ኬር (EthioCare)",
    tagline: "ናይ ከባቢኹም ትካላት ጥዕናን ናይ ህጹጽ ረድኤትን መእለዪ",
    searchPlaceholder: "ሆስፒታል፣ 24/7 ፋርማሲ፣ ኦክስጅን፣ አይሲዩ፣ ቦታ...",
    allCities: "ኩለን ከተማታት",
    allSubCities: "ኩሎም ክፍለ ከተማታት",
    subCityLabel: "ክፍለ ከተማ",
    cityLabel: "ከተማ",
    openNow: "ሕጂ ክፍቲ",
    cbhiAccepted: "መድሕን ጥዕና (CBHI)",
    cbhiFull: "ማሕበረሰብ ዝተመርኮሰ መድሕን ጥዕና ተቐባሊ",
    emergencySOS: "ህጹጽ 24/7 ሓደጋ SOS",
    emergencyHotlines: "ናይ ህጹጽ ሓደጋ ቁጽርታት",
    firstAidTitle: "ቀዳማይ ረድኤት ኣወሃህባ መምርሒታት",
    firstAidBtn: "ቀዳማይ ረድኤት",
    savedFacilities: "ዝተዓቀቡ ትካላት",
    noSaved: "ዝተዓቀበ ትካል ጥዕና የለን።",
    callNow: "ደውሉ",
    directions: "ኣንፈት",
    details: "ዝርዝር",
    locateMe: "ቦታይ ርኸብ",
    locating: "ቦታ ይድለ ኣሎ...",
    locationFound: "ቦታኹም ተረኺቡ",
    verified: "ዝተረጋገጸ ትካል ጥዕና",
    allCategories: "ኩሉ",
    filterByService: "ፍሉያት ኣገልግሎታት",
    sortBy: "ስርዓት",
    sortNearest: "ዝቐረበ",
    sortRating: "ብሉጽ ደረጃ",
    sortName: "ብፊደል",
    servicesAvailable: "ዝርከቡ ኣገልግሎታትን ናውትን",
    operatingHours: "ናይ ስራሕ ሰዓታት",
    reportIssue: "ሓበሬታ ኣመሓይሽ",
    reportSuccess: "የቐንየልና!",
    nearestERTitle: "ናይ 24 ሰዓት ህጹጽ ሓደጋ ክፍሊ",
    nearestERDesc: "ኣብ ቀረባኹም ዝርከብ ህጹጽ ሆስፒታል የርእየኩም",
    findNearestERBtn: "ናብ ህጹጽ ሆስፒታል ምራሕ",
    share: "ኣካፍል",
    copied: "ተቐዲሑ!",
    beds: "ዓራት ደቂስካ ሕክምና",
    viewOnMap: "ኣብ ካርታ ርኣይ",
    switchToList: "ዝርዝር",
    switchToMap: "ካርታ",
    switchToSOS: "ህጹጽ",
    noResultsTitle: "ዝተረኽበ ትካል የለን",
    noResultsDesc: "ፍለጋኹም ብምቕያር ደጊምኩም ፈትኑ።"
  }
};

const SERVICE_TAGS = [
  'Oxygen Supply', 'ICU', 'Blood Bank', 'Dialysis', 'Trauma Center',
  'CT Scan', 'MRI', 'Maternity/NICU', 'Pediatric ER', 'Ambulance'
];

export default function HomePage() {
  const [lang, setLang] = useState('en');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Facilities & Filtering
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Addis Ababa');
  const [selectedSubCity, setSelectedSubCity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [filter247, setFilter247] = useState(false);
  const [filterCBHI, setFilterCBHI] = useState(false);
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  // User GPS Location
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);

  // Modals & Drawers
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [showHotlinesModal, setShowHotlinesModal] = useState(false);
  const [showFirstAidModal, setShowFirstAidModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTargetFacility, setReportTargetFacility] = useState(null);
  const [reportForm, setReportForm] = useState({ type: 'hours_update', details: '', contact: '' });
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Saved / Bookmarked Facilities (in localStorage)
  const [savedFacilityIds, setSavedFacilityIds] = useState([]);

  // Mobile View Tab: 'list' | 'map' | 'sos'
  const [mobileTab, setMobileTab] = useState('list');

  // Current Addis Ababa Clock
  const [eatTime, setEatTime] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Load Saved bookmarks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ethiocare_saved_facilities');
      if (saved) {
        setSavedFacilityIds(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read saved bookmarks', e);
    }
  }, []);

  const toggleSaveFacility = (id) => {
    let next;
    if (savedFacilityIds.includes(id)) {
      next = savedFacilityIds.filter((x) => x !== id);
    } else {
      next = [...savedFacilityIds, id];
    }
    setSavedFacilityIds(next);
    try {
      localStorage.setItem('ethiocare_saved_facilities', JSON.stringify(next));
    } catch (e) {}
  };

  // Live EAT Time Clock
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const timeStr = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Africa/Addis_Ababa',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(now);
        setEatTime(timeStr);
      } catch (e) {}
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Facilities
  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity);
      if (selectedSubCity && selectedSubCity !== 'all') params.append('subCity', selectedSubCity);
      if (selectedCategory && selectedCategory !== 'all') params.append('type', selectedCategory);
      if (filter247) params.append('is24_7', 'true');
      if (filterCBHI) params.append('cbhi', 'true');
      if (filterOpenNow) params.append('openNow', 'true');
      if (selectedService && selectedService !== 'all') params.append('service', selectedService);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (sortBy !== 'default') params.append('sortBy', sortBy);

      if (userLocation?.lat && userLocation?.lng) {
        params.append('lat', userLocation.lat.toString());
        params.append('lng', userLocation.lng.toString());
      }

      const res = await fetch(`/api/facilities?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setFacilities(json.data);
      } else {
        setFacilities(INITIAL_FACILITIES);
      }
    } catch (e) {
      console.error('Fetch error:', e);
      setFacilities(INITIAL_FACILITIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [
    selectedCity,
    selectedSubCity,
    selectedCategory,
    selectedService,
    filter247,
    filterCBHI,
    filterOpenNow,
    sortBy,
    userLocation,
  ]);

  // Trigger search on Enter key or debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFacilities();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Locate User GPS
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setSortBy('distance');
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        // Default to central Addis Ababa Bole / Meskel Square if permission denied
        setUserLocation({
          lat: 9.0125,
          lng: 38.7522,
          accuracy: 500,
        });
        setSortBy('distance');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Find Nearest 24/7 Emergency Hospital
  const handleFindNearestEmergency = () => {
    setShowSOSModal(false);
    setFilter247(true);
    setSelectedCategory('public_hospital');
    setSortBy('distance');
    if (!userLocation) {
      handleLocateMe();
    }
    setMobileTab('list');
  };

  // Report Form Submit
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: reportTargetFacility?.id || null,
          reportType: reportForm.type,
          details: reportForm.details,
          contact: reportForm.contact,
        }),
      });
      setReportSubmitted(true);
      setTimeout(() => {
        setReportSubmitted(false);
        setShowReportModal(false);
        setReportForm({ type: 'hours_update', details: '', contact: '' });
      }, 1800);
    } catch (e) {
      alert('Failed to submit. Please try again.');
    }
  };

  const handleShareFacility = (fac) => {
    const shareText = `${fac.name_en} - ${fac.landmark_en || fac.city}. Tel: ${fac.phone_primary}. Find on EthioCare: ${window.location.origin}`;
    if (navigator.share) {
      navigator.share({ title: fac.name_en, text: shareText, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const savedFacilitiesList = useMemo(() => {
    return facilities.filter((f) => savedFacilityIds.includes(f.id));
  }, [facilities, savedFacilityIds]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      {/* Top Navigation Bar */}
      <header className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-3 sm:px-5 py-2.5 flex items-center justify-between shadow-md z-30 shrink-0 border-b border-emerald-700/50">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500/20 border border-emerald-400/40 p-2 rounded-xl text-emerald-300 shadow-inner flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-emerald-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base sm:text-lg tracking-tight leading-none text-white drop-shadow-sm">
                {t.title}
              </h1>
              <span className="hidden lg:inline-flex items-center gap-1 bg-emerald-700/60 border border-emerald-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full text-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                EAT {eatTime || 'Addis Ababa (UTC+3)'}
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/90 font-medium hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Action Controls & Emergency Hub */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Emergency SOS Button */}
          <button
            onClick={() => setShowSOSModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md border border-red-500 animate-sos-glow transition-all active:scale-95"
            title="Emergency 24/7 SOS Hotlines"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-white" />
            <span className="tracking-wide uppercase font-extrabold">{t.emergencySOS}</span>
          </button>

          {/* Quick Hotline Drawer Trigger */}
          <button
            onClick={() => setShowHotlinesModal(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 rounded-xl text-xs font-bold border border-emerald-600/60 transition shadow-sm"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-300" />
            <span>907 / 8877</span>
          </button>

          {/* First Aid Protocols Button */}
          <button
            onClick={() => setShowFirstAidModal(true)}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-800/60 hover:bg-emerald-700 text-emerald-200 rounded-xl text-xs font-semibold border border-emerald-600/40 transition"
            title="Emergency First Aid Protocols"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-300" />
            <span>{t.firstAidBtn}</span>
          </button>

          {/* Saved Facilities Button */}
          <button
            onClick={() => setShowSavedModal(true)}
            className="relative p-2 bg-emerald-800/70 hover:bg-emerald-700 text-emerald-200 rounded-xl text-xs border border-emerald-600/50 transition"
            title="View Saved Facilities"
          >
            <Bookmark className="w-4 h-4 text-emerald-200" />
            {savedFacilityIds.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow">
                {savedFacilityIds.length}
              </span>
            )}
          </button>

          {/* Multi-language Selector */}
          <div className="flex bg-emerald-950/70 border border-emerald-700/50 rounded-xl p-0.5 text-xs font-semibold">
            {[
              { code: 'en', label: 'EN' },
              { code: 'am', label: 'አማ' },
              { code: 'om', label: 'OR' },
              { code: 'ti', label: 'ትግ' },
            ].map((item) => (
              <button
                key={item.code}
                onClick={() => setLang(item.code)}
                className={`px-2 py-1 rounded-lg transition text-[11px] ${
                  lang === item.code
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'text-emerald-300 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Workspace (Sidebar + Map) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar (Desktop & Mobile view) */}
        <aside
          className={`w-full md:w-[460px] lg:w-[490px] bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl transition-all duration-300 ${
            mobileTab === 'map' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search & Location Bar */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/90 space-y-2.5 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* City & Sub-City Dropdowns */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setSelectedSubCity('all');
                  }}
                  className="w-full bg-white border border-slate-200 text-xs font-semibold rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm text-slate-800"
                >
                  {ETHIOPIAN_CITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {lang === 'am' ? c.name_am : lang === 'om' ? c.name_om : c.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <select
                  value={selectedSubCity}
                  onChange={(e) => setSelectedSubCity(e.target.value)}
                  disabled={selectedCity !== 'Addis Ababa'}
                  className="w-full bg-white border border-slate-200 text-xs font-semibold rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm text-slate-800 disabled:opacity-50"
                >
                  <option value="all">{t.allSubCities}</option>
                  {ADDIS_SUBCITIES.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {lang === 'am' ? sc.name_am : lang === 'om' ? sc.name_om : sc.name_en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Quick Chips Scrollable Bar */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
              {FACILITY_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const label = lang === 'am' ? cat.label_am : lang === 'om' ? cat.label_om : cat.label_en;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] whitespace-nowrap transition flex items-center gap-1.5 border shadow-sm ${
                      isSelected
                        ? `${cat.color} border-transparent font-bold scale-[1.02]`
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Smart Filters Row */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                {/* 24/7 Filter */}
                <button
                  onClick={() => setFilter247(!filter247)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1 ${
                    filter247
                      ? 'bg-red-50 border-red-300 text-red-700 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${filter247 ? 'bg-red-600 animate-pulse' : 'bg-slate-400'}`}></span>
                  24/7 ER
                </button>

                {/* CBHI Accepted Filter */}
                <button
                  onClick={() => setFilterCBHI(!filterCBHI)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1 ${
                    filterCBHI
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="w-3 h-3 text-emerald-600" />
                  {t.cbhiAccepted}
                </button>

                {/* Open Now Filter */}
                <button
                  onClick={() => setFilterOpenNow(!filterOpenNow)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1 ${
                    filterOpenNow
                      ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Clock className="w-3 h-3 text-amber-600" />
                  {t.openNow}
                </button>
              </div>

              {/* GPS Locate Me Button */}
              <button
                onClick={handleLocateMe}
                disabled={locating}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-sm"
              >
                <Compass className={`w-3.5 h-3.5 text-blue-600 ${locating ? 'animate-spin' : ''}`} />
                <span>{locating ? t.locating : userLocation ? t.locationFound : t.locateMe}</span>
              </button>
            </div>

            {/* Specialized Service Tags Selector */}
            <div className="flex items-center gap-1 text-[11px] text-slate-500 overflow-x-auto pt-0.5">
              <span className="font-bold text-slate-600 shrink-0">Tags:</span>
              <button
                onClick={() => setSelectedService('all')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                  selectedService === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                All
              </button>
              {SERVICE_TAGS.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedService(selectedService === st ? 'all' : st)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 transition ${
                    selectedService === st
                      ? 'bg-teal-700 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Results Header Count & Sort */}
          <div className="px-3 py-2 bg-slate-100/80 border-b border-slate-200/60 flex items-center justify-between text-xs text-slate-600 shrink-0">
            <span className="font-bold">
              {facilities.length} {facilities.length === 1 ? 'facility' : 'facilities'}
            </span>
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="default">{t.sortBy}: Recommended</option>
                <option value="distance">{t.sortNearest}</option>
                <option value="rating">{t.sortRating}</option>
                <option value="name">{t.sortName}</option>
              </select>
            </div>
          </div>

          {/* Facility Cards List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {loading ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-500 font-semibold">Updating medical facilities...</p>
              </div>
            ) : facilities.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 m-2 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">{t.noResultsTitle}</h4>
                  <p className="text-xs text-slate-500 mt-1">{t.noResultsDesc}</p>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedSubCity('all');
                    setSelectedService('all');
                    setFilter247(false);
                    setFilterCBHI(false);
                    setFilterOpenNow(false);
                  }}
                  className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow hover:bg-emerald-800 transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              facilities.map((fac) => {
                const name = lang === 'am' ? fac.name_am : lang === 'om' ? fac.name_om : fac.name_en;
                const landmark = lang === 'am' ? fac.landmark_am : fac.landmark_en;
                const isSelected = selectedFacility?.id === fac.id;
                const isSaved = savedFacilityIds.includes(fac.id);

                return (
                  <div
                    key={fac.id}
                    onClick={() => {
                      setSelectedFacility(fac);
                      if (window.innerWidth < 768) {
                        // On mobile, stay or switch to map if clicked
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer relative ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/30'
                        : 'border-slate-200/80 hover:border-slate-300 bg-white hover:shadow-sm'
                    }`}
                  >
                    {/* Top Row: Category Type + Open Status + Save */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            fac.type === 'public_hospital'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : fac.type === 'pharmacy'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : fac.type === 'diagnostic_lab'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : fac.type === 'ambulance_hub'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {fac.type.replace('_', ' ')}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                            fac.isOpen
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              fac.isOpen ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          ></span>
                          {fac.isOpen ? t.openNow : 'Closed'}
                        </span>

                        {fac.is_24_7 && (
                          <span className="bg-red-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded shadow-xs animate-pulse">
                            24/7 ER
                          </span>
                        )}

                        {fac.accepts_cbhi && (
                          <span
                            title={t.cbhiFull}
                            className="bg-emerald-700 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5"
                          >
                            <Shield className="w-2.5 h-2.5" />
                            CBHI
                          </span>
                        )}
                      </div>

                      {/* Bookmark Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveFacility(fac.id);
                        }}
                        className="text-slate-400 hover:text-amber-500 p-1 rounded-lg transition"
                        title="Save to favorites"
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Facility Name & Rating */}
                    <div className="mt-2">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                          {name}
                        </h3>
                        {fac.rating && (
                          <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                            ★ {fac.rating}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-1 flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          {fac.sub_city ? `${fac.sub_city}, ` : ''}{fac.city} • {landmark}
                        </span>
                      </p>
                    </div>

                    {/* Distance Badge & Key Services */}
                    {fac.services && fac.services.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {fac.services.slice(0, 4).map((s, i) => (
                          <span
                            key={i}
                            className="bg-slate-100 text-slate-700 text-[10px] font-medium px-1.5 py-0.5 rounded"
                          >
                            {s}
                          </span>
                        ))}
                        {fac.services.length > 4 && (
                          <span className="text-slate-400 text-[10px] font-medium self-center">
                            +{fac.services.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bottom Action Row */}
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-xs">
                      {fac.distance !== null && fac.distance !== undefined ? (
                        <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          📍 {fac.distance} km away
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-semibold">
                          {fac.city}
                        </span>
                      )}

                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${fac.phone_primary}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs transition"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{t.callNow}</span>
                        </a>

                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${fac.latitude},${fac.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs flex items-center gap-1 border border-slate-200 transition"
                        >
                          <Navigation className="w-3 h-3 text-emerald-600" />
                          <span>{t.directions}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Map Workspace */}
        <main
          className={`flex-1 h-full relative overflow-hidden ${
            mobileTab === 'list' ? 'hidden md:block' : 'block'
          }`}
        >
          <MapComponent
            facilities={facilities}
            selectedFacility={selectedFacility}
            onSelectFacility={setSelectedFacility}
            userLocation={userLocation}
            onLocateUser={handleLocateMe}
            lang={lang}
          />

          {/* Selected Facility Floating Detail Card (Desktop & Mobile) */}
          {selectedFacility && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-200 z-[500] animate-in fade-in slide-in-from-bottom-3 duration-200">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        selectedFacility.type === 'public_hospital'
                          ? 'bg-red-100 text-red-800'
                          : selectedFacility.type === 'pharmacy'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {selectedFacility.type.replace('_', ' ')}
                    </span>
                    {selectedFacility.is_24_7 && (
                      <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                        24/7 ER
                      </span>
                    )}
                    {selectedFacility.accepts_cbhi && (
                      <span className="bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        CBHI Accepted
                      </span>
                    )}
                  </div>
                  <h2 className="font-extrabold text-sm text-slate-900 leading-tight">
                    {lang === 'am'
                      ? selectedFacility.name_am
                      : lang === 'om'
                      ? selectedFacility.name_om
                      : selectedFacility.name_en}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedFacility(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 mt-1.5 flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">
                  {selectedFacility.sub_city ? `${selectedFacility.sub_city}, ` : ''}
                  {selectedFacility.city} • {selectedFacility.landmark_en}
                </span>
              </p>

              {/* Description preview */}
              {selectedFacility.description_en && (
                <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {lang === 'am' && selectedFacility.description_am
                    ? selectedFacility.description_am
                    : selectedFacility.description_en}
                </p>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100">
                <a
                  href={`tel:${selectedFacility.phone_primary}`}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-center py-2 rounded-xl text-xs font-bold shadow flex items-center justify-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t.callNow} ({selectedFacility.phone_primary})</span>
                </a>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.latitude},${selectedFacility.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-900 hover:bg-slate-800 text-white text-center py-2 rounded-xl text-xs font-bold shadow flex items-center justify-center gap-1.5 transition"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.directions}</span>
                </a>
              </div>

              {/* Secondary actions: Share & Report correction */}
              <div className="flex items-center justify-between mt-2 pt-2 text-[11px] text-slate-500">
                <button
                  onClick={() => handleShareFacility(selectedFacility)}
                  className="flex items-center gap-1 hover:text-slate-800 font-semibold"
                >
                  <Share2 className="w-3 h-3" />
                  <span>{copyFeedback ? t.copied : t.share}</span>
                </button>

                <button
                  onClick={() => {
                    setReportTargetFacility(selectedFacility);
                    setShowReportModal(true);
                  }}
                  className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold"
                >
                  <MessageSquarePlus className="w-3 h-3" />
                  <span>{t.reportIssue}</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (List / Map / SOS) */}
      <nav className="md:hidden bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-around z-30 shadow-lg">
        <button
          onClick={() => setMobileTab('list')}
          className={`flex flex-col items-center gap-0.5 text-xs font-bold transition ${
            mobileTab === 'list' ? 'text-emerald-700' : 'text-slate-400'
          }`}
        >
          <Building2 className="w-5 h-5" />
          <span>{t.switchToList} ({facilities.length})</span>
        </button>

        <button
          onClick={() => setMobileTab('map')}
          className={`flex flex-col items-center gap-0.5 text-xs font-bold transition ${
            mobileTab === 'map' ? 'text-emerald-700' : 'text-slate-400'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>{t.switchToMap}</span>
        </button>

        <button
          onClick={() => setShowSOSModal(true)}
          className="flex flex-col items-center gap-0.5 text-xs font-bold text-red-600 animate-pulse"
        >
          <Radio className="w-5 h-5 text-red-600" />
          <span>{t.switchToSOS}</span>
        </button>
      </nav>

      {/* ================= EMERGENCY 24/7 SOS MODAL ================= */}
      {showSOSModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-[600] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-red-200 overflow-hidden relative">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg animate-pulse">
                  <Radio className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">{t.emergencySOS}</h3>
                  <p className="text-xs text-red-600 font-bold">Ethiopia 24/7 Rapid Emergency Response</p>
                </div>
              </div>
              <button
                onClick={() => setShowSOSModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action: Find Nearest 24/7 ER */}
            <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-4 rounded-2xl shadow-lg space-y-2">
              <h4 className="font-black text-sm flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-300" />
                {t.nearestERTitle}
              </h4>
              <p className="text-xs text-red-100">{t.nearestERDesc}</p>
              <button
                onClick={handleFindNearestEmergency}
                className="w-full mt-2 py-2.5 bg-white text-red-700 hover:bg-red-50 rounded-xl font-black text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4 text-red-600" />
                {t.findNearestERBtn}
              </button>
            </div>

            {/* Hotlines List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {EMERGENCY_HOTLINES.map((h) => {
                const name = lang === 'am' ? h.name_am : lang === 'om' ? h.name_om : h.name;
                const desc = lang === 'am' ? h.desc_am : h.desc;
                return (
                  <div
                    key={h.code}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition shadow-xs"
                  >
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-900">{name}</h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">{desc}</p>
                    </div>
                    <a
                      href={`tel:${h.phone}`}
                      className={`px-3.5 py-2 ${h.color} text-white font-black text-xs rounded-xl shadow-md hover:brightness-110 flex items-center gap-1.5 shrink-0`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{h.code}</span>
                    </a>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                onClick={() => {
                  setShowSOSModal(false);
                  setShowFirstAidModal(true);
                }}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>View Step-by-Step First Aid Protocols</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EMERGENCY HOTLINES MODAL ================= */}
      {showHotlinesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[600] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900">{t.emergencyHotlines}</h3>
              </div>
              <button
                onClick={() => setShowHotlinesModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {EMERGENCY_HOTLINES.map((h) => (
                <div
                  key={h.code}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">
                      {lang === 'am' ? h.name_am : h.name}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {lang === 'am' ? h.desc_am : h.desc}
                    </p>
                  </div>
                  <a
                    href={`tel:${h.phone}`}
                    className="px-3 py-1.5 bg-red-600 text-white font-black text-xs rounded-lg shadow hover:bg-red-700 flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    {h.code}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= FIRST AID PROTOCOLS MODAL ================= */}
      {showFirstAidModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[600] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-red-600" />
                <h3 className="font-black text-base text-slate-900">{t.firstAidTitle}</h3>
              </div>
              <button
                onClick={() => setShowFirstAidModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {FIRST_AID_GUIDES.map((g) => {
                const title = lang === 'am' ? g.title_am : g.title_en;
                const steps = lang === 'am' ? g.steps_am : g.steps_en;
                return (
                  <div
                    key={g.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-slate-900">{title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        {g.category}
                      </span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700 font-medium">
                      {steps.map((step, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= SAVED FACILITIES DRAWER ================= */}
      {showSavedModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[600] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-sm text-slate-900">
                  {t.savedFacilities} ({savedFacilityIds.length})
                </h3>
              </div>
              <button
                onClick={() => setShowSavedModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {savedFacilitiesList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Bookmark className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">{t.noSaved}</p>
                </div>
              ) : (
                savedFacilitiesList.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => {
                      setSelectedFacility(f);
                      setShowSavedModal(false);
                    }}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{f.name_en}</h4>
                      <p className="text-[10px] text-slate-500">{f.landmark_en || f.city}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveFacility(f.id);
                      }}
                      className="text-red-500 p-1 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= REPORT / SUGGEST UPDATE MODAL ================= */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[600] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-sm text-slate-900">{t.reportIssue}</h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-bold text-sm text-slate-900">{t.reportSuccess}</h4>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3">
                {reportTargetFacility && (
                  <p className="text-xs text-slate-600 font-semibold bg-slate-50 p-2 rounded-xl border">
                    Facility: <span className="font-extrabold">{reportTargetFacility.name_en}</span>
                  </p>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Issue Type</label>
                  <select
                    value={reportForm.type}
                    onChange={(e) => setReportForm({ ...reportForm, type: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="hours_update">Operating Hours Changed</option>
                    <option value="phone_update">Incorrect Phone Number</option>
                    <option value="closed_down">Facility Permanently Closed</option>
                    <option value="cbhi_status">CBHI Status Update</option>
                    <option value="new_facility">Suggest New Pharmacy / Hospital</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Details & Corrections</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide corrected phone, new operating hours, or location landmarks..."
                    value={reportForm.details}
                    onChange={(e) => setReportForm({ ...reportForm, details: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Contact / Phone (Optional)</label>
                  <input
                    type="text"
                    placeholder="+251 9..."
                    value={reportForm.contact}
                    onChange={(e) => setReportForm({ ...reportForm, contact: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow transition"
                >
                  Submit Feedback
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}