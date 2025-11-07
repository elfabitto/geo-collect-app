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
  registration_number: z.string().trim().min(1, { message: "Matrícula/Nº Ligação é obrigatório" }).max(50),
  water_meter_number: z.string().trim().max(50).optional(),
  street: z.string().trim().min(1, { message: "Logradouro é obrigatório" }).max(300),
  door_number: z.string().trim().max(20).optional(),
  complement: z.string().trim().max(100).optional(),
  field_observations: z.string().max(1000).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// Função auxiliar para preparar dados compatíveis com o schema atual
const preparePropertyData = (data: any) => {
  // Remove campos que podem não existir no banco ainda
  const { registration_number, street, door_number, complement, ...rest } = data;
  
  // Retorna apenas os campos que existem no schema original
  return {
    ...rest,
    // Adiciona os novos campos apenas se eles existirem no banco
    ...(registration_number && { registration_number }),
    ...(street && { street }),
    ...(door_number && { door_number }),
    ...(complement && { complement }),
  };
};

interface PropertyFormProps {
  property?: Property | null;
  coordinates: { lat: number; lng: number } | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PropertyForm({ property, coordinates, onSuccess, onCancel }: PropertyFormProps) {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [waterMeterNumber, setWaterMeterNumber] = useState("");
  const [street, setStreet] = useState("");
  const [doorNumber, setDoorNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [observations, setObservations] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<Array<{id: string, photo_name: string, photo_url: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadPhotos = async () => {
      if (property) {
        setRegistrationNumber(property.registration_number || property.property_number);
        setWaterMeterNumber(property.water_meter_number || "");
        setStreet(property.street || "");
        setDoorNumber(property.door_number || "");
        setComplement(property.complement || "");
        setObservations(property.field_observations || "");
        setLat(property.latitude);
        setLng(property.longitude);
        
        // Carregar fotos existentes
        const { data: photosData } = await supabase
          .from("property_photos")
          .select("*")
          .eq("property_id", property.id)
          .order("created_at", { ascending: true });
        
        if (photosData) {
          setExistingPhotos(photosData);
        }
      } else if (coordinates) {
        setLat(coordinates.lat);
        setLng(coordinates.lng);
      }
    };
    
    loadPhotos();
  }, [property, coordinates]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          toast({
            variant: "destructive",
            title: "Arquivo muito grande",
            description: `${file.name} deve ter no máximo 5MB`,
          });
          continue;
        }
        newPhotos.push(file);
      }
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = async (photoId: string) => {
    try {
      const { error } = await supabase
        .from("property_photos")
        .delete()
        .eq("id", photoId);
      
      if (error) throw error;
      
      setExistingPhotos(existingPhotos.filter(p => p.id !== photoId));
      toast({
        title: "Foto removida!",
        description: "A foto foi deletada com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao remover foto",
        description: "Não foi possível remover a foto",
      });
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
      // Gerar endereço completo
      const fullAddress = [street, doorNumber, complement].filter(Boolean).join(", ");
      
      propertySchema.parse({
        registration_number: registrationNumber,
        water_meter_number: waterMeterNumber || undefined,
        street,
        door_number: doorNumber || undefined,
        complement: complement || undefined,
        field_observations: observations || undefined,
        latitude: lat,
        longitude: lng,
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const propertyData = {
        user_id: user.id,
        property_number: registrationNumber, // Manter compatibilidade
        registration_number: registrationNumber,
        water_meter_number: waterMeterNumber || null,
        street,
        door_number: doorNumber || null,
        complement: complement || null,
        address: fullAddress,
        field_observations: observations || null,
        photo_url: null,
        latitude: lat,
        longitude: lng,
      };

      let propertyId = property?.id;

      if (property) {
        const { error } = await supabase
          .from("properties")
          .update(propertyData)
          .eq("id", property.id);

        if (error) throw error;
      } else {
        const { data: newProperty, error } = await supabase
          .from("properties")
          .insert([propertyData])
          .select()
          .single();

        if (error) throw error;
        propertyId = newProperty.id;
      }

      // Upload de novas fotos
      if (photos.length > 0 && propertyId) {
        for (const photo of photos) {
          const fileExt = photo.name.split(".").pop();
          const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("property-photos")
            .upload(fileName, photo);

          if (uploadError) {
            console.error("Erro ao fazer upload:", uploadError);
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from("property-photos")
            .getPublicUrl(fileName);

          // Salvar referência da foto no banco
          await supabase.from("property_photos").insert({
            property_id: propertyId,
            photo_url: publicUrl,
            photo_name: photo.name,
          });
        }
      }

      toast({
        title: property ? "Ponto atualizado!" : "Ponto criado!",
        description: property 
          ? "As informações foram atualizadas com sucesso"
          : "O novo ponto foi adicionado ao mapa",
      });

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
            <Label htmlFor="registrationNumber">Matrícula / Nº Ligação *</Label>
            <Input
              id="registrationNumber"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              required
              disabled={loading}
              placeholder="Ex: 12345"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="waterMeter">Hidrômetro</Label>
            <Input
              id="waterMeter"
              value={waterMeterNumber}
              onChange={(e) => setWaterMeterNumber(e.target.value)}
              disabled={loading}
              placeholder="Ex: HID-5678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">Logradouro *</Label>
            <Input
              id="street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              required
              disabled={loading}
              placeholder="Ex: Rua das Flores"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doorNumber">Número de Porta</Label>
            <Input
              id="doorNumber"
              value={doorNumber}
              onChange={(e) => setDoorNumber(e.target.value)}
              disabled={loading}
              placeholder="Ex: 123"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              value={complement}
              onChange={(e) => setComplement(e.target.value)}
              disabled={loading}
              placeholder="Ex: Apto 201, Bloco B"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observação de Campo</Label>
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
            <Label>Fotos</Label>
            
            {/* Fotos existentes */}
            {existingPhotos.length > 0 && (
              <div className="space-y-1">
                {existingPhotos.map((photo) => (
                  <div key={photo.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <a 
                      href={photo.photo_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline truncate flex-1"
                    >
                      {photo.photo_name}
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExistingPhoto(photo.id)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Novas fotos para upload */}
            {photos.length > 0 && (
              <div className="space-y-1">
                {photos.map((photo, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-secondary/20 rounded">
                    <span className="text-sm truncate flex-1">{photo.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePhoto(index)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <Input
              id="photos"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              disabled={loading}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("photos")?.click()}
              disabled={loading}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              Adicionar Fotos
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Latitude / Longitude *</Label>
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
