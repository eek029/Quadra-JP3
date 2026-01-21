'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const timeSlots = [
        '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
        '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
    ];

    // Mock availability data
    const getSlotStatus = (day: number, time: string) => {
        const random = Math.random();
        if (random > 0.7) return 'booked';
        if (random > 0.4) return 'available';
        return 'blocked';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 hover:bg-green-200 border-green-300 text-green-800';
            case 'booked':
                return 'bg-red-100 border-red-300 text-red-800 cursor-not-allowed';
            case 'blocked':
                return 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed';
            default:
                return 'bg-gray-50';
        }
    };

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - date.getDay() + i);
        return date;
    });

    const goToPreviousWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const goToNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-gradient-purple">Calendário</h1>
                <p className="text-muted-foreground mt-2">
                    Visualize a disponibilidade e faça sua reserva
                </p>
            </div>

            {/* Week Navigation */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>
                                {weekDays[0].toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                            </CardTitle>
                            <CardDescription>
                                Semana de {weekDays[0].getDate()} a {weekDays[6].getDate()}
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={goToNextWeek}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Calendar Grid */}
                    <div className="overflow-x-auto">
                        <div className="min-w-[700px]">
                            {/* Header Row */}
                            <div className="grid grid-cols-8 gap-2 mb-2">
                                <div className="text-sm font-medium text-muted-foreground">
                                    Horário
                                </div>
                                {weekDays.map((day, i) => (
                                    <div
                                        key={i}
                                        className="text-center text-sm font-medium"
                                    >
                                        <div className="text-muted-foreground">{daysOfWeek[i]}</div>
                                        <div className={`mt-1 ${day.toDateString() === new Date().toDateString() ? 'text-purple-600 font-bold' : ''}`}>
                                            {day.getDate()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Time Slots */}
                            <div className="space-y-2">
                                {timeSlots.map((time) => (
                                    <div key={time} className="grid grid-cols-8 gap-2">
                                        <div className="flex items-center text-sm font-medium text-muted-foreground">
                                            {time}
                                        </div>
                                        {weekDays.map((day, i) => {
                                            const status = getSlotStatus(i, time);
                                            return (
                                                <button
                                                    key={i}
                                                    className={`p-2 text-xs rounded border transition-colors ${getStatusColor(
                                                        status
                                                    )}`}
                                                    disabled={status !== 'available'}
                                                >
                                                    {status === 'available' && 'Disponível'}
                                                    {status === 'booked' && 'Reservado'}
                                                    {status === 'blocked' && 'Bloqueado'}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
                            <span className="text-sm text-muted-foreground">Disponível</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-red-100 border border-red-300" />
                            <span className="text-sm text-muted-foreground">Reservado</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300" />
                            <span className="text-sm text-muted-foreground">Bloqueado</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
