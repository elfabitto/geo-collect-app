import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Crosshair } from "lucide-react";

type Property = Database["public"]["Tables"]["properties"]["Row"];

interface MapProps {
  onMapClick?: (lat: number, lng: number) => void;
  selectedProperty?: Property | null;
  properties: Property[];
}

// Fix para os ícones padrão do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Ícones customizados
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: ${color};
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

const primaryIcon = createCustomIcon("hsl(200, 95%, 45%)");
const secondaryIcon = createCustomIcon("hsl(155, 60%, 48%)");

function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

function FlyToProperty({ property }: { property: Property | null }) {
  const map = useMap();

  useEffect(() => {
    if (property) {
      map.flyTo([property.latitude, property.longitude], 16, {
        duration: 1.5,
      });
    }
  }, [property, map]);

  return null;
}

// Ícone de localização do usuário (vermelho pulsante)
const userLocationIcon = L.divIcon({
  className: "custom-marker-user",
  html: `
    <div style="
      position: relative;
      width: 20px;
      height: 20px;
    ">
      <div style="
        position: absolute;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: rgba(239, 68, 68, 0.3);
        animation: pulse 2s infinite;
      "></div>
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background-color: #ef4444;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.6);
        cursor: pointer;
        z-index: 1000;
      "></div>
    </div>
    <style>
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.5);
          opacity: 0.5;
        }
        100% {
          transform: scale(2);
          opacity: 0;
        }
      }
    </style>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function LocationButton({ onLocationFound }: { onLocationFound: (lat: number, lng: number) => void }) {
  const map = useMap();
  const [loading, setLoading] = useState(false);

  const handleLocate = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o clique propague
    setLoading(true);
    map.locate({ setView: true, maxZoom: 16 });
    
    const onFound = (e: L.LocationEvent) => {
      setLoading(false);
      onLocationFound(e.latlng.lat, e.latlng.lng);
      map.off('locationfound', onFound);
      map.off('locationerror', onError);
    };
    
    const onError = () => {
      setLoading(false);
      alert('Não foi possível obter sua localização. Verifique as permissões do navegador.');
      map.off('locationfound', onFound);
      map.off('locationerror', onError);
    };
    
    map.on('locationfound', onFound);
    map.on('locationerror', onError);
  };

  return (
    <Button
      onClick={handleLocate}
      disabled={loading}
      size="icon"
      className="absolute top-4 right-4 z-[1000] shadow-lg bg-white hover:bg-gray-100 text-primary"
      title="Minha Localização"
    >
      <Crosshair className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
    </Button>
  );
}

export function Map({ onMapClick, selectedProperty, properties }: MapProps) {
  const [center] = useState<[number, number]>([-1.4558, -48.4902]); // Belém, PA como padrão
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleLocationFound = (lat: number, lng: number) => {
    console.log('📍 Localização encontrada:', { lat, lng });
    setUserLocation({ lat, lng });
  };

  // Debug: mostrar quando userLocation muda
  useEffect(() => {
    if (userLocation) {
      console.log('✅ Marcador vermelho deve aparecer em:', userLocation);
    }
  }, [userLocation]);

  const handleUserLocationClick = () => {
    if (userLocation && onMapClick) {
      onMapClick(userLocation.lat, userLocation.lng);
    }
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={12}
        className="absolute inset-0 rounded-lg shadow-lg z-0"
        zoomControl={true}
      >
        {/* Camada de satélite - Google Satellite */}
        <TileLayer
          attribution='Imagery &copy; Google'
          url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
          maxZoom={22}
          maxNativeZoom={20}
        />
        {/* Camada de labels (nomes de ruas) - CartoDB com apenas labels */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png"
          maxZoom={22}
          maxNativeZoom={19}
          pane="shadowPane"
        />
        
        <MapClickHandler onMapClick={onMapClick} />
        <FlyToProperty property={selectedProperty} />
        <LocationButton onLocationFound={handleLocationFound} />

        {/* Marcador de localização do usuário */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userLocationIcon}
            eventHandlers={{
              click: handleUserLocationClick,
            }}
          >
            <Popup>
              <div className="p-2">
                <p className="font-bold text-sm">Sua Localização</p>
                <p className="text-xs text-muted-foreground">Clique para criar um ponto aqui</p>
              </div>
            </Popup>
          </Marker>
        )}

        {properties.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude, property.longitude]}
            icon={property.id === selectedProperty?.id ? secondaryIcon : primaryIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold mb-1">Imóvel {property.property_number}</h3>
                <p className="text-sm">{property.address}</p>
                {property.water_meter_number && (
                  <p className="text-sm">Hidrômetro: {property.water_meter_number}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
