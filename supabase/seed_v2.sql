-- ================================================
-- SEED V2 (CORRIGIDO FINAL): RESET & FIX DATA INTEGRITY
-- Handles existing Auth Users properly & Corrects Schema
-- ================================================

-- 1. CLEANUP (Wipe old test data references)
TRUNCATE TABLE public.messages CASCADE;
TRUNCATE TABLE public.connections CASCADE;

DO $$
DECLARE
    -- Variables for IDs
    id_ana UUID;
    id_joao UUID;
    id_clara UUID;
    current_user_id UUID;
BEGIN
    -- ---------------------------------------------------------
    -- 1. GET OR CREATE USER: ANA PERFEITA
    -- ---------------------------------------------------------
    SELECT id INTO id_ana FROM auth.users WHERE email = 'ana@test.com';
    
    IF id_ana IS NULL THEN
        id_ana := gen_random_uuid();
        INSERT INTO auth.users (id, email, raw_user_meta_data, created_at)
        VALUES (id_ana, 'ana@test.com', '{"full_name": "Ana Perfeita"}', NOW());
    END IF;

    -- ---------------------------------------------------------
    -- 2. GET OR CREATE USER: JOÃO BAGUNCEIRO
    -- ---------------------------------------------------------
    SELECT id INTO id_joao FROM auth.users WHERE email = 'joao@test.com';
    
    IF id_joao IS NULL THEN
        id_joao := gen_random_uuid();
        INSERT INTO auth.users (id, email, raw_user_meta_data, created_at)
        VALUES (id_joao, 'joao@test.com', '{"full_name": "João Bagunceiro"}', NOW());
    END IF;

    -- ---------------------------------------------------------
    -- 3. GET OR CREATE USER: CLARA NEUTRA
    -- ---------------------------------------------------------
    SELECT id INTO id_clara FROM auth.users WHERE email = 'clara@test.com';
    
    IF id_clara IS NULL THEN
        id_clara := gen_random_uuid();
        INSERT INTO auth.users (id, email, raw_user_meta_data, created_at)
        VALUES (id_clara, 'clara@test.com', '{"full_name": "Clara Neutra"}', NOW());
    END IF;

    -- ---------------------------------------------------------
    -- 4. UPDATE/INSERT PUBLIC PROFILES (Upsert)
    -- Remove non-existent columns (has_housing, compatibility_score)
    -- Map has_housing to looking_for ('housing' or 'roommate')
    -- ---------------------------------------------------------
    INSERT INTO public.profiles (
        id, full_name, role, university, course, bio, city_origin, budget, 
        looking_for, photos, preferences
    ) VALUES 
    (
        id_ana, 'Ana Perfeita', 'student', 'USP', 'Medicina', 
        'Estudiosa, durmo cedo e adoro gatos. Procuro lugar calmo.', 
        'São Paulo', 2500, 'housing', -- was has_housing=false
        ARRAY['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'], 
        '{"smoker": false, "pets": true, "party": false, "sleep_early": true, "clean": true}'
    ),
    (
        id_joao, 'João Bagunceiro', 'student', 'Mackenzie', 'Design', 
        'Gosto de festas e trazer amigos. Fumo ocasionalmente.', 
        'Rio de Janeiro', 1800, 'housing', -- was has_housing=false
        ARRAY['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'], 
        '{"smoker": true, "pets": false, "party": true, "sleep_early": false, "clean": false}'
    ),
    (
        id_clara, 'Clara Neutra', 'student', 'PUC', 'Direito', 
        'Sou tranquila, fico na minha.', 
        'Curitiba', 2000, 'roommate', -- was has_housing=true
        ARRAY['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'], 
        '{"smoker": false, "pets": false, "party": false, "sleep_early": true, "clean": true}'
    )
    ON CONFLICT (id) DO UPDATE SET 
        full_name = EXCLUDED.full_name,
        photos = EXCLUDED.photos,
        preferences = EXCLUDED.preferences,
        bio = EXCLUDED.bio,
        looking_for = EXCLUDED.looking_for;

    -- ---------------------------------------------------------
    -- 5. CREATE CONNECTIONS
    -- ---------------------------------------------------------
    -- Get logged user (ignoring our test users)
    SELECT id INTO current_user_id FROM auth.users 
    WHERE email NOT IN ('ana@test.com', 'joao@test.com', 'clara@test.com')
    ORDER BY created_at DESC -- Pick most recent real user
    LIMIT 1;

    IF current_user_id IS NOT NULL THEN
        -- Clear existing connections for current user
        DELETE FROM public.connections WHERE requester_id = current_user_id OR receiver_id = current_user_id;

        -- Ana: Accepted
        INSERT INTO public.connections (requester_id, receiver_id, status)
        VALUES (current_user_id, id_ana, 'accepted');

        -- João: Pending
        INSERT INTO public.connections (requester_id, receiver_id, status)
        VALUES (id_joao, current_user_id, 'pending');
        
        -- Clara: Pending
        INSERT INTO public.connections (requester_id, receiver_id, status)
        VALUES (current_user_id, id_clara, 'pending');
        
        -- Message
        INSERT INTO public.messages (connection_id, sender_id, content, created_at)
        VALUES (
            (SELECT id FROM public.connections WHERE requester_id = current_user_id AND receiver_id = id_ana),
            id_ana,
            'Olá! Vi que temos alta compatibilidade. Vamos dividir apê?',
            NOW()
        );
    END IF;

END $$;
