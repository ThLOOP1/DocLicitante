"use client"

import { AlertCircle, FileX, LayoutGrid, XCircle } from "lucide-react"

const PAIN_POINTS = [
  {
    icon: FileX,
    title: "Documentos Vencidos",
    description: "Ser inabilitado em uma licitação porque esqueceu de renovar uma certidão simples.",
    color: "bg-red-50 text-red-600 border-red-100"
  },
  {
    icon: LayoutGrid,
    title: "Caos em Planilhas",
    description: "Tentar controlar datas de validade de 50 documentos em planilhas que ninguém atualiza.",
    color: "bg-amber-50 text-amber-600 border-amber-100"
  },
  {
    icon: AlertCircle,
    title: "Arquivos Perdidos",
    description: "Perder horas procurando a última versão do contrato social ou atestado técnico.",
    color: "bg-indigo-50 text-indigo-600 border-indigo-100"
  }
]

export function PainPointsSection() {
  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">O Problema</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Cansado de perder licitações por{" "}
            <span className="text-red-500 underline decoration-red-200 underline-offset-8">falha na burocracia</span>?
          </p>
          <p className="text-lg text-slate-600">
            O processo de licitação já é complexo o suficiente. O controle dos seus documentos não deveria ser um obstáculo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {PAIN_POINTS.map((point, index) => (
            <div
              key={index}
              className="group bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${point.color} mb-6 transition-transform group-hover:scale-110`}>
                <point.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{point.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 rounded-3xl bg-indigo-600 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 transition-transform group-hover:rotate-0">
            <XCircle className="h-40 w-40 text-white" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">Chega de estresse de última hora</h3>
              <p className="text-indigo-100">
                Nós automatizamos o que é chato para você focar no que realmente importa: ganhar o contrato.
              </p>
            </div>
            <div className="flex -space-x-3 overflow-hidden shrink-0">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="inline-block h-12 w-12 rounded-full ring-4 ring-indigo-600 bg-indigo-200 border-2 border-indigo-700" />
              ))}
              <div className="flex items-center justify-center h-12 w-12 rounded-full ring-4 ring-indigo-600 bg-white text-[10px] font-bold text-indigo-600">
                +500
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
