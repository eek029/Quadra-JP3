import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, Clock, TrendingUp, Plus } from 'lucide-react';

export default function DashboardPage() {
    // Mock data
    const stats = [
        {
            title: 'Total de Reservas',
            value: '12',
            description: 'Desde o início',
            icon: Calendar,
            color: 'text-purple-600',
        },
        {
            title: 'Próximas Reservas',
            value: '3',
            description: 'Nos próximos 7 dias',
            icon: Clock,
            color: 'text-blue-600',
        },
        {
            title: 'Este Mês',
            value: '5',
            description: 'Reservas em Janeiro',
            icon: TrendingUp,
            color: 'text-green-600',
        },
    ];

    const upcomingReservations = [
        {
            id: 1,
            date: '2026-01-22',
            time: '18:00 - 19:00',
            court: 'Quadra',
        },
        {
            id: 2,
            date: '2026-01-24',
            time: '20:00 - 21:00',
            court: 'Quadra',
        },
        {
            id: 3,
            date: '2026-01-26',
            time: '19:00 - 20:00',
            court: 'Quadra',
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold text-gradient-purple">
                    Bem-vindo ao Reserva Quadra
                </h1>
                <p className="text-muted-foreground mt-2">
                    Gerencie suas reservas de forma fácil e rápida
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <Icon className={`h-5 w-5 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <Card className="bg-gradient-purple text-white">
                <CardHeader>
                    <CardTitle>Ações Rápidas</CardTitle>
                    <CardDescription className="text-purple-100">
                        Acesse as funcionalidades principais
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    <Link href="/reservas/nova">
                        <Button variant="secondary" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nova Reserva
                        </Button>
                    </Link>
                    <Link href="/calendario">
                        <Button variant="secondary" className="gap-2">
                            <Calendar className="h-4 w-4" />
                            Ver Calendário
                        </Button>
                    </Link>
                    <Link href="/reservas/minhas">
                        <Button variant="secondary" className="gap-2">
                            <Clock className="h-4 w-4" />
                            Minhas Reservas
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            {/* Upcoming Reservations */}
            <Card>
                <CardHeader>
                    <CardTitle>Próximas Reservas</CardTitle>
                    <CardDescription>Suas reservas agendadas</CardDescription>
                </CardHeader>
                <CardContent>
                    {upcomingReservations.length > 0 ? (
                        <div className="space-y-4">
                            {upcomingReservations.map((reservation) => (
                                <div
                                    key={reservation.id}
                                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-gradient-purple flex items-center justify-center text-white font-bold">
                                            {new Date(reservation.date).getDate()}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{reservation.court}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(reservation.date).toLocaleDateString('pt-BR', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{reservation.time}</p>
                                        <Link href={`/reservas/minhas`}>
                                            <Button variant="link" size="sm" className="text-purple-600">
                                                Ver detalhes
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>Nenhuma reserva agendada</p>
                            <Link href="/reservas/nova">
                                <Button className="mt-4 bg-gradient-purple">
                                    Fazer primeira reserva
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
