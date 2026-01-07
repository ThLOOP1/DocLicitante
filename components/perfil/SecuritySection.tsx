"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Lock, Edit, Save, X, Trash2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface SecuritySectionProps {
    userUID?: string
}

export function SecuritySection({ userUID }: SecuritySectionProps) {
    const [isEditingPassword, setIsEditingPassword] = useState(false)
    const [isDeletingAccount, setIsDeletingAccount] = useState(false)
    const [passwordData, setPasswordData] = useState({
        senhaAtual: "",
        novaSenha: "",
        confirmarSenha: "",
    })

    const handleSavePassword = () => {
        if (passwordData.novaSenha !== passwordData.confirmarSenha) {
            toast.error("As senhas não coincidem!")
            return
        }

        if (passwordData.novaSenha.length < 6) {
            toast.error("A senha deve ter pelo menos 6 caracteres!")
            return
        }

        toast.info("Funcionalidade de troca de senha via backend em breve")
        setIsEditingPassword(false)
        setPasswordData({ senhaAtual: "", novaSenha: "", confirmarSenha: "" })
    }

    const handleDeleteAccount = async () => {
        if (!userUID) {
            toast.error("Erro: Usuário não identificado")
            return
        }

        // Confirmação dupla
        const confirmacao1 = confirm(
            "⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\n" +
            "Ao excluir sua conta, TODOS os seus dados serão permanentemente removidos:\n" +
            "• Seu perfil e informações pessoais\n" +
            "• Todas as empresas cadastradas\n" +
            "• Todos os documentos enviados\n" +
            "• Histórico completo\n\n" +
            "Deseja realmente continuar?"
        )

        if (!confirmacao1) return

        const confirmacao2 = confirm(
            "🚨 ÚLTIMA CONFIRMAÇÃO!\n\n" +
            "Esta ação NÃO pode ser desfeita.\n\n" +
            "Digite OK para confirmar a exclusão permanente da sua conta."
        )

        if (!confirmacao2) return

        setIsDeletingAccount(true)
        console.log('[SecuritySection] Iniciando exclusão de conta para UID:', userUID)

        try {
            // Importar Firebase
            const { deleteUser } = await import('firebase/auth')
            const { doc, deleteDoc, collection, query, where, getDocs } = await import('firebase/firestore')
            const { auth, db } = await import('@/lib/firebase')

            const user = auth.currentUser
            if (!user) {
                throw new Error('Usuário não autenticado')
            }

            console.log('[SecuritySection] 1/5 - Buscando empresas do usuário...')
            // 1. Buscar todas as empresas do usuário
            const empresasQuery = query(collection(db, 'empresas'), where('donoUid', '==', userUID))
            const empresasSnapshot = await getDocs(empresasQuery)

            console.log(`[SecuritySection] Encontradas ${empresasSnapshot.size} empresa(s)`)

            // 2. Para cada empresa, deletar documentos e arquivos do Drive
            for (const empresaDoc of empresasSnapshot.docs) {
                const empresaId = empresaDoc.id
                const empresaData = empresaDoc.data()
                console.log(`[SecuritySection] Processando empresa: ${empresaData.razaoSocial || empresaId}`)

                // 2.1. Buscar documentos da empresa
                const docsQuery = query(collection(db, 'documentos'), where('empresaId', '==', empresaId))
                const docsSnapshot = await getDocs(docsQuery)

                console.log(`[SecuritySection] Encontrados ${docsSnapshot.size} documento(s) da empresa`)

                // 2.2. Deletar arquivos do Drive
                for (const docDoc of docsSnapshot.docs) {
                    const docData = docDoc.data()

                    if (docData.arquivo?.fileId) {
                        try {
                            console.log(`[SecuritySection] Deletando arquivo do Drive: ${docData.arquivo.fileId}`)
                            await fetch(`/api/drive/delete/${docData.arquivo.fileId}`, {
                                method: 'DELETE'
                            })
                        } catch (driveError) {
                            console.warn(`[SecuritySection] Erro ao deletar arquivo do Drive:`, driveError)
                        }
                    }

                    // 2.3. Deletar documento do Firestore
                    await deleteDoc(doc(db, 'documentos', docDoc.id))
                }

                // 2.4. Deletar pasta da empresa no Drive (se existir)
                if (empresaData.driveFolder?.folderId) {
                    try {
                        console.log(`[SecuritySection] Deletando pasta da empresa no Drive: ${empresaData.driveFolder.folderId}`)
                        await fetch(`/api/drive/delete/${empresaData.driveFolder.folderId}`, {
                            method: 'DELETE'
                        })
                    } catch (driveError) {
                        console.warn(`[SecuritySection] Erro ao deletar pasta do Drive:`, driveError)
                    }
                }

                // 2.5. Deletar empresa do Firestore
                console.log(`[SecuritySection] Deletando empresa do Firestore: ${empresaId}`)
                await deleteDoc(doc(db, 'empresas', empresaId))
            }

            console.log(`[SecuritySection] ${empresasSnapshot.size} empresa(s) e seus arquivos deletados`)

            console.log('[SecuritySection] 3/5 - Deletando perfil do usuário no Firestore...')
            // 3. Deletar documento do usuário no Firestore
            await deleteDoc(doc(db, 'usuarios', userUID))
            console.log('[SecuritySection] Perfil deletado do Firestore')

            console.log('[SecuritySection] 4/5 - Deletando conta do Firebase Auth...')
            // 4. Deletar usuário do Firebase Auth
            await deleteUser(user)
            console.log('[SecuritySection] ✅ Conta deletada do Firebase Auth')

            toast.success("Conta excluída com sucesso. Redirecionando para login...")

            // Redirecionar imediatamente para login
            window.location.href = '/login'

        } catch (error: any) {
            console.error('[SecuritySection] ❌ Erro ao excluir conta:', error)

            if (error.code === 'auth/requires-recent-login') {
                toast.error('⚠️ Por segurança, faça login novamente antes de excluir sua conta.')
            } else {
                toast.error('❌ Erro ao excluir conta. Tente novamente.')
            }
        } finally {
            setIsDeletingAccount(false)
        }
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Segurança
                        </CardTitle>
                        <CardDescription>Altere sua senha de acesso</CardDescription>
                    </div>
                    {!isEditingPassword ? (
                        <Button variant="outline" onClick={() => setIsEditingPassword(true)} className="gap-2 bg-transparent">
                            <Edit className="h-4 w-4" />
                            Alterar Senha
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsEditingPassword(false)
                                    setPasswordData({ senhaAtual: "", novaSenha: "", confirmarSenha: "" })
                                }}
                                className="gap-2 bg-transparent"
                            >
                                <X className="h-4 w-4" />
                                Cancelar
                            </Button>
                            <Button onClick={handleSavePassword} className="gap-2">
                                <Save className="h-4 w-4" />
                                Salvar Nova Senha
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    {!isEditingPassword ? (
                        <div className="text-sm text-muted-foreground">
                            <p>Clique em "Alterar Senha" para modificar sua senha de acesso.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="senhaAtual">Senha Atual</Label>
                                <Input
                                    id="senhaAtual"
                                    type="password"
                                    value={passwordData.senhaAtual}
                                    onChange={(e) => setPasswordData({ ...passwordData, senhaAtual: e.target.value })}
                                    placeholder="Digite sua senha atual"
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="novaSenha">Nova Senha</Label>
                                    <Input
                                        id="novaSenha"
                                        type="password"
                                        value={passwordData.novaSenha}
                                        onChange={(e) => setPasswordData({ ...passwordData, novaSenha: e.target.value })}
                                        placeholder="Digite a nova senha"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                                    <Input
                                        id="confirmarSenha"
                                        type="password"
                                        value={passwordData.confirmarSenha}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmarSenha: e.target.value })}
                                        placeholder="Confirme a nova senha"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Card de Exclusão de Conta */}
            <Card className="border-destructive/50 mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Zona de Perigo
                    </CardTitle>
                    <CardDescription>
                        Ações irreversíveis que afetam permanentemente sua conta
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <h4 className="font-semibold text-sm mb-2">Excluir Conta Permanentemente</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                                Esta ação irá deletar permanentemente:
                            </p>
                            <ul className="text-sm text-muted-foreground space-y-1 mb-4 ml-4">
                                <li>• Seu perfil e dados pessoais</li>
                                <li>• Todas as empresas cadastradas</li>
                                <li>• Todos os documentos enviados</li>
                                <li>• Todo o histórico de atividades</li>
                            </ul>
                            <p className="text-sm font-semibold text-destructive mb-4">
                                ⚠️ Esta ação NÃO pode ser desfeita!
                            </p>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteAccount}
                                disabled={isDeletingAccount}
                                className="gap-2"
                            >
                                {isDeletingAccount ? (
                                    <>
                                        <span className="animate-spin">⏳</span>
                                        Excluindo conta...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4" />
                                        Excluir Minha Conta
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
