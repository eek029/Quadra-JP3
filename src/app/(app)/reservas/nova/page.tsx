'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, getProfile } from '@/app/actions/auth';
import { createReservation, getAvailableSlots } from '@/app/actions/reservation';
import { TimeSlotGrid } from '@/components/reservations/TimeSlotGrid';
import { TermsModal } from '@/components/reservations/TermsModal';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function NovaReservaPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);

    const [date, setDate] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedHours, setSelectedHours] = useState<number[]>([]);
    const [slots, setSlots] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [showTermsModal, setShowTermsModal] = useState(false);

    useEffect(() => {
        loadUser();
        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDate(tomorrow.toISOString().split('T')[0]);
    }, []);

    useEffect(() => {
        if (date && user) {
            loadSlots();
        }
    }, [date, user]);

    const loadUser = async () => {
        try {
            const currentUser = await getUser();
            if (!currentUser) {
                router.push('/login');
                return;
            }

            const currentProfile = await getProfile(currentUser.id);
            if (!currentProfile || currentProfile.status !== 'approved') {
                router.push('/pendente');
                return;
            }

            setUser(currentUser);
            setProfile(currentProfile);
        } finally {
            setLoading(false);
        }
    };

    const loadSlots = async () => {
        const availableSlots = await getAvailableSlots(date);
        setSlots(availableSlots);
    };

    const handleSelectSlot = (hour: number) => {
        setError('');
        setSelectedHours((prev) => {
            if (prev.includes(hour)) {
                return prev.filter((h) => h !== hour);
            } else {
                return [...prev, hour].sort();
            }
        });
    };

    const handleReserveClick = () => {
        setError('');

        if (selectedHours.length === 0) {
            setError('Selecione pelo menos um horário');
            return;
        }

        if (selectedHours.length > 2) {
            setError('Máximo de 2 horas por dia');
            return;
        }

        setShowTermsModal(true);
    };

    const handleConfirmReservation = async () => {
        setSubmitting(true);
        setError('');

        try {
            // Get unit_key from profile
            const unitKey = profile.block
                ? `${profile.tower}-${profile.block}-${profile.apartment}`
                : `${profile.tower}-${profile.apartment}`;

            // Create reservation for each selected hour
            for (const hour of selectedHours) {
                const result = await createReservation(user.id, unitKey, {
                    date,
                    startHour: hour,
                    duration: 1,
                    notes,
                    termsVersion: 'v1.0',
                    termsPayload: {
                        accepted_at: new Date().toISOString(),
                        user_id: user.id,
                        ip: 'N/A',
                    },
                });

                if (!result.success) {
                    setError(result.error || 'Erro ao criar reserva');
                    setSubmitting(false);
                    setShowTermsModal(false);
                    return;
                }
            }

            router.push('/reservas/minhas');
        } catch (err) {
            setError('Erro inesperado ao criar reserva');
            setSubmitting(false);
            setShowTermsModal(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-white">Carregando...</div>
            </div>
        );
    }

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    return (
        <div className="container max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-white mb-6">Nova Reserva</h1>

            {error && (
                <Alert className="mb-6 bg-red-500/20 border-red-500/50 text-red-100">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card className="glass-dark border-white/20">
                <CardHeader>
                    <CardTitle className="text-xl text-white">Reservar Quadra</CardTitle>
                    <CardDescription className="text-purple-200">
                        Selecione a data e horários desejados
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="date" className="text-sm font-medium text-white">
                            Data
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-200" />
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => {
                                    setDate(e.target.value);
                                    setSelectedHours([]);
                                }}
                                min={new Date().toISOString().split('T')[0]}
                                max={maxDateStr}
                                className="pl-10 bg-white/10 border-white/20 text-white"
                                required
                            />
                        </div>
                        <p className="text-xs text-purple-300">
                            Reservas podem ser feitas com até 30 dias de antecedência
                        </p>
                    </div>

                    {date && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">
                                Horários Disponíveis
                            </label>
                            <TimeSlotGrid
                                slots={slots}
                                selectedHours={selectedHours}
                                onSelectSlot={handleSelectSlot}
                                maxSelection={2}
                                disabled={submitting}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="notes" className="text-sm font-medium text-white">
                            Observações (opcional)
                        </label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Adicione observações sobre sua reserva..."
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-md text-white placeholder:text-purple-200 min-h-[100px]"
                            disabled={submitting}
                        />
                    </div>

                    <Button
                        onClick={handleReserveClick}
                        disabled={selectedHours.length === 0 || submitting}
                        className="w-full bg-gradient-purple hover:bg-gradient-purple-hover text-white font-semibold h-12"
                    >
                        Reservar
                    </Button>
                </CardContent>
            </Card>

            <TermsModal
                open={showTermsModal}
                onClose={() => setShowTermsModal(false)}
                onConfirm={handleConfirmReservation}
                loading={submitting}
                reservationDetails={{
                    date,
                    hours: selectedHours,
                }}
            />
        </div>
    );
}
