-- ================================================
-- TEST DATA SEED (FIXED)
-- Run this in Supabase SQL Editor
-- Creates 3 users with varied compatibility scenarios
-- Uses ON CONFLICT to avoid duplicate key errors if profiles are auto-created
-- ================================================

DO $$
DECLARE
    u_ana uuid := gen_random_uuid();
    u_joao uuid := gen_random_uuid();
    u_clara uuid := gen_random_uuid();
BEGIN
    -- 1. Create Mock Auth Users (Simulated)
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES 
    (u_ana, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ana@test.com', '$2a$10$wT0C7/Hj7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''),
    (u_joao, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'joao@test.com', '$2a$10$wT0C7/Hj7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''),
    (u_clara, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'clara@test.com', '$2a$10$wT0C7/Hj7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');

    -- 2. Upsert Profiles (Update if exists, Insert if not)
    
    -- Ana Perfeita (100% Match)
    INSERT INTO public.profiles (id, full_name, university, course, age, budget, role, city_origin, looking_for, preferences, bio)
    VALUES (u_ana, 'Ana Perfeita', 'UFPI', 'Administração', 20, 800, 'student', 'Teresina', 'roommate', '{"smoker":false,"pets":false,"clean":true,"party":false,"sleep_early":true}', '100% Match test user - Sou organizada e busco roommate tranquilo.')
    ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name, university = EXCLUDED.university, course = EXCLUDED.course, age = EXCLUDED.age, budget = EXCLUDED.budget, role = EXCLUDED.role, city_origin = EXCLUDED.city_origin, looking_for = EXCLUDED.looking_for, preferences = EXCLUDED.preferences, bio = EXCLUDED.bio;

    -- João Incompatível (0% Match)
    INSERT INTO public.profiles (id, full_name, university, course, age, budget, role, city_origin, looking_for, preferences, bio)
    VALUES (u_joao, 'João Incompatível', 'UESPI', 'Direito', 28, 2000, 'student', 'Parnaíba', 'housing', '{"smoker":true,"pets":true,"clean":false,"party":true,"sleep_early":false}', '0% Match test user - Gosto de festas e tenho 3 gatos.')
    ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name, university = EXCLUDED.university, course = EXCLUDED.course, age = EXCLUDED.age, budget = EXCLUDED.budget, role = EXCLUDED.role, city_origin = EXCLUDED.city_origin, looking_for = EXCLUDED.looking_for, preferences = EXCLUDED.preferences, bio = EXCLUDED.bio;

    -- Clara Média (50% Match)
    INSERT INTO public.profiles (id, full_name, university, course, age, budget, role, city_origin, looking_for, preferences, bio)
    VALUES (u_clara, 'Clara Média', 'Estácio', 'Psicologia', 19, 850, 'student', 'Timon', 'roommate', '{"smoker":false,"pets":true,"clean":true,"party":true,"sleep_early":false}', '50% Match test user - Sou tranquila mas gosto de sair às vezes.')
    ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name, university = EXCLUDED.university, course = EXCLUDED.course, age = EXCLUDED.age, budget = EXCLUDED.budget, role = EXCLUDED.role, city_origin = EXCLUDED.city_origin, looking_for = EXCLUDED.looking_for, preferences = EXCLUDED.preferences, bio = EXCLUDED.bio;

END $$;
