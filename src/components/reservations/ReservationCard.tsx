'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, FileText, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Reservation = {
    id: string;
    starts_at: string;
    ends_at: string;
    status: string;
    notes?: string;
    created_at: string;
};

type ReservationCardProps = {
    reservation: Reservation;
    onCancel?: (id: string) => void;
    showCancelButton?: boolean;
    loading?: boolean;
};

export function ReservationCard({
    reservation,
    onCancel,
    showCancelButton = false,
    loading = false,
}: ReservationCardProps) {
    const startDate = new Date(reservation.starts_at);
    const endDate = new Date(reservation.ends_at);
    const isFuture = startDate > new Date();
    const canCancel = isFuture && reservation.status === 'confirmed' && showCancelButton;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <Badge className="bg-green-600">Confirmada</Badge>;
            case 'cancelled':
                return <Badge variant="outline" className="border-yellow-500 text-yellow-300">Cancelada</Badge>;
            case 'admin_cancelled':
                return <Badge variant="outline" className="border-red-500 text-red-300">Cancelada (Admin)</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Card className="glass-dark border-white/20">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-purple-300" />
                            <span className="text-white font-semibold">
                                {format(startDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-purple-300" />
                            <span className="text-purple-100">
                                {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-purple-300" />
                            <span className="text-purple-100">Quadra do Condomínio</span>
                        </div>

                        {reservation.notes && (
                            <div className="flex items-start gap-2 mt-3 p-2 bg-white/5 rounded">
                                <FileText className="h-4 w-4 text-purple-300 mt-0.5" />
                                <span className="text-sm text-purple-200">{reservation.notes}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                        {getStatusBadge(reservation.status)}

                        {canCancel && onCancel && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onCancel(reservation.id)}
                                disabled={loading}
                                className="bg-red-600/20 border-red-500/50 text-red-100 hover:bg-red-600/30"
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancelar
                            </Button>
                        )}
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/10 text-xs text-purple-300">
                    Criada em {format(new Date(reservation.created_at), "dd/MM/yyyy 'às' HH:mm")}
                </div>
            </CardContent>
        </Card>
    );
}
