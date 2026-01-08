"use client"

import Link from "next/link"
import { FileText, Github, Instagram, Linkedin, Mail, Twitter } from "lucide-react"

const FOOTER_LINKS = {
  produto: [
    { label: "Funcionalidades", href: "#funcionalidades" },
    { label: "Planos de Preços", href: "#planos" },
    { label: "Segurança de Dados", href: "#" },
    { label: "API para Desenvolvedores", href: "#" },
  ],
  empresa: [
    { label: "Sobre o DocLicitante", href: "#sobre" },
    { label: "Blog de Licitações", href: "#" },
    { label: "Vagas e Carreiras", href: "#" },
    { label: "Contato Suporte", href: "#" },
  ],
  legal: [
    { label: "Termos de Uso", href: "#" },
    { label: "Política de Privacidade", href: "#" },
    { label: "Cookies", href: "#" },
    { label: "Conformidade LGPD", href: "#" },
  ]
}

export function Footer() {
  return (
    <footer className="bg-slate-900 pt-20 pb-10 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Info */}
          <div className="col-span-2 lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-1 px-2 bg-indigo-600 rounded shadow-lg shadow-indigo-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-white" />
                <span className="text-white font-bold tracking-tight">DocLicitante</span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
              A plataforma inteligente que automatiza o back-office documental para empresas que buscam excelência em licitações públicas.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-700 transition-all">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-700 transition-all">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-700 transition-all">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6 underline decoration-indigo-600 decoration-2 underline-offset-8">Produto</h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.produto.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-slate-400 text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6 underline decoration-indigo-600 decoration-2 underline-offset-8">Empresa</h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.empresa.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-slate-400 text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6 underline decoration-indigo-600 decoration-2 underline-offset-8">Legal</h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.legal.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-slate-400 text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-500 text-xs font-medium">
            © {new Date().getFullYear()} DocLicitante Systems. Todos os direitos reservados.
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700 text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
              <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
              Status: Sistemas Operacionais
            </div>
            <Link href="mailto:contato@doclicitante.com.br" className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors text-xs font-bold">
              <Mail className="h-4 w-4" />
              contato@doclicitante.com.br
            </Link>
          </div>
        </div>
      </div>

      {/* Background Decorative */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-600 to-transparent opacity-50" />
    </footer>
  )
}
