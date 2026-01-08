"use client"

import { Quote, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

const TESTIMONIALS = [
  {
    name: "Ricardo Mendes",
    role: "Analista de Licitação Sênior",
    company: "Engenharia Master",
    content: "O DocLicitante mudou o nosso jogo. Antes perdíamos pelo menos duas licitações por ano por erro de certidões. Agora, temos paz total.",
    avatar: "RM"
  },
  {
    name: "Juliana Silva",
    role: "Diretora Contratual",
    company: "ServPlus LTDA",
    content: "A integração com o Google Drive é perfeita. Meus documentos estão sempre organizados e acessíveis de qualquer lugar. Simplesmente indispensável.",
    avatar: "JS"
  },
  {
    name: "Marcos Oliveira",
    role: "Proprietário",
    company: "Oliveira & Filhos",
    content: "Como pequena empresa, não temos equipe para ficar olhando certidões todo dia. Os alertas de e-mail do sistema são o meu salva-vidas.",
    avatar: "MO"
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Depoimentos</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Quem usa, <span className="text-indigo-600">recomenda</span>.
          </p>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Descubra por que centenas de profissionais de licitação trocaram suas planilhas manuais pelo DocLicitante.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, index) => (
            <Card key={index} className="border-slate-200 border-2 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-8 space-y-6">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <div className="relative">
                  <Quote className="h-10 w-10 text-indigo-100 absolute -top-4 -left-2 -z-10" />
                  <p className="text-slate-700 italic leading-relaxed relative z-10">
                    "{testimonial.content}"
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                  <Avatar className="h-12 w-12 border-2 border-indigo-100">
                    <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold">{testimonial.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{testimonial.name}</p>
                    <p className="text-xs text-slate-500">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-20 p-8 rounded-3xl bg-slate-900 text-center space-y-6">
          <p className="text-indigo-300 font-medium">Junte-se a mais de 500 empresas que não perdem mais licitações por burocracia.</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-white">4.9/5</span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">Avaliação Média</span>
            </div>
            <div className="h-10 w-px bg-slate-800 hidden sm:block" />
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-white">98%</span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">Satisfação</span>
            </div>
            <div className="h-10 w-px bg-slate-800 hidden sm:block" />
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-white">24/7</span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">Suporte especializado</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
