'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, X, Edit } from 'lucide-react';
import { useState } from 'react';

type Tab = 'upcoming' | 'past' | 'cancelled';

export default function MyReservationsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('upcoming');

    // Mock data
    const reservations = {
        upcoming: [
            { id: 1, date: '2026-01-22', time: '18:00 - 19:00', court: 'Quadra' },
            { id: 2, date: '2026-01-24', time: '20:00 - 21:00', court: 'Quadra' },
            { id: 3, date: '2026-01-26', time: '19:00 - 20:00', court: 'Quadra' },
        ],
        past: [
            { id: 4, date: '2026-01-15', time: '18:00 - 19:00', court: 'Quadra' },
            { id: 5, date: '2026-01-10', time: '20:00 - 21:00', court: 'Quadra' },
        ],
        cancelled: [
            { id: 6, date: '2026-01-20', time: '19:00 - 20:00', court: 'Quadra' },
        ],
    };

    const currentReservations = reservations[activeTab];

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-gradient-purple">
                    Minhas Reservas
                </h1>
                <p className="text-muted-foreground mt-2">
                    Gerencie todas as suas reservas
                </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b">
                <Button
                    variant={activeTab === 'upcoming' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('upcoming')}
                    className={
                        activeTab === 'upcoming' ? 'bg-gradient-purple' : ''
                    }
                >
                    Próximas ({reservations.upcoming.length})
                </Button>
                <Button
                    variant={activeTab === 'past' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('past')}
                    className={activeTab === 'past' ? 'bg-gradient-purple' : ''}
                >
                    Passadas ({reservations.past.length})
                </Button>
                <Button
                    variant={activeTab === 'cancelled' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('cancelled')}
                    className={
                        activeTab === 'cancelled' ? 'bg-gradient-purple' : ''
                    }
                >
                    Canceladas ({reservations.cancelled.length})
                </Button>
            </div>

            {/* Reservations List */}
            <div className="grid gap-4">
                {currentReservations.length > 0 ? (
                    currentReservations.map((reservation) => (
                        <Card key={reservation.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-purple-600" />
                                            {reservation.court}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            Reserva #{reservation.id.toString().padStart(4, '0')}
                                        </CardDescription>
                                    </div>
                                    <div className="h-12 w-12 rounded-lg bg-gradient-purple flex items-center justify-center text-white font-bold text-lg">
                                        {new Date(reservation.date).getDate()}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>
                                                {new Date(reservation.date).toLocaleDateString('pt-BR', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span>{reservation.time}</span>
                                        </div>
                                    </div>

                                    {activeTab === 'upcoming' && (
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <Edit className="h-4 w-4" />
                                                Editar
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="gap-2"
                                            >
                                                <X className="h-4 w-4" />
                                                Cancelar
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                            <p className="text-muted-foreground mb-4">
                                Nenhuma reserva {activeTab === 'upcoming' ? 'agendada' : activeTab === 'past' ? 'passada' : 'cancelada'}
                            </p>
                            {activeTab === 'upcoming' && (
                                <Button className="bg-gradient-purple">Nova Reserva</Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
