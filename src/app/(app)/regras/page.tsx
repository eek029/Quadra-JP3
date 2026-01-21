import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Calendar,
    Clock,
    Users,
    Ban,
    Phone,
    AlertCircle,
    Info,
} from 'lucide-react';

export default function RulesPage() {
    const rules = [
        {
            icon: Calendar,
            title: 'Limite de Reservas',
            description: 'Cada morador pode fazer até 2 reservas por dia.',
            color: 'text-blue-600',
        },
        {
            icon: Clock,
            title: 'Duração das Reservas',
            description: 'Cada reserva tem duração de 1 hora. Chegue no horário para aproveitar todo o tempo.',
            color: 'text-green-600',
        },
        {
            icon: Ban,
            title: 'Política de Cancelamento',
            description: 'Cancelamentos devem ser feitos com no mínimo 4 horas de antecedência.',
            color: 'text-red-600',
        },
        {
            icon: Users,
            title: 'Uso Compartilhado',
            description: 'Respeite outros moradores. Mantenha a quadra limpa e organizada.',
            color: 'text-purple-600',
        },
        {
            icon: AlertCircle,
            title: 'Horário de Funcionamento',
            description: 'A quadra está disponível das 09:00 às 22:00, todos os dias.',
            color: 'text-orange-600',
        },
        {
            icon: Info,
            title: 'Equipamentos',
            description: 'Traga seus próprios equipamentos. O condomínio não fornece bolas ou raquetes.',
            color: 'text-cyan-600',
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-gradient-purple">
                    Regras e Políticas
                </h1>
                <p className="text-muted-foreground mt-2">
                    Conheça as regras para uso das quadras
                </p>
            </div>

            {/* Rules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rules.map((rule, index) => {
                    const Icon = rule.icon;
                    return (
                        <Card
                            key={index}
                            className="hover:shadow-lg transition-shadow animate-slide-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <CardHeader>
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg bg-gradient-purple`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{rule.title}</CardTitle>
                                        <CardDescription className="mt-2">
                                            {rule.description}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    );
                })}
            </div>

            {/* Contact Information */}
            <Card className="bg-gradient-purple text-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        Precisa de Ajuda?
                    </CardTitle>
                    <CardDescription className="text-purple-100">
                        Entre em contato com a administração
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <p>
                            <strong>Telefone:</strong> (11) 9999-9999
                        </p>
                        <p>
                            <strong>Email:</strong> quadra@condominio.com
                        </p>
                        <p>
                            <strong>Horário de atendimento:</strong> Seg-Sex, 8h-18h
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
