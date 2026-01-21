'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type NotificationData = {
    type: 'system' | 'message' | 'alert';
    title: string;
    body: string;
    metadata?: any;
};

export async function createNotification(
    userId: string,
    data: NotificationData
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { error } = await supabase.from('notifications').insert({
        recipient_user_id: userId,
        type: data.type,
        title: data.title,
        body: data.body,
        metadata: data.metadata,
    });

    if (error) {
        return {
            success: false,
            error: error.message,
        };
    }

    revalidatePath('/dashboard');
    return { success: true };
}

export async function getUserNotifications(userId: string, limit: number = 10) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }

    return data || [];
}

export async function markAsRead(notificationId: string): Promise<{ success: boolean }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

    if (error) {
        console.error('Error marking notification as read:', error);
        return { success: false };
    }

    revalidatePath('/dashboard');
    return { success: true };
}

export async function markAllAsRead(userId: string): Promise<{ success: boolean }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_user_id', userId)
        .is('read_at', null);

    if (error) {
        console.error('Error marking all as read:', error);
        return { success: false };
    }

    revalidatePath('/dashboard');
    return { success: true };
}
