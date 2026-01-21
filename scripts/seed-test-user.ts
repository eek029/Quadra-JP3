import { createClient } from '@supabase/supabase-js';

// Script to create test user for development
// Run with: ENABLE_TEST_USER=true tsx scripts/seed-test-user.ts

const ENABLE_TEST_USER = process.env.ENABLE_TEST_USER === 'true';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const TEST_USER_EMAIL = 'user@teste.local';
const TEST_USER_PASSWORD = '@123';

async function seedTestUser() {
    if (!ENABLE_TEST_USER) {
        console.log('❌ ENABLE_TEST_USER is not set to true. Skipping...');
        console.log('To enable, run: ENABLE_TEST_USER=true tsx scripts/seed-test-user.ts');
        return;
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Missing Supabase credentials');
        console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
        process.exit(1);
    }

    console.log('🌱 Seeding test user...');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    try {
        // Check if user already exists
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users.find(
            (u) => u.email === TEST_USER_EMAIL
        );

        let userId: string;

        if (existingUser) {
            console.log('✅ Test user already exists:', TEST_USER_EMAIL);
            userId = existingUser.id;
        } else {
            // Create user via admin API
            const { data, error } = await supabase.auth.admin.createUser({
                email: TEST_USER_EMAIL,
                password: TEST_USER_PASSWORD,
                email_confirm: true,
                user_metadata: {
                    full_name: 'Usuário de Teste',
                    birth_date: '1990-01-01',
                    phone: '(11) 99999-9999',
                    tower: 1,
                    apartment: 'TESTE',
                },
            });

            if (error) {
                console.error('❌ Error creating user:', error);
                process.exit(1);
            }

            if (!data.user) {
                console.error('❌ User creation failed');
                process.exit(1);
            }

            userId = data.user.id;
            console.log('✅ Created test user:', TEST_USER_EMAIL);
        }

        // Update profile to be approved with general_manager role
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (!profile) {
            // Create profile if trigger didn't work
            const { error: profileError } = await supabase.from('profiles').insert({
                user_id: userId,
                full_name: 'Usuário de Teste',
                birth_date: '1990-01-01',
                phone: '(11) 99999-9999',
                tower: 1,
                apartment: 'TESTE',
                role: 'general_manager',
                status: 'approved',
            });

            if (profileError) {
                console.error('❌ Error creating profile:', profileError);
                process.exit(1);
            }

            console.log('✅ Created profile for test user');
        } else {
            // Update existing profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: 'Usuário de Teste',
                    birth_date: '1990-01-01',
                    phone: '(11) 99999-9999',
                    tower: 1,
                    apartment: 'TESTE',
                    role: 'general_manager',
                    status: 'approved',
                })
                .eq('user_id', userId);

            if (updateError) {
                console.error('❌ Error updating profile:', updateError);
                process.exit(1);
            }

            console

                .log('✅ Updated profile for test user');
        }

        console.log('\n🎉 Test user setup complete!');
        console.log('📧 Email:', TEST_USER_EMAIL);
        console.log('🔑 Password:', TEST_USER_PASSWORD);
        console.log('👤 Role: general_manager');
        console.log('✅ Status: approved');
        console.log('\nYou can now use the "Usuário de Teste" button on the login page (dev only)');
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    }
}

seedTestUser();
