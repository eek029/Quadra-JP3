import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Construction } from 'lucide-react';

export default function AdminPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-gradient-purple flex items-center gap-3">
                    <Shield className="h-8 w-8" />
                    Painel Administrativo
                </h1>
                <p className="text-muted-foreground mt-2">
                    Área restrita para administradores
                </p>
            </div>

            {/* Under Construction */}
            <Card className="text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="h-24 w-24 rounded-full bg-gradient-purple flex items-center justify-center">
                            <Construction className="h-12 w-12 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Página em Construção</CardTitle>
                    <CardDescription className="text-base">
                        O painel administrativo está sendo desenvolvido
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 text-left max-w-2xl mx-auto">
                        <p className="text-muted-foreground">
                            Em breve, você terá acesso às seguintes funcionalidades:
                        </p>
                        <ul className="space-y-2 text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-purple-600" />
                                Gerenciamento de usuários e permissões
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-purple-600" />
                                Configuração de quadras e horários
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-purple-600" />
                                Visualização de relatórios e estatísticas
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-purple-600" />
                                Gerenciamento de reservas e bloqueios
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-purple-600" />
                                Configuração de regras e políticas
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Access Notice */}
            <Card className="bg-gradient-purple text-white">
                <CardHeader>
                    <CardTitle>Acesso Restrito</CardTitle>
                    <CardDescription className="text-purple-100">
                        Esta área requer permissões especiais
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm">
                        Se você acredita que deveria ter acesso a esta área, entre em
                        contato com o administrador do sistema.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
