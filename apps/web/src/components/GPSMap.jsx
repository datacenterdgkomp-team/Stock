
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';
import { getCurrentLocation, reverseGeocode, validateGPSAccuracy } from '@/lib/geolocationHelper';
import { toast } from 'sonner';

// Fix for default Leaflet marker icon in React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Component to dynamically change map view
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 16);
  }, [center, map]);
  return null;
};

const GPSMap = ({ onLocationFound, initialLocation = null, readOnly = false }) => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');

  const fetchLocation = async () => {
    if (readOnly) return;
    setLoading(true);
    try {
      const pos = await getCurrentLocation();
      validateGPSAccuracy(pos.accuracy, 150); // Allowing 150m for web
      
      const addr = await reverseGeocode(pos.lat, pos.lng);
      
      setLocation(pos);
      setAddress(addr);
      if (onLocationFound) onLocationFound({ ...pos, address: addr });
      toast.success('Lokasi berhasil didapatkan');
    } catch (error) {
      toast.error(error.message || 'Gagal mendapatkan lokasi GPS');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
      setAddress(initialLocation.address || '');
    } else if (!readOnly) {
      fetchLocation();
    }
  }, [initialLocation, readOnly]);

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="bg-card border border-border rounded-xl overflow-hidden min-h-[250px] h-full relative z-0 shadow-sm flex-1">
        {location ? (
          <MapContainer 
            center={[location.lat, location.lng]} 
            zoom={16} 
            scrollWheelZoom={!readOnly}
            className="w-full h-full min-h-[250px]"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={[location.lat, location.lng]} />
            <Marker position={[location.lat, location.lng]}>
              <Popup>{readOnly ? 'Lokasi Absen' : 'Lokasi Anda Saat Ini'}</Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div className="w-full h-full min-h-[250px] flex flex-col items-center justify-center bg-muted/50 p-6 text-center">
            <MapPin className="w-10 h-10 text-muted-foreground opacity-50 mb-3" />
            <p className="text-muted-foreground text-sm max-w-[250px]">
              {loading ? 'Sedang mencari sinyal GPS...' : 'Lokasi belum tersedia.'}
            </p>
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-muted/30 p-3 rounded-lg border border-border/50">
          <div className="flex items-start gap-2 overflow-hidden w-full">
            <MapPin className={`w-5 h-5 shrink-0 mt-0.5 ${location ? 'text-[hsl(var(--status-hadir))]' : 'text-muted-foreground'}`} />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {location ? 'Lokasi Terdeteksi' : 'Menunggu GPS...'}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                {address || 'Ketuk tombol untuk mendeteksi lokasi'}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchLocation} 
            disabled={loading}
            className="shrink-0 w-full sm:w-auto"
          >
            <Navigation className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Mendeteksi...' : 'Perbarui Lokasi'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default GPSMap;
