import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { cores } from '../theme';

const SIMBOLOS = ['✦', '✧', '⋆', '★', '·'];

function gerarEstrelas(qtd) {
  let seed = 7;
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  return Array.from({ length: qtd }, (_, i) => ({
    id: i,
    simbolo: SIMBOLOS[Math.floor(rand() * SIMBOLOS.length)],
    top: `${rand() * 100}%`,
    left: `${rand() * 100}%`,
    tamanho: 8 + rand() * 14,
    dourada: rand() < 0.25,
    duracao: 1500 + rand() * 2500,
    atraso: rand() * 2000,
  }));
}

const ESTRELAS = gerarEstrelas(36);

function Estrela({ e }) {
  const brilho = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(e.atraso),
        Animated.timing(brilho, { toValue: 0.9, duration: e.duracao, useNativeDriver: true }),
        Animated.timing(brilho, { toValue: 0.25, duration: e.duracao, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        top: e.top,
        left: e.left,
        fontSize: e.tamanho,
        color: e.dourada ? cores.estrela : cores.destaque,
        opacity: brilho,
      }}
    >
      {e.simbolo}
    </Animated.Text>
  );
}

// Envolve a tela com o céu roxo estrelado
export default function Fundo({ children }) {
  return (
    <View style={styles.fundo}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {ESTRELAS.map((e) => <Estrela key={e.id} e={e} />)}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: cores.fundo, overflow: 'hidden' },
});
