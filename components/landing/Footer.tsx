"use client"

import { FileCheck, Mail, Phone, MapPin, Instagram, Facebook, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const logoUrl = "/logo/logo.png";

const footerLinks = [
  {
    title: "Produto",
    links: [
      { label: "Funcionalidades", href: "#funcionalidades" },
      { label: "Preços", href: "#precos" },
      { label: "Depoimentos", href: "#depoimentos" },
      { label: "Guia", href: "#" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre Nós", href: "#sobre" },
      { label: "Carreiras", href: "#" },
      { label: "Blog", href: "#blog" },
      { label: "Contato", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacidade", href: "#" },
      { label: "Termos", href: "#" },
      { label: "Cookies", href: "#" },
      { label: "Segurança", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8 lg:pt-20">
      <div className="container-narrow mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="relative h-8 w-28">
                <Image
                  src={logoUrl}
                  alt="DocLicitante"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-semibold tracking-tight">
                <span className="text-primary">Doc</span>
                <span className="text-foreground">Licitante</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs mb-6">
              A plataforma inteligente para gestão de documentos e certidões para empresas que participam de licitações.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {footerLinks.map((section) => (
            <div key={section.title} className="col-span-1">
              <h4 className="font-semibold text-foreground mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Column */}
          <div className="col-span-2 lg:col-span-1">
            <h4 className="font-semibold text-foreground mb-4">Suporte</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">contatodoclicitante@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">(98) 98119-4177</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">São Luís, MA</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DocLicitante. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
