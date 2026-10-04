-- ==========================================================
-- ETHIOCARE SUPABASE DATABASE SCHEMA & GEOSPATIAL SEARCH
-- ==========================================================

-- Enable PostGIS for high-accuracy geo indexing
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Create Facilities Table
CREATE TABLE IF NOT EXISTS facilities (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_am TEXT,
  name_om TEXT,
  name_ti TEXT,
  type TEXT NOT NULL, -- 'public_hospital', 'private_hospital', 'pharmacy', 'clinic', 'diagnostic_lab', 'ambulance_hub'
  city TEXT NOT NULL DEFAULT 'Addis Ababa',
  sub_city TEXT,
  landmark_en TEXT,
  landmark_am TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone_primary TEXT NOT NULL,
  phone_emergency TEXT,
  is_24_7 BOOLEAN DEFAULT false,
  accepts_cbhi BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT true,
  opens_at TIME DEFAULT '00:00',
  closes_at TIME DEFAULT '23:59',
  services TEXT[] DEFAULT '{}',
  rating NUMERIC(2, 1) DEFAULT 4.5,
  review_count INTEGER DEFAULT 0,
  beds_count INTEGER DEFAULT 0,
  description_en TEXT,
  description_am TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Community Reports Table
CREATE TABLE IF NOT EXISTS facility_reports (
  id BIGSERIAL PRIMARY KEY,
  facility_id TEXT REFERENCES facilities(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL,
  details TEXT NOT NULL,
  contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Geospatial / Filter RPC Function
CREATE OR REPLACE FUNCTION search_facilities_geo(
  p_lat DOUBLE PRECISION DEFAULT NULL,
  p_lng DOUBLE PRECISION DEFAULT NULL,
  p_radius_meters DOUBLE PRECISION DEFAULT 50000,
  p_city TEXT DEFAULT NULL,
  p_sub_city TEXT DEFAULT NULL,
  p_type TEXT DEFAULT NULL,
  p_is_24_7 BOOLEAN DEFAULT NULL,
  p_cbhi BOOLEAN DEFAULT NULL,
  p_service TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL
)
RETURNS SETOF facilities
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT f.*
  FROM facilities f
  WHERE
    (p_city IS NULL OR LOWER(f.city) = LOWER(p_city))
    AND (p_sub_city IS NULL OR LOWER(f.sub_city) = LOWER(p_sub_city))
    AND (p_type IS NULL OR f.type = p_type)
    AND (p_is_24_7 IS NULL OR f.is_24_7 = p_is_24_7)
    AND (p_cbhi IS NULL OR f.accepts_cbhi = p_cbhi)
    AND (p_service IS NULL OR p_service = ANY(f.services))
    AND (
      p_search IS NULL OR
      LOWER(f.name_en) LIKE '%' || LOWER(p_search) || '%' OR
      LOWER(COALESCE(f.name_am, '')) LIKE '%' || LOWER(p_search) || '%' OR
      LOWER(COALESCE(f.landmark_en, '')) LIKE '%' || LOWER(p_search) || '%' OR
      LOWER(COALESCE(f.sub_city, '')) LIKE '%' || LOWER(p_search) || '%'
    )
    AND (
      p_lat IS NULL OR p_lng IS NULL OR
      ST_DWithin(
        ST_SetSRID(ST_MakePoint(f.longitude, f.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
        p_radius_meters
      )
    )
  ORDER BY
    f.is_24_7 DESC,
    f.rating DESC;
END;
$$;
