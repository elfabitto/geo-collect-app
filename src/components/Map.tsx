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

export function Map({ onMapClick, selectedProperty, properties }: MapProps) {
  const [center] = useState<[number, number]>([-1.4558, -48.4902]); // Belém, PA como padrão

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={12}
        className="absolute inset-0 rounded-lg shadow-lg z-0"
        zoomControl={true}
      >
        {/* Camada de satélite */}
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />
        {/* Camada de labels (nomes de ruas) - CartoDB com apenas labels */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png"
          maxZoom={19}
          pane="shadowPane"
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
