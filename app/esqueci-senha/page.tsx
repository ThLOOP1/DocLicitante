"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Loader2, MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function EsqueciSenhaPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error("❌ Por favor, informe seu e-mail.")
      return
    }

    setLoading(true)
    try {
      const { sendPasswordResetEmail } = await import("firebase/auth")
      const { auth } = await import("@/lib/firebase")

      await sendPasswordResetEmail(auth, email.trim())

      setEnviado(true)
      toast.success("✅ Link enviado! Verifique sua caixa de entrada.")

      // Redireciona para login após 4 segundos
      setTimeout(() => router.push("/login"), 4000)
    } catch (error: any) {
      console.error("[EsqueciSenha] Erro:", error.code, error.message)

      if (error.code === "auth/user-not-found") {
        toast.error("❌ E-mail não encontrado. Verifique o e-mail digitado.")
      } else if (error.code === "auth/invalid-email") {
        toast.error("❌ E-mail inválido. Digite um e-mail válido.")
      } else if (error.code === "auth/too-many-requests") {
        toast.error("❌ Muitas tentativas. Aguarde alguns minutos e tente novamente.")
      } else if (error.code === "auth/network-request-failed") {
        toast.error("❌ Erro de conexão. Verifique sua internet.")
      } else {
        toast.error("❌ Erro ao enviar o e-mail. Tente novamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header bar */}
      <div className="bg-blue-700 text-white text-center py-2 text-sm font-medium">
        DocLicitante
      </div>

      {/* Language selector */}
      <div className="absolute top-16 right-8 text-sm text-muted-foreground">
        Português (Brasil)
      </div>

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

          {/* Form ou confirmação */}
          {enviado ? (
            <div className="flex flex-col items-center gap-4 text-center py-6">
              <MailCheck className="w-14 h-14 text-blue-600" />
              <p className="text-foreground font-medium text-lg">E-mail enviado!</p>
              <p className="text-muted-foreground text-sm">
                Um link para redefinir sua senha foi enviado para{" "}
                <span className="font-semibold text-foreground">{email}</span>.
                <br />
                Verifique sua caixa de entrada (e a pasta de spam).
              </p>
              <p className="text-xs text-muted-foreground">
                Redirecionando para o login em instantes...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-center text-base font-medium text-muted-foreground">
                  Informe seu e-mail para receber o link de redefinição de senha
                </h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  E-mail <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="h-12 bg-white border-input"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-blue-700 hover:bg-blue-800 text-white font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar link de redefinição"
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t">
        ©2025 DocLicitante - Todos os Direitos Reservados
      </footer>
    </div>
  )
}
