import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars = Object.fromEntries(
    envContent.split('\n')
        .filter(line => line.includes('='))
        .map(line => line.split('=').map(part => part.trim()))
)

const SUPABASE_URL = envVars['NEXT_PUBLIC_SUPABASE_URL']
const SUPABASE_KEY = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY']

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function check() {
    console.log('--- DIAGNOSTIC SCRIPT ---')
    const partnerId = '4c565f40-e87f-45c4-aba8-c9aa90c17ab6'
    console.log(`Checking profile for ID: ${partnerId}`)

    // 1. Check with ANON key (Simulation frontend)
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', partnerId)
        .maybeSingle()

    console.log('ANON Key Result:')
    if (error) console.error('Error:', error)
    if (data) console.log('Found:', data)
    else console.warn('NOT FOUND with Anon Key')

    // 2. Check Connection (to be sure)
    const connId = 'fde67ba4-aca4-4bd5-b627-8560c81e85a1'
    const { data: conn, error: connError } = await supabase
        .from('connections')
        .select('*')
        .eq('id', connId)
        .maybeSingle()

    console.log('Connection Result:')
    if (connError) console.error('Conn Error:', connError)
    if (conn) console.log('Conn Found:', conn)

}

check()
