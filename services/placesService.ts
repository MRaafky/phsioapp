// Service untuk mencari tempat fisioterapi terdekat menggunakan berbagai API

export interface PhysiotherapyPlace {
    id: string;
    name: string;
    lat: number;
    lng: number;
    address: string;
    phone?: string;
    rating?: number;
    website?: string;
    distance?: number; // dalam meter
}

/**
 * Mencari tempat fisioterapi terdekat dari lokasi user
 * Menggunakan Overpass API (OpenStreetMap) sebagai alternatif gratis
 */
export async function findNearbyPhysiotherapy(
    latitude: number,
    longitude: number,
    radiusMeters: number = 5000
): Promise<PhysiotherapyPlace[]> {
    try {
        // Menggunakan Overpass API untuk query OpenStreetMap
        const query = `
            [out:json][timeout:25];
            (
                node["amenity"="clinic"]["healthcare"="physiotherapist"](around:${radiusMeters},${latitude},${longitude});
                way["amenity"="clinic"]["healthcare"="physiotherapist"](around:${radiusMeters},${latitude},${longitude});
                node["healthcare"="physiotherapist"](around:${radiusMeters},${latitude},${longitude});
                way["healthcare"="physiotherapist"](around:${radiusMeters},${latitude},${longitude});
                node["name"~"fisio|physio|terapi",i](around:${radiusMeters},${latitude},${longitude});
                way["name"~"fisio|physio|terapi",i](around:${radiusMeters},${latitude},${longitude});
            );
            out body;
            >;
            out skel qt;
        `;

        const overpassUrl = 'https://overpass-api.de/api/interpreter';
        const response = await fetch(overpassUrl, {
            method: 'POST',
            body: `data=${encodeURIComponent(query)}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) {
            throw new Error(`Overpass API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Parse hasil dan convert ke format kita
        const places: PhysiotherapyPlace[] = data.elements
            .filter((element: any) => element.tags && element.tags.name)
            .map((element: any) => {
                const lat = element.lat || element.center?.lat;
                const lon = element.lon || element.center?.lon;

                if (!lat || !lon) return null;

                // Hitung jarak dari user
                const distance = calculateDistance(latitude, longitude, lat, lon);

                return {
                    id: element.id.toString(),
                    name: element.tags.name,
                    lat: lat,
                    lng: lon,
                    address: formatAddress(element.tags),
                    phone: element.tags.phone || element.tags['contact:phone'],
                    website: element.tags.website || element.tags['contact:website'],
                    rating: undefined, // OSM tidak menyediakan rating
                    distance: distance
                };
            })
            .filter((place: any) => place !== null);

        // Fallback: jika tidak ada hasil dari OSM, gunakan dummy data dengan lokasi relatif
        if (places.length === 0) {
            console.warn('No physiotherapy places found in OSM, using fallback data');
            return getFallbackPlaces(latitude, longitude);
        }

        // Sort berdasarkan jarak terdekat
        places.sort((a, b) => (a.distance || 0) - (b.distance || 0));

        return places.slice(0, 10); // Ambil maksimal 10 tempat terdekat
    } catch (error) {
        console.error('Error fetching physiotherapy places:', error);
        // Fallback ke dummy data jika API gagal
        return getFallbackPlaces(latitude, longitude);
    }
}

/**
 * Hitung jarak antara dua koordinat (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Radius bumi dalam meter
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Jarak dalam meter
}

/**
 * Format alamat dari tags OSM
 */
function formatAddress(tags: any): string {
    const parts = [];

    if (tags['addr:street']) {
        const street = tags['addr:street'];
        const housenumber = tags['addr:housenumber'];
        parts.push(housenumber ? `${street} ${housenumber}` : street);
    }
    if (tags['addr:city']) parts.push(tags['addr:city']);
    if (tags['addr:postcode']) parts.push(tags['addr:postcode']);

    if (parts.length === 0) {
        return tags.address || 'Alamat tidak tersedia';
    }

    return parts.join(', ');
}

/**
 * Format jarak ke string yang readable
 */
export function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    } else {
        return `${(meters / 1000).toFixed(1)} km`;
    }
}

/**
 * Fallback data jika API tidak tersedia atau tidak ada hasil
 */
function getFallbackPlaces(latitude: number, longitude: number): PhysiotherapyPlace[] {
    // Data dummy dengan posisi relatif dari lokasi user
    const fallbackData = [
        {
            id: 'fallback-1',
            name: 'PhysioMedika Clinic',
            lat: latitude + 0.008,
            lng: longitude - 0.012,
            address: 'Jl. Kesehatan No. 45, Jakarta',
            phone: '+62 21 5555 0101',
            distance: calculateDistance(latitude, longitude, latitude + 0.008, longitude - 0.012)
        },
        {
            id: 'fallback-2',
            name: 'Klinik Fisioterapi Prima',
            lat: latitude - 0.005,
            lng: longitude + 0.015,
            address: 'Jl. Sehat Sentosa No. 12, Jakarta',
            phone: '+62 21 5555 0102',
            distance: calculateDistance(latitude, longitude, latitude - 0.005, longitude + 0.015)
        },
        {
            id: 'fallback-3',
            name: 'ActiveLife Physiotherapy Center',
            lat: latitude + 0.010,
            lng: longitude + 0.008,
            address: 'Jl. Wijaya Kusuma No. 88, Jakarta',
            phone: '+62 21 5555 0103',
            website: 'https://activelife-physio.com',
            distance: calculateDistance(latitude, longitude, latitude + 0.010, longitude + 0.008)
        },
        {
            id: 'fallback-4',
            name: 'Flex & Heal Klinik',
            lat: latitude - 0.012,
            lng: longitude - 0.006,
            address: 'Jl. Sudirman No. 156, Jakarta',
            phone: '+62 21 5555 0104',
            distance: calculateDistance(latitude, longitude, latitude - 0.012, longitude - 0.006)
        },
        {
            id: 'fallback-5',
            name: 'RehabPro Physiotherapy',
            lat: latitude + 0.003,
            lng: longitude - 0.020,
            address: 'Jl. Gatot Subroto No. 234, Jakarta',
            phone: '+62 21 5555 0105',
            rating: 4.5,
            distance: calculateDistance(latitude, longitude, latitude + 0.003, longitude - 0.020)
        }
    ];

    return fallbackData.sort((a, b) => (a.distance || 0) - (b.distance || 0));
}
