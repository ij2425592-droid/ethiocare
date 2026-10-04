import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

function isOpenNowEAT(is24_7, opensAt, closesAt) {
  if (is24_7) return true;
  if (!opensAt || !closesAt) return true;

  const now = new Date();
  const eatFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Addis_Ababa',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const currentTime = eatFormatter.format(now);
  if (opensAt <= closesAt) {
    return currentTime >= opensAt && currentTime <= closesAt;
  }
  return currentTime >= opensAt || currentTime <= closesAt;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')) : null;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')) : null;
    const radius = searchParams.get('radius') ? parseFloat(searchParams.get('radius')) * 1000 : 25000;
    const city = searchParams.get('city') || null;
    const subCity = searchParams.get('subCity') || null;
    const type = searchParams.get('type') || null;
    const is24_7 = searchParams.get('is24_7') === 'true' ? true : null;
    const cbhi = searchParams.get('cbhi') === 'true' ? true : null;
    const search = searchParams.get('search') || null;
    const openNow = searchParams.get('openNow') === 'true';

    const { data, error } = await supabase.rpc('search_facilities_geo', {
      p_lat: lat,
      p_lng: lng,
      p_radius_meters: radius,
      p_city: city,
      p_sub_city: subCity,
      p_type: type,
      p_is_24_7: is24_7,
      p_cbhi: cbhi,
      p_service: null,
      p_search: search,
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    let facilities = (data || []).map((fac) => ({
      ...fac,
      isOpen: isOpenNowEAT(fac.is_24_7, fac.opens_at, fac.closes_at),
    }));

    if (openNow) {
      facilities = facilities.filter((fac) => fac.isOpen);
    }

    return NextResponse.json({ success: true, count: facilities.length, data: facilities });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}