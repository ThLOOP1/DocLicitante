"use client"

import { Building2, CheckCircle2, Trophy, Users } from "lucide-react"

const STATS = [
  {
    icon: Users,
    value: "+500",
    label: "Empresas Cadastradas",
    description: "Empresas de todos os tamanhos confiam no DocLicitante."
  },
  {
    icon: CheckCircle2,
    value: "+10.000",
    label: "Documentos Gerenciados",
    description: "Mais de dez mil licitações protegidas pela nossa plataforma."
  },
  {
    icon: Trophy,
    value: "99.9%",
    label: "Uptime Garantido",
    description: "Seu back-office de documentos nunca para."
  }
]

export function SocialProofSection() {
  return (
    <section className="py-20 bg-indigo-900 overflow-hidden relative">
      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-20 -mr-48 -mt-24" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-[120px] opacity-20 -ml-48 -mb-24" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-indigo-200 text-sm font-bold uppercase tracking-widest mb-4">Números que Impressionam</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white">
            Autoridade construída com <span className="text-indigo-400">resultado real</span>.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {STATS.map((stat, index) => (
            <div
              key={index}
              className="group text-center space-y-4"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-800 border border-indigo-700 text-indigo-300 group-hover:scale-110 group-hover:bg-indigo-700 group-hover:text-white transition-all duration-300">
                <stat.icon className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {stat.value}
                </p>
                <p className="text-lg font-bold text-indigo-200">
                  {stat.label}
                </p>
              </div>
              <p className="text-sm text-indigo-300 max-w-[250px] mx-auto opacity-70">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Client Logos / Trust Teaser */}
        <div className="mt-24 pt-12 border-t border-indigo-800/50">
          <p className="text-center text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8">Empresas que utilizam nossa tecnologia</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 opacity-40 hover:opacity-100 transition-opacity">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-2 text-white">
                <Building2 className="h-6 w-6" />
                <span className="font-bold tracking-tighter text-sm italic">CONSTRUTORA {i}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
