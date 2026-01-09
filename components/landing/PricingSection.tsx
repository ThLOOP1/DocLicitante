"use client"

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const plans = [
  {
    name: "Essencial",
    price: "Grátis",
    priceNote: "Para sempre",
    description: "Perfeito para começar a organizar seus documentos.",
    features: [
      "Até 10 documentos",
      "Alertas por e-mail",
      "Busca básica",
      "Suporte por e-mail",
    ],
    cta: "Começar Grátis",
    href: "/cadastro",
    popular: false,
  },
  {
    name: "Pro",
    price: "R$ 97",
    priceNote: "por mês",
    description: "Para empresas que participam de licitações regularmente.",
    features: [
      "Documentos ilimitados",
      "Monitoramento automático",
      "Alertas via WhatsApp",
      "Busca inteligente (OCR)",
      "Relatórios avançados",
      "Suporte prioritário",
      "API de integração",
    ],
    cta: "Testar por 14 dias",
    href: "/cadastro",
    popular: true,
  },
];

export function PricingSection() {
  return (
    <section id="precos" className="section-padding bg-muted/30">
      <div className="container-narrow mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 lg:mb-16"
        >
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wide mb-3">
            Preços
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
            Planos simples,{" "}
            <span className="gradient-text">sem surpresas.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para sua empresa. Cancele quando quiser.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-1.5 rounded-full shadow-glow">
                    Mais Popular
                  </span>
                </div>
              )}

              <div
                className={`h-full rounded-3xl p-6 lg:p-8 transition-all ${plan.popular
                    ? "bg-card border-2 border-primary shadow-glow-lg"
                    : "bg-card border border-border"
                  }`}
              >
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl lg:text-5xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">/{plan.priceNote}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.popular ? "bg-primary/10" : "bg-muted"
                        }`}>
                        <Check className={`h-3.5 w-3.5 ${plan.popular ? "text-primary" : "text-muted-foreground"
                          }`} />
                      </div>
                      <span className="text-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href} className="w-full">
                  <Button
                    variant={plan.popular ? "hero" : "outline"}
                    size="lg"
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Teaser */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-10 text-sm text-muted-foreground"
        >
          Tem dúvidas?{" "}
          <a href="#" className="text-primary hover:underline font-medium">
            Fale com nosso time
          </a>
        </motion.p>
      </div>
    </section>
  );
}
