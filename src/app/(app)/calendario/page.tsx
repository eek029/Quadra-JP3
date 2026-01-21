'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getUser } from '@/app/actions/auth';
import { getUserReservations } from '@/app/actions/reservation';
import { getBlackoutPeriods } from '@/app/actions/blackout';

export default function CalendarioPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [reservations, setReservations] = useState<any[]>([]);
    const [blackouts, setBlackouts] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, [currentMonth]);

    const loadData = async () => {
        try {
            const currentUser = await getUser();
            if (!currentUser) {
                router.push('/login');
                return;
            }

            // Get user reservations
            const userReservations = await getUserReservations(currentUser.id);
            setReservations(userReservations);

            // Get blackouts for current month
            const start = startOfMonth(currentMonth);
            const end = endOfMonth(currentMonth);
            const monthBlackouts = await getBlackoutPeriods(
                start.toISOString(),
                end.toISOString()
            );
            setBlackouts(monthBlackouts);
        } finally {
            setLoading(false);
        }
    };

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    const getReservationsForDay = (date: Date) => {
        return reservations.filter((r) =>
            isSameDay(new Date(r.starts_at), date) && r.status === 'confirmed'
        );
    };

    const getBlackoutsForDay = (date: Date) => {
        return blackouts.filter((b) => {
            const blackStart = new Date(b.starts_at);
            const blackEnd = new Date(b.ends_at);
            return date >= blackStart && date <= blackEnd;
        });
    };

    const previousMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-white">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-white">Calendário</h1>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={previousMonth}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-white font-semibold min-w-[200px] text-center">
                        {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={nextMonth}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Card className="glass-dark border-white/20">
                <CardHeader>
                    <CardTitle className="text-xl text-white">Minhas Reservas e Bloqueios</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {daysInMonth.map((day) => {
                            const dayReservations = getReservationsForDay(day);
                            const dayBlackouts = getBlackoutsForDay(day);
                            const isPast = day < new Date();

                            if (dayReservations.length === 0 && dayBlackouts.length === 0) {
                                return null;
                            }

                            return (
                                <div
                                    key={day.toISOString()}
                                    className="bg-white/5 border border-white/20 rounded-lg p-4"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4 text-purple-300" />
                                            <span className="text-white font-semibold">
                                                {format(day, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                                            </span>
                                        </div>
                                        {isPast && (
                                            <Badge variant="outline" className="text-xs">
                                                Passado
                                            </Badge>
                                        )}
                                    </div>

                                    {dayReservations.length > 0 && (
                                        <div className="space-y-2 mt-3">
                                            {dayReservations.map((reservation) => (
                                                <div
                                                    key={reservation.id}
                                                    className="bg-purple-600/20 border border-purple-500/50 rounded p-2"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-purple-100">
                                                            {format(new Date(reservation.starts_at), 'HH:mm')} -{' '}
                                                            {format(new Date(reservation.ends_at), 'HH:mm')}
                                                        </span>
                                                        <Badge className="bg-green-600 text-xs">
                                                            Confirmada
                                                        </Badge>
                                                    </div>
                                                    {reservation.notes && (
                                                        <p className="text-xs text-purple-200 mt-1">
                                                            {reservation.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {dayBlackouts.length > 0 && (
                                        <div className="space-y-2 mt-3">
                                            {dayBlackouts.map((blackout) => (
                                                <div
                                                    key={blackout.id}
                                                    className="bg-red-600/20 border border-red-500/50 rounded p-2"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Ban className="h-4 w-4 text-red-300" />
                                                        <span className="text-sm text-red-100 font-semibold">
                                                            Período Bloqueado
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-red-200 mt-1">
                                                        Motivo: {blackout.reason}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {daysInMonth.filter((day) =>
                            getReservationsForDay(day).length > 0 || getBlackoutsForDay(day).length > 0
                        ).length === 0 && (
                                <div className="text-center py-12">
                                    <CalendarIcon className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                                    <p className="text-purple-200">
                                        Nenhuma reserva ou bloqueio neste mês
                                    </p>
                                </div>
                            )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
