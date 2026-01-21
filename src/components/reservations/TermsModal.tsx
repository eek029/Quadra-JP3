'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type TermsModalProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
    reservationDetails?: {
        date: string;
        hours: number[];
    };
};

export function TermsModal({
    open,
    onClose,
    onConfirm,
    loading = false,
    reservationDetails,
}: TermsModalProps) {
    const [accepted, setAccepted] = useState(false);

    const handleConfirm = () => {
        if (accepted) {
            onConfirm();
            setAccepted(false); // Reset for next use
        }
    };

    const handleClose = () => {
        setAccepted(false);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="glass-dark border-white/20 max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-white flex items-center gap-2">
                        <FileText className="h-6 w-6" />
                        Termos de Reserva
                    </DialogTitle>
                    <DialogDescription className="text-purple-200">
                        Leia e aceite os termos antes de confirmar sua reserva
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {reservationDetails && (
                        <div className="bg-purple-600/20 border border-purple-500/50 rounded-lg p-4">
                            <h3 className="text-white font-semibold mb-2">Resumo da Reserva</h3>
                            <ul className="text-sm text-purple-100 space-y-1">
                                <li>
                                    <strong>Data:</strong>{' '}
                                    {new Date(reservationDetails.date).toLocaleDateString('pt-BR')}
                                </li>
                                <li>
                                    <strong>Horários:</strong>{' '}
                                    {reservationDetails.hours
                                        .sort()
                                        .map((h) => `${String(h).padStart(2, '0')}:00 - ${String(h + 1).padStart(2, '0')}:00`)
                                        .join(', ')}
                                </li>
                                <li>
                                    <strong>Duração:</strong> {reservationDetails.hours.length} hora(s)
                                </li>
                            </ul>
                        </div>
                    )}

                    <div className="bg-white/5 border border-white/20 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                        <h3 className="text-white font-semibold mb-3">Regras da Quadra</h3>
                        <ul className="text-sm text-purple-200 space-y-2 list-disc list-inside">
                            <li>
                                <strong>Horário de funcionamento:</strong> 09:00 às 22:00
                            </li>
                            <li>
                                <strong>Duração das reservas:</strong> Slots de 1 hora
                            </li>
                            <li>
                                <strong>Limite diário:</strong> Máximo de 2 horas por dia por apartamento
                            </li>
                            <li>
                                <strong>Antecedência:</strong> Reservas podem ser feitas com até 30 dias de antecedência
                            </li>
                            <li>
                                <strong>Cancelamento:</strong> Reservas podem ser canceladas a qualquer momento antes do horário marcado
                            </li>
                            <li>
                                <strong>Respeito às regras:</strong> O não comparecimento sem cancelamento prévio pode resultar em penalidades
                            </li>
                            <li>
                                <strong>Responsabilidade:</strong> O usuário é responsável por manter a quadra limpa e em boas condições
                            </li>
                            <li>
                                <strong>Períodos de bloqueio:</strong> A administração pode bloquear períodos para manutenção ou eventos
                            </li>
                        </ul>
                    </div>

                    <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
                        <Checkbox
                            id="terms"
                            checked={accepted}
                            onCheckedChange={(checked) => setAccepted(checked as boolean)}
                            disabled={loading}
                        />
                        <label
                            htmlFor="terms"
                            className="text-sm text-white cursor-pointer select-none"
                        >
                            Li e concordo com os{' '}
                            <Link href="/regras" className="text-purple-300 hover:text-purple-100 underline" target="_blank">
                                termos de uso da quadra
                            </Link>
                        </label>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={loading}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!accepted || loading}
                        className="bg-gradient-purple hover:bg-gradient-purple-hover text-white"
                    >
                        {loading ? 'Confirmando...' : 'Confirmar Reserva'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
