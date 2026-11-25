import { View, Text, StyleSheet } from 'react-native';
import { cores } from '../theme';

export default function BarraProgresso({ percentual, altura = 10, mostrarTexto = true }) {
  const p = Math.max(0, Math.min(100, Number(percentual) || 0));
  const concluido = p >= 100;
  return (
    <View>
      <View style={[styles.trilho, { height: altura, borderRadius: altura / 2 }]}>
        <View
          style={{
            width: `${p}%`,
            height: '100%',
            backgroundColor: concluido ? cores.estrela : cores.primaria,
            borderRadius: altura / 2,
          }}
        />
      </View>
      {mostrarTexto && (
        <Text style={[styles.texto, concluido && { color: cores.estrela }]}>
          {concluido ? '★ ' : '✦ '}
          {p.toFixed(1)}% concluído
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  trilho: { backgroundColor: cores.trilho, overflow: 'hidden' },
  texto: { marginTop: 4, fontSize: 12, color: cores.textoSecundario },
});
