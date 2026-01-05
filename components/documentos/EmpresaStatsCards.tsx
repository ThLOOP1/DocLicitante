import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, AlertCircle } from "lucide-react"

interface EmpresaStatsCardsProps {
    validos: number
    vencendo: number
    vencidos: number
    filtroAtivo: string
    onFiltroChange: (filtro: any) => void
}

export function EmpresaStatsCards({
    validos,
    vencendo,
    vencidos,
    filtroAtivo,
    onFiltroChange
}: EmpresaStatsCardsProps) {
    const stats = [
        { label: "Válidos", count: validos, color: "text-green-600", icon: CheckCircle2, filtro: 'validos' },
        { label: "Vencendo em breve", count: vencendo, color: "text-yellow-500", icon: AlertCircle, filtro: 'vencendo' },
        { label: "Vencidos/Pendentes", count: vencidos, color: "text-red-500", icon: AlertCircle, filtro: 'vencidos' }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {stats.map(stat => (
                <Card
                    key={stat.label}
                    className={`cursor-pointer transition-all hover:shadow-lg ${filtroAtivo === stat.filtro ? 'ring-2 ring-primary shadow-md' : 'border-muted-foreground/10'}`}
                    onClick={() => onFiltroChange(filtroAtivo === stat.filtro ? 'todos' : stat.filtro)}
                >
                    <CardContent className="pt-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                            <p className={`text-3xl font-bold ${stat.color}`}>{stat.count}</p>
                            {filtroAtivo === stat.filtro && (
                                <p className="text-[10px] text-primary font-bold uppercase mt-1 tracking-wider">Filtro Ativo</p>
                            )}
                        </div>
                        <div className={`p-3 rounded-full bg-slate-50 ${stat.color.replace('text', 'bg').replace('600', '100').replace('500', '100')}`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
