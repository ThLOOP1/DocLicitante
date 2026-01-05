"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Loader2 } from "lucide-react"
import { useInputMask } from "@/hooks/useInputMask"
import { toast } from "sonner"

interface AddressFormProps {
    endereco: {
        cep: string
        logradouro: string
        numero: string
        complemento?: string
        bairro: string
        cidade: string
        estado: string
    }
    isEditing: boolean
    onChange: (field: string, value: string) => void
}

export function AddressForm({ endereco, isEditing, onChange }: AddressFormProps) {
    const { handleCEPChange, removeMask } = useInputMask()
    const [loadingCEP, setLoadingCEP] = useState(false)

    const fetchAddressByCEP = async (cep: string) => {
        const cleanCEP = removeMask(cep)

        if (cleanCEP.length !== 8) return

        setLoadingCEP(true)
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
            const data = await response.json()

            if (data.erro) {
                toast.error("CEP não encontrado")
                return
            }

            onChange("logradouro", data.logradouro || "")
            onChange("bairro", data.bairro || "")
            onChange("cidade", data.localidade || "")
            onChange("estado", data.uf || "")

            toast.success("Endereço preenchido automaticamente!")
        } catch (error) {
            console.error("Erro ao buscar CEP:", error)
            toast.error("Erro ao buscar CEP")
        } finally {
            setLoadingCEP(false)
        }
    }

    const handleCEPBlur = () => {
        if (endereco.cep && isEditing) {
            fetchAddressByCEP(endereco.cep)
        }
    }

    const handleCEPInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleCEPChange(e, (value) => {
            onChange("cep", value)

            // Buscar automaticamente ao atingir 8 dígitos
            const cleanCEP = removeMask(value)
            if (cleanCEP.length === 8 && isEditing) {
                console.log('[AddressForm] CEP completo detectado, buscando endereço:', cleanCEP)
                fetchAddressByCEP(value)
            }
        })
    }

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <div className="relative">
                        <Input
                            id="cep"
                            value={endereco.cep}
                            onChange={handleCEPInput}
                            onBlur={handleCEPBlur}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted" : ""}
                            placeholder="00000-000"
                        />
                        {loadingCEP && (
                            <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        )}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="logradouro">Logradouro</Label>
                    <Input
                        id="logradouro"
                        value={endereco.logradouro}
                        onChange={(e) => onChange("logradouro", e.target.value)}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input
                        id="numero"
                        value={endereco.numero}
                        onChange={(e) => onChange("numero", e.target.value)}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                        id="complemento"
                        value={endereco.complemento}
                        onChange={(e) => onChange("complemento", e.target.value)}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                        id="bairro"
                        value={endereco.bairro}
                        onChange={(e) => onChange("bairro", e.target.value)}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                        id="cidade"
                        value={endereco.cidade}
                        onChange={(e) => onChange("cidade", e.target.value)}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                        id="estado"
                        value={endereco.estado}
                        onChange={(e) => onChange("estado", e.target.value)}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                        maxLength={2}
                    />
                </div>
            </div>
        </div>
    )
}
