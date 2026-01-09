"use client"

import { motion } from "framer-motion";

const companies = [
  { name: "GLL Engenharia" },
  { name: "One Emprendimento" },
  { name: "GAL BENDER" },
  { name: "Varejão Galb" },
  { name: "EV de Moura" },
  { name: "GLL Construtora" },
];

export function SocialProofSection() {
  return (
    <section id="sobre" className="py-16 lg:py-20 bg-background border-y border-border/50">
      <div className="container-narrow mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wide mb-10"
        >
          Empresas que confiam no DocLicitante
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-8 lg:gap-12"
        >
          {companies.map((company, index) => (
            <div
              key={company.name}
              className="flex items-center justify-center opacity-40 hover:opacity-70 transition-opacity"
            >
              {/* Placeholder logo */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-muted-foreground">
                    {company.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-muted-foreground hidden sm:block">
                  {company.name}
                </span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {[
            { value: "50+", label: "Empresas ativas" },
            { value: "1.000+", label: "Documentos monitorados" },
            { value: "99.9%", label: "Uptime garantido" },
            { value: "R$ 2M+", label: "Economizados em multas" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl lg:text-4xl font-bold text-foreground mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
