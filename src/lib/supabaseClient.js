import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function makeNoopClient() {
	const noop = async () => ({ data: null, error: new Error('Supabase not configured') });
	return {
		auth: {
			getUser: async () => ({ data: { user: null } }),
			onAuthStateChange: () => ({ data: null, subscription: { unsubscribe: () => {} } }),
			signInWithPassword: noop,
			signUp: noop,
			signOut: noop,
			resetPasswordForEmail: noop
		},
		from: () => ({ select: async () => ({ data: [], error: null }) })
	};
}

let supabase;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
	console.warn('VITE_SUPABASE_* env vars not set — using noop Supabase client')
	supabase = makeNoopClient();
} else {
	supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export default supabase;
