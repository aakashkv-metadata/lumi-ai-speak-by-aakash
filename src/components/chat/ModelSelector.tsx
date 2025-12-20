import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";

export type AIModel = {
  id: string;
  name: string;
  description: string;
};

export const AI_MODELS: AIModel[] = [
  { id: "gpt-4o", name: "GPT-4o", description: "Most capable, multimodal" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast and efficient" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "High performance" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Quick responses" },
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  disabled?: boolean;
}

export function ModelSelector({
  selectedModel,
  onModelChange,
  disabled = false,
}: ModelSelectorProps) {
  const currentModel = AI_MODELS.find((m) => m.id === selectedModel);

  return (
    <Select value={selectedModel} onValueChange={onModelChange} disabled={disabled}>
      <SelectTrigger className="w-[180px] bg-secondary border-border text-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <SelectValue placeholder="Select model">
            {currentModel?.name || "Select model"}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="bg-popover border-border">
        {AI_MODELS.map((model) => (
          <SelectItem
            key={model.id}
            value={model.id}
            className="focus:bg-accent focus:text-accent-foreground"
          >
            <div className="flex flex-col">
              <span className="font-medium">{model.name}</span>
              <span className="text-xs text-muted-foreground">{model.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
