'use client';

import { Button } from '@/components/ui/button';
import { Check, Clock, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TimeSlot = {
    hour: number;
    start: string;
    end: string;
    available: boolean;
    occupied: boolean;
    blocked: boolean;
};

type TimeSlotGridProps = {
    slots: TimeSlot[];
    selectedHours: number[];
    onSelectSlot: (hour: number) => void;
    maxSelection?: number;
    disabled?: boolean;
};

export function TimeSlotGrid({
    slots,
    selectedHours,
    onSelectSlot,
    maxSelection = 2,
    disabled = false,
}: TimeSlotGridProps) {
    const getSlotStatus = (slot: TimeSlot) => {
        const isSelected = selectedHours.includes(slot.hour);

        if (slot.blocked) return 'blocked';
        if (slot.occupied) return 'occupied';
        if (isSelected) return 'selected';
        if (slot.available) return 'available';
        return 'unavailable';
    };

    const getSlotColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-500/20 border-green-500/50 text-green-100 hover:bg-green-500/30';
            case 'selected':
                return 'bg-purple-600 border-purple-400 text-white';
            case 'occupied':
                return 'bg-gray-500/20 border-gray-500/50 text-gray-400 cursor-not-allowed';
            case 'blocked':
                return 'bg-red-500/20 border-red-500/50 text-red-300 cursor-not-allowed';
            default:
                return 'bg-white/5 border-white/20 text-white/50 cursor-not-allowed';
        }
    };

    const getSlotIcon = (status: string) => {
        switch (status) {
            case 'selected':
                return <Check className="h-4 w-4" />;
            case 'occupied':
                return <Clock className="h-4 w-4" />;
            case 'blocked':
                return <Ban className="h-4 w-4" />;
            default:
                return null;
        }
    };

    const getSlotLabel = (status: string, hour: number) => {
        switch (status) {
            case 'blocked':
                return 'Bloqueado';
            case 'occupied':
                return 'Ocupado';
            default:
                return `${String(hour).padStart(2, '0')}:00`;
        }
    };

    const handleSlotClick = (slot: TimeSlot) => {
        if (disabled) return;

        const status = getSlotStatus(slot);
        if (status === 'occupied' || status === 'blocked') return;

        const isSelected = selectedHours.includes(slot.hour);

        // If deselecting, always allow
        if (isSelected) {
            onSelectSlot(slot.hour);
            return;
        }

        // If selecting and haven't reached max, allow
        if (selectedHours.length < maxSelection) {
            onSelectSlot(slot.hour);
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {slots.map((slot) => {
                    const status = getSlotStatus(slot);
                    const isClickable = status === 'available' || status === 'selected';

                    return (
                        <Button
                            key={slot.hour}
                            type="button"
                            variant="outline"
                            onClick={() => handleSlotClick(slot)}
                            disabled={!isClickable || disabled}
                            className={cn(
                                'h-16 flex flex-col items-center justify-center gap-1 transition-all',
                                getSlotColor(status)
                            )}
                        >
                            {getSlotIcon(status)}
                            <span className="text-sm font-semibold">
                                {getSlotLabel(status, slot.hour)}
                            </span>
                            {status === 'selected' && (
                                <span className="text-xs">Selecionado</span>
                            )}
                        </Button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500/30 border border-green-500/50" />
                    <span className="text-purple-200">Disponível</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-purple-600 border border-purple-400" />
                    <span className="text-purple-200">Selecionado</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-500/30 border border-gray-500/50" />
                    <span className="text-purple-200">Ocupado</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500/30 border border-red-500/50" />
                    <span className="text-purple-200">Bloqueado</span>
                </div>
            </div>

            {selectedHours.length > 0 && (
                <div className="bg-purple-600/20 border border-purple-500/50 rounded-lg p-3">
                    <p className="text-sm text-purple-100">
                        <strong>{selectedHours.length}</strong> slot(s) selecionado(s):{' '}
                        {selectedHours.sort().map((h) => `${String(h).padStart(2, '0')}:00`).join(', ')}
                    </p>
                    <p className="text-xs text-purple-200 mt-1">
                        Máximo: {maxSelection} hora(s) por dia
                    </p>
                </div>
            )}
        </div>
    );
}
