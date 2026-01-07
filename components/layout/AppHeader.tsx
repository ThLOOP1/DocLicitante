"use client"

import { FileCheck, Bell } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/user-menu"

export function AppHeader() {
    return (
        <header className="border-b border-border bg-card">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/Dashboard" className="flex items-center gap-2">
                    <FileCheck className="h-7 w-7 text-primary" />
                    <h1 className="text-2xl font-semibold text-foreground">DocLicitante</h1>
                </Link>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                    </Button>
                    <UserMenu />
                </div>
            </div>
        </header>
    )
}
