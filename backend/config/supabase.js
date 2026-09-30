/**
 * Supabase client configuration
 *
 * Supports both new Supabase API keys (sb_publishable_ / sb_secret_)
 * and legacy anon / service_role JWT keys.
 * Never expose the secret key to the frontend.
 */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabasePublishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    '[Supabase] SUPABASE_URL or SUPABASE_SECRET_KEY is missing. ' +
      'Set them in backend/.env.'
  );
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const isPlaceholder =
  !supabaseUrl ||
  !supabaseServiceKey ||
  supabaseUrl.includes('your-project-ref') ||
  supabaseServiceKey.includes('your_supabase') ||
  supabaseServiceKey === 'placeholder-key';

const testSupabaseConnection = async () => {
  if (isPlaceholder) {
    return {
      ok: false,
      message:
        'Supabase credentials not configured — update backend/.env',
    };
  }

  try {
    const { error } = await supabase.from('users').select('id').limit(1);

    if (
      error &&
      (error.code === 'PGRST205' ||
        error.code === '42P01' ||
        error.message?.toLowerCase().includes('does not exist') ||
        error.message?.toLowerCase().includes('could not find the table'))
    ) {
      return {
        ok: true,
        message:
          'Connected to Supabase (tables not created yet — run database/schema.sql)',
      };
    }

    if (error) {
      return {
        ok: false,
        message: error.message,
      };
    }

    return {
      ok: true,
      message: 'Connected to Supabase successfully',
    };
  } catch (err) {
    return {
      ok: false,
      message: err.message || 'Unable to reach Supabase',
    };
  }
};

module.exports = {
  supabase,
  supabaseUrl,
  supabasePublishableKey,
  testSupabaseConnection,
};
