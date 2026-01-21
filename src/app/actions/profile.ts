'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ProfileData = {
    full_name: string;
    birth_date: string;
    phone: string;
    tower: number;
    block?: string;
    apartment: string;
};

export type ProfileResult = {
    success: boolean;
    error?: string;
};

export async function updateProfile(
    userId: string,
    data: ProfileData
): Promise<ProfileResult> {
    const supabase = await createClient();

    // Validate tower 5 must have block
    if (data.tower === 5 && !data.block) {
        return {
            success: false,
            error: 'Torre 5 deve ter bloco (A ou B)',
        };
    }

    // Validate tower 1-4 should not have block
    if (data.tower !== 5 && data.block) {
        return {
            success: false,
            error: 'Apenas Torre 5 possui blocos',
        };
    }

    const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('user_id', userId);

    if (error) {
        return {
            success: false,
            error: error.message,
        };
    }

    revalidatePath('/perfil');
    return { success: true };
}

export async function uploadProfilePhoto(
    userId: string,
    formData: FormData
): Promise<ProfileResult & { url?: string }> {
    const supabase = await createClient();
    const file = formData.get('file') as File;

    if (!file) {
        return {
            success: false,
            error: 'Nenhum arquivo selecionado',
        };
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        return {
            success: false,
            error: 'Tipo de arquivo inválido. Use JPEG, PNG ou WebP.',
        };
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        return {
            success: false,
            error: 'Arquivo muito grande. Tamanho máximo: 2MB.',
        };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
            upsert: true,
            contentType: file.type,
        });

    if (uploadError) {
        return {
            success: false,
            error: uploadError.message,
        };
    }

    // Get public URL
    const {
        data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(fileName);

    // Update profile with photo URL
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: publicUrl })
        .eq('user_id', userId);

    if (updateError) {
        return {
            success: false,
            error: updateError.message,
        };
    }

    revalidatePath('/perfil');
    return { success: true, url: publicUrl };
}

export async function encryptAndSaveSensitiveData(
    userId: string,
    cpf: string,
    rg: string
): Promise<ProfileResult> {
    const supabase = await createClient();

    // Use pgcrypto to encrypt CPF and RG
    // We'll use a SQL function for encryption
    const { error } = await supabase.rpc('update_sensitive_data', {
        p_user_id: userId,
        p_cpf: cpf,
        p_rg: rg,
    });

    if (error) {
        return {
            success: false,
            error: error.message,
        };
    }

    revalidatePath('/perfil');
    return { success: true };
}
