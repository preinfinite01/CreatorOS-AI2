import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Trash2, ExternalLink, Calendar, FolderOpen } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Projects() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setProjects(data);
      }
      setIsLoading(false);
    };
    fetchProjects();
  }, [user]);

  const deleteProject = async (id: string) => {
    if (!user) return;
    try {
      await supabase.from('projects').delete().eq('id', id);
      setProjects(projects.filter(p => p.id !== id));
      toast({ title: "Project deleted" });
    } catch (e) {
      toast({ title: "Failed to delete project", variant: "destructive" });
    }
  };

  const filteredProjects = projects.filter(p =>
    (p.title ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (p.type ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'idea': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hook': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'title': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'script': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'workflow': return 'text-primary bg-primary/10 border-primary/20';
      default: return 'text-muted-foreground bg-white/5 border-white/10';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Projects</h1>
          <p className="text-muted-foreground">Your personal library of saved AI generations.</p>
        </div>
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search projects..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-white/5"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="glass p-12 flex flex-col items-center justify-center text-center border-dashed min-h-[400px]">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="font-medium text-lg mb-1">{search ? "No matches found" : "No projects yet"}</h3>
          <p className="text-muted-foreground text-sm max-w-sm mb-6">
            {search ? "Try adjusting your search terms." : "Save your favorite generations from the AI Tools to build your library."}
          </p>
          {!search && (
            <Link href="/tools">
              <Button className="bg-primary text-white">Go to AI Tools</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="glass p-5 border-white/10 flex flex-col group hover:border-white/20 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border uppercase tracking-wider ${getTypeColor(project.type)}`}>
                  {project.type}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10" onClick={() => deleteProject(project.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <h3 className="font-bold text-lg mb-2 line-clamp-2 flex-1 group-hover:text-primary transition-colors">
                {project.title}
              </h3>
              
              {project.platform && (
                <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider">{project.platform}</p>
              )}

              <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(project.created_at), 'MMM d, yyyy')}
                </span>
                <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-white/5">
                  View <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
