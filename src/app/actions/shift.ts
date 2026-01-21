'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ShiftWindow = {
    isOnDuty: boolean;
    shiftStart: string | null;
    shiftEnd: string | null;
    shiftType: 'day' | 'night' | null;
    status: 'active' | 'off_duty' | 'schedule_missing';
    message?: string;
};

export type ShiftConfig = {
    shift_type: 'day' | 'night';
    shift_anchor_date: string; // YYYY-MM-DD
};

/**
 * Calculate if doorman is on duty based on 12x36 schedule
 * Logic: diff_days % 2 === 0 means on duty
 */
function calculateShiftWindow(
    shiftType: 'day' | 'night',
    anchorDate: string,
    currentDate: Date = new Date()
): ShiftWindow {
    // Parse anchor date (in America/Sao_Paulo timezone)
    const anchor = new Date(anchorDate + 'T00:00:00-03:00');

    // Calculate diff in days
    const diffTime = currentDate.getTime() - anchor.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // On duty if diff is even (0, 2, 4, ...)
    const isOnDuty = diffDays % 2 === 0;

    if (!isOnDuty) {
        return {
            isOnDuty: false,
            shiftStart: null,
            shiftEnd: null,
            shiftType,
            status: 'off_duty',
            message: 'Você está fora do plantão hoje (escala 12x36)',
        };
    }

    // Calculate shift window
    let shiftStart: Date;
    let shiftEnd: Date;

    const todayStr = currentDate.toLocaleDateString('en-CA'); // YYYY-MM-DD

    if (shiftType === 'day') {
        // Day shift: 07:00 - 19:00 same day
        shiftStart = new Date(`${todayStr}T07:00:00-03:00`);
        shiftEnd = new Date(`${todayStr}T19:00:00-03:00`);
    } else {
        // Night shift: 19:00 today - 07:00 tomorrow
        shiftStart = new Date(`${todayStr}T19:00:00-03:00`);
        const tomorrow = new Date(currentDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toLocaleDateString('en-CA');
        shiftEnd = new Date(`${tomorrowStr}T07:00:00-03:00`);
    }

    // Check if current time is within shift window
    const now = currentDate.getTime();
    const inShiftWindow = now >= shiftStart.getTime() && now < shiftEnd.getTime();

    return {
        isOnDuty: inShiftWindow,
        shiftStart: shiftStart.toISOString(),
        shiftEnd: shiftEnd.toISOString(),
        shiftType,
        status: inShiftWindow ? 'active' : 'off_duty',
        message: inShiftWindow
            ? `Plantão ativo: ${shiftStart.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${shiftEnd.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
            : 'Fora do horário do plantão',
    };
}

export async function getCurrentDoormanShiftWindow(
    userId: string
): Promise<ShiftWindow> {
    const supabase = await createClient();

    // Get doorman profile
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, shift_type, shift_anchor_date, status')
        .eq('user_id', userId)
        .single();

    if (error || !profile) {
        return {
            isOnDuty: false,
            shiftStart: null,
            shiftEnd: null,
            shiftType: null,
            status: 'schedule_missing',
            message: 'Perfil não encontrado',
        };
    }

    // Verify is doorman
    if (profile.role !== 'doorman') {
        return {
            isOnDuty: false,
            shiftStart: null,
            shiftEnd: null,
            shiftType: null,
            status: 'schedule_missing',
            message: 'Acesso restrito a porteiros',
        };
    }

    // Check if schedule is configured
    if (!profile.shift_type || !profile.shift_anchor_date) {
        return {
            isOnDuty: false,
            shiftStart: null,
            shiftEnd: null,
            shiftType: null,
            status: 'schedule_missing',
            message: 'Configure sua escala no perfil para ver o painel',
        };
    }

    // Calculate shift window
    return calculateShiftWindow(
        profile.shift_type as 'day' | 'night',
        profile.shift_anchor_date
    );
}

export async function getDoormanShiftNotifications(userId: string) {
    const supabase = await createClient();

    // Get shift window
    const shiftWindow = await getCurrentDoormanShiftWindow(userId);

    if (!shiftWindow.isOnDuty || !shiftWindow.shiftStart || !shiftWindow.shiftEnd) {
        return [];
    }

    // Get notifications created during current shift
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_user_id', userId)
        .gte('created_at', shiftWindow.shiftStart)
        .lte('created_at', shiftWindow.shiftEnd)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching shift notifications:', error);
        return [];
    }

    return data || [];
}

export async function getActiveReservationsNow() {
    const supabase = await createClient();

    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('reservations')
        .select('*, profiles!reservations_user_id_fkey(full_name, phone, tower, block, apartment)')
        .eq('status', 'confirmed')
        .lte('starts_at', now)
        .gte('ends_at', now)
        .order('starts_at', { ascending: true });

    if (error) {
        console.error('Error fetching active reservations:', error);
        return [];
    }

    return data || [];
}

export async function getUpcomingReservations(hoursAhead: number = 3) {
    const supabase = await createClient();

    const now = new Date();
    const future = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

    const { data, error } = await supabase
        .from('reservations')
        .select('*, profiles!reservations_user_id_fkey(full_name, phone, tower, block, apartment)')
        .eq('status', 'confirmed')
        .gt('starts_at', now.toISOString())
        .lte('starts_at', future.toISOString())
        .order('starts_at', { ascending: true });

    if (error) {
        console.error('Error fetching upcoming reservations:', error);
        return [];
    }

    return data || [];
}

export async function updateDoormanShift(
    userId: string,
    data: ShiftConfig
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // Verify user is doorman
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .single();

    if (!profile || profile.role !== 'doorman') {
        return {
            success: false,
            error: 'Apenas porteiros podem configurar escala',
        };
    }

    // Update shift config
    const { error } = await supabase
        .from('profiles')
        .update({
            shift_type: data.shift_type,
            shift_anchor_date: data.shift_anchor_date,
        })
        .eq('user_id', userId);

    if (error) {
        return {
            success: false,
            error: error.message,
        };
    }

    revalidatePath('/perfil');
    revalidatePath('/porteiro/ao-vivo');

    return { success: true };
}
