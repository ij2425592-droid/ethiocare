import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { INITIAL_FACILITIES } from '@/data/facilitiesData';

export const dynamic = 'force-dynamic';

// Calculate Haversine distance in Kilometers
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
}

// Compute if facility is currently open in East Africa Time (EAT, UTC+3)
function isOpenNowEAT(is24_7, opensAt, closesAt) {
  if (is24_7) return true;
  if (!opensAt || !closesAt) return true;

  try {
    const now = new Date();
    const eatFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Addis_Ababa',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const currentTime = eatFormatter.format(now);
    if (opensAt <= closesAt) {
      return currentTime >= opensAt && currentTime <= closesAt;
    }
    return currentTime >= opensAt || currentTime <= closesAt;
  } catch (e) {
    return true;
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')) : null;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')) : null;
    const radiusKm = searchParams.get('radius') ? parseFloat(searchParams.get('radius')) : 100;
    const city = searchParams.get('city') || null;
    const subCity = searchParams.get('subCity') || null;
    const type = searchParams.get('type') || null;
    const is24_7 = searchParams.get('is24_7') === 'true' ? true : null;
    const cbhi = searchParams.get('cbhi') === 'true' ? true : null;
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const openNow = searchParams.get('openNow') === 'true';
    const serviceFilter = searchParams.get('service') || null;
    const sortBy = searchParams.get('sortBy') || 'default'; // 'distance', 'rating', 'name'

    let rawFacilities = [];

    // Try Supabase first if available
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.rpc('search_facilities_geo', {
          p_lat: lat,
          p_lng: lng,
          p_radius_meters: radiusKm * 1000,
          p_city: city && city !== 'all' ? city : null,
          p_sub_city: subCity && subCity !== 'all' ? subCity : null,
          p_type: type && type !== 'all' ? type : null,
          p_is_24_7: is24_7,
          p_cbhi: cbhi,
          p_service: serviceFilter,
          p_search: search || null,
        });

        if (!error && Array.isArray(data) && data.length > 0) {
          rawFacilities = data;
        } else {
          // If RPC doesn't exist or table empty, try basic select
          const { data: tableData, error: tableErr } = await supabase
            .from('facilities')
            .select('*');
          if (!tableErr && Array.isArray(tableData) && tableData.length > 0) {
            rawFacilities = tableData;
          } else {
            rawFacilities = INITIAL_FACILITIES;
          }
        }
      } catch (e) {
        console.warn('Supabase query failed, falling back to local dataset:', e.message);
        rawFacilities = INITIAL_FACILITIES;
      }
    } else {
      rawFacilities = INITIAL_FACILITIES;
    }

    // Process & Filter
    let results = rawFacilities.map((fac) => {
      const distance =
        lat !== null && lng !== null
          ? calculateDistanceKm(lat, lng, fac.latitude, fac.longitude)
          : null;
      const isOpen = isOpenNowEAT(fac.is_24_7, fac.opens_at, fac.closes_at);

      return {
        ...fac,
        distance,
        isOpen,
      };
    });

    // Apply Filters
    if (city && city !== 'all') {
      results = results.filter(
        (f) => f.city?.toLowerCase() === city.toLowerCase()
      );
    }

    if (subCity && subCity !== 'all') {
      results = results.filter(
        (f) => f.sub_city?.toLowerCase() === subCity.toLowerCase()
      );
    }

    if (type && type !== 'all') {
      results = results.filter((f) => f.type === type);
    }

    if (is24_7) {
      results = results.filter((f) => f.is_24_7);
    }

    if (cbhi) {
      results = results.filter((f) => f.accepts_cbhi);
    }

    if (openNow) {
      results = results.filter((f) => f.isOpen);
    }

    if (serviceFilter) {
      results = results.filter(
        (f) =>
          Array.isArray(f.services) &&
          f.services.some((s) => s.toLowerCase().includes(serviceFilter.toLowerCase()))
      );
    }

    if (search) {
      results = results.filter((f) => {
        const query = search;
        const nameEn = (f.name_en || '').toLowerCase();
        const nameAm = (f.name_am || '').toLowerCase();
        const nameOm = (f.name_om || '').toLowerCase();
        const landmarkEn = (f.landmark_en || '').toLowerCase();
        const landmarkAm = (f.landmark_am || '').toLowerCase();
        const subCityName = (f.sub_city || '').toLowerCase();
        const cityName = (f.city || '').toLowerCase();
        const servicesMatch = Array.isArray(f.services)
          ? f.services.some((s) => s.toLowerCase().includes(query))
          : false;

        return (
          nameEn.includes(query) ||
          nameAm.includes(query) ||
          nameOm.includes(query) ||
          landmarkEn.includes(query) ||
          landmarkAm.includes(query) ||
          subCityName.includes(query) ||
          cityName.includes(query) ||
          servicesMatch
        );
      });
    }

    // Distance Radius Filter
    if (lat !== null && lng !== null && radiusKm) {
      results = results.filter(
        (f) => f.distance === null || f.distance <= radiusKm
      );
    }

    // Sorting
    if (sortBy === 'distance' && lat !== null && lng !== null) {
      results.sort((a, b) => (a.distance ?? 99999) - (b.distance ?? 99999));
    } else if (sortBy === 'rating') {
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'name') {
      results.sort((a, b) => (a.name_en || '').localeCompare(b.name_en || ''));
    } else {
      // Default: 24/7 emergency & verified first, then by rating
      results.sort((a, b) => {
        if (a.is_24_7 !== b.is_24_7) return b.is_24_7 ? 1 : -1;
        return (b.rating || 0) - (a.rating || 0);
      });
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      data: results,
      meta: {
        total: rawFacilities.length,
        filtered: results.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Facilities API error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Internal Server Error',
        data: INITIAL_FACILITIES,
      },
      { status: 500 }
    );
  }
}

// POST endpoint to handle user reports and facility suggestions
export async function POST(request) {
  try {
    const body = await request.json();
    const { facilityId, reportType, details, contact } = body;

    console.log('Received community report:', { facilityId, reportType, details, contact });

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('facility_reports').insert([
          {
            facility_id: facilityId,
            report_type: reportType,
            details,
            contact,
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (e) {
        console.warn('Could not persist report to Supabase:', e.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your feedback has been submitted to the EthioCare health registry.',
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}