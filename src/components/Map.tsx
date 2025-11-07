import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Database } from "@/integrations/supabase/types";

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
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: ${color};
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
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

export function Map({ onMapClick, selectedProperty, properties }: MapProps) {
  const [center] = useState<[number, number]>([-15.7801, -47.9292]); // Brasília como padrão

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={12}
        className="absolute inset-0 rounded-lg shadow-lg z-0"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onMapClick={onMapClick} />
        <FlyToProperty property={selectedProperty} />

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
