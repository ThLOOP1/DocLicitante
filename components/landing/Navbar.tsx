"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FileText, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b" : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-indigo-600 rounded-lg group-hover:bg-indigo-700 transition-colors">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-indigo-600">
              DocLicitante
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#funcionalidades" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              Funcionalidades
            </Link>
            <Link href="#planos" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              Planos
            </Link>
            <Link href="#sobre" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              Sobre
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-semibold text-indigo-600">
                Entrar
              </Button>
            </Link>
            <Link href="/cadastro">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full px-5">
                Começar Grátis
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-indigo-600"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b absolute w-full left-0 p-4 space-y-4 shadow-lg animate-in slide-in-from-top duration-300">
          <Link
            href="#funcionalidades"
            className="block text-base font-medium text-slate-600 px-2 py-1"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Funcionalidades
          </Link>
          <Link
            href="#planos"
            className="block text-base font-medium text-slate-600 px-2 py-1"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Planos
          </Link>
          <Link
            href="#sobre"
            className="block text-base font-medium text-slate-600 px-2 py-1"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Sobre
          </Link>
          <div className="pt-4 border-t flex flex-col gap-2">
            <Link href="/login" className="w-full">
              <Button variant="ghost" className="w-full text-indigo-600 font-semibold" onClick={() => setIsMobileMenuOpen(false)}>
                Entrar
              </Button>
            </Link>
            <Link href="/cadastro" className="w-full">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full" onClick={() => setIsMobileMenuOpen(false)}>
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
