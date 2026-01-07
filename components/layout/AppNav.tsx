"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function AppNav() {
    const pathname = usePathname()

    const navItems = [
        { name: "Inicial", href: "/Dashboard" },
        { name: "Minhas Empresas", href: "/empresas" },
        // { name: "Solicitações", href: "/solicitacoes" },
        { name: "Notificações", href: "/notificacoes" },
    ]

    const isActive = (href: string) => {
        if (href === "/Dashboard" && pathname === "/Dashboard") return true
        if (href !== "/Dashboard" && pathname.startsWith(href)) return true
        return false
    }

    return (
        <nav className="border-b border-border bg-card">
            <div className="container mx-auto px-6 flex gap-6">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`py-3 px-1 text-sm font-medium transition-colors ${isActive(item.href)
                            ? "border-b-2 border-primary text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {item.name}
                    </Link>
                ))}
            </div>
        </nav>
    )
}
