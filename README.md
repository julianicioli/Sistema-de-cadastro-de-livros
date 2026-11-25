# Minhas Leituras — gerenciador de livros e mangás

App mobile em **React Native (Expo)** integrado ao **Supabase** (PostgreSQL). Permite cadastrar obras
(livros ou mangás) com quantidade de volumes/capítulos e total de páginas, marcar o progresso de leitura
e calcular automaticamente o percentual concluído.

## Funcionalidades
- Cadastrar, editar e excluir obras (título, autor, tipo, volumes, capítulos, páginas)
- Marcar progresso: páginas lidas, capítulo atual e volume atual (botões +/− ou digitando)
- Percentual concluído calculado automaticamente:
  - no app, em tempo real (`src/utils/progresso.js`)
  - no banco, como coluna gerada `percentual` (`supabase/schema.sql`)
- Botão "Marcar como concluído"
- Lista com filtro (Todos / Livros / Mangás), status (Não iniciado / Lendo / Concluído) e média geral

## Como rodar
1. Crie um projeto em https://supabase.com.
2. No Supabase, abra **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e clique em **Run**.
3. Copie `.env.example` para `.env` e preencha a URL do projeto e a chave publishable/anon
   (Project Settings → Data API e API Keys, ou o botão **Connect**).
   A URL deve terminar em `.supabase.co`. Se vier com `/rest/v1/`, o app remove automaticamente.
4. Instale e inicie:
   ```bash
   npm install
   npx expo install --fix   # alinha as versões das libs nativas com o SDK do Expo
   npx expo start
   ```
5. Abra no celular com o app **Expo Go** (lendo o QR code) ou em um emulador Android (`a`).

## Estrutura
```
App.js                         navegação (stack)
src/lib/supabase.js            cliente Supabase
src/services/obras.js          CRUD da tabela "obras"
src/utils/progresso.js         cálculo do percentual e status
src/components/BarraProgresso.js
src/screens/ListaObrasScreen.js   lista + resumo + filtros
src/screens/DetalheObraScreen.js  marcar progresso / concluir / excluir
src/screens/FormObraScreen.js     cadastro e edição
supabase/schema.sql            tabela, coluna gerada, trigger e RLS
```

## Regra do percentual
`percentual = min(100, paginas_lidas / total_paginas × 100)`, arredondado a 1 casa decimal.
Para obras com capítulos, a tela de detalhe também mostra o percentual por capítulos.
