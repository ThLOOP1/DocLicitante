"use client"

import { Bell, Cloud, Globe, MessageSquare, Search, ShieldCheck } from "lucide-react"

const FEATURES = [
  {
    icon: Bell,
    title: "Alertas de Vencimento",
    description: "Receba notificações proativas antes que suas certidões vençam, via e-mail e painel.",
    className: "lg:col-span-2 bg-indigo-50 border-indigo-100"
  },
  {
    icon: Cloud,
    title: "Google Drive Sync",
    description: "Seus arquivos são salvos e organizados automaticamente na sua nuvem preferida.",
    className: "lg:col-span-1 bg-white border-slate-200"
  },
  {
    icon: Globe,
    title: "Gestão Multi-Empresas",
    description: "Controle documentos de diferentes CNPJs em uma única conta centralizada.",
    className: "lg:col-span-1 bg-white border-slate-200"
  },
  {
    icon: Search,
    title: "Busca Inteligente (OCR)",
    description: "Encontre qualquer atestado pelo seu conteúdo. Nossa IA lê seus documentos para você.",
    className: "lg:col-span-2 bg-slate-900 text-white border-slate-800"
  }
]

export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-3">Funcionalidades</h2>
            <p className="text-4xl font-extrabold text-slate-900 mb-6">
              Poderoso para empresas grandes, <br className="hidden md:block" />
              <span className="text-indigo-600">simples</span> para quem está começando.
            </p>
            <p className="text-lg text-slate-600">
              Cada detalhe foi pensado para eliminar o trabalho manual e reduzir os riscos de erro na gestão documental da sua licitação.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <div className="p-3 bg-white rounded-2xl shadow-sm">
              <ShieldCheck className="h-10 w-10 text-indigo-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Segurança de Grado Bancário</p>
              <p className="text-sm text-slate-600">Seus documentos protegidos por criptografia de ponta a ponta.</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className={`p-8 rounded-3xl border transition-all duration-300 hover:shadow-xl ${feature.className}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${index === 3 ? "bg-white text-slate-900" : "bg-indigo-600 text-white"}`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${index === 3 ? "text-white" : "text-slate-900"}`}>
                {feature.title}
              </h3>
              <p className={`text-lg leading-relaxed ${index === 3 ? "text-slate-400" : "text-slate-600"}`}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Floating elements teaser */}
        <div className="mt-20 flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2 font-bold text-slate-500">
            <MessageSquare className="h-5 w-5" /> WhatsApp Business
          </div>
          <div className="flex items-center gap-2 font-bold text-slate-500">
            <Globe className="h-5 w-5" /> Brasil API
          </div>
          <div className="flex items-center gap-2 font-bold text-slate-500">
            <Cloud className="h-5 w-5" /> Google Cloud
          </div>
        </div>
      </div>
    </section>
  )
}
