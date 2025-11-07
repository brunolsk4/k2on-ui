"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Search from "./components/search";
import ListItem from "./components/list-item";
import FAQ from "./components/faq";

const faqItems = [
  {
    id: "teste",
    question: "Existe um teste de 3 dias?",
    answer:
      "Sim, oferecemos um teste gratuito de 3 dias para todos os novos usuários. Você pode acessar todos os recursos premium durante este período sem quaisquer limitações. Nenhum cartão de crédito é necessário para iniciar seu teste."
  },
  {
    id: "premium",
    question: "Quais são os benefícios da Assinatura Premium?",
    answer:
      "Os membros premium têm acesso a recursos avançados, suporte prioritário, uso ilimitado, conteúdo exclusivo e acesso antecipado a novos recursos. Você também recebe gerenciamento de conta dedicado e integrações personalizadas."
  },
  {
    id: "pagamento",
    question: "Como funciona o pagamento dos planos?",
    answer:
      "Oferecemos opções de pagamento flexíveis, incluindo planos mensais e anuais. Os assinantes anuais recebem um desconto de 20%. Todos os planos incluem uma garantia de devolução de 7 dias."
  },
  {
    id: "suporte",
    question: "Que tipo de suporte vocês oferecem?",
    answer:
      "Oferecemos suporte por e-mail 24 horas por dia, 7 dias por semana para todos os usuários, chat ao vivo para membros premium e suporte telefônico dedicado para clientes corporativos. Nosso tempo médio de resposta é inferior a 2 horas."
  }
];

export default function Page() {
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return faqItems
    return faqItems.filter((it) => (
      it.question.toLowerCase().includes(q) || it.answer.toLowerCase().includes(q)
    ))
  }, [query])

  function focusFaq() {
    try { document.getElementById("faqs")?.scrollIntoView({ behavior: "smooth" }) } catch {}
  }
  return (
    <div>
      <div className="bg-muted relative">
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="mb-6 flex justify-end">
            <Link href="/home">
              <Button variant="outline" size="sm">Voltar ao app</Button>
            </Link>
          </div>
          <div className="mb-12 text-center">
            <h1 className="mb-6 text-4xl leading-tight font-bold md:text-5xl">
              Como podemos ajudar você hoje?
            </h1>
            <p className="text-muted-foreground mx-auto max-w-3xl text-lg leading-relaxed text-balance">
              Pesquise um tópico ou pergunta, confira nossas perguntas frequentes e guias, entre em contato conosco para obter informações detalhadas
              Suporte
            </p>
          </div>

          <div className="mb-16">
            <Search value={query} onChange={setQuery} onSubmit={focusFaq} />
            {query && (
              <div className="text-muted-foreground mt-2 text-center text-sm">
                {filtered.length} resultado(s) para “{query}”
              </div>
            )}
          </div>

          <div className="mx-auto -mb-36 grid max-w-6xl gap-6 md:grid-cols-3">
            <ListItem
              title="FAQs"
              description="Dúvidas frequentes"
              linkText="Ir para FAQs"
              href="#"
            />
            <ListItem
              title="Artigos e Guias"
              description="Artigos e recursos para te guiar"
              linkText="Ver guias"
              href="#"
            />
            <ListItem
              title="Suporte"
              description="Entre em contato conosco para obter suporte mais detalhado"
              linkText="Entre em contato"
              href="https://wa.me/+5544988283140"
            />
          </div>
        </div>
      </div>

      <div id="faqs" className="bg-faq py-16 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-foreground mb-4 text-2xl font-bold md:text-3xl">
              Perguntas frequentes
            </h2>
            <p className="text-muted-foreground mx-auto max-w-3xl">
              Aqui estão as perguntas mais frequentes que você pode verificar antes de começar
            </p>
          </div>

          <FAQ items={filtered} />
        </div>
      </div>
    </div>
  );
}
