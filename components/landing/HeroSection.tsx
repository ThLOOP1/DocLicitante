"use client"

import Link from "next/link"
import { CheckCircle, ArrowRight, ShieldCheck, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
      {/* Background Gradients */}
      <div className="absolute top-0 inset-x-0 h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left space-y-8 max-w-2xl mx-auto lg:mx-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>Plataforma 100% segura e em conformidade</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
              A gestão completa dos seus documentos de{" "}
              <span className="text-indigo-600">licitação</span> em um só lugar.
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
              Monitore vencimentos, organize certidões e receba alertas automáticos.
              Nunca mais seja inabilitado por burocracia e perca oportunidades de negócio.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/cadastro" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-lg h-14 px-8 rounded-full shadow-lg shadow-indigo-200 group">
                  Testar Grátis Agora
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Sem cartão de crédito
              </p>
            </div>

            <div className="pt-8 grid grid-cols-2 gap-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock className="h-5 w-5 text-indigo-500" />
                <span className="text-sm font-medium">Setup em 2 minutos</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <ShieldCheck className="h-5 w-5 text-indigo-500" />
                <span className="text-sm font-medium">Dados Criptografados</span>
              </div>
            </div>
          </div>

          {/* Visual Element / Mockup */}
          <div className="relative group lg:block hidden">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative bg-white border border-slate-200 rounded-[2rem] shadow-2xl overflow-hidden aspect-square flex items-center justify-center">
              {/* Abstract Representation of the System */}
              <div className="w-full h-full p-8 bg-slate-50 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
                  <div className="h-10 w-10 bg-indigo-200 rounded-full animate-bounce" />
                </div>
                <div className="space-y-4">
                  <div className="h-12 w-full bg-white rounded-xl border border-slate-200 shadow-sm flex items-center px-4 gap-3">
                    <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="h-4 w-1/2 bg-slate-100 rounded" />
                    <div className="ml-auto h-6 w-20 bg-green-50 text-green-700 text-[10px] font-bold flex items-center justify-center rounded-full">VÁLIDO</div>
                  </div>
                  <div className="h-12 w-full bg-white rounded-xl border border-slate-200 shadow-sm flex items-center px-4 gap-3">
                    <div className="h-6 w-6 bg-amber-100 rounded-full flex items-center justify-center border border-amber-200">
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="h-4 w-2/3 bg-slate-100 rounded" />
                    <div className="ml-auto h-6 w-20 bg-amber-50 text-amber-700 text-[10px] font-bold flex items-center justify-center rounded-full tracking-tight">VENCE EM 5D</div>
                  </div>
                  <div className="h-12 w-full bg-white rounded-xl border border-slate-200 shadow-sm flex items-center px-4 gap-3 opacity-50">
                    <div className="h-6 w-6 bg-indigo-100 rounded-full" />
                    <div className="h-4 w-1/3 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="mt-auto p-4 bg-indigo-600 rounded-2xl text-white space-y-2">
                  <p className="text-xs font-medium opacity-80 uppercase tracking-wider">Alertas Pendentes</p>
                  <p className="text-2xl font-bold">2 Documentos</p>
                  <div className="h-1.5 w-full bg-indigo-400 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
