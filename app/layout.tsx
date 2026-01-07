import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/AuthContext"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DocLicitante - Gestão de Documentação",
  description: "Sistema de gestão de documentação para empresas licitantes",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/Logo_escuro.png",
        media: "(prefers-color-scheme: light)", // Navegador em modo claro
      },
      {
        url: "/Logo_claro.png",
        media: "(prefers-color-scheme: dark)", // Navegador em modo escuro
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}

