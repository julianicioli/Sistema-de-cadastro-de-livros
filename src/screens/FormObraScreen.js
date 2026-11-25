import { useEffect, useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { avisar } from '../utils/alerta';
import Fundo from '../components/Fundo';
import { buscarObra, criarObra, atualizarObra } from '../services/obras';
import { cores } from '../theme';

const vazio = { titulo: '', autor: '', tipo: 'livro', total_volumes: '', total_capitulos: '', total_paginas: '' };

export default function FormObraScreen({ navigation, route }) {
  const id = route.params?.id;
  const [form, setForm] = useState(vazio);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(!!id);

  useEffect(() => {
    navigation.setOptions({ title: id ? 'Editar obra' : 'Nova obra' });
    if (!id) return;
    buscarObra(id)
      .then((o) =>
        setForm({
          titulo: o.titulo,
          autor: o.autor ?? '',
          tipo: o.tipo,
          total_volumes: String(o.total_volumes),
          total_capitulos: String(o.total_capitulos),
          total_paginas: String(o.total_paginas),
          paginas_lidas: o.paginas_lidas,
        })
      )
      .catch((e) => avisar('Erro', e.message))
      .finally(() => setCarregando(false));
  }, [id]);

  const set = (campo) => (valor) => setForm((f) => ({ ...f, [campo]: valor }));
  const num = (v) => parseInt(v, 10) || 0;

  async function salvar() {
    const totalPaginas = num(form.total_paginas);
    if (!form.titulo.trim()) return avisar('Atenção', 'Informe o título.');
    if (totalPaginas <= 0) return avisar('Atenção', 'O total de páginas deve ser maior que zero.');
    if (id && form.paginas_lidas > totalPaginas) {
      return avisar('Atenção', `Você já leu ${form.paginas_lidas} páginas; o total não pode ser menor.`);
    }

    const dados = {
      titulo: form.titulo.trim(),
      autor: form.autor.trim() || null,
      tipo: form.tipo,
      total_volumes: num(form.total_volumes),
      total_capitulos: num(form.total_capitulos),
      total_paginas: totalPaginas,
    };

    setSalvando(true);
    try {
      if (id) await atualizarObra(id, dados);
      else await criarObra(dados);
      navigation.goBack();
    } catch (e) {
      avisar('Erro ao salvar', e.message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <View style={styles.centro}><ActivityIndicator size="large" color={cores.primaria} /></View>;
  }

  return (
    <Fundo>
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Tipo</Text>
      <View style={styles.tipos}>
        {[['livro', 'Livro'], ['manga', 'Mangá']].map(([valor, rotulo]) => (
          <TouchableOpacity
            key={valor}
            style={[styles.tipo, form.tipo === valor && styles.tipoAtivo]}
            onPress={() => set('tipo')(valor)}
          >
            <Text style={[styles.tipoTexto, form.tipo === valor && { color: '#fff' }]}>{rotulo}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Campo label="Título *" value={form.titulo} onChangeText={set('titulo')} placeholder="Ex.: One Piece" />
      <Campo label="Autor" value={form.autor} onChangeText={set('autor')} placeholder="Ex.: Eiichiro Oda" />
      <View style={styles.linha}>
        <Campo flex label="Volumes" value={form.total_volumes} onChangeText={set('total_volumes')} numerico />
        <Campo flex label="Capítulos" value={form.total_capitulos} onChangeText={set('total_capitulos')} numerico />
      </View>
      <Campo label="Total de páginas *" value={form.total_paginas} onChangeText={set('total_paginas')} numerico />

      <TouchableOpacity style={styles.botao} onPress={salvar} disabled={salvando}>
        {salvando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoTexto}>Salvar</Text>}
      </TouchableOpacity>
    </ScrollView>
    </Fundo>
  );
}

function Campo({ label, numerico, flex, ...props }) {
  return (
    <View style={[{ marginBottom: 14 }, flex && { flex: 1 }]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        keyboardType={numerico ? 'number-pad' : 'default'}
        placeholderTextColor={cores.textoSecundario}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: cores.fundo },
  label: { fontSize: 13, fontWeight: '600', color: cores.texto, marginBottom: 6 },
  input: { backgroundColor: cores.cartao, borderWidth: 1, borderColor: cores.borda, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: cores.texto },
  linha: { flexDirection: 'row', gap: 12 },
  tipos: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  tipo: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: cores.primaria, alignItems: 'center', backgroundColor: cores.cartao },
  tipoAtivo: { backgroundColor: cores.primaria },
  tipoTexto: { color: cores.destaque, fontWeight: '600' },
  botao: { backgroundColor: cores.primaria, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  botaoTexto: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
