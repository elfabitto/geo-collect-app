import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, MapPin, Droplet, Home, Hash, FileText, Image as ImageIcon } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Property = Database["public"]["Tables"]["properties"]["Row"];
type PropertyPhoto = Database["public"]["Tables"]["property_photos"]["Row"];

interface PropertyViewProps {
  property: Property;
  onClose: () => void;
}

export function PropertyView({ property, onClose }: PropertyViewProps) {
  const [photos, setPhotos] = useState<PropertyPhoto[]>([]);

  useEffect(() => {
    const loadPhotos = async () => {
      const { data } = await supabase
        .from("property_photos")
        .select("*")
        .eq("property_id", property.id)
        .order("created_at", { ascending: true });
      
      if (data) {
        setPhotos(data);
      }
    };
    
    loadPhotos();
  }, [property.id]);

  return (
    <Card className="h-full overflow-y-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Visualizar Ponto</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Matrícula / Nº Ligação</p>
              <p className="text-base font-semibold">{property.registration_number || property.property_number}</p>
            </div>
          </div>

          {property.water_meter_number && (
            <div className="flex items-start gap-3">
              <Droplet className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Hidrômetro</p>
                <p className="text-base">{property.water_meter_number}</p>
              </div>
            </div>
          )}

          {property.street && (
            <div className="flex items-start gap-3">
              <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                <p className="text-base">{property.street}</p>
                {property.door_number && <p className="text-sm text-muted-foreground">Nº {property.door_number}</p>}
                {property.complement && <p className="text-sm text-muted-foreground">{property.complement}</p>}
              </div>
            </div>
          )}

          {property.field_observations && (
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Observações</p>
                <p className="text-base whitespace-pre-wrap">{property.field_observations}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Coordenadas</p>
              <p className="text-sm font-mono">
                Lat: {property.latitude.toFixed(6)}<br />
                Lng: {property.longitude.toFixed(6)}
              </p>
            </div>
          </div>

          {photos.length > 0 && (
            <div className="flex items-start gap-3">
              <ImageIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">Fotos ({photos.length})</p>
                <div className="space-y-1">
                  {photos.map((photo) => (
                    <a
                      key={photo.id}
                      href={photo.photo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-primary hover:underline truncate"
                    >
                      {photo.photo_name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4">
          <Button onClick={onClose} className="w-full">
            Fechar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
