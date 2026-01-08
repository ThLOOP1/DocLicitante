"use client"

import Link from "next/link"
import { Check, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const PLANS = [
  {
    name: "Starter",
    price: "Grátis",
    description: "Para quem está participando das primeiras licitações.",
    features: [
      "Até 10 documentos",
      "Alertas por e-mail",
      "Busca básica",
      "Suporte por e-mail",
      "Gestão de 1 Empresa",
    ],
    cta: "Começar Agora",
    href: "/cadastro",
    popular: false,
  },
  {
    name: "Pro",
    price: "R$ 97",
    period: "/ mês",
    description: "O controle total para empresas em crescimento.",
    features: [
      "Documentos Ilimitados",
      "Controle de Vencimento Dinâmico",
      "Alertas WhatsApp & E-mail",
      "Busca Inteligente (OCR)",
      "Gestão Multi-Empresas (Até 5)",
      "Sync com Google Drive",
    ],
    cta: "Testar Grátis por 14 Dias",
    href: "/cadastro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Sob Consulta",
    description: "Soluções customizadas para grandes grupos econômicos.",
    features: [
      "Empresas Ilimitadas",
      "API de Integração",
      "Single Sign-On (SSO)",
      "Painel de Auditoria",
      "Gerente de Sucesso (CSM)",
      "Treinamento de Equipe",
    ],
    cta: "Falar com Consultor",
    href: "#contato",
    popular: false,
  },
]

export function PricingSection() {
  return (
    <section id="planos" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Preços</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Escalável para <span className="text-indigo-600">cada etapa</span> do seu negócio.
          </p>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Sem taxas escondidas. Cancele ou altere seu plano a qualquer momento.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {PLANS.map((plan, index) => (
            <Card
              key={index}
              className={`relative rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl ${plan.popular
                  ? "border-indigo-600 border-4 shadow-xl -translate-y-4 scale-105 z-10"
                  : "border-slate-200 border-2"
                }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 py-1.5 px-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl shadow-sm">
                  Mais Recomendado
                </div>
              )}

              <CardHeader className="pt-10 text-center space-y-2">
                <CardTitle className="text-xl font-bold text-slate-900 uppercase tracking-wide">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                  <span className="text-slate-500 font-medium ml-1">{plan.period}</span>
                </div>
                <CardDescription className="text-slate-500 pt-2 min-h-[48px]">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                <div className="space-y-4">
                  {plan.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-center gap-3">
                      <div className={`shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${plan.popular ? "bg-indigo-600" : "bg-indigo-100"}`}>
                        <Check className={`h-3 w-3 ${plan.popular ? "text-white" : "text-indigo-600"}`} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="pb-10 pt-6">
                <Link href={plan.href} className="w-full">
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className={`w-full h-12 rounded-xl font-bold text-sm shadow-md transition-all ${plan.popular
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
                        : "border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                      }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <TooltipProvider>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 text-sm text-slate-500 font-medium cursor-help hover:border-indigo-200 transition-colors">
              Dúvidas sobre qual plano escolher?
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-indigo-600" />
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 text-white border-none p-3 max-w-xs text-xs">
                  <p>Nosso time de consultores está pronto para analisar sua base documental e sugerir a melhor configuração.</p>
                </TooltipContent>
              </Tooltip>
              <Link href="#contato" className="text-indigo-600 font-bold hover:underline">Fale conosco</Link>
            </div>
          </TooltipProvider>
        </div>
      </div>
    </section>
  )
}
