"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export default function CadastroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
    pais: "brasil",
    role: "usuario" // Padrão: usuário comum
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handlePaisChange = (value: string) => {
    setFormData({ ...formData, pais: value })
  }

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação 1: Senhas devem coincidir
    if (formData.senha !== formData.confirmarSenha) {
      toast.error("❌ As senhas não coincidem")
      return
    }

    // Validação 2: Senha mínima de 6 caracteres
    if (formData.senha.length < 6) {
      toast.error("❌ A senha deve ter pelo menos 6 caracteres")
      return
    }

    // Validação 3: CPF deve ter 11 dígitos (sem formatação)
    const cpfLimpo = formData.cpf.replace(/\D/g, '')
    if (cpfLimpo.length !== 11) {
      toast.error("❌ CPF inválido. Digite os 11 dígitos.")
      return
    }

    // Validação 4: Email deve ser válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("❌ Email inválido. Digite um email válido.")
      return
    }

    setLoading(true)
    console.log('[Cadastro] Iniciando cadastro:', { email: formData.email, nome: formData.nome, role: formData.role })

    try {
      // Importar Firebase Auth e Firestore
      const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = await import('firebase/auth')
      const { doc, setDoc } = await import('firebase/firestore')
      const { auth, db } = await import('@/lib/firebase')

      // Criar usuário no Firebase Auth
      console.log('[Cadastro] Criando usuário no Firebase Auth...')
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.senha
      )

      const uid = userCredential.user.uid
      console.log('[Cadastro] Usuário criado no Auth! UID:', uid)

      // Salvar dados completos no Firestore (coleção usuarios)
      console.log('[Cadastro] Salvando dados na coleção usuarios...')
      await setDoc(doc(db, 'usuarios', uid), {
        nome: formData.nome,
        email: formData.email,
        cpf: formData.cpf,
        telefone: formData.telefone || '',
        pais: formData.pais,
        role: formData.role, // Nível de usuário escolhido
        statusConta: 'ativo', // Status da conta: ativo por padrão
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      console.log('[Cadastro] ✅ Cadastro concluído com sucesso!')
      toast.success("✅ Cadastro realizado com sucesso! Redirecionando para o dashboard...")

      // Limpar formulário
      setFormData({
        nome: "",
        email: "",
        cpf: "",
        telefone: "",
        senha: "",
        confirmarSenha: "",
        pais: "brasil",
        role: "usuario"
      })

      // Aguardar 1.5s para o usuário ver a mensagem, depois redirecionar
      // O usuário já está autenticado automaticamente pelo createUserWithEmailAndPassword
      setTimeout(() => {
        router.push("/")
      }, 1500)

    } catch (error: any) {
      console.error('[Cadastro] ❌ Erro ao cadastrar:', error.code, error.message)

      // Mensagens de erro específicas baseadas no código do Firebase
      if (error.code === 'auth/email-already-in-use') {
        console.log('[Cadastro] Email já existe no Auth. Verificando se existe no Firestore...')

        try {
          // Tentar fazer login para pegar o UID
          const { signInWithEmailAndPassword, signOut } = await import('firebase/auth')
          const { doc, getDoc, setDoc } = await import('firebase/firestore')
          const { auth, db } = await import('@/lib/firebase')

          const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.senha)
          const uid = userCredential.user.uid

          // Verificar se existe no Firestore
          const userDoc = await getDoc(doc(db, 'usuarios', uid))

          if (!userDoc.exists()) {
            console.log('[Cadastro] Conta órfã detectada! Recriando documento no Firestore...')

            // Recriar documento no Firestore
            await setDoc(doc(db, 'usuarios', uid), {
              nome: formData.nome,
              email: formData.email,
              cpf: formData.cpf,
              telefone: formData.telefone || '',
              pais: formData.pais,
              role: formData.role,
              statusConta: 'ativo',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            })

            console.log('[Cadastro] ✅ Conta recriada com sucesso!')
            toast.success("✅ Conta recuperada e atualizada! Redirecionando...")

            setTimeout(() => {
              router.push("/")
            }, 1500)
            return
          } else {
            // Usuário existe em ambos - fazer logout e mostrar erro
            await signOut(auth)
            alert('Este e-mail já possui cadastro. Tente fazer login.')
            toast.error('❌ Este email já está cadastrado.')
          }
        } catch (loginError: any) {
          console.error('[Cadastro] Erro ao verificar conta órfã:', loginError)

          if (loginError.code === 'auth/wrong-password') {
            alert('Este e-mail já possui cadastro com senha diferente. Tente fazer login ou recuperar sua senha.')
            toast.error('❌ Email já cadastrado. Use a senha correta ou recupere sua senha.')
          } else {
            alert('Este e-mail já possui cadastro. Tente fazer login.')
            toast.error('❌ Este email já está cadastrado.')
          }
        }
      } else if (error.code === 'auth/invalid-email') {
        toast.error('❌ Email inválido. Digite um email válido.')
      } else if (error.code === 'auth/weak-password') {
        toast.error('❌ Senha muito fraca. Use pelo menos 6 caracteres.')
      } else if (error.code === 'auth/network-request-failed') {
        toast.error('❌ Erro de conexão. Verifique sua internet e tente novamente.')
      } else {
        toast.error('❌ Dados não cadastrados. Verifique as informações e tente novamente.')
      }

      // Manter usuário na tela para correção
      console.log('[Cadastro] Usuário mantido na tela para correção dos dados')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header bar */}
      <div className="bg-blue-700 text-white text-center py-2 text-sm font-medium">DocLicitante
      </div>

      {/* Language selector */}
      <div className="absolute top-16 right-8 text-sm text-muted-foreground">Português (Brasil)</div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-2xl space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rotate-45 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white -rotate-45" />
              </div>
              <h1 className="text-3xl font-semibold text-foreground">DocLicitante</h1>
            </div>
          </div>

          {/* Registration form */}
          <div className="space-y-6">
            <h2 className="text-center text-lg font-medium text-foreground">Cadastrar-se</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* País */}
              <div className="space-y-2">
                <Label htmlFor="pais">
                  País <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.pais} onValueChange={handlePaisChange}>
                  <SelectTrigger id="pais" className="h-12 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brasil">Brasil</SelectItem>
                    <SelectItem value="portugal">Portugal</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Nível de Usuário (Role) */}
              <div className="space-y-2">
                <Label htmlFor="role">
                  Tipo de Usuário <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger id="role" className="h-12 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usuario">Usuário Comum</SelectItem>
                    <SelectItem value="fornecedor">Fornecedor/Empresa</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Nome e E-mail */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">
                    Nome completo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nome"
                    type="text"
                    className="h-12 bg-white border-input"
                    required
                    value={formData.nome}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    E-mail <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    className="h-12 bg-white border-input"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* CPF e Telefone */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">
                    CPF <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    className="h-12 bg-white border-input"
                    required
                    value={formData.cpf}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    className="h-12 bg-white border-input"
                    value={formData.telefone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Senha e Confirmar Senha */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="senha">
                    Senha <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="senha"
                    type="password"
                    className="h-12 bg-white border-input"
                    required
                    value={formData.senha}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">
                    Confirme a senha <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="confirmarSenha"
                    type="password"
                    className="h-12 bg-white border-input"
                    required
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-blue-700 hover:bg-blue-800 text-white font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cadastrando...
                    </>
                  ) : "Cadastre-se"}
                </Button>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
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
