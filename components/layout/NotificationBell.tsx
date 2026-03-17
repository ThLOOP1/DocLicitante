"use client"

import * as React from "react"
import { Bell } from "lucide-react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"

export function NotificationBell() {
  const { user } = useAuth()
  const router = useRouter()
  const [count, setCount] = React.useState(0)

  const fetchCount = React.useCallback(async () => {
    if (!user?.uid) return

    try {
      const res = await fetch(`/api/notificacoes?donoUid=${user.uid}`)
      if (res.ok) {
        const data = await res.json()
        // Conta apenas as não lidas (não salvas no localStorage)
        const savedLidas = localStorage.getItem(`notificacoes_lidas_${user.uid}`)
        const lidasIds: string[] = savedLidas ? JSON.parse(savedLidas) : []
        const unread = data.filter((n: { id: string }) => !lidasIds.includes(n.id)).length
        setCount(unread)
      }
    } catch {
      /* silencioso */
    }
  }, [user?.uid])

  React.useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchCount])

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-9 w-9"
      onClick={() => router.push("/notificacoes")}
      aria-label="Ver notificações"
    >
      <Bell className="h-5 w-5 text-muted-foreground" />
      {count > 0 && (
        <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
        </span>
      )}
    </Button>
  )
}
