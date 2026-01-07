"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { User, Settings, LogOut, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"

export function UserMenu() {
  const [userData, setUserData] = useState({
    nome: "Carregando...",
    cpf: "...",
    email: "",
    iniciais: "??"
  })

  const { user, loading } = useAuth()
  const userUID = user?.uid

  useEffect(() => {
    const fetchUser = async () => {
      // Guard clause: não fazer requisição se userUID não estiver disponível
      if (!user || !userUID || userUID === 'undefined' || typeof userUID !== 'string') {
        console.log('[UserMenu] Aguardando autenticação do usuário...', { user: !!user, userUID })
        return
      }

      try {
        const response = await fetch(`/api/users/${userUID}`)
        const data = await response.json()
        if (response.ok) {
          setUserData({
            nome: data.nome,
            cpf: data.cpf,
            email: data.email,
            iniciais: data.nome ? data.nome.substring(0, 2).toUpperCase() : "TL"
          })
        }
      } catch (error) {
        console.error("Erro ao carregar menu do usuário", error)
      }
    }
    fetchUser()
  }, [user, userUID])

  // Don't render the menu if user is not authenticated
  if (!user || !userUID) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 h-auto py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">{userData.iniciais}</AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium text-foreground">{userData.nome}</span>
            <span className="text-xs text-muted-foreground">CPF: {userData.cpf}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{userData.nome}</p>
            <p className="text-xs text-muted-foreground">{userData.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/perfil" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Meu Perfil
          </Link>
        </DropdownMenuItem>
        {/* Configurações removido temporariamente - página não existe */}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/login" className="cursor-pointer text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
