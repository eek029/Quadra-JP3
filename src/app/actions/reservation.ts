'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type CreateReservationData = {
    date: string; // YYYY-MM-DD
    startHour: number; // 9-21
    duration: number; // 1 or 2 (hours)
    notes?: string;
    termsVersion: string;
    termsPayload: any;
};

export type ReservationResult = {
    success: boolean;
    error?: string;
    reservationId?: string;
};

export async function createReservation(
    userId: string,
    unitKey: string,
    data: CreateReservationData
): Promise<ReservationResult> {
    const supabase = await createClient();

    try {
        // Create starts_at timestamp
        const startsAt = new Date(`${data.date}T${String(data.startHour).padStart(2, '0')}:00:00`);

        // Call the RPC function that handles all validations
        const { data: reservationId, error } = await supabase.rpc('create_reservation', {
            p_user_id: userId,
            p_created_by: userId,
            p_unit_key: unitKey,
            p_starts_at: startsAt.toISOString(),
            p_terms_version: data.termsVersion,
            p_terms_payload: {
                ...data.termsPayload,
                notes: data.notes,
                timestamp: new Date().toISOString(),
            },
        });

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }

        // Create notification for user
        await supabase.from('notifications').insert({
            recipient_user_id: userId,
            type: 'system',
            title: 'Reserva Confirmada',
            body: `Sua reserva para ${new Date(data.date).toLocaleDateString('pt-BR')} às ${data.startHour}h foi confirmada com sucesso!`,
            metadata: {
                reservation_id: reservationId,
                date: data.date,
                hour: data.startHour,
            },
        });

        revalidatePath('/dashboard');
        revalidatePath('/reservas/minhas');

        return {
            success: true,
            reservationId,
        };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Erro inesperado ao criar reserva',
        };
    }
}

export async function cancelReservation(
    userId: string,
    reservationId: string,
    reason?: string,
    isAdminCancel: boolean = false
): Promise<ReservationResult> {
    const supabase = await createClient();

    try {
        // Get reservation details
        const { data: reservation } = await supabase
            .from('reservations')
            .select('*, profiles!reservations_user_id_fkey(full_name)')
            .eq('id', reservationId)
            .single();

        if (!reservation) {
            return {
                success: false,
                error: 'Reserva não encontrada',
            };
        }

        // Check permissions
        if (!isAdminCancel && reservation.user_id !== userId) {
            return {
                success: false,
                error: 'Você não tem permissão para cancelar esta reserva',
            };
        }

        // Update reservation
        const { error } = await supabase
            .from('reservations')
            .update({
                status: isAdminCancel ? 'admin_cancelled' : 'cancelled',
                cancel_reason: reason,
            })
            .eq('id', reservationId);

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }

        // Create notification
        const notificationBody = isAdminCancel
            ? `Sua reserva para ${new Date(reservation.starts_at).toLocaleDateString('pt-BR')} foi cancelada pela administração. Motivo: ${reason || 'não informado'}`
            : `Você cancelou sua reserva para ${new Date(reservation.starts_at).toLocaleDateString('pt-BR')}.`;

        await supabase.from('notifications').insert({
            recipient_user_id: reservation.user_id,
            type: 'alert',
            title: isAdminCancel ? 'Reserva Cancelada pela Administração' : 'Reserva Cancelada',
            body: notificationBody,
            metadata: {
                reservation_id: reservationId,
                reason,
                cancelled_by: isAdminCancel ? 'admin' : 'user',
            },
        });

        // Create audit log
        await supabase.from('audit_logs').insert({
            actor_user_id: userId,
            action: isAdminCancel ? 'admin_cancel_reservation' : 'cancel_reservation',
            target_type: 'reservation',
            target_id: reservationId,
            metadata_json: {
                reason,
                starts_at: reservation.starts_at,
            },
        });

        revalidatePath('/dashboard');
        revalidatePath('/reservas/minhas');
        revalidatePath('/admin/reservas');

        return {
            success: true,
        };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Erro ao cancelar reserva',
        };
    }
}

export async function getUserReservations(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', userId)
        .order('starts_at', { ascending: false });

    if (error) {
        console.error('Error fetching reservations:', error);
        return [];
    }

    return data || [];
}

export async function getAvailableSlots(date: string) {
    const supabase = await createClient();

    // Get all confirmed reservations for the date
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);

    const { data: reservations } = await supabase
        .from('reservations')
        .select('starts_at, ends_at')
        .eq('status', 'confirmed')
        .gte('starts_at', startOfDay.toISOString())
        .lte('starts_at', endOfDay.toISOString());

    // Get blackout periods for the date
    const { data: blackouts } = await supabase
        .from('blackout_periods')
        .select('starts_at, ends_at')
        .gte('starts_at', startOfDay.toISOString())
        .lte('ends_at', endOfDay.toISOString());

    // Generate all possible slots (9-21, last slot ends at 22)
    const slots = [];
    for (let hour = 9; hour <= 21; hour++) {
        const slotStart = new Date(`${date}T${String(hour).padStart(2, '0')}:00:00`);
        const slotEnd = new Date(`${date}T${String(hour + 1).padStart(2, '0')}:00:00`);

        // Check if occupied
        const isOccupied = reservations?.some((r) => {
            const resStart = new Date(r.starts_at);
            const resEnd = new Date(r.ends_at);
            return slotStart < resEnd && slotEnd > resStart;
        });

        // Check if blocked
        const isBlocked = blackouts?.some((b) => {
            const blackStart = new Date(b.starts_at);
            const blackEnd = new Date(b.ends_at);
            return slotStart < blackEnd && slotEnd > blackStart;
        });

        slots.push({
            hour,
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            available: !isOccupied && !isBlocked,
            occupied: isOccupied,
            blocked: isBlocked,
        });
    }

    return slots;
}

export async function getReservationsForWeek(startDate: string) {
    const supabase = await createClient();

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('status', 'confirmed')
        .gte('starts_at', start.toISOString())
        .lt('starts_at', end.toISOString())
        .order('starts_at', { ascending: true });

    if (error) {
        console.error('Error fetching weekly reservations:', error);
        return [];
    }

    return data || [];
}

export async function getAllReservations(filters?: {
    startDate?: string;
    endDate?: string;
    tower?: number;
    status?: string;
}) {
    const supabase = await createClient();

    let query = supabase
        .from('reservations')
        .select('*, profiles!reservations_user_id_fkey(full_name, phone, tower, block, apartment)')
        .order('starts_at', { ascending: false });

    if (filters?.startDate) {
        query = query.gte('starts_at', new Date(filters.startDate).toISOString());
    }

    if (filters?.endDate) {
        query = query.lte('starts_at', new Date(filters.endDate).toISOString());
    }

    if (filters?.status) {
        query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching all reservations:', error);
        return [];
    }

    // Filter by tower if specified (post-query since it's in joined table)
    if (filters?.tower && data) {
        return data.filter((r: any) => r.profiles?.tower === filters.tower);
    }

    return data || [];
}
