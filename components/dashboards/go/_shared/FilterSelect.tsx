import { useState } from "react";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface FilterSelectProps {
  label: string;
  placeholder: string;
  options: string[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  width?: string;
}

export function FilterSelect({
  label,
  placeholder,
  options,
  selected,
  onSelectionChange,
  width = "w-[200px]",
}: FilterSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = searchTerm
    ? options.filter((option) => option.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  const allSelected = filteredOptions.length > 0 && filteredOptions.every((opt) => selected.includes(opt));

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange(selected.filter((item) => !filteredOptions.includes(item)));
    } else {
      onSelectionChange([...new Set([...selected, ...filteredOptions])]);
    }
  };

  const toggleOption = (option: string) => {
    onSelectionChange(
      selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option]
    );
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-muted-foreground">{label}</label>
      <Select>
        <SelectTrigger className={width}>
          <SelectValue
            placeholder={selected.length > 0 ? `${selected.length} selecionado(s)` : placeholder}
          />
        </SelectTrigger>
        <SelectContent>
          <div className="p-2 space-y-2">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Input
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8"
              />
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2 py-1 border-b pb-2">
              <Checkbox id="select-all" checked={allSelected} onCheckedChange={toggleAll} />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Selecionar todos
              </label>
            </div>
            <div className="max-h-[200px] overflow-y-auto space-y-1">
              {filteredOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id={`option-${option}`}
                    checked={selected.includes(option)}
                    onCheckedChange={() => toggleOption(option)}
                  />
                  <label htmlFor={`option-${option}`} className="text-sm cursor-pointer flex-1">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
