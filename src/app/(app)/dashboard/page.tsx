'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Plus, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, getProfile } from '@/app/actions/auth';
import { getUserReservations } from '@/app/actions/reservation';
import { getUserNotifications, markAsRead } from '@/app/actions/notification';
import { ReservationCard } from '@/components/reservations/ReservationCard';
import { NotificationList } from '@/components/notifications/NotificationList';

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [upcomingReservations, setUpcomingReservations] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const currentUser = await getUser();
            if (!currentUser) {
                router.push('/login');
                return;
            }

            setUser(currentUser);

            const currentProfile = await getProfile(currentUser.id);
            if (!currentProfile) {
                router.push('/perfil');
                return;
            }

            setProfile(currentProfile);

            // Get upcoming reservations
            const reservations = await getUserReservations(currentUser.id);
            const upcoming = reservations
                .filter((r: any) => new Date(r.starts_at) > new Date() && r.status === 'confirmed')
                .slice(0, 3);
            setUpcomingReservations(upcoming);

            // Get notifications
            const notifs = await getUserNotifications(currentUser.id, 10);
            setNotifications(notifs);
        } catch (err) {
            console.error('Error loading dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id);
        await loadData();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-white">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="container max-w-6xl mx-auto p-6 space-y-6">
            {/* Welcome */}
            <div>
                <h1 className="text-3xl font-bold text-white">
                    Olá, {profile?.full_name?.split(' ')[0] || 'Usuário'}!
                </h1>
                <p className="text-purple-200 mt-1">
                    Bem-vindo ao Reserva Quadra - Complexo Júlio Prestes
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/reservas/nova">
                    <Card className="glass-dark border-white/20 hover:border-purple-500/50 transition-all cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-600 rounded-lg">
                                    <Plus className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Nova Reserva</h3>
                                    <p className="text-sm text-purple-200">Reserve a quadra</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/reservas/minhas">
                    <Card className="glass-dark border-white/20 hover:border-purple-500/50 transition-all cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-600 rounded-lg">
                                    <CalendarIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Minhas Reservas</h3>
                                    <p className="text-sm text-purple-200">Ver e gerenciar</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Upcoming Reservations */}
            <Card className="glass-dark border-white/20">
                <CardHeader>
                    <CardTitle className="text-xl text-white">Próximas Reservas</CardTitle>
                    <CardDescription className="text-purple-200">
                        Suas reservas confirmadas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {upcomingReservations.length === 0 ? (
                        <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 text-purple-300 mx-auto mb-3" />
                            <p className="text-purple-200">Você não tem reservas futuras</p>
                            <Link href="/reservas/nova">
                                <Button className="mt-4 bg-gradient-purple hover:bg-gradient-purple-hover">
                                    Fazer uma reserva
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcomingReservations.map((reservation) => (
                                <ReservationCard
                                    key={reservation.id}
                                    reservation={reservation}
                                    showCancelButton={false}
                                />
                            ))}
                            {upcomingReservations.length > 0 && (
                                <Link href="/reservas/minhas">
                                    <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                                        Ver todas as reservas
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="glass-dark border-white/20">
                <CardHeader>
                    <CardTitle className="text-xl text-white">Notificações</CardTitle>
                    <CardDescription className="text-purple-200">
                        Últimas atualizações
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <NotificationList
                        notifications={notifications}
                        onMarkAsRead={handleMarkAsRead}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
