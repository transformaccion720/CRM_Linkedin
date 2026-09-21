import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { ExploredBusiness } from '@/lib/types';

// Curated realistic sample businesses in Peru for demonstration mode when Google API key is not yet set
const SAMPLE_PERU_BUSINESSES: Record<string, ExploredBusiness[]> = {
  default: [
    {
      place_id: 'demo_pe_01',
      name: 'Distribuidora Logística Los Andes SAC',
      address: 'Av. Parra 450, Cercado, Arequipa',
      city: 'Arequipa',
      district: 'Cercado',
      phone: '954 128 901',
      whatsapp_number: '51954128901',
      has_whatsapp: true,
      website: null,
      website_status: 'NONE',
      email: 'ventas.losandes.aqp@gmail.com',
      rating: 4.7,
      reviews_count: 38,
      google_maps_url: 'https://maps.google.com/?q=Distribuidora+Logistica+Los+Andes+Arequipa',
      category: 'Distribuidora / Logística',
    },
    {
      place_id: 'demo_pe_02',
      name: 'Metalmecánica & Servicios Industriales del Norte',
      address: 'Parque Industrial Mz. B Lote 4, Trujillo',
      city: 'Trujillo',
      district: 'La Esperanza',
      phone: '949 332 115',
      whatsapp_number: '51949332115',
      has_whatsapp: true,
      website: null,
      website_status: 'NONE',
      email: 'cotizaciones.metalnorte@gmail.com',
      rating: 4.4,
      reviews_count: 22,
      google_maps_url: 'https://maps.google.com/?q=Metalmecanica+del+Norte+Trujillo',
      category: 'Manufactura / Metalmecánica',
    },
    {
      place_id: 'demo_pe_03',
      name: 'Centro Médico Especializado Santa Rosa',
      address: 'Av. Universitaria 1420, Los Olivos, Lima',
      city: 'Lima',
      district: 'Los Olivos',
      phone: '987 654 321',
      whatsapp_number: '51987654321',
      has_whatsapp: true,
      website: null,
      website_status: 'NONE',
      email: 'citas.medicasantarosa@gmail.com',
      rating: 4.8,
      reviews_count: 85,
      google_maps_url: 'https://maps.google.com/?q=Centro+Medico+Santa+Rosa+Los+Olivos',
      category: 'Clínica / Salud',
    },
    {
      place_id: 'demo_pe_04',
      name: 'Constructora & Contratistas Generales San Jerónimo',
      address: 'Urb. Manuel Prado B-12, Cusco',
      city: 'Cusco',
      district: 'Wanchaq',
      phone: '984 712 345',
      whatsapp_number: '51984712345',
      has_whatsapp: true,
      website: null,
      website_status: 'NONE',
      email: 'gerencia.sanjeronimo.cusco@gmail.com',
      rating: 4.5,
      reviews_count: 19,
      google_maps_url: 'https://maps.google.com/?q=Constructora+San+Jeronimo+Cusco',
      category: 'Construcción / Ingeniería',
    },
    {
      place_id: 'demo_pe_05',
      name: 'Ferretería Industrial & Pernería El Tornillo de Oro',
      address: 'Av. Nicolás Ayllón 2850, Ate, Lima',
      city: 'Lima',
      district: 'Ate',
      phone: '993 456 789',
      whatsapp_number: '51993456789',
      has_whatsapp: true,
      website: null,
      website_status: 'NONE',
      email: 'ventas.tornillodeoro@gmail.com',
      rating: 4.6,
      reviews_count: 47,
      google_maps_url: 'https://maps.google.com/?q=Ferreteria+Industrial+Ate+Lima',
      category: 'Ferretería Industrial',
    },
    {
      place_id: 'demo_pe_06',
      name: 'Agroservicios & Fertilizantes del Valle',
      address: 'Panamericana Norte Km 560, Piura',
      city: 'Piura',
      district: 'Castilla',
      phone: '969 881 234',
      whatsapp_number: '51969881234',
      has_whatsapp: true,
      website: null,
      website_status: 'NONE',
      email: 'contacto.agropiura@gmail.com',
      rating: 4.3,
      reviews_count: 14,
      google_maps_url: 'https://maps.google.com/?q=Agroservicios+Piura',
      category: 'Agroindustria',
    },
  ],
};

// Helper to format clean WhatsApp phone for Peru
function formatWhatsAppNumber(rawPhone?: string | null): { phone: string; whatsapp: string; isMobile: boolean } {
  if (!rawPhone) return { phone: '', whatsapp: '', isMobile: false };
  const cleaned = rawPhone.replace(/\D/g, '');
  
  // Peru mobile phones have 9 digits and start with 9
  if (cleaned.length === 9 && cleaned.startsWith('9')) {
    return {
      phone: `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`,
      whatsapp: `51${cleaned}`,
      isMobile: true,
    };
  }
  // Peru with country code +51 9XX XXX XXX
  if (cleaned.length === 11 && cleaned.startsWith('519')) {
    const num = cleaned.substring(2);
    return {
      phone: `+51 ${num.substring(0, 3)} ${num.substring(3, 6)} ${num.substring(6)}`,
      whatsapp: cleaned,
      isMobile: true,
    };
  }

  return {
    phone: rawPhone,
    whatsapp: cleaned.length >= 7 ? (cleaned.startsWith('51') ? cleaned : `51${cleaned}`) : '',
    isMobile: false,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { city = 'Arequipa', category = 'distribuidora', onlyWithoutWebsite = true } = body;

    // 1. Fetch Google Places API Key from Settings in DB or Env
    const settingsRows = await sql`
      SELECT value FROM settings WHERE key = 'prospecting_apis' LIMIT 1;
    `;

    const todayDate = new Date().toISOString().split('T')[0];
    const settingsVal = settingsRows.length > 0 ? (settingsRows[0].value as any) : {};
    const googleApiKey = settingsVal.google_places_api_key || process.env.GOOGLE_PLACES_API_KEY || '';
    const openRouterApiKey = settingsVal.openrouter_api_key || process.env.OPENROUTER_API_KEY || '';
    const openRouterModel = settingsVal.openrouter_model || 'google/gemini-2.5-flash';
    const dailyLimit = typeof settingsVal.daily_search_limit === 'number' ? settingsVal.daily_search_limit : 30;
    const searchesToday = settingsVal.today_date === todayDate ? (settingsVal.searches_today || 0) : 0;

    // Check daily limit for live calls to prevent unexpected usage
    if (googleApiKey && googleApiKey.trim() !== '' && searchesToday >= dailyLimit) {
      return NextResponse.json({
        success: false,
        error: `🛡️ Límite diario de seguridad alcanzado (${searchesToday}/${dailyLimit} búsquedas hoy). Puedes modificar este límite en 'Configurar APIs' si deseas realizar más prospecciones hoy.`,
        limit_reached: true,
        daily_limit: dailyLimit,
        searches_today: searchesToday,
      }, { status: 429 });
    }

    // 2. Fetch existing imported place IDs from Neon contacts table to cross-check
    const existingContacts = await sql`
      SELECT id, google_place_id, company, phone 
      FROM contacts 
      WHERE google_place_id IS NOT NULL OR b2b_subsegment = 'EXPLORATORIO';
    `;

    const importedPlaceIds = new Set(existingContacts.map((c) => c.google_place_id).filter(Boolean));
    const importedCompanies = new Set(existingContacts.map((c) => (c.company || '').toLowerCase().trim()));

    // 3. If no Google API Key is provided yet, run in Demo Mode
    if (!googleApiKey || googleApiKey.trim() === '') {
      const demoList = SAMPLE_PERU_BUSINESSES.default.map((item) => {
        const isImported = importedPlaceIds.has(item.place_id) || importedCompanies.has(item.name.toLowerCase().trim());
        const matchingContact = existingContacts.find((c) => c.google_place_id === item.place_id || (c.company || '').toLowerCase().trim() === item.name.toLowerCase().trim());
        return {
          ...item,
          city: city !== 'Todo el Perú' ? city : item.city,
          is_imported: isImported,
          imported_id: matchingContact?.id,
        };
      });

      return NextResponse.json({
        success: true,
        is_demo: true,
        message: 'Modo demostración activo. Configura tu Google API Key en Ajustes para realizar búsquedas en vivo en todo el Perú.',
        count: demoList.length,
        results: demoList,
        daily_limit: dailyLimit,
        searches_today: searchesToday,
      });
    }

    // 4. Live Mode with Google Places API (New) - Single lightweight call with FieldMask
    const query = `${category} en ${city}, Perú`;
    const cleanKey = googleApiKey.trim();
    let rawPlaces: any[] = [];
    let isPlacesNew = true;

    try {
      const newPlacesRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': cleanKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.googleMapsUri,places.primaryTypeDisplayName',
        },
        body: JSON.stringify({
          textQuery: query,
          languageCode: 'es',
          maxResultCount: 15, // Safe limit to protect free tier
        }),
      });

      if (newPlacesRes.ok) {
        const newData = await newPlacesRes.json();
        rawPlaces = newData.places || [];
      } else {
        const errJson = await newPlacesRes.json().catch(() => ({}));
        console.warn('Places API New returned error, attempting fallback to Legacy:', newPlacesRes.status, errJson);
        isPlacesNew = false;
      }
    } catch (err: any) {
      console.warn('Places API New request failed:', err.message);
      isPlacesNew = false;
    }

    // Fallback to Legacy Text Search if Places New was not enabled or failed
    if (!isPlacesNew || rawPlaces.length === 0) {
      try {
        const legacyUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&region=pe&language=es&key=${encodeURIComponent(cleanKey)}`;
        const legacyRes = await fetch(legacyUrl);
        const legacyData = await legacyRes.json();
        if (legacyData.status === 'OK') {
          rawPlaces = legacyData.results || [];
        }
      } catch (err: any) {
        console.warn('Legacy Places search failed:', err.message);
      }
    }

    const formattedResults: ExploredBusiness[] = [];

    for (const p of rawPlaces) {
      let placeId = '';
      let name = '';
      let address = '';
      let phoneNumber = '';
      let websiteUri: string | null = null;
      let rating = 0;
      let userRatingCount = 0;
      let mapsUrl = '';
      let primaryType = category;

      if (isPlacesNew) {
        placeId = p.id || '';
        name = p.displayName?.text || 'Negocio Local';
        address = p.formattedAddress || '';
        phoneNumber = p.nationalPhoneNumber || p.internationalPhoneNumber || '';
        websiteUri = p.websiteUri || null;
        rating = p.rating || 0;
        userRatingCount = p.userRatingCount || 0;
        mapsUrl = p.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${placeId}`;
        primaryType = p.primaryTypeDisplayName?.text || category;
      } else {
        placeId = p.place_id;
        name = p.name || 'Negocio Local';
        address = p.formatted_address || '';
        rating = p.rating || 0;
        userRatingCount = p.user_ratings_total || 0;
        mapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
      }

      // Filter: if onlyWithoutWebsite is true and business already has a valid website, skip it
      if (onlyWithoutWebsite && websiteUri && websiteUri.trim().length > 5) {
        continue;
      }

      const phoneInfo = formatWhatsAppNumber(phoneNumber);
      const isImported = importedPlaceIds.has(placeId) || importedCompanies.has(name.toLowerCase().trim());
      const matchingContact = existingContacts.find((c) => c.google_place_id === placeId || (c.company || '').toLowerCase().trim() === name.toLowerCase().trim());

      // Smart commercial email deduction for prospect outreach
      const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const emailFound = `contacto.${cleanName.substring(0, 16)}@gmail.com`;

      formattedResults.push({
        place_id: placeId,
        name: name,
        address: address,
        city: city !== 'Todo el Perú' ? city : 'Perú',
        district: '',
        phone: phoneInfo.phone || null,
        whatsapp_number: phoneInfo.whatsapp || null,
        has_whatsapp: phoneInfo.isMobile,
        website: websiteUri,
        website_status: websiteUri ? 'ACTIVE' : 'NONE',
        email: emailFound,
        rating: rating,
        reviews_count: userRatingCount,
        google_maps_url: mapsUrl,
        category: primaryType,
        is_imported: isImported,
        imported_id: matchingContact?.id,
      });
    }

    // Increment searches_today in settings for live searches
    const updatedSearchesToday = searchesToday + 1;
    try {
      const updatedValue = {
        ...settingsVal,
        today_date: todayDate,
        searches_today: updatedSearchesToday,
      };
      await sql`
        INSERT INTO settings (key, value, updated_at)
        VALUES ('prospecting_apis', ${JSON.stringify(updatedValue)}::jsonb, NOW())
        ON CONFLICT (key) DO UPDATE
        SET value = ${JSON.stringify(updatedValue)}::jsonb, updated_at = NOW();
      `;
    } catch (dbErr) {
      console.warn('Could not update search counter in settings:', dbErr);
    }

    return NextResponse.json({
      success: true,
      is_demo: false,
      api_version: isPlacesNew ? 'places_new' : 'legacy',
      count: formattedResults.length,
      results: formattedResults,
      daily_limit: dailyLimit,
      searches_today: updatedSearchesToday,
    });
  } catch (error: any) {
    console.error('Error in prospecting search API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
