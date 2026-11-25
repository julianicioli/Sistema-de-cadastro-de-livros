import { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listarObras } from '../services/obras';
import BarraProgresso from '../components/BarraProgresso';
import Fundo from '../components/Fundo';
import { statusLeitura } from '../utils/progresso';
import { cores } from '../theme';

const FILTROS = [
  { chave: 'todos', rotulo: 'Todos' },
  { chave: 'livro', rotulo: 'Livros' },
  { chave: 'manga', rotulo: 'Mangás' },
];

export default function ListaObrasScreen({ navigation }) {
  const [obras, setObras] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtro, setFiltro] = useState('todos');

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      setObras(await listarObras());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  const visiveis = useMemo(
    () => (filtro === 'todos' ? obras : obras.filter((o) => o.tipo === filtro)),
    [obras, filtro]
  );

  const mediaGeral = obras.length
    ? obras.reduce((s, o) => s + Number(o.percentual), 0) / obras.length
    : 0;
  const concluidas = obras.filter((o) => Number(o.percentual) >= 100).length;

  if (carregando) {
    return <View style={styles.centro}><ActivityIndicator size="large" color={cores.primaria} /></View>;
  }

  return (
    <Fundo>
      <View style={styles.resumo}>
        <Text style={styles.resumoTitulo}>
          {obras.length} obra(s) · {concluidas} concluída(s)
        </Text>
        <BarraProgresso percentual={mediaGeral} />
      </View>

      <View style={styles.filtros}>
        {FILTROS.map((f) => (
          <TouchableOpacity
            key={f.chave}
            style={[styles.chip, filtro === f.chave && styles.chipAtivo]}
            onPress={() => setFiltro(f.chave)}
          >
            <Text style={[styles.chipTexto, filtro === f.chave && styles.chipTextoAtivo]}>{f.rotulo}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {erro && <Text style={styles.erro}>Erro: {erro}</Text>}

      <FlatList
        data={visiveis}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={carregar} />}
        ListEmptyComponent={
          <Text style={styles.vazio}>✧ Nenhuma obra cadastrada ainda ✧{'\n'}Toque em “+” para adicionar.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.cartao} onPress={() => navigation.navigate('Detalhe', { id: item.id })}>
            <View style={styles.linha}>
              <Text style={styles.titulo} numberOfLines={1}>{item.titulo}</Text>
              <Text style={[styles.tag, { backgroundColor: item.tipo === 'manga' ? cores.manga : cores.livro }]}>
                {item.tipo === 'manga' ? 'Mangá' : 'Livro'}
              </Text>
            </View>
            {!!item.autor && <Text style={styles.autor}>{item.autor}</Text>}
            <Text style={styles.info}>
              Pág. {item.paginas_lidas}/{item.total_paginas}
              {item.total_capitulos > 0 ? ` · Cap. ${item.capitulo_atual}/${item.total_capitulos}` : ''}
              {item.total_volumes > 0 ? ` · Vol. ${item.volume_atual}/${item.total_volumes}` : ''}
              {`  ·  ${statusLeitura(Number(item.percentual))}`}
            </Text>
            <BarraProgresso percentual={item.percentual} altura={8} />
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Form')}>
        <Text style={styles.fabTexto}>+</Text>
      </TouchableOpacity>
    </Fundo>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: cores.fundo },
  resumo: { backgroundColor: cores.cabecalho, padding: 16, borderBottomWidth: 1, borderColor: cores.borda },
  resumoTitulo: { fontSize: 14, color: cores.texto, marginBottom: 8, fontWeight: '600' },
  filtros: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 12 },
  chip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: cores.borda, backgroundColor: cores.cartao },
  chipAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  chipTexto: { color: cores.texto },
  chipTextoAtivo: { color: '#fff', fontWeight: '600' },
  erro: { color: cores.perigo, paddingHorizontal: 16, paddingTop: 8 },
  vazio: { textAlign: 'center', color: cores.textoSecundario, marginTop: 40 },
  cartao: { backgroundColor: cores.cartao, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: cores.borda },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  titulo: { flex: 1, fontSize: 16, fontWeight: '700', color: cores.texto },
  tag: { color: '#fff', fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
  autor: { color: cores.textoSecundario, marginTop: 2 },
  info: { color: cores.textoSecundario, fontSize: 12, marginVertical: 8 },
  fab: { position: 'absolute', right: 20, bottom: 28, width: 58, height: 58, borderRadius: 29, backgroundColor: cores.primaria, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: cores.primaria, shadowOpacity: 0.6, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  fabTexto: { color: '#fff', fontSize: 30, lineHeight: 32 },
});
