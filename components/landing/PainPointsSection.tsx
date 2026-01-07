"use client"

import { motion } from "framer-motion";
import { AlertTriangle, Clock, TrendingDown, FileX } from "lucide-react";

const mainPainPoints = [
  {
    icon: Clock,
    title: "Gasto de tempo",
    description: "Horas perdidas conferindo manualmente cada certidão nos sites dos órgãos.",
  },
  {
    icon: AlertTriangle,
    title: "Documento Vencido",
    description: "O desespero de descobrir que uma certidão venceu bem na hora de anexar no portal.",
  },
  {
    icon: TrendingDown,
    title: "Oportunidades Perdidas",
    description: "Licitações perdidas e contratos cancelados por falhas simples de documentação.",
  },
  {
    icon: FileX,
    title: "Falta de Organização",
    description: "Arquivos espalhados por pastas e e-mails, dificultando o acesso rápido.",
  },
];

export function PainPointsSection() {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <div className="container-narrow mx-auto">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6">
            Participar de licitações não precisa ser um{" "}
            <span className="text-destructive">caos documental.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Sabemos o quanto é difícil manter tudo em dia. Por isso criamos a solução para os problemas que mais atrapalham o seu crescimento.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {mainPainPoints.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-2xl border border-border bg-card hover-lift"
            >
              <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center mb-4">
                <point.icon className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{point.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {point.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
