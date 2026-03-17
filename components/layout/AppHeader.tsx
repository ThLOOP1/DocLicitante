"use client"

import { FileCheck } from "lucide-react"

import Link from "next/link"
import { UserMenu } from "@/components/user-menu"
import { NotificationBell } from "@/components/layout/NotificationBell"

export function AppHeader() {
    return (
        <header className="border-b border-border bg-card">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/Dashboard" className="flex items-center gap-2">
                    <FileCheck className="h-7 w-7 text-primary" />
                    <h1 className="text-2xl font-semibold text-foreground">DocLicitante</h1>
                </Link>
                <div className="flex items-center gap-3">
                    <NotificationBell />
                    <UserMenu />
                </div>
            </div>
        </header>
    )
}
