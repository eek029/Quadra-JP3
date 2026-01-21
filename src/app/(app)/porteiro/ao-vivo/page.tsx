'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Calendar as CalendarIcon, Bell, AlertCircle, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUser } from '@/app/actions/auth';
import {
    getCurrentDoormanShiftWindow,
    getDoormanShiftNotifications,
    getActiveReservationsNow,
    getUpcomingReservations,
} from '@/app/actions/shift';
import { markAsRead } from '@/app/actions/notification';
import { ReservationCardDoorman } from '@/components/reservations/ReservationCardDoorman';
import { NotificationList } from '@/components/notifications/NotificationList';

export default function PorteiroAoVivoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [shiftWindow, setShiftWindow] = useState<any>(null);
    const [activeReservations, setActiveReservations] = useState<any[]>([]);
    const [upcomingReservations, setUpcomingReservations] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        loadData();
        // Refresh every minute
        const interval = setInterval(loadData, 60000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            const currentUser = await getUser();
            if (!currentUser) {
                router.push('/login');
                return;
            }

            // Get shift status
            const shift = await getCurrentDoormanShiftWindow(currentUser.id);
            setShiftWindow(shift);

            // Get reservations
            const active = await getActiveReservationsNow();
            setActiveReservations(active);

            const upcoming = await getUpcomingReservations(3);
            setUpcomingReservations(upcoming);

            // Get shift notifications
            const notifs = await getDoormanShiftNotifications(currentUser.id);
            setNotifications(notifs);
        } catch (err) {
            console.error('Error loading doorman data:', err);
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

    // If schedule not configured
    if (shiftWindow?.status === 'schedule_missing') {
        return (
            <div className="container max-w-4xl mx-auto p-6">
                <Alert className="bg-yellow-500/20 border-yellow-500/50">
                    <Settings className="h-4 w-4" />
                    <AlertDescription className="text-yellow-100">
                        <p className="font-semibold mb-2">Configure sua escala</p>
                        <p className="text-sm mb-3">{shiftWindow.message}</p>
                        <Link href="/perfil">
                            <span className="text-yellow-200 hover:text-yellow-100 underline font-semibold">
                                Ir para o perfil →
                            </span>
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container max-w-6xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Painel do Porteiro</h1>
                    <p className="text-purple-200">Gerenciamento em tempo real</p>
                </div>
                <Badge className={shiftWindow?.isOnDuty ? 'bg-green-600 text-lg px-4 py-2' : 'bg-gray-600 text-lg px-4 py-2'}>
                    {shiftWindow?.isOnDuty ? '✓ De Plantão' : 'Fora do Plantão'}
                </Badge>
            </div>

            {/* Shift Status */}
            <Card className="glass-dark border-white/20">
                <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Status do Plantão
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-purple-200">Turno:</span>
                            <span className="text-white font-semibold">
                                {shiftWindow?.shiftType === 'day' ? 'Diurno (07:00 - 19:00)' : 'Noturno (19:00 - 07:00)'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-purple-200">Status Atual:</span>
                            <Badge className={shiftWindow?.isOnDuty ? 'bg-green-600' : 'bg-gray-600'}>
                                {shiftWindow?.status === 'active' ? 'Ativo' : 'Inativo'}
                            </Badge>
                        </div>
                        {shiftWindow?.message && (
                            <Alert className="bg-purple-600/20 border-purple-500/50 mt-3">
                                <AlertDescription className="text-purple-100">
                                    {shiftWindow.message}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </CardContent>
            </Card>

            {!shiftWindow?.isOnDuty ? (
                <Alert className="bg-blue-500/20 border-blue-500/50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-blue-100">
                        Você está fora do horário de plantão. As informações abaixo são limitadas.
                    </AlertDescription>
                </Alert>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Active Reservations */}
                    <Card className="glass-dark border-white/20">
                        <CardHeader>
                            <CardTitle className="text-xl text-white">Reservas Ativas Agora</CardTitle>
                            <CardDescription className="text-purple-200">
                                Quadra em uso no momento
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {activeReservations.length === 0 ? (
                                <div className="text-center py-8">
                                    <CalendarIcon className="h-12 w-12 text-purple-300 mx-auto mb-3" />
                                    <p className="text-purple-200">Nenhuma reserva ativa no momento</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activeReservations.map((reservation) => (
                                        <ReservationCardDoorman
                                            key={reservation.id}
                                            reservation={reservation}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming Reservations */}
                    <Card className="glass-dark border-white/20">
                        <CardHeader>
                            <CardTitle className="text-xl text-white">Próximas Reservas (3h)</CardTitle>
                            <CardDescription className="text-purple-200">
                                Reservas nas próximas horas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {upcomingReservations.length === 0 ? (
                                <div className="text-center py-8">
                                    <Clock className="h-12 w-12 text-purple-300 mx-auto mb-3" />
                                    <p className="text-purple-200">Nenhuma reserva nas próximas 3 horas</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {upcomingReservations.map((reservation) => (
                                        <ReservationCardDoorman
                                            key={reservation.id}
                                            reservation={reservation}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Shift Notifications */}
            <Card className="glass-dark border-white/20">
                <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notificações do Plantão
                    </CardTitle>
                    <CardDescription className="text-purple-200">
                        {shiftWindow?.isOnDuty
                            ? 'Notificações durante seu turno atual'
                            : 'Configure sua escala para ver notificações filtradas'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!shiftWindow?.isOnDuty ? (
                        <div className="text-center py-8">
                            <Bell className="h-12 w-12 text-purple-300 mx-auto mb-3" />
                            <p className="text-purple-200">Disponível apenas durante o plantão</p>
                        </div>
                    ) : (
                        <NotificationList
                            notifications={notifications}
                            onMarkAsRead={handleMarkAsRead}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
