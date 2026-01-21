'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/app/actions/auth';

export default function PendentePage() {
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <Card className="glass-dark border-white/20 max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <Clock className="h-8 w-8 text-yellow-400" />
                    </div>
                    <CardTitle className="text-2xl text-white">
                        Aguardando Aprovação
                    </CardTitle>
                    <CardDescription className="text-purple-100">
                        Complexo Júlio Prestes
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert className="bg-yellow-500/20 border-yellow-500/50">
                        <AlertDescription className="text-yellow-100">
                            <p className="font-semibold mb-2">Seu cadastro está em análise</p>
                            <p className="text-sm">
                                A administração do condomínio está revisando seu cadastro.
                                Você receberá uma notificação assim que for aprovado.
                            </p>
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-3 text-sm text-purple-100">
                        <p>
                            <strong className="text-white">O que fazer enquanto aguarda:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Certifique-se de que completou todos os dados do seu perfil</li>
                            <li>Verifique se seu telefone e email estão corretos</li>
                            <li>Entre em contato com a portaria se houver urgência</li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => router.push('/perfil')}
                            className="w-full bg-gradient-purple hover:bg-gradient-purple-hover text-white"
                        >
                            Ver Meu Perfil
                        </Button>
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sair
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
