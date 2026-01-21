'use client';

import { Bell, BellOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type Notification = {
    id: string;
    type: 'system' | 'message' | 'alert';
    title: string;
    body: string;
    read_at: string | null;
    created_at: string;
    metadata?: any;
};

type NotificationListProps = {
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    loading?: boolean;
};

export function NotificationList({
    notifications,
    onMarkAsRead,
    loading = false,
}: NotificationListProps) {
    if (notifications.length === 0) {
        return (
            <Card className="glass-dark border-white/20">
                <CardContent className="p-8 text-center">
                    <BellOff className="h-12 w-12 text-purple-300 mx-auto mb-3" />
                    <p className="text-purple-200">Nenhuma notificação</p>
                </CardContent>
            </Card>
        );
    }

    const getTypeIcon = (type: string) => {
        return <Bell className="h-4 w-4" />;
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'alert':
                return 'text-red-300';
            case 'message':
                return 'text-blue-300';
            default:
                return 'text-purple-300';
        }
    };

    return (
        <div className="space-y-2">
            {notifications.map((notification) => (
                <Card
                    key={notification.id}
                    className={cn(
                        'glass-dark border-white/20 transition-all',
                        !notification.read_at && 'border-purple-500/50'
                    )}
                >
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <div className={cn('mt-0.5', getTypeColor(notification.type))}>
                                {getTypeIcon(notification.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <h4 className="text-sm font-semibold text-white">
                                        {notification.title}
                                    </h4>
                                    {!notification.read_at && (
                                        <Badge className="bg-purple-600 text-white text-xs">
                                            Nova
                                        </Badge>
                                    )}
                                </div>

                                <p className="text-sm text-purple-200 mt-1">
                                    {notification.body}
                                </p>

                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-purple-300">
                                        {format(new Date(notification.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                                    </span>

                                    {!notification.read_at && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onMarkAsRead(notification.id)}
                                            disabled={loading}
                                            className="text-xs text-purple-200 hover:text-white"
                                        >
                                            Marcar como lida
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
