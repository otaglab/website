-- Demo listings matching the prototype's hardcoded spaces. Re-running updates them in place.

INSERT INTO coworking_spaces (slug, name, description, district, address, location, price_from, currency, workspace_types, amenities, status, opening_hours, verified) VALUES
  ('coworking-space-01', 'Coworking Space 01', 'A calm, professional place to focus in Yasamal.', 'Yasamal', 'Yasamal, Baku', ST_SetSRID(ST_MakePoint(49.8150, 40.3850), 4326), 15, 'AZN', ARRAY['Hot Desk', 'Meeting Room'], ARRAY['Wi-Fi', 'Coffee', 'Quiet Area'], 'active', '{"label": "Open until 20:00"}', true),
  ('coworking-space-02', 'Coworking Space 02', 'A central workspace steps from 28 May metro.', '28 May', '28 May, Baku', ST_SetSRID(ST_MakePoint(49.8486, 40.3794), 4326), 18, 'AZN', ARRAY['Hot Desk', 'Dedicated Desk'], ARRAY['Wi-Fi', 'Phone Booths', 'Kitchen'], 'active', '{"label": "Open until 22:00"}', true),
  ('lotfi-zadeh-center', 'Coworking Space 03', 'Private offices and meeting rooms in White City.', 'White City', 'White City, Baku', ST_SetSRID(ST_MakePoint(49.8770, 40.3750), 4326), 22, 'AZN', ARRAY['Private Office', 'Meeting Room'], ARRAY['Reception', 'Parking', '24/7 Access'], 'active', '{"label": "Open 24 hours"}', true),
  ('port-work-club', 'Coworking Space 04', 'A bright workspace with city views at Port Baku.', 'Port Baku', 'Port Baku, Baku', ST_SetSRID(ST_MakePoint(49.8614, 40.3747), 4326), 20, 'AZN', ARRAY['Hot Desk', 'Meeting Room'], ARRAY['Coffee', 'City Views', 'Wi-Fi'], 'active', '{"label": "Open until 21:00"}', false)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, district = EXCLUDED.district, address = EXCLUDED.address,
  location = EXCLUDED.location, price_from = EXCLUDED.price_from, currency = EXCLUDED.currency,
  workspace_types = EXCLUDED.workspace_types, amenities = EXCLUDED.amenities, status = EXCLUDED.status,
  opening_hours = EXCLUDED.opening_hours, verified = EXCLUDED.verified, updated_at = now();

INSERT INTO coworking_space_images (space_id, object_key, public_url, alt_text, sort_order, is_primary)
SELECT s.id, v.object_key, v.public_url, s.name, 0, true
FROM (VALUES
  ('coworking-space-01', 'seed/coworking-space-01.jpg', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85'),
  ('coworking-space-02', 'seed/coworking-space-02.jpg', 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=85'),
  ('lotfi-zadeh-center', 'seed/lotfi-zadeh-center.jpg', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=85'),
  ('port-work-club', 'seed/port-work-club.jpg', 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=900&q=85')
) AS v(slug, object_key, public_url)
JOIN coworking_spaces s ON s.slug = v.slug
ON CONFLICT (object_key) DO UPDATE SET public_url = EXCLUDED.public_url;
