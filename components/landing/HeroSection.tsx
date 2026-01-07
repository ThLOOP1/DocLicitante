"use client"

import { motion } from "framer-motion";
import { CheckCircle, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 lg:pt-0 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container-narrow mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-6"
            >
              <Shield className="h-4 w-4" />
              Plataforma segura e automatizada
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
              Pare de perder licitações por{" "}
              <span className="gradient-text">documentos vencidos.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8">
              A plataforma inteligente que monitora, organiza e alerta sobre suas Certidões e Atestados automaticamente.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/cadastro">
                <Button variant="hero" size="xl">
                  Começar Grátis
                </Button>
              </Link>
            </div>

            {/* Microcopy */}
            <p className="mt-4 text-sm text-muted-foreground flex items-center gap-2 justify-center lg:justify-start">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Sem cartão de crédito
            </p>

            {/* Trust indicators */}
            <div className="mt-8 pt-8 border-t border-border/50">
              <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Setup em 5 minutos
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Dados criptografados
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Floating card - Glassmorphism */}
            <div className="relative">
              {/* Main card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="glass-card rounded-3xl p-6 sm:p-8 shadow-card"
              >
                {/* Success notification */}
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-500 rounded-full">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">Documento Válido</p>
                      <p className="text-sm text-green-600">CND Federal verificada com sucesso</p>
                    </div>
                  </div>
                </div>

                {/* Document preview */}
                <div className="bg-background rounded-2xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Certidão</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">Automático</span>
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">CND Federal</h4>
                  <p className="text-sm text-muted-foreground mb-3">Receita Federal do Brasil</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Validade</span>
                    <span className="font-medium text-foreground">15/03/2026</span>
                  </div>
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-green-400 to-green-500 rounded-full" />
                  </div>
                </div>
              </motion.div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -top-4 -right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-glow text-sm font-semibold"
              >
                +15 dias de aviso
              </motion.div>

              {/* Secondary floating card */}
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-6 -left-6 glass-card rounded-2xl p-4 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">12 documentos</p>
                    <p className="text-xs text-muted-foreground">monitorados 24/7</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
