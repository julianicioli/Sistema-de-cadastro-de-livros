import { supabase } from '../lib/supabase';

const TABELA = 'obras';

function check({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

export async function listarObras() {
  return check(await supabase.from(TABELA).select('*').order('atualizado_em', { ascending: false }));
}

export async function buscarObra(id) {
  return check(await supabase.from(TABELA).select('*').eq('id', id).single());
}

export async function criarObra(obra) {
  return check(await supabase.from(TABELA).insert(obra).select().single());
}

export async function atualizarObra(id, campos) {
  return check(await supabase.from(TABELA).update(campos).eq('id', id).select().single());
}

export async function excluirObra(id) {
  return check(await supabase.from(TABELA).delete().eq('id', id));
}
