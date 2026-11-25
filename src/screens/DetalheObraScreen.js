import { useCallback, useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { avisar, confirmar } from '../utils/alerta';
import { useFocusEffect } from '@react-navigation/native';
import { buscarObra, atualizarObra, excluirObra } from '../services/obras';
import BarraProgresso from '../components/BarraProgresso';
import Fundo from '../components/Fundo';
import { calcularPercentual, percentualCapitulos, statusLeitura, limitar } from '../utils/progresso';
import { cores } from '../theme';

export default function DetalheObraScreen({ navigation, route }) {
  const { id } = route.params;
  const [obra, setObra] = useState(null);
  const [prog, setProg] = useState({ paginas_lidas: 0, capitulo_atual: 0, volume_atual: 0 });
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const o = await buscarObra(id);
      setObra(o);
      setProg({ paginas_lidas: o.paginas_lidas, capitulo_atual: o.capitulo_atual, volume_atual: o.volume_atual });
      navigation.setOptions({ title: o.titulo });
    } catch (e) {
      avisar('Erro', e.message);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  if (!obra) {
    return <View style={styles.centro}><ActivityIndicator size="large" color={cores.primaria} /></View>;
  }

  const percentual = calcularPercentual(prog.paginas_lidas, obra.total_paginas);
  const alterado =
    prog.paginas_lidas !== obra.paginas_lidas ||
    prog.capitulo_atual !== obra.capitulo_atual ||
    prog.volume_atual !== obra.volume_atual;

  const maximos = { paginas_lidas: obra.total_paginas, capitulo_atual: obra.total_capitulos, volume_atual: obra.total_volumes };
  const ajustar = (campo, delta) =>
    setProg((p) => ({ ...p, [campo]: limitar(p[campo] + delta, maximos[campo]) }));
  const digitar = (campo) => (txt) => setProg((p) => ({ ...p, [campo]: limitar(txt, maximos[campo]) }));

  async function salvar(novo = prog) {
    setSalvando(true);
    try {
      const o = await atualizarObra(id, novo);
      setObra(o);
      setProg({ paginas_lidas: o.paginas_lidas, capitulo_atual: o.capitulo_atual, volume_atual: o.volume_atual });
    } catch (e) {
      avisar('Erro ao salvar', e.message);
    } finally {
      setSalvando(false);
    }
  }

  function marcarConcluido() {
    salvar({ paginas_lidas: obra.total_paginas, capitulo_atual: obra.total_capitulos, volume_atual: obra.total_volumes });
  }

  function confirmarExclusao() {
    confirmar('Excluir obra', `Deseja excluir "${obra.titulo}"?`, 'Excluir', async () => {
      try {
        await excluirObra(id);
        navigation.goBack();
      } catch (e) {
        avisar('Erro', e.message);
      }
    });
  }

  return (
    <Fundo>
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cartao}>
        <Text style={styles.tipo}>{obra.tipo === 'manga' ? 'MANGÁ' : 'LIVRO'}</Text>
        <Text style={styles.titulo}>{obra.titulo}</Text>
        {!!obra.autor && <Text style={styles.autor}>{obra.autor}</Text>}

        <Text style={[styles.percentual, percentual >= 100 && { color: cores.estrela }]}>
          {percentual >= 100 ? '★ ' : ''}{percentual.toFixed(1)}%
        </Text>
        <Text style={styles.status}>{statusLeitura(percentual)}</Text>
        <BarraProgresso percentual={percentual} altura={14} mostrarTexto={false} />
        <Text style={styles.sub}>
          {prog.paginas_lidas} de {obra.total_paginas} páginas · faltam {obra.total_paginas - prog.paginas_lidas}
        </Text>
      </View>

      <View style={styles.cartao}>
        <Text style={styles.secao}>Marcar progresso</Text>
        <Contador
          label="Páginas lidas"
          valor={prog.paginas_lidas}
          max={obra.total_paginas}
          onMenos={() => ajustar('paginas_lidas', -10)}
          onMais={() => ajustar('paginas_lidas', 10)}
          passo={10}
          onDigitar={digitar('paginas_lidas')}
        />
        {obra.total_capitulos > 0 && (
          <Contador
            label="Capítulo atual"
            valor={prog.capitulo_atual}
            max={obra.total_capitulos}
            onMenos={() => ajustar('capitulo_atual', -1)}
            onMais={() => ajustar('capitulo_atual', 1)}
            onDigitar={digitar('capitulo_atual')}
            extra={`${percentualCapitulos(prog.capitulo_atual, obra.total_capitulos).toFixed(1)}% dos capítulos`}
          />
        )}
        {obra.total_volumes > 0 && (
          <Contador
            label="Volume atual"
            valor={prog.volume_atual}
            max={obra.total_volumes}
            onMenos={() => ajustar('volume_atual', -1)}
            onMais={() => ajustar('volume_atual', 1)}
            onDigitar={digitar('volume_atual')}
          />
        )}

        <TouchableOpacity
          style={[styles.botao, !alterado && styles.botaoDesativado]}
          disabled={!alterado || salvando}
          onPress={() => salvar()}
        >
          {salvando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoTexto}>Salvar progresso</Text>}
        </TouchableOpacity>
        {percentual < 100 && (
          <TouchableOpacity style={[styles.botao, { backgroundColor: cores.estrela }]} onPress={marcarConcluido}>
            <Text style={[styles.botaoTexto, { color: cores.fundo }]}>★ Marcar como concluído</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.acoes}>
        <TouchableOpacity style={styles.acao} onPress={() => navigation.navigate('Form', { id })}>
          <Text style={{ color: cores.destaque, fontWeight: '600' }}>Editar dados</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acao} onPress={confirmarExclusao}>
          <Text style={{ color: cores.perigo, fontWeight: '600' }}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </Fundo>
  );
}

function Contador({ label, valor, max, onMenos, onMais, onDigitar, passo = 1, extra }) {
  return (
    <View style={styles.contador}>
      <Text style={styles.label}>{label} <Text style={styles.max}>(de {max})</Text></Text>
      <View style={styles.contadorLinha}>
        <TouchableOpacity style={styles.passo} onPress={onMenos}><Text style={styles.passoTexto}>−{passo > 1 ? passo : ''}</Text></TouchableOpacity>
        <TextInput style={styles.input} keyboardType="number-pad" value={String(valor)} onChangeText={onDigitar} />
        <TouchableOpacity style={styles.passo} onPress={onMais}><Text style={styles.passoTexto}>+{passo > 1 ? passo : ''}</Text></TouchableOpacity>
      </View>
      {!!extra && <Text style={styles.max}>{extra}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: cores.fundo },
  cartao: { backgroundColor: cores.cartao, borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: cores.borda },
  tipo: { fontSize: 11, fontWeight: '700', color: cores.textoSecundario, letterSpacing: 1 },
  titulo: { fontSize: 22, fontWeight: '800', color: cores.texto, marginTop: 2 },
  autor: { color: cores.textoSecundario, marginBottom: 8 },
  percentual: { fontSize: 44, fontWeight: '800', color: cores.destaque, textAlign: 'center', marginTop: 8 },
  status: { textAlign: 'center', color: cores.textoSecundario, marginBottom: 10 },
  sub: { textAlign: 'center', color: cores.textoSecundario, marginTop: 8, fontSize: 13 },
  secao: { fontSize: 16, fontWeight: '700', color: cores.texto, marginBottom: 10 },
  contador: { marginBottom: 14 },
  label: { fontWeight: '600', color: cores.texto, marginBottom: 6 },
  max: { color: cores.textoSecundario, fontWeight: '400', fontSize: 12 },
  contadorLinha: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  passo: { width: 52, height: 44, borderRadius: 10, backgroundColor: cores.trilho, alignItems: 'center', justifyContent: 'center' },
  passoTexto: { fontSize: 16, fontWeight: '700', color: cores.destaque },
  input: { flex: 1, height: 44, borderWidth: 1, borderColor: cores.borda, borderRadius: 10, textAlign: 'center', fontSize: 18, color: cores.texto },
  botao: { backgroundColor: cores.primaria, borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 8 },
  botaoDesativado: { opacity: 0.4 },
  botaoTexto: { color: '#fff', fontWeight: '700' },
  acoes: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 },
  acao: { padding: 12 },
});
