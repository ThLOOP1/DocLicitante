"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BellRing, Send, Info } from "lucide-react"

interface NotificationSectionProps {
    userData: {
        notificacoesEmail?: boolean
        telegramChatId?: string
    }
    isEditing: boolean
    onChange: (field: string, value: any) => void
}

export function NotificationSection({
    userData,
    isEditing,
    onChange
}: NotificationSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BellRing className="h-5 w-5" />
                    Preferências de Notificação
                </CardTitle>
                <CardDescription>
                    Gerencie como você deseja receber os alertas de documentos vencidos.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div className="flex items-center justify-between space-x-2">
                    <div className="flex flex-col space-y-1">
                        <Label htmlFor="notificacoesEmail" className="text-base">
                            Notificações por E-mail
                        </Label>
                        <span className="text-sm text-muted-foreground">
                            Receba um e-mail quando seus documentos estiverem prestes a vencer.
                        </span>
                    </div>
                    <Switch
                        id="notificacoesEmail"
                        checked={userData.notificacoesEmail !== false}
                        onCheckedChange={(checked) => onChange("notificacoesEmail", checked)}
                        disabled={!isEditing}
                    />
                </div>

                {/* Telegram Notifications */}
                <div className="pt-4 border-t border-border">
                    <div className="flex flex-col space-y-4">
                        <div>
                            <Label htmlFor="telegramChatId" className="text-base flex items-center gap-2">
                                <Send className="h-4 w-4 text-[#229ED9]" />
                                Alertas no Telegram
                            </Label>
                            <span className="text-sm text-muted-foreground block mt-1">
                                Para receber alertas diretamente no Telegram, informe o seu Chat ID.
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <Input
                                id="telegramChatId"
                                value={userData.telegramChatId || ""}
                                onChange={(e) => onChange("telegramChatId", e.target.value)}
                                disabled={!isEditing}
                                className={!isEditing ? "bg-muted flex-1" : "flex-1"}
                                placeholder="Ex: 123456789"
                            />
                            {isEditing && (
                                <Button 
                                    variant="outline" 
                                    onClick={() => window.open('https://t.me/userinfobot', '_blank')}
                                    className="gap-2"
                                >
                                    <Info className="h-4 w-4" />
                                    Descobrir meu ID
                                </Button>
                            )}
                        </div>
                        {isEditing && (
                            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                                <strong>Como usar:</strong> Inicie uma conversa com o bot <code>@userinfobot</code> no Telegram para descobrir o seu <strong>Id</strong> (apenas os números). Depois copie e cole no campo acima.
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
