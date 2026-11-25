import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Aceita a URL copiada com "/rest/v1/" ou "/" no final (o cliente já adiciona o caminho da API)
const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !anonKey) {
  console.warn('Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY no arquivo .env');
}

export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true },
});
