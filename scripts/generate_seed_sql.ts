import { createClient } from '@supabase/supabase-js'

// You must setup these env vars for the script to run locally
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase env vars')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

/**
 * MOCK DATA GENERATOR
 * Generates profiles to test specific matching scenarios
 */
async function seedUsers() {
    console.log('🌱 Starting seed process...')

    // 1. Create mock auth users first (Supabase requires auth user for profile)
    // NOTE: In a real seed script we'd use admin API to create users. 
    // Since we don't have admin key here, we will mock the profiles directly 
    // assuming they are linked to "dummy" IDs.

    // HOWEVER, profiles table references auth.users(id). 
    // We cannot insert profiles without existing users if foreign key constraint is active.
    // WORKAROUND: We will just log the JSON data for you to copy-paste into SQL Editor
    // OR we generate SQL insert statements.

    const matches = [
        {
            full_name: 'Ana Perfeita (100% Match)',
            university: 'UFPI', // Change to match your current user
            course: 'Administração',
            age: 20,
            budget: 800, // Same budget
            role: 'student',
            city_origin: 'Teresina',
            looking_for: 'roommate', // Same objective
            preferences: {
                smoker: false,
                pets: false,
                party: false,
                sleep_early: true,
                clean: true
            },
            bio: 'Estudante organizada procurando roommate igual.'
        },
        {
            full_name: 'João Incompatível (0% Match)',
            university: 'UESPI',
            course: 'Direito',
            age: 28, // Age diff > 5
            budget: 2000, // Budget diff > 20%
            role: 'student',
            city_origin: 'Parnaíba',
            looking_for: 'housing', // Different objective
            preferences: {
                smoker: true, // Conflict if you hate smoke
                pets: true,
                party: true,
                sleep_early: false,
                clean: false
            },
            bio: 'Gosto de festas e tenho 3 gatos.'
        },
        {
            full_name: 'Clara Média (50% Match)',
            university: 'Estácio', // Different uni (-8)
            course: 'Psicologia',
            age: 19, // Good age (+4)
            budget: 850, // Good budget (+8)
            role: 'student',
            city_origin: 'Timon', // Different city (-2)
            looking_for: 'roommate', // Good obj (+10)
            preferences: {
                // Mixed prefs
                smoker: false,
                pets: true,
                party: true
            },
            bio: 'Sou tranquila mas gosto de sair às vezes.'
        }
    ]

    console.log('\n👇 COPY AND RUN THIS SQL IN SUPABASE EDITOR TO CREATE TEST PROFILES:\n')

    // Generating SQL for profiles (using gen_random_uuid() for IDs if not linked to auth)
    // Note: If you have strict FK constraint, you need real auth users.
    // Assuming for testing you might want to temporarily disable trigger or constraints, 
    // OR best approach: create a SQL function to seed.

    const sql = `
    -- Create test users
    INSERT INTO auth.users (id, email) VALUES 
    (gen_random_uuid(), 'ana@test.com'),
    (gen_random_uuid(), 'joao@test.com'),
    (gen_random_uuid(), 'clara@test.com');

    -- Insert their profiles (using the same IDs generated above needs variables, so we simplify)
    -- BETTER APPROACH: Pure SQL Block
    
    DO $$
    DECLARE
        u_ana uuid := gen_random_uuid();
        u_joao uuid := gen_random_uuid();
        u_clara uuid := gen_random_uuid();
    BEGIN
        -- Insert into auth.users (Mocking auth needed for FK)
        -- Note: INSERTing into auth.users generally requires service_role key or direct SQL access
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
        VALUES 
        (u_ana, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ana@test.com', 'encrypted_password', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''),
        (u_joao, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'joao@test.com', 'encrypted_password', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''),
        (u_clara, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'clara@test.com', 'encrypted_password', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');

        -- Insert profiles
        INSERT INTO public.profiles (id, full_name, university, course, age, budget, role, city_origin, looking_for, preferences, bio)
        VALUES 
        (u_ana, 'Ana Perfeita', 'UFPI', 'Administração', 20, 800, 'student', 'Teresina', 'roommate', '{"smoker":false,"pets":false,"clean":true,"party":false,"sleep_early":true}', '100% Match test user'),
        (u_joao, 'João Incompatível', 'UESPI', 'Direito', 28, 2000, 'student', 'Parnaíba', 'housing', '{"smoker":true,"pets":true,"clean":false,"party":true,"sleep_early":false}', '0% Match test user'),
        (u_clara, 'Clara Média', 'Estácio', 'Psicologia', 19, 850, 'student', 'Timon', 'roommate', '{"smoker":false,"pets":true,"clean":true,"party":true,"sleep_early":false}', '50% Match test user');
        
    END $$;
    `

    console.log(sql)
}

seedUsers()
