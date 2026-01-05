"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProfileSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header Skeleton */}
            <div className="border-b border-border bg-card">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Navigation Skeleton */}
            <div className="border-b border-border bg-card">
                <div className="container mx-auto px-6">
                    <div className="flex gap-6">
                        <Skeleton className="h-10 w-20" />
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-28" />
                    </div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <main className="container mx-auto px-6 py-8">
                <div className="mb-8">
                    <Skeleton className="h-9 w-48 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sidebar Skeleton */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader className="text-center pb-4">
                                <div className="flex justify-center mb-4">
                                    <Skeleton className="h-24 w-24 rounded-full" />
                                </div>
                                <Skeleton className="h-6 w-32 mx-auto mb-2" />
                                <Skeleton className="h-4 w-24 mx-auto" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mt-6">
                            <CardHeader>
                                <Skeleton className="h-5 w-32 mb-2" />
                                <Skeleton className="h-4 w-48" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full mb-3" />
                                <Skeleton className="h-20 w-full mb-3" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Forms Skeleton */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-48 mb-2" />
                                <Skeleton className="h-4 w-64" />
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <Skeleton className="h-6 w-32 mb-4" />
                                <div className="grid md:grid-cols-2 gap-4">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="space-y-2">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-10 w-full" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-32 mb-2" />
                                <Skeleton className="h-4 w-48" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-16 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
