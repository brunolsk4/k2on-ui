"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  { title: "Resumo do meu funil de vendas desta semana", category: "Vendas" },
  { title: "Ideias de campanha para Black Friday", category: "Marketing" },
  { title: "Crie um texto para WhatsApp sobre nosso novo produto", category: "Copy" },
  { title: "Quais KPIs devo acompanhar hoje?", category: "Operações" }
];

export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center p-8">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-5xl font-bold">
          <span className="bg-gradient-to-r from-pink-500 via-red-500 to-red-600 bg-clip-text text-transparent">
            Olá! Como posso ajudar?
          </span>
        </h1>
        <p className="text-muted-foreground text-xl">Sugestões para começar</p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            onClick={() => onSuggestionClick(suggestion.title)}
            className="group h-auto border-gray-200 p-6 text-left hover:bg-gray-50"
          >
            <div className="flex w-full items-start justify-between">
              <div className="flex-1 pr-4">
                <p className="text-muted-foreground text-sm leading-relaxed text-wrap">{suggestion.title}</p>
                <span className="text-xs text-foreground/60">{suggestion.category}</span>
              </div>
              <ArrowUpRight className="group-hover:text-primary text-muted-foreground h-4 w-4 flex-shrink-0" />
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}

