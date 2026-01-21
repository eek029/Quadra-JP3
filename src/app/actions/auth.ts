'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type SignUpData = {
    email: string;
    password: string;
    metadata: {
        full_name: string;
        birth_date: string;
        phone: string;
        tower: number;
        block?: string;
        apartment: string;
    };
};

export type AuthResult = {
    success: boolean;
    error?: string;
    user?: any;
};

export async function signUp(data: SignUpData): Promise<AuthResult> {
    const supabase = await createClient();

    // Validate tower 5 must have block
    if (data.metadata.tower === 5 && !data.metadata.block) {
        return {
            success: false,
            error: 'Torre 5 deve ter bloco (A ou B)',
        };
    }

    // Validate tower 1-4 should not have block
    if (data.metadata.tower !== 5 && data.metadata.block) {
        return {
            success: false,
            error: 'Apenas Torre 5 possui blocos',
        };
    }

    const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            data: data.metadata,
        },
    });

    if (error) {
        return {
            success: false,
            error: error.message,
        };
    }

    if (!authData.user) {
        return {
            success: false,
            error: 'Erro ao criar usuário',
        };
    }

    // The trigger will automatically create the profile
    // Redirect to profile page to complete registration
    revalidatePath('/', 'layout');
    redirect('/perfil');
}

export async function signIn(
    email: string,
    password: string
): Promise<AuthResult> {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return {
            success: false,
            error: error.message,
        };
    }

    if (!data.user) {
        return {
            success: false,
            error: 'Erro ao fazer login',
        };
    }

    // Get profile to check status
    const { data: profile } = await supabase
        .from('profiles')
        .select('status')
        .eq('user_id', data.user.id)
        .single();

    revalidatePath('/', 'layout');

    // Redirect based on profile status
    if (!profile) {
        // No profile yet, redirect to complete it
        redirect('/perfil');
    } else if (profile.status === 'pending_approval') {
        redirect('/pendente');
    } else if (profile.status === 'approved') {
        redirect('/dashboard');
    } else if (profile.status === 'rejected') {
        // Logout user and show message
        await supabase.auth.signOut();
        return {
            success: false,
            error: 'Seu cadastro foi rejeitado. Entre em contato com a administração.',
        };
    }

    return { success: true, user: data.user };
}

export async function signOut(): Promise<void> {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    redirect('/login');
}

export async function resetPassword(email: string): Promise<AuthResult> {
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });

    if (error) {
        return {
            success: false,
            error: error.message,
        };
    }

    return {
        success: true,
    };
}

export async function getUser() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user;
}

export async function getProfile(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    return data;
}
