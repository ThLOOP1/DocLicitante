"use client"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Importar Firebase Auth
      const { signInWithEmailAndPassword } = await import('firebase/auth')
      const { auth } = await import('@/lib/firebase')

      console.log('[Login] Tentando login com email:', formData.email)

      // Tentar fazer login com Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      )

      console.log('[Login] Login bem-sucedido! UID:', userCredential.user.uid)
      toast.success(`Bem-vindo de volta!`)

      // Redirecionar para a página inicial
      router.push("/")
    } catch (error: any) {
      console.error('[Login] Erro ao fazer login:', error.code, error.message)

      // Mensagens de erro específicas baseadas no código do Firebase
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        toast.error('❌ Email ou senha incorretos. Verifique seus dados e tente novamente.')
      } else if (error.code === 'auth/user-not-found') {
        toast.error('❌ Usuário não encontrado. Verifique o email digitado.')
      } else if (error.code === 'auth/invalid-email') {
        toast.error('❌ Email inválido. Digite um email válido.')
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('❌ Muitas tentativas de login. Tente novamente mais tarde.')
      } else if (error.code === 'auth/network-request-failed') {
        toast.error('❌ Erro de conexão. Verifique sua internet.')
      } else {
        toast.error('❌ Erro ao fazer login. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header bar */}
      <div className="bg-blue-700 text-white text-center py-2 text-sm font-medium"> DocLicitante
      </div>

      {/* Language selector */}
      <div className="absolute top-16 right-8 text-sm text-muted-foreground">Português (Brasil)</div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-[400px] space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rotate-45 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white -rotate-45" />
              </div>
              <h1 className="text-3xl font-semibold text-foreground">DocLicitante</h1>
            </div>
          </div>

          {/* Login form */}
          <div className="space-y-6">
            <h2 className="text-center text-lg font-medium text-foreground mt-4">Entrar na sua conta</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="sr-only">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="E-mail"
                  className="h-12 bg-white border-input"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="sr-only">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Senha"
                  className="h-12 bg-white border-input"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-blue-700 hover:bg-blue-800 text-white font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : "Entrar"}
              </Button>
            </form>

            <div className="flex flex-col items-center gap-2 text-sm">
              <Link href="/cadastro" className="text-muted-foreground hover:text-foreground transition-colors">
                Não tem cadastro? (Empresa)
              </Link>
              <Link href="/esqueci-senha" className="text-muted-foreground hover:text-foreground transition-colors">
                Esqueceu sua senha?
              </Link>
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
