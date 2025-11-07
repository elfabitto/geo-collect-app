import { useState } from "react";
import { Database } from "@/integrations/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, MapPin, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Property = Database["public"]["Tables"]["properties"]["Row"];

interface PropertyListProps {
  properties: Property[];
  onEdit: (property: Property) => void;
  onSelect: (property: Property) => void;
  onDelete: () => void;
}

export function PropertyList({ properties, onEdit, onSelect, onDelete }: PropertyListProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProperties = properties.filter((property) => {
    const search = searchTerm.toLowerCase();
    return (
      property.property_number.toLowerCase().includes(search) ||
      (property.registration_number?.toLowerCase().includes(search) ?? false) ||
      (property.water_meter_number?.toLowerCase().includes(search) ?? false) ||
      (property.street?.toLowerCase().includes(search) ?? false) ||
      (property.door_number?.toLowerCase().includes(search) ?? false) ||
      property.address.toLowerCase().includes(search) ||
      (property.field_observations?.toLowerCase().includes(search) ?? false)
    );
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("properties").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Ponto deletado!",
        description: "O ponto foi removido com sucesso",
      });
      onDelete();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar",
        description: "Ocorreu um erro. Tente novamente.",
      });
    }
  };

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum ponto cadastrado</h3>
        <p className="text-sm text-muted-foreground">
          Clique no mapa para adicionar um novo ponto
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por matrícula, hidrômetro, endereço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchTerm && (
          <p className="text-sm text-muted-foreground mt-2">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
          </p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredProperties.length === 0 && searchTerm ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Search className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum resultado encontrado</h3>
            <p className="text-sm text-muted-foreground">
              Tente buscar por outro termo
            </p>
          </div>
        ) : (
          filteredProperties.map((property) => (
        <Card key={property.id} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div onClick={() => onSelect(property)}>
              <div className="mb-2">
                <h3 className="font-semibold text-base">
                  {property.registration_number || property.property_number}
                </h3>
                {property.water_meter_number && (
                  <p className="text-sm text-muted-foreground">
                    Hidrômetro: {property.water_meter_number}
                  </p>
                )}
              </div>
              <div className="text-sm space-y-1">
                {property.street && (
                  <p className="font-medium">{property.street}{property.door_number ? `, ${property.door_number}` : ''}</p>
                )}
                {property.complement && (
                  <p className="text-muted-foreground">{property.complement}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(property)}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="flex-1">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Deletar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja deletar este ponto? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(property.id)}>
                      Deletar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
          ))
        )}
      </div>
    </div>
  );
}
