import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, X, MapPin } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { z } from "zod";

type Property = Database["public"]["Tables"]["properties"]["Row"];

const propertySchema = z.object({
  property_number: z.string().trim().min(1, { message: "Número do imóvel é obrigatório" }).max(50),
  water_meter_number: z.string().trim().max(50).optional(),
  address: z.string().trim().min(1, { message: "Endereço é obrigatório" }).max(500),
  field_observations: z.string().max(1000).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

interface PropertyFormProps {
  property?: Property | null;
  coordinates: { lat: number; lng: number } | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PropertyForm({ property, coordinates, onSuccess, onCancel }: PropertyFormProps) {
  const [propertyNumber, setPropertyNumber] = useState("");
  const [waterMeterNumber, setWaterMeterNumber] = useState("");
  const [address, setAddress] = useState("");
  const [observations, setObservations] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (property) {
      setPropertyNumber(property.property_number);
      setWaterMeterNumber(property.water_meter_number || "");
      setAddress(property.address);
      setObservations(property.field_observations || "");
      setLat(property.latitude);
      setLng(property.longitude);
      if (property.photo_url) {
        setPhotoPreview(property.photo_url);
      }
    } else if (coordinates) {
      setLat(coordinates.lat);
      setLng(coordinates.lng);
    }
  }, [property, coordinates]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: "A foto deve ter no máximo 5MB",
        });
        return;
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
          setLoading(false);
          toast({
            title: "Localização obtida!",
            description: "Coordenadas atualizadas com sua localização",
          });
        },
        (error) => {
          setLoading(false);
          toast({
            variant: "destructive",
            title: "Erro ao obter localização",
            description: "Verifique se permitiu o acesso à localização",
          });
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (lat === null || lng === null) {
      toast({
        variant: "destructive",
        title: "Coordenadas obrigatórias",
        description: "Clique no mapa ou use sua localização atual",
      });
      return;
    }

    setLoading(true);

    try {
      propertySchema.parse({
        property_number: propertyNumber,
        water_meter_number: waterMeterNumber || undefined,
        address,
        field_observations: observations || undefined,
        latitude: lat,
        longitude: lng,
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      let photoUrl = property?.photo_url || null;

      if (photo) {
        const fileExt = photo.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("property-photos")
          .upload(fileName, photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("property-photos")
          .getPublicUrl(fileName);

        photoUrl = publicUrl;
      }

      const propertyData = {
        user_id: user.id,
        property_number: propertyNumber,
        water_meter_number: waterMeterNumber || null,
        address,
        field_observations: observations || null,
        photo_url: photoUrl,
        latitude: lat,
        longitude: lng,
      };

      if (property) {
        const { error } = await supabase
          .from("properties")
          .update(propertyData)
          .eq("id", property.id);

        if (error) throw error;

        toast({
          title: "Ponto atualizado!",
          description: "As informações foram atualizadas com sucesso",
        });
      } else {
        const { error } = await supabase.from("properties").insert([propertyData]);

        if (error) throw error;

        toast({
          title: "Ponto criado!",
          description: "O novo ponto foi adicionado ao mapa",
        });
      }

      onSuccess();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Erro de validação",
          description: error.errors[0].message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao salvar",
          description: "Ocorreu um erro. Tente novamente.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full overflow-y-auto">
      <CardHeader>
        <CardTitle>{property ? "Editar Ponto" : "Novo Ponto"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="propertyNumber">Número do Imóvel *</Label>
            <Input
              id="propertyNumber"
              value={propertyNumber}
              onChange={(e) => setPropertyNumber(e.target.value)}
              required
              disabled={loading}
              placeholder="Ex: 1234"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="waterMeter">Número do Hidrômetro</Label>
            <Input
              id="waterMeter"
              value={waterMeterNumber}
              onChange={(e) => setWaterMeterNumber(e.target.value)}
              disabled={loading}
              placeholder="Ex: HID-5678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço *</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              disabled={loading}
              placeholder="Rua, número, bairro"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observações de Campo</Label>
            <Textarea
              id="observations"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              disabled={loading}
              placeholder="Anotações e observações"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Coordenadas *</Label>
            <div className="flex gap-2">
              <Input
                value={lat?.toFixed(6) || ""}
                readOnly
                placeholder="Latitude"
              />
              <Input
                value={lng?.toFixed(6) || ""}
                readOnly
                placeholder="Longitude"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
              disabled={loading}
              className="w-full"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Usar Minha Localização
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Foto da Casa</Label>
            {photoPreview && (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setPhoto(null);
                    setPhotoPreview("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={loading}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("photo")?.click()}
                disabled={loading}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {photoPreview ? "Trocar Foto" : "Adicionar Foto"}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {property ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
