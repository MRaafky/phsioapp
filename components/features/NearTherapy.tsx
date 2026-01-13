import React, { useEffect, useRef, useState } from 'react';
import { findNearbyPhysiotherapy, formatDistance, type PhysiotherapyPlace } from '../../services/placesService';

// Declare Leaflet in the global scope to avoid TypeScript errors
declare const L: any;

const NearTherapy: React.FC = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const userMarkerRef = useRef<any>(null);
    const clinicMarkersRef = useRef<any[]>([]);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [nearbyPlaces, setNearbyPlaces] = useState<PhysiotherapyPlace[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlace, setSelectedPlace] = useState<PhysiotherapyPlace | null>(null);

    // Initialize map and get user location
    useEffect(() => {
        const handleSuccess = async (position: GeolocationPosition) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });

            // Initialize map
            if (mapRef.current && !mapInstance.current) {
                mapInstance.current = L.map(mapRef.current).setView([latitude, longitude], 14);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(mapInstance.current);

                // Add user marker with pulsing animation
                const liveIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: "<div class='live-dot-pulse'></div><div class='live-dot'></div>",
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });

                userMarkerRef.current = L.marker([latitude, longitude], { icon: liveIcon })
                    .addTo(mapInstance.current)
                    .bindPopup('<b style="font-family: Inter, sans-serif; color: #0f172a;">Lokasi Anda</b>');
            }

            // Search for nearby physiotherapy places
            setIsSearching(true);
            try {
                const places = await findNearbyPhysiotherapy(latitude, longitude, 5000);
                setNearbyPlaces(places);

                // Add markers for each place
                places.forEach(place => {
                    const popupContent = `
                        <div class="font-sans p-2" style="font-family: 'Inter', sans-serif; min-width: 200px;">
                            <h3 class="font-bold text-base mb-2 text-slate-800 font-heading">${place.name}</h3>
                            <p class="text-sm text-slate-600 mb-1">
                                <i class="fas fa-map-marker-alt mr-2 text-emerald-500"></i>${place.address}
                            </p>
                            ${place.distance ? `<p class="text-sm text-slate-600 mb-1">
                                <i class="fas fa-route mr-2 text-emerald-500"></i>${formatDistance(place.distance)}
                            </p>` : ''}
                            ${place.phone ? `<p class="text-sm text-slate-600 mb-3">
                                <i class="fas fa-phone mr-2 text-emerald-500"></i>${place.phone}
                            </p>` : ''}
                            <a href="https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${place.lat},${place.lng}" 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               class="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center text-sm font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all w-full decoration-none"
                               style="text-decoration: none; border-radius: 0.75rem;">
                                <i class="fas fa-directions mr-2"></i>Arahkan Rute
                            </a>
                        </div>
                    `;

                    const emeraldIcon = L.divIcon({
                        className: 'custom-clinic-icon',
                        html: `<div style="background: linear-gradient(135deg, #10b981 0%, #0d9488 100%); width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 6px rgba(0,0,0,0.2); border: 3px solid white;">
                                <i class="fas fa-clinic-medical" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg); color: white; font-size: 16px;"></i>
                               </div>`,
                        iconSize: [36, 36],
                        iconAnchor: [18, 36]
                    });

                    const marker = L.marker([place.lat, place.lng], { icon: emeraldIcon })
                        .addTo(mapInstance.current)
                        .bindPopup(popupContent);

                    marker.on('click', () => {
                        setSelectedPlace(place);
                    });

                    clinicMarkersRef.current.push(marker);
                });

                // Fit map to show all markers
                if (places.length > 0) {
                    const bounds = L.latLngBounds([
                        [latitude, longitude],
                        ...places.map(p => [p.lat, p.lng])
                    ]);
                    mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
                }

            } catch (err) {
                console.error('Error searching for places:', err);
                setError('Gagal mencari tempat fisioterapi. Menggunakan data alternatif.');
            } finally {
                setIsSearching(false);
                setIsLoading(false);
            }
        };

        const handleError = (err: GeolocationPositionError) => {
            console.error(`Geolocation error - Code: ${err.code}, Message: ${err.message}`);
            let userMessage: string;

            switch (err.code) {
                case 1: // PERMISSION_DENIED
                    userMessage = "Izin lokasi ditolak. Mohon aktifkan izin lokasi di browser Anda.";
                    break;
                case 2: // POSITION_UNAVAILABLE
                    userMessage = "Informasi lokasi tidak tersedia. Periksa koneksi internet Anda.";
                    break;
                case 3: // TIMEOUT
                    userMessage = "Waktu habis saat mencoba mendapatkan lokasi Anda.";
                    break;
                default:
                    userMessage = "Terjadi kesalahan saat mendapatkan lokasi Anda.";
            }
            setError(userMessage);
            setIsLoading(false);

            // Fallback to default location (Jakarta) if geolocation fails
            if (mapRef.current && !mapInstance.current) {
                const defaultLat = -6.2088;
                const defaultLng = 106.8456;

                mapInstance.current = L.map(mapRef.current).setView([defaultLat, defaultLng], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(mapInstance.current);

                L.marker([defaultLat, defaultLng]).addTo(mapInstance.current)
                    .bindPopup('<b>Lokasi Default (Jakarta)</b><br>Tidak dapat mengakses lokasi Anda.').openPopup();
            }
        };

        // Get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        } else {
            setError("Geolocation tidak didukung oleh browser ini.");
            setIsLoading(false);
        }

        // Cleanup
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
            clinicMarkersRef.current = [];
            userMarkerRef.current = null;
        };
    }, []);

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-800 mb-2 font-heading">
                Temukan Fisioterapis Terdekat
            </h2>
            <p className="text-slate-500 mb-6">
                Cari klinik fisioterapi terbaik di sekitar lokasi Anda.
            </p>

            {/* Loading State */}
            {isLoading && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-6 py-4 rounded-xl mb-6 flex items-center justify-center shadow-sm">
                    <i className="fas fa-spinner fa-spin mr-3 text-emerald-600 text-xl"></i>
                    <span className="font-semibold">Mendapatkan lokasi Anda dan mencari klinik terdekat...</span>
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div className="bg-amber-50 border border-amber-100 text-amber-800 px-6 py-4 rounded-xl mb-6 flex items-start gap-3 shadow-sm" role="alert">
                    <i className="fas fa-exclamation-triangle text-xl mt-0.5 text-amber-500"></i>
                    <div>
                        <p className="font-bold">Perhatian</p>
                        <p className="text-sm mt-1 opacity-90">{error}</p>
                    </div>
                </div>
            )}

            {/* Places Found Info */}
            {!isLoading && nearbyPlaces.length > 0 && (
                <div className="bg-white border border-slate-100 px-6 py-4 rounded-xl mb-6 shadow-sm flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mr-4">
                            <i className="fas fa-map-marked-alt text-lg"></i>
                        </div>
                        <span className="font-bold text-slate-700">
                            Ditemukan <span className="text-emerald-600">{nearbyPlaces.length}</span> tempat fisioterapi dalam radius 5 km
                        </span>
                    </div>
                    {isSearching && <i className="fas fa-spinner fa-spin text-emerald-500"></i>}
                </div>
            )}

            {/* Map Container */}
            <div className="w-full aspect-video rounded-3xl shadow-lg overflow-hidden border border-slate-200 mb-8 relative z-0">
                <div ref={mapRef} id="map" className="h-full w-full" />
            </div>

            {/* Places List */}
            {!isLoading && nearbyPlaces.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-6 font-heading flex items-center">
                        <i className="fas fa-list-ul mr-3 text-emerald-500"></i>
                        Daftar Klinik Fisioterapi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {nearbyPlaces.slice(0, 6).map((place) => (
                            <div
                                key={place.id}
                                className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer group ${selectedPlace?.id === place.id
                                    ? 'border-emerald-500 bg-emerald-50 shadow-md ring-1 ring-emerald-500'
                                    : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1'
                                    }`}
                                onClick={() => {
                                    setSelectedPlace(place);
                                    if (mapInstance.current) {
                                        mapInstance.current.setView([place.lat, place.lng], 16);
                                        // Find and open popup for this marker
                                        clinicMarkersRef.current.forEach(marker => {
                                            if (marker.getLatLng().lat === place.lat && marker.getLatLng().lng === place.lng) {
                                                marker.openPopup();
                                            }
                                        });
                                    }
                                }}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h4 className="font-bold text-lg text-slate-800 font-heading group-hover:text-emerald-600 transition-colors">
                                        {place.name}
                                    </h4>
                                    {place.distance && (
                                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ml-2">
                                            {formatDistance(place.distance)}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500 mb-3 flex items-start gap-2">
                                    <i className="fas fa-map-marker-alt text-emerald-500 mt-1 shrink-0"></i>
                                    {place.address}
                                </p>
                                {place.phone && (
                                    <p className="text-sm text-slate-500 mb-4 flex items-center gap-2">
                                        <i className="fas fa-phone text-emerald-500 shrink-0"></i>
                                        {place.phone}
                                    </p>
                                )}
                                {userLocation && (
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${place.lat},${place.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center w-full bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold py-3 px-4 rounded-xl transition-all duration-300 border border-slate-200 hover:border-emerald-200"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <i className="fas fa-directions mr-2"></i>
                                        Arahkan Rute
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NearTherapy;