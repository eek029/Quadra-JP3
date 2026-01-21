'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type PendingProfile = {
    user_id: string;
    full_name: string;
    birth_date: string;
    phone: string;
    tower: number;
    block?: string;
    apartment: string;
    photo_url?: string;
    created_at: string;
};

export type ApprovalResult = {
    success: boolean;
    error?: string;
};

export async function getPendingProfiles(
    approverId: string
): Promise<PendingProfile[]> {
    const supabase = await createClient();

    // Get approver's profile to check role and tower
    const { data: approverProfile } = await supabase
        .from('profiles')
        .select('role, tower, status')
        .eq('user_id', approverId)
        .single();

    if (!approverProfile || approverProfile.status !== 'approved') {
        return [];
    }

    const { role, tower } = approverProfile;

    let query = supabase
        .from('profiles')
        .select('*')
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false });

    // Filter based on role
    if (role === 'doorman' || role === 'sub_manager') {
        // Doorman and sub_manager only see their own tower
        query = query.eq('tower', tower);
    }
    // general_manager and dev_admin see all

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching pending profiles:', error);
        return [];
    }

    return data || [];
}

export async function approveProfile(
    profileUserId: string,
    approverId: string
): Promise<ApprovalResult> {
    const supabase = await createClient();

    // Verify approver has permission
    const { data: approverProfile } = await supabase
        .from('profiles')
        .select('role, tower, status')
        .eq('user_id', approverId)
        .single();

    if (!approverProfile || approverProfile.status !== 'approved') {
        return {
            success: false,
            error: 'Você não tem permissão para aprovar perfis',
        };
    }

    // Get the profile to approve
    const { data: profileToApprove } = await supabase
        .from('profiles')
        .select('tower, role')
        .eq('user_id', profileUserId)
        .single();

    if (!profileToApprove) {
        return {
            success: false,
            error: 'Perfil não encontrado',
        };
    }

    // Check role-based permissions
    const { role: approverRole, tower: approverTower } = approverProfile;
    const { tower: profileTower, role: profileRole } = profileToApprove;

    if (approverRole === 'doorman') {
        // Doorman can only approve residents of their tower
        if (profileTower !== approverTower) {
            return {
                success: false,
                error: 'Você só pode aprovar perfis da sua torre',
            };
        }
        if (profileRole !== 'resident') {
            return {
                success: false,
                error: 'Porteiros só podem aprovar moradores',
            };
        }
    } else if (approverRole === 'sub_manager') {
        // Sub_manager can approve residents and doormen of their tower
        if (profileTower !== approverTower) {
            return {
                success: false,
                error: 'Você só pode aprovar perfis da sua torre',
            };
        }
        if (!['resident', 'doorman'].includes(profileRole)) {
            return {
                success: false,
                error: 'Sub-síndicos só podem aprovar moradores e porteiros',
            };
        }
    }
    // general_manager and dev_admin can approve anyone

    // Update profile status
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ status: 'approved' })
        .eq('user_id', profileUserId);

    if (updateError) {
        return {
            success: false,
            error: updateError.message,
        };
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
        actor_user_id: approverId,
        action: 'approve_profile',
        target_type: 'profile',
        target_id: profileUserId,
        metadata_json: {
            tower: profileTower,
            role: profileRole,
        },
    });

    revalidatePath('/admin/aprovacoes');
    return { success: true };
}

export async function rejectProfile(
    profileUserId: string,
    approverId: string,
    reason: string
): Promise<ApprovalResult> {
    const supabase = await createClient();

    // Similar permission checks as approve
    const { data: approverProfile } = await supabase
        .from('profiles')
        .select('role, tower, status')
        .eq('user_id', approverId)
        .single();

    if (!approverProfile || approverProfile.status !== 'approved') {
        return {
            success: false,
            error: 'Você não tem permissão para rejeitar perfis',
        };
    }

    const { data: profileToReject } = await supabase
        .from('profiles')
        .select('tower, role')
        .eq('user_id', profileUserId)
        .single();

    if (!profileToReject) {
        return {
            success: false,
            error: 'Perfil não encontrado',
        };
    }

    // Check role-based permissions (same as approve)
    const { role: approverRole, tower: approverTower } = approverProfile;
    const { tower: profileTower } = profileToReject;

    if (
        (approverRole === 'doorman' || approverRole === 'sub_manager') &&
        profileTower !== approverTower
    ) {
        return {
            success: false,
            error: 'Você só pode rejeitar perfis da sua torre',
        };
    }

    // Update profile status
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ status: 'rejected' })
        .eq('user_id', profileUserId);

    if (updateError) {
        return {
            success: false,
            error: updateError.message,
        };
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
        actor_user_id: approverId,
        action: 'reject_profile',
        target_type: 'profile',
        target_id: profileUserId,
        metadata_json: {
            reason: reason,
            tower: profileTower,
        },
    });

    revalidatePath('/admin/aprovacoes');
    return { success: true };
}
