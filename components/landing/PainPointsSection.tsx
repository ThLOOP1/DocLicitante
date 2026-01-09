"use client"

import { motion } from "framer-motion";
import { AlertTriangle, Search, FileX } from "lucide-react";

const painPoints = [
  {
    icon: AlertTriangle,
    title: "Perdeu o prazo",
    description: "Perdeu o prazo de renovação e foi inabilitado da licitação.",
  },
  {
    icon: Search,
    title: "Tempo desperdiçado",
    description: "Horas perdidas procurando atestados em pastas e e-mails.",
  },
  {
    icon: FileX,
    title: "Equipe sobrecarregada",
    description: "Planilhas manuais que ninguém consegue manter atualizadas.",
  },
];

export function PainPointsSection() {
  return (
    <section className="section-padding bg-background">
      <div className="container-narrow mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
            A burocracia custa <span className="gradient-text">caro.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Você não está sozinho. Milhares de empresas enfrentam os mesmos problemas todos os dias.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {painPoints.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full bg-card border border-border rounded-2xl p-6 lg:p-8 hover-lift">
                <div className="w-14 h-14 bg-destructive/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-destructive/20 transition-colors">
                  <point.icon className="h-7 w-7 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {point.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {point.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
