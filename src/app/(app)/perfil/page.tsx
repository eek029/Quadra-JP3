'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Phone, Calendar, Building, Home, Upload, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, getProfile } from '@/app/actions/auth';
import {
    updateProfile,
    uploadProfilePhoto,
    encryptAndSaveSensitiveData,
    type ProfileData,
} from '@/app/actions/profile';
import { updateDoormanShift, type ShiftConfig } from '@/app/actions/shift';

export default function PerfilPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);

    const [fullName, setFullName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [phone, setPhone] = useState('');
    const [tower, setTower] = useState<number>(1);
    const [block, setBlock] = useState('');
    const [apartment, setApartment] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [cpf, setCpf] = useState('');
    const [rg, setRg] = useState('');

    // Doorman shift fields
    const [shiftType, setShiftType] = useState<'day' | 'night' | ''>('');
    const [shiftAnchorDate, setShiftAnchorDate] = useState('');

    useEffect(() => {
        loadUserAndProfile();
    }, []);

    const loadUserAndProfile = async () => {
        try {
            const currentUser = await getUser();
            if (!currentUser) {
                router.push('/login');
                return;
            }

            setUser(currentUser);

            const currentProfile = await getProfile(currentUser.id);
            if (currentProfile) {
                setProfile(currentProfile);
                setFullName(currentProfile.full_name || '');
                setBirthDate(currentProfile.birth_date || '');
                setPhone(currentProfile.phone || '');
                setTower(currentProfile.tower || 1);
                setBlock(currentProfile.block || '');
                setApartment(currentProfile.apartment || '');
                setPhotoUrl(currentProfile.photo_url || '');
                setShiftType(currentProfile.shift_type || '');
                setShiftAnchorDate(currentProfile.shift_anchor_date || '');
            }
        } catch (err) {
            setError('Erro ao carregar perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            const profileData: ProfileData = {
                full_name: fullName,
                birth_date: birthDate,
                phone,
                tower,
                block: tower === 5 ? block : undefined,
                apartment,
            };

            const result = await updateProfile(user.id, profileData);
            if (!result.success) {
                setError(result.error || 'Erro ao salvar perfil');
                setSaving(false);
                return;
            }

            // Save CPF/RG if provided
            if (cpf && rg) {
                const sensitiveResult = await encryptAndSaveSensitiveData(user.id, cpf, rg);
                if (!sensitiveResult.success) {
                    setError(sensitiveResult.error || 'Erro ao salvar CPF/RG');
                    setSaving(false);
                    return;
                }
            }

            setSuccess('Perfil atualizado com sucesso!');
            await loadUserAndProfile();
        } catch (err) {
            setError('Erro inesperado ao salvar perfil');
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const result = await uploadProfilePhoto(user.id, formData);
            if (!result.success) {
                setError(result.error || 'Erro ao fazer upload da foto');
            } else {
                setPhotoUrl(result.url || '');
                setSuccess('Foto atualizada com sucesso!');
            }
        } catch (err) {
            setError('Erro inesperado ao fazer upload');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-white">Carregando...</div>
            </div>
        );
    }

    const isPending = profile?.status === 'pending_approval';

    return (
        <div className="container max-w-2xl mx-auto p-6">
            <Card className="glass-dark border-white/20">
                <CardHeader>
                    <CardTitle className="text-2xl text-white">Meu Perfil</CardTitle>
                    <CardDescription className="text-purple-100">
                        Complete seu cadastro
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isPending && (
                        <Alert className="bg-yellow-500/20 border-yellow-500/50 text-yellow-100">
                            <AlertDescription>
                                ⏳ Seu cadastro está pendente de aprovação pela administração.
                            </AlertDescription>
                        </Alert>
                    )}

                    {error && (
                        <Alert className="bg-red-500/20 border-red-500/50 text-red-100">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="bg-green-500/20 border-green-500/50 text-green-100">
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}

                    {/* Photo Upload */}
                    <div className="flex flex-col items-center space-y-4">
                        <Avatar className="h-32 w-32">
                            <AvatarImage src={photoUrl} />
                            <AvatarFallback className="bg-purple-600 text-white text-3xl">
                                {fullName.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <label htmlFor="photo-upload" className="cursor-pointer">
                            <Button
                                type="button"
                                variant="outline"
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                disabled={saving}
                                onClick={() => document.getElementById('photo-upload')?.click()}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Alterar foto
                            </Button>
                            <input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoUpload}
                                disabled={saving}
                            />
                        </label>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="fullName" className="text-sm font-medium text-white">
                                Nome Completo
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-200" />
                                <Input
                                    id="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="pl-10 bg-white/10 border-white/20 text-white"
                                    required
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="phone" className="text-sm font-medium text-white">
                                    Telefone
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-200" />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="pl-10 bg-white/10 border-white/20 text-white"
                                        required
                                        disabled={saving}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="birthDate" className="text-sm font-medium text-white">
                                    Data de Nasc.
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-200" />
                                    <Input
                                        id="birthDate"
                                        type="date"
                                        value={birthDate}
                                        onChange={(e) => setBirthDate(e.target.value)}
                                        className="pl-10 bg-white/10 border-white/20 text-white"
                                        required
                                        disabled={saving}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="tower" className="text-sm font-medium text-white">
                                    Torre
                                </label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-200" />
                                    <select
                                        id="tower"
                                        value={tower}
                                        onChange={(e) => setTower(Number(e.target.value))}
                                        className="w-full pl-10 h-10 bg-white/10 border border-white/20 rounded-md text-white"
                                        required
                                        disabled={saving}
                                    >
                                        <option value="1" className="bg-purple-900">1</option>
                                        <option value="2" className="bg-purple-900">2</option>
                                        <option value="3" className="bg-purple-900">3</option>
                                        <option value="4" className="bg-purple-900">4</option>
                                        <option value="5" className="bg-purple-900">5</option>
                                    </select>
                                </div>
                            </div>

                            {tower === 5 && (
                                <div className="space-y-2">
                                    <label htmlFor="block" className="text-sm font-medium text-white">
                                        Bloco
                                    </label>
                                    <select
                                        id="block"
                                        value={block}
                                        onChange={(e) => setBlock(e.target.value)}
                                        className="w-full h-10 bg-white/10 border border-white/20 rounded-md text-white px-3"
                                        required
                                        disabled={saving}
                                    >
                                        <option value="" className="bg-purple-900">Selecione</option>
                                        <option value="A" className="bg-purple-900">A</option>
                                        <option value="B" className="bg-purple-900">B</option>
                                    </select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="apartment" className="text-sm font-medium text-white">
                                    Apto
                                </label>
                                <div className="relative">
                                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-200" />
                                    <Input
                                        id="apartment"
                                        type="text"
                                        value={apartment}
                                        onChange={(e) => setApartment(e.target.value)}
                                        className="pl-10 bg-white/10 border-white/20 text-white"
                                        required
                                        disabled={saving}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Doorman Shift Configuration */}
                        {profile?.role === 'doorman' && (
                            <div className="border-t border-white/20 pt-4">
                                <h3 className="text-white font-semibold mb-4">⏰ Escala do Porteiro (12x36)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="shiftType" className="text-sm font-medium text-white">
                                            Turno *
                                        </label>
                                        <select
                                            id="shiftType"
                                            value={shiftType}
                                            onChange={(e) => setShiftType(e.target.value as 'day' | 'night')}
                                            className="w-full h-10 bg-white/10 border border-white/20 rounded-md text-white px-3"
                                            required={profile?.role === 'doorman'}
                                            disabled={saving}
                                        >
                                            <option value="" className="bg-purple-900">Selecione</option>
                                            <option value="day" className="bg-purple-900">Diurno (07:00 - 19:00)</option>
                                            <option value="night" className="bg-purple-900">Noturno (19:00 - 07:00)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="shiftAnchorDate" className="text-sm font-medium text-white">
                                            Data do 1º Plantão *
                                        </label>
                                        <Input
                                            id="shiftAnchorDate"
                                            type="date"
                                            value={shiftAnchorDate}
                                            onChange={(e) => setShiftAnchorDate(e.target.value)}
                                            className="bg-white/10 border-white/20 text-white"
                                            required={profile?.role === 'doorman'}
                                            disabled={saving}
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-purple-200 mt-2">
                                    ℹ️ O sistema calculará automaticamente seus plantões baseado nesta data (escala 12x36)
                                </p>
                                {shiftType && shiftAnchorDate && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={async () => {
                                            setSaving(true);
                                            const result = await updateDoormanShift(user.id, {
                                                shift_type: shiftType as 'day' | 'night',
                                                shift_anchor_date: shiftAnchorDate,
                                            });
                                            if (result.success) {
                                                setSuccess('Escala atualizada!');
                                                await loadUserAndProfile();
                                            } else {
                                                setError(result.error || 'Erro ao atualizar escala');
                                            }
                                            setSaving(false);
                                        }}
                                        className="mt-3 w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                                        disabled={saving}
                                    >
                                        Atualizar Escala
                                    </Button>
                                )}
                            </div>
                        )}

                        <div className="border-t border-white/20 pt-4">
                            <h3 className="text-white font-semibold mb-4 flex items-center">
                                <Lock className="mr-2 h-4 w-4" />
                                Documentos (Criptografados)
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="cpf" className="text-sm font-medium text-white">
                                        CPF
                                    </label>
                                    <Input
                                        id="cpf"
                                        type="text"
                                        placeholder="000.000.000-00"
                                        value={cpf}
                                        onChange={(e) => setCpf(e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                        disabled={saving}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="rg" className="text-sm font-medium text-white">
                                        RG
                                    </label>
                                    <Input
                                        id="rg"
                                        type="text"
                                        placeholder="00.000.000-0"
                                        value={rg}
                                        onChange={(e) => setRg(e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                        disabled={saving}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-purple-200 mt-2">
                                🔒 Estes dados são criptografados e armazenados com segurança
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-purple hover:bg-gradient-purple-hover text-white font-semibold h-11"
                            disabled={saving}
                        >
                            {saving ? 'Salvando...' : 'Salvar Perfil'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
