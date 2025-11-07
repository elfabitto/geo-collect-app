import { Database } from "@/integrations/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MapPin } from "lucide-react";
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
    <div className="space-y-2 h-full overflow-y-auto p-2">
      {properties.map((property) => (
        <Card key={property.id} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div onClick={() => onSelect(property)}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">Imóvel {property.property_number}</h3>
                  {property.water_meter_number && (
                    <p className="text-sm text-muted-foreground">
                      Hidrômetro: {property.water_meter_number}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm mb-2">{property.address}</p>
              {property.field_observations && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {property.field_observations}
                </p>
              )}
              {property.photo_url && (
                <img
                  src={property.photo_url}
                  alt="Foto do imóvel"
                  className="w-full h-32 object-cover rounded-md mb-2"
                />
              )}
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
      ))}
    </div>
  );
}
