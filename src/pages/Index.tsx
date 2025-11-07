import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Map } from "@/components/Map";
import { PropertyForm } from "@/components/PropertyForm";
import { PropertyList } from "@/components/PropertyList";
import { PropertyView } from "@/components/PropertyView";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, List, MapIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Session, User } from "@supabase/supabase-js";

type Property = Database["public"]["Tables"]["properties"]["Row"];

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [showList, setShowList] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar pontos",
        description: "Não foi possível carregar os pontos do mapa",
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadProperties();

      const channel = supabase
        .channel("properties-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "properties",
          },
          () => {
            setTimeout(() => {
              loadProperties();
            }, 0);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (!showForm) {
      setCoordinates({ lat, lng });
      setSelectedProperty(null);
      setShowForm(true);
      setShowList(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedProperty(null);
    setCoordinates(null);
    loadProperties();
  };

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setShowForm(true);
    setShowView(false);
    setShowList(false);
  };

  const handleView = (property: Property) => {
    setSelectedProperty(property);
    setShowView(true);
    setShowForm(false);
    setShowList(false);
  };

  const handleSelect = (property: Property) => {
    setSelectedProperty(property);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="bg-card border-b border-border p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <MapIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">WebGIS Coleta</h1>
            <p className="text-sm text-muted-foreground">Sistema de Coleta de Dados</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout} size="sm">
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className={`flex-1 ${showForm || showList ? "hidden md:block" : ""}`}>
          <Map
            onMapClick={handleMapClick}
            selectedProperty={selectedProperty}
            properties={properties}
          />
        </div>

        <div className={`w-full md:w-96 border-l border-border bg-card overflow-y-auto ${!showForm && !showList && !showView ? "hidden md:block" : ""}`}>
          {showForm ? (
            <PropertyForm
              property={selectedProperty}
              coordinates={coordinates}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowForm(false);
                setSelectedProperty(null);
                setCoordinates(null);
              }}
            />
          ) : showView && selectedProperty ? (
            <PropertyView
              property={selectedProperty}
              onClose={() => {
                setShowView(false);
                setSelectedProperty(null);
              }}
            />
          ) : (
            <PropertyList
              properties={properties}
              onView={handleView}
              onEdit={handleEdit}
              onSelect={handleSelect}
              onDelete={loadProperties}
            />
          )}
        </div>
      </div>

      {/* Botões flutuantes - escondidos quando formulário, lista ou visualização estão abertos */}
      {!showForm && !showList && !showView && (
        <div className="md:hidden fixed bottom-4 right-4 flex flex-col gap-2">
          <Button
            onClick={() => {
              setShowList(true);
              setShowForm(false);
            }}
            size="lg"
            className="rounded-full shadow-lg"
          >
            <List className="h-5 w-5 mr-2" />
            Pontos ({properties.length})
          </Button>
          <Button
            onClick={() => {
              setShowForm(true);
              setShowList(false);
              setCoordinates(null);
              setSelectedProperty(null);
            }}
            size="lg"
            className="rounded-full shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Novo Ponto
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;
