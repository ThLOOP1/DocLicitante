"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Save, X, Loader2 } from "lucide-react"
import { useInputMask } from "@/hooks/useInputMask"

interface PersonalInfoFormProps {
    userData: {
        nome: string
        cpf: string
        email: string
        telefone?: string
        dataNascimento?: string
        genero?: 'masculino' | 'feminino' | 'outro' | 'prefiro-nao-informar'
        cargo?: string
    }
    isEditing: boolean
    saving: boolean
    onEdit: () => void
    onCancel: () => void
    onSave: () => void
    onChange: (field: string, value: string) => void
}

export function PersonalInfoForm({
    userData,
    isEditing,
    saving,
    onEdit,
    onCancel,
    onSave,
    onChange
}: PersonalInfoFormProps) {
    const { handlePhoneChange } = useInputMask()

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>Seus dados cadastrais como pessoa física</CardDescription>
                </div>
                {!isEditing ? (
                    <Button variant="outline" onClick={onEdit} className="gap-2 bg-transparent">
                        <Edit className="h-4 w-4" />
                        Editar
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onCancel} className="gap-2 bg-transparent" disabled={saving}>
                            <X className="h-4 w-4" />
                            Cancelar
                        </Button>
                        <Button onClick={onSave} className="gap-2" disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Salvar
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Dados Pessoais</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome Completo</Label>
                            <Input
                                id="nome"
                                value={userData.nome}
                                onChange={(e) => onChange("nome", e.target.value)}
                                disabled={!isEditing}
                                className={!isEditing ? "bg-muted" : ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cpf">CPF</Label>
                            <Input id="cpf" value={userData.cpf} disabled className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                value={userData.email}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="telefone">Telefone</Label>
                            <Input
                                id="telefone"
                                value={userData.telefone}
                                onChange={(e) => handlePhoneChange(e, (value) => onChange("telefone", value))}
                                disabled={!isEditing}
                                className={!isEditing ? "bg-muted" : ""}
                                placeholder="(00) 00000-0000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                            <Input
                                id="dataNascimento"
                                type="date"
                                value={userData.dataNascimento}
                                onChange={(e) => onChange("dataNascimento", e.target.value)}
                                disabled={!isEditing}
                                className={!isEditing ? "bg-muted" : ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="genero">Gênero</Label>
                            <Select
                                value={userData.genero}
                                onValueChange={(value) => onChange("genero", value)}
                                disabled={!isEditing}
                            >
                                <SelectTrigger id="genero" className={!isEditing ? "bg-muted" : ""}>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="masculino">Masculino</SelectItem>
                                    <SelectItem value="feminino">Feminino</SelectItem>
                                    <SelectItem value="outro">Outro</SelectItem>
                                    <SelectItem value="prefiro-nao-informar">Prefiro não informar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="cargo">Cargo/Profissão</Label>
                            <Input
                                id="cargo"
                                value={userData.cargo}
                                onChange={(e) => onChange("cargo", e.target.value)}
                                disabled={!isEditing}
                                className={!isEditing ? "bg-muted" : ""}
                                placeholder="Ex: Engenheiro Civil, Advogado, etc."
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
