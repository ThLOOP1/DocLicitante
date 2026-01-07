"use client"

import { motion } from "framer-motion";
import { Bot, Search, MessageSquare, Bell, Shield, FileCheck } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "Monitoramento Automático",
    description: "Robôs que verificam a Receita Federal, TST e outros órgãos diariamente. Nunca mais perca uma atualização.",
  },
  {
    icon: Search,
    title: "Busca Inteligente (OCR)",
    description: "Encontre qualquer atestado pelo seu conteúdo.",
  },
  {
    icon: MessageSquare,
    title: "Alertas via E-mail",
    description: "Receba avisos personalizados antes do vencimento, direto no seu celular.",
  },
  {
    icon: Bell,
    title: "Notificações Inteligentes",
    description: "Alertas programados com antecedência configurável.",
  },
  {
    icon: Shield,
    title: "Dados Seguros",
    description: "Criptografia de ponta a ponta em todos os documentos.",
  },
  {
    icon: FileCheck,
    title: "Relatórios Completos",
    description: "Exporte relatórios detalhados para auditoria.",
  },
];

export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="section-padding bg-muted/30">
      <div className="container-narrow mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 lg:mb-16"
        >
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wide mb-3">
            Funcionalidades
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
            Tudo o que você precisa para{" "}
            <span className="gradient-text">blindar sua empresa.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Uma plataforma completa para gerenciar todos os documentos da sua empresa de forma automatizada.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="h-full bg-card border border-border rounded-3xl p-6 lg:p-8 hover-lift group"
            >
              <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
