import { useState, useEffect, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Clipboard, Trash2 } from 'lucide-react';
import { useGetToolbox, useSaveToolbox } from '@/hooks/useQueries';
import { toast } from 'sonner';

interface ToolboxRowData {
  toolboxLabel: string;
  content: string;
}

export default function Toolbox() {
  const { data: toolboxData = [], isLoading } = useGetToolbox();
  const saveToolboxMutation = useSaveToolbox();
  
  const [rows, setRows] = useState<ToolboxRowData[]>(toolboxData);

  // Sync with backend data when it loads
  useEffect(() => {
    if (toolboxData.length > 0) {
      setRows(toolboxData);
    }
  }, [toolboxData]);

  const addRow = () => {
    const newRows = [...rows, { toolboxLabel: '', content: '' }];
    setRows(newRows);
    saveToolboxMutation.mutate(newRows);
  };

  const updateLabel = (index: number, label: string) => {
    const newRows = [...rows];
    newRows[index].toolboxLabel = label;
    setRows(newRows);
    saveToolboxMutation.mutate(newRows);
  };

  const updateContent = (index: number, content: string) => {
    const newRows = [...rows];
    newRows[index].content = content;
    setRows(newRows);
    saveToolboxMutation.mutate(newRows);
  };

  const deleteRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
    saveToolboxMutation.mutate(newRows);
  };

  const handlePaste = async (index: number) => {
    try {
      const text = await navigator.clipboard.readText();
      updateContent(index, text);
      toast.success('Content pasted from clipboard');
    } catch (error) {
      toast.error('Failed to read clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="cyber-border rounded-sm bg-card/50 p-4 backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between border-b border-primary/30 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-primary">TOOLBOX</h2>
        </div>
        <p className="text-xs text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="cyber-border rounded-sm bg-card/50 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between border-b border-primary/30 pb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-primary">TOOLBOX</h2>
        <Button
          onClick={addRow}
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-primary hover:bg-primary/20 hover:text-primary"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No entries. Click + to add.
          </p>
        ) : (
          rows.map((row, index) => (
            <div key={index} className="cyber-border rounded-sm bg-black/50 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  value={row.toolboxLabel}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateLabel(index, event.target.value)}
                  placeholder="LABEL"
                  className="h-7 text-xs uppercase tracking-wider bg-black/50 border-primary/30 text-foreground placeholder:text-muted-foreground/50 font-mono"
                />
                <Button
                  onClick={() => deleteRow(index)}
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-primary/70 hover:bg-primary/20 hover:text-primary"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Input
                  value={row.content}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateContent(index, event.target.value)}
                  placeholder="Content"
                  className="h-7 text-xs bg-black/50 border-primary/30 text-foreground placeholder:text-muted-foreground/50 font-mono"
                />
                <Button
                  onClick={() => handlePaste(index)}
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-primary/70 hover:bg-primary/20 hover:text-primary"
                  title="Paste from clipboard"
                >
                  <Clipboard className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
