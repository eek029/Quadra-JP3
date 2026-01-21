'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type BlackoutData = {
    startsAt: string; // ISO timestamp
    endsAt: string; // ISO timestamp
    reason: string;
};

export type BlackoutResult = {
    success: boolean;
    error?: string;
    id?: string;
};

export async function createBlackoutPeriod(
    createdBy: string,
    data: BlackoutData
): Promise<BlackoutResult> {
    const supabase = await createClient();

    // Verify user has permission (sub_manager or above)
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('user_id', createdBy)
        .single();

    if (!profile || profile.status !== 'approved') {
        return {
            success: false,
            error: 'Usuário não encontrado ou não aprovado',
        };
    }

    const allowedRoles = ['sub_manager', 'general_manager', 'dev_admin'];
    if (!allowedRoles.includes(profile.role)) {
        return {
            success: false,
            error: 'Você não tem permissão para criar períodos de bloqueio',
        };
    }

    // Validate dates
    const start = new Date(data.startsAt);
    const end = new Date(data.endsAt);

    if (end <= start) {
        return {
            success: false,
            error: 'A data de término deve ser posterior à data de início',
        };
    }

    // Create blackout period
    const { data: blackout, error } = await supabase
        .from('blackout_periods')
        .insert({
            starts_at: data.startsAt,
            ends_at: data.endsAt,
            reason: data.reason,
            created_by: createdBy,
        })
        .select()
        .single();

    if (error) {
        return {
            success: false,
            error: error.message,
        };
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
        actor_user_id: createdBy,
        action: 'create_blackout',
        target_type: 'blackout_period',
        target_id: blackout.id,
        metadata_json: {
            starts_at: data.startsAt,
            ends_at: data.endsAt,
            reason: data.reason,
        },
    });

    revalidatePath('/admin/blackouts');
    revalidatePath('/dashboard');
    revalidatePath('/reservas/nova');

    return {
        success: true,
        id: blackout.id,
    };
}

export async function deleteBlackoutPeriod(
    userId: string,
    blackoutId: string
): Promise<BlackoutResult> {
    const supabase = await createClient();

    // Verify user has permission
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('user_id', userId)
        .single();

    if (!profile || profile.status !== 'approved') {
        return {
            success: false,
            error: 'Usuário não encontrado ou não aprovado',
        };
    }

    const allowedRoles = ['sub_manager', 'general_manager', 'dev_admin'];
    if (!allowedRoles.includes(profile.role)) {
        return {
            success: false,
            error: 'Você não tem permissão para deletar períodos de bloqueio',
        };
    }

    // Delete blackout
    const { error } = await supabase
        .from('blackout_periods')
        .delete()
        .eq('id', blackoutId);

    if (error) {
        return {
            success: false,
            error: error.message,
        };
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
        actor_user_id: userId,
        action: 'delete_blackout',
        target_type: 'blackout_period',
        target_id: blackoutId,
    });

    revalidatePath('/admin/blackouts');
    revalidatePath('/dashboard');
    revalidatePath('/reservas/nova');

    return {
        success: true,
    };
}

export async function getBlackoutPeriods(startDate?: string, endDate?: string) {
    const supabase = await createClient();

    let query = supabase
        .from('blackout_periods')
        .select('*, profiles!blackout_periods_created_by_fkey(full_name)')
        .order('starts_at', { ascending: true });

    if (startDate) {
        query = query.gte('ends_at', new Date(startDate).toISOString());
    }

    if (endDate) {
        query = query.lte('starts_at', new Date(endDate).toISOString());
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching blackout periods:', error);
        return [];
    }

    return data || [];
}

export async function getActiveBlackouts() {
    const supabase = await createClient();

    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('blackout_periods')
        .select('*')
        .gte('ends_at', now)
        .order('starts_at', { ascending: true });

    if (error) {
        console.error('Error fetching active blackouts:', error);
        return [];
    }

    return data || [];
}
