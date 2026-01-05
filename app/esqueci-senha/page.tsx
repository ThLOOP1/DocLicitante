"use client"
import { useRouter } from "next/navigation"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function EsqueciSenhaPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header bar */}
      <div className="bg-blue-700 text-white text-center py-2 text-sm font-medium">DocLicitante
      </div>

      {/* Language selector */}
      <div className="absolute top-16 right-8 text-sm text-muted-foreground">Português (Brasil)</div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rotate-45 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white -rotate-45" />
              </div>
              <h1 className="text-3xl font-semibold text-foreground">DocLicitante</h1>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="login">
                Login <span className="text-destructive">*</span>
              </Label>
              <Input id="login" type="text" className="h-12 bg-white border-input" />
            </div>

            <div className="space-y-3">
              <Button className="w-full h-12 bg-blue-700 hover:bg-blue-800 text-white font-medium">Ok</Button>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t">
        ©2025 DocLicitante - Todos os Direitos Reservados
      </footer>
    </div>
  )
}
