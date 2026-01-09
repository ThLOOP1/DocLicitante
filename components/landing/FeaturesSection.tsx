"use client"

import { motion } from "framer-motion";
import { Bot, Search, MessageSquare, Bell, Shield, FileCheck } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "Monitoramento Automático",
    description: "Robôs que verificam a Receita Federal, TST e outros órgãos diariamente. Nunca mais perca uma atualização.",
    size: "large",
  },
  {
    icon: Search,
    title: "Busca Inteligente (OCR)",
    description: "Encontre qualquer atestado pelo seu conteúdo. Nossa IA lê seus documentos.",
    size: "medium",
  },
  {
    icon: MessageSquare,
    title: "Alertas via E-mail",
    description: "Receba avisos personalizados antes do vencimento, direto no seu celular.",
    size: "medium",
  },
  {
    icon: Bell,
    title: "Notificações Inteligentes",
    description: "Alertas programados com antecedência configurável.",
    size: "small",
  },
  {
    icon: Shield,
    title: "Dados Seguros",
    description: "Criptografia de ponta a ponta em todos os documentos.",
    size: "small",
  },
  {
    icon: FileCheck,
    title: "Relatórios Completos",
    description: "Exporte relatórios detalhados para auditoria.",
    size: "small",
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

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Large Feature */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 lg:col-span-2 row-span-2"
          >
            <div className="h-full bg-gradient-to-br from-primary to-blue-700 rounded-3xl p-8 lg:p-10 text-primary-foreground relative overflow-hidden group">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-2xl" />
              </div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                  {features[0].title}
                </h3>
                <p className="text-lg text-white/80 max-w-md leading-relaxed mb-6">
                  {features[0].description}
                </p>

                {/* Mini demo */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Verificação em tempo real</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Receita Federal</span>
                      <span className="text-green-300">✓ Atualizado</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">TST</span>
                      <span className="text-green-300">✓ Atualizado</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">FGTS</span>
                      <span className="text-yellow-300">⏳ Verificando...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Medium Features */}
          {features.slice(1, 3).map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
            >
              <div className="h-full bg-card border border-border rounded-3xl p-6 lg:p-8 hover-lift group">
                <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Small Features */}
          {features.slice(3).map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 3) }}
            >
              <div className="h-full bg-card border border-border rounded-2xl p-5 lg:p-6 hover-lift group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
