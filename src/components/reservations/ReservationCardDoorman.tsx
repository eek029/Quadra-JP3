'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Building, Home, Phone, Copy, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

type Reservation = {
    id: string;
    starts_at: string;
    ends_at: string;
    status: string;
    notes?: string;
    profiles: {
        full_name: string;
        phone: string;
        tower: number;
        block?: string;
        apartment: string;
    };
};

type ReservationCardDoormanProps = {
    reservation: Reservation;
};

export function ReservationCardDoorman({ reservation }: ReservationCardDoormanProps) {
    const [copied, setCopied] = useState(false);

    const startDate = new Date(reservation.starts_at);
    const endDate = new Date(reservation.ends_at);

    const handleCopyPhone = () => {
        navigator.clipboard.writeText(reservation.profiles.phone);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWhatsApp = () => {
        const phone = reservation.profiles.phone.replace(/\D/g, ''); // Remove non-digits
        const message = encodeURIComponent(
            `Olá ${reservation.profiles.full_name}, tudo bem? Sou o porteiro do condomínio.`
        );
        window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
    };

    const unitDisplay = reservation.profiles.block
        ? `Torre ${reservation.profiles.tower} - Bloco ${reservation.profiles.block} - Apto ${reservation.profiles.apartment}`
        : `Torre ${reservation.profiles.tower} - Apto ${reservation.profiles.apartment}`;

    return (
        <Card className="glass-dark border-white/20">
            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h4 className="text-white font-semibold text-lg">
                                {reservation.profiles.full_name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <Building className="h-3 w-3 text-purple-300" />
                                <span className="text-sm text-purple-200">{unitDisplay}</span>
                            </div>
                        </div>
                        <Badge className="bg-green-600">Ativa</Badge>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-purple-300" />
                            <span className="text-purple-100">
                                {format(startDate, "dd 'de' MMMM", { locale: ptBR })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-purple-300" />
                            <span className="text-purple-100">
                                {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
                            </span>
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-2 bg-white/5 rounded p-2">
                        <Phone className="h-4 w-4 text-purple-300" />
                        <span className="text-white font-mono">{reservation.profiles.phone}</span>
                    </div>

                    {/* Notes */}
                    {reservation.notes && (
                        <div className="bg-white/5 rounded p-2 text-sm text-purple-200">
                            <strong>Observações:</strong> {reservation.notes}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCopyPhone}
                            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            {copied ? 'Copiado!' : 'Copiar Telefone'}
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleWhatsApp}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            WhatsApp
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
