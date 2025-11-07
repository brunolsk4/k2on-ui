import { Clock, Phone, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface MessageEditorProps {
  message: string;
  onMessageChange: (value: string) => void;
  scheduleTime: string;
  onScheduleTimeChange: (value: string) => void;
  recipients: string[];
  onRecipientsChange: (value: string[]) => void;
  isActive: boolean;
  onIsActiveChange: (value: boolean) => void;
}

export const MessageEditor = ({
  message,
  onMessageChange,
  scheduleTime,
  onScheduleTimeChange,
  recipients,
  onRecipientsChange,
  isActive,
  onIsActiveChange,
}: MessageEditorProps) => {
  const [phoneInput, setPhoneInput] = useState("");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const metric = e.dataTransfer.getData("metric");
    if (metric) {
      const cursorPosition = message.length;
      const newMessage =
        message.slice(0, cursorPosition) +
        `{{${metric}}}` +
        message.slice(cursorPosition);
      onMessageChange(newMessage);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const addRecipient = () => {
    if (phoneInput.trim() && !recipients.includes(phoneInput.trim())) {
      onRecipientsChange([...recipients, phoneInput.trim()]);
      setPhoneInput("");
    }
  };

  const removeRecipient = (phone: string) => {
    onRecipientsChange(recipients.filter((r) => r !== phone));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addRecipient();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
      <div className="bg-card rounded-xl border p-6 card-elevated">
        <h2 className="text-xl font-semibold mb-4">Mensagem do Relatório</h2>

        <div className="space-y-4">
          <div>
            <Label className="mb-2">Mensagem</Label>
            <Textarea
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              placeholder="Digite a mensagem ou arraste métricas aqui...&#10;&#10;Exemplo:&#10;Hoje vendemos {{vendas}}, tivemos {{devolucoes}} e investimos {{investimento}}."
              className="min-h-[200px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Use variáveis no formato {`{{métrica}}`} para inserir valores dinâmicos
            </p>
          </div>

          <div>
            <Label className="mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horário de Envio
            </Label>
            <Input
              type="time"
              value={scheduleTime}
              onChange={(e) => onScheduleTimeChange(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <Label className="mb-2 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Destinatários WhatsApp
            </Label>
            <div className="flex gap-2 mb-3">
              <Input
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ex: +55 11 99999-9999"
                className="flex-1"
              />
              <Button onClick={addRecipient} type="button">
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recipients.map((phone) => (
                <div
                  key={phone}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm"
                >
                  <Phone className="h-3 w-3" />
                  <span>{phone}</span>
                  <button
                    onClick={() => removeRecipient(phone)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Label htmlFor="active-toggle" className="font-medium">
              Relatório Ativo
            </Label>
            <Switch
              id="active-toggle"
              checked={isActive}
              onCheckedChange={onIsActiveChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
