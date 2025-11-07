import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type Property = Database["public"]["Tables"]["properties"]["Row"];

interface MapProps {
  onMapClick?: (lat: number, lng: number) => void;
  selectedProperty?: Property | null;
  properties: Property[];
}

export function Map({ onMapClick, selectedProperty, properties }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchToken = async () => {
      const { data } = await supabase.from("profiles").select("*").limit(1);
      const token = localStorage.getItem("mapbox_token");
      if (token) {
        setMapboxToken(token);
      }
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;
    if (map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-47.9292, -15.7801],
      zoom: 12,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      "top-right"
    );

    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      }),
      "top-right"
    );

    if (onMapClick) {
      map.current.on("click", (e) => {
        onMapClick(e.lngLat.lat, e.lngLat.lng);
      });
    }

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, onMapClick]);

  useEffect(() => {
    if (!map.current) return;

    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    properties.forEach((property) => {
      if (!map.current) return;

      const el = document.createElement("div");
      el.className = "property-marker";
      el.style.width = "30px";
      el.style.height = "30px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = property.id === selectedProperty?.id ? "hsl(var(--secondary))" : "hsl(var(--primary))";
      el.style.border = "3px solid white";
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";

      const marker = new mapboxgl.Marker(el)
        .setLngLat([property.longitude, property.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div style="padding: 8px;">
              <h3 style="font-weight: bold; margin-bottom: 4px;">Imóvel ${property.property_number}</h3>
              <p style="margin: 2px 0;">${property.address}</p>
              ${property.water_meter_number ? `<p style="margin: 2px 0;">Hidrômetro: ${property.water_meter_number}</p>` : ""}
            </div>`
          )
        )
        .addTo(map.current);

      markersRef.current[property.id] = marker;
    });
  }, [properties, selectedProperty]);

  useEffect(() => {
    if (!map.current || !selectedProperty) return;

    map.current.flyTo({
      center: [selectedProperty.longitude, selectedProperty.latitude],
      zoom: 16,
      duration: 1500,
    });
  }, [selectedProperty]);

  if (!mapboxToken) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-map-bg p-8 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Configurar Mapbox</h3>
        <p className="text-muted-foreground mb-4 text-center max-w-md">
          Para usar o mapa, você precisa de um token do Mapbox.
          <br />
          Acesse{" "}
          <a
            href="https://mapbox.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            mapbox.com
          </a>{" "}
          e crie uma conta gratuita.
        </p>
        <input
          type="text"
          placeholder="Cole seu token do Mapbox aqui"
          className="px-4 py-2 border rounded-lg max-w-md w-full mb-4"
          onBlur={(e) => {
            const token = e.target.value.trim();
            if (token) {
              localStorage.setItem("mapbox_token", token);
              setMapboxToken(token);
              toast({
                title: "Token salvo!",
                description: "O mapa será carregado agora",
              });
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
    </div>
  );
}
