'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock } from 'lucide-react';
import { useState } from 'react';

export default function NewReservationPage() {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [notes, setNotes] = useState('');

    const timeSlots = [
        '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
        '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('New reservation:', {
            date: selectedDate,
            time: selectedTime,
            court_id: 1, // Sistema de quadra única
            notes,
        });
        alert('Reserva criada com sucesso! (placeholder)');
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-gradient-purple">Nova Reserva</h1>
                <p className="text-muted-foreground mt-2">
                    Escolha a data e horário para sua reserva
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informações da Reserva</CardTitle>
                    <CardDescription>
                        Preencha os dados para criar sua reserva
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Date Selection */}
                        <div className="space-y-2">
                            <label htmlFor="date" className="text-sm font-medium">
                                Data
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="date"
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="pl-10"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>


                        {/* Time Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Horário
                            </label>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg">
                                {timeSlots.map((time) => (
                                    <Button
                                        key={time}
                                        type="button"
                                        variant={selectedTime === time ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedTime(time)}
                                        className={
                                            selectedTime === time
                                                ? 'bg-gradient-purple hover:opacity-90'
                                                : ''
                                        }
                                    >
                                        {time}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <label htmlFor="notes" className="text-sm font-medium">
                                Observações (opcional)
                            </label>
                            <textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full min-h-24 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="Adicione informações adicionais sobre sua reserva..."
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                className="flex-1 bg-gradient-purple hover:opacity-90"
                                disabled={!selectedDate || !selectedTime}
                            >
                                Confirmar Reserva
                            </Button>
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
