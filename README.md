# Consulta CNPJ - Frontend React

Aplicação web moderna, rápida e responsiva construída em **React 19**, **TypeScript** e **Tailwind CSS** para consulta de dados cadastrais de pessoas jurídicas brasileiras através da API pública oficial do [CNPJ.ws](https://publica.cnpj.ws).

---

## 📌 Sumário

- [Visão Geral](#-visão-geral)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Consumo da API Pública](#-consumo-da-api-pública)
- [Como Executar o Projeto](#-como-executar-o-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Tratamento de Limites e Erros](#-tratamento-de-limites-e-erros)

---

## 🚀 Visão Geral

O objetivo deste projeto é oferecer uma experiência fluida, limpa e profissional para consulta e auditoria de cadastros corporativos de CNPJ. Além de exibir um **resumo cadastral padronizado**, a aplicação conta com um **renderizador dinâmico recursivo** capaz de mapear e exibir 100% das propriedades contidas no retorno da API pública — incluindo arrays de sócios (QSA), histórico do Simples Nacional/MEI, CNAEs secundários e detalhes regionais de inscrições estaduais.

---

## ✨ Funcionalidades Principais

### 1. Campo de Busca com Máscara e Validação
- **Máscara Automática**: Aplicação automática do padrão `00.000.000/0000-00` conforme digitação ou colagem de dados.
- **Validação Algorítmica (Módulo 11)**: Checagem matemática em tempo real dos dígitos verificadores antes de disparar requisições.
- **Atalhos Rápidos**: Presets pré-configurados de empresas conhecidas (Banco do Brasil, Petrobras, Magazine Luiza, Nubank, Mercado Livre).
- **Histórico de Consultas**: Armazena as últimas empresas consultadas localmente no navegador via `localStorage`.

### 2. Resumo Cadastral Corporativo
- **Identificação da Empresa**: Razão social, nome fantasia, tipo de estabelecimento (Matriz/Filial) e porte empresarial.
- **Situação Cadastral**: Badge colorido indicando o status (Ativa, Baixada, Suspensa, Inapta, Nula) e data da situação.
- **Localização Completa**: Endereço estruturado (logradouro, número, complemento, bairro, cidade, UF e CEP formatado), com botão de cópia de endereço com 1 clique.
- **Canais de Contato**: E-mail com link `mailto:` direto e telefones formatados com discagem rápida `tel:`.
- **Atividade Econômica (CNAE)**: CNAE Fiscal Principal detalhado com código de subclasse e botão expansível com a listagem de todas as atividades secundárias.
- **Inscrições Estaduais**: Tabela visual com inscrições por estado e identificador de status de habilitação (Ativa/Inativa).
- **Capital Social & Enquadramento**: Valor monetário formatado em Real (`R$`) e indicador de opção pelo Simples Nacional ou MEI.

### 3. Explorador Dinâmico Recursivo de Campos
- **Renderização Total**: Não perde nenhuma informação: percorre e renderiza objetos profundamente aninhados, listas de primitivos e listas de objetos complexos (ex.: Quadro de Sócios e Administradores - QSA).
- **Filtro de Busca em Tempo Real**: Campo para pesquisar por qualquer nome de campo ou valor dentro da resposta retornada.
- **Controles de Expansão**: Botões para expandir ou recolher todos os blocos estruturais simultaneamente.

### 4. Formatação Automática Inteligente
- **CNPJ e CPF**: Formatação com pontuação regulamentar e suporte a dados mascarados de sócios.
- **CEP**: Formatação automática no formato `00000-000`.
- **Datas**: Conversão automática de timestamps ISO (`2026-08-08T03:00:00.000Z`) e padrões `YYYY-MM-DD` para o formato brasileiro `DD/MM/YYYY`.
- **Booleanos**: Exibição clara em badges de *Sim* ou *Não*.
- **Moeda e Capital Social**: Formatação monetária padronizada em Real brasileiro (`Intl.NumberFormat('pt-BR')`).

### 5. Contador de Campos e Métricas
- **Contador Recursivo**: Cálculo preciso do total de propriedades efetivamente preenchidas contra o total de folhas inspecionadas no payload da resposta.

### 6. Modal de JSON Bruto
- **Syntax Highlighting**: Realce de sintaxe colorido nativo para chaves, strings, números, booleanos e valores nulos.
- **Filtro Interno no JSON**: Busca textual rápida de termos específicos no código fonte do JSON.
- **Copiar e Exportar**: Botão de cópia rápida para o clipboard e botão para download do arquivo `.json` gerado (`cnpj_{numero}.json`).

### 7. Ícones Nativos em SVG
- Implementação limpa sem dependência de pacotes externos pesados, garantindo carregamento ultrarrápido e zero bundle bloat.

---

## 🛠 Tecnologias Utilizadas

- **[React 19](https://react.dev/)**: Biblioteca componentizada para interface de usuário reativa.
- **[TypeScript](https://www.typescriptlang.org/)**: Tipagem estática segura para o modelo de dados de estabelecimentos e respostas da API.
- **[Vite 6](https://vitejs.dev/)**: Ferramenta de build e servidor de desenvolvimento de alta performance.
- **[Tailwind CSS v4](https://tailwindcss.com/)**: Framework de estilização utilitária para design responsivo e acessível.

---

## 📁 Estrutura do Projeto

```text
├── index.html                     # Entrypoint HTML com metatags e fontes
├── package.json                   # Dependências e scripts do projeto
├── tsconfig.json                  # Configuração do compilador TypeScript
├── vite.config.ts                 # Configuração do Vite e Tailwind
├── src/
│   ├── main.tsx                   # Inicialização do React DOM
│   ├── App.tsx                    # Componente principal, estado da busca e layout
│   ├── index.css                  # Folha de estilo global com import do Tailwind
│   ├── types/
│   │   └── cnpj.ts                # Interfaces TypeScript da API CNPJ.ws
│   ├── utils/
│   │   └── formatters.ts          # Validadores (Módulo 11), máscaras e formatadores
│   ├── components/
│   │   ├── icons.tsx              # Conjunto de ícones SVG nativos
│   │   ├── CnpjSummaryCard.tsx    # Card principal com resumo cadastral corporativo
│   │   ├── DynamicJsonViewer.tsx  # Renderizador dinâmico e recursivo de nós JSON
│   │   └── RawJsonModal.tsx       # Modal com JSON bruto, busca, cópia e download
│   └── data/
│       └── mockData.ts            # Presets corporativos e dados padrão pré-carregados
```

---

## 🌐 Consumo da API Pública

A aplicação consome diretamente a rota pública:

```http
GET https://publica.cnpj.ws/cnpj/{cnpj}
```

- **Parâmetro**: `{cnpj}` contendo apenas os 14 dígitos numéricos (sem pontuação).
- **Sem necessidade de chave**: A rota pública é aberta para consultas cadastrais da Receita Federal.
- **CORS**: A API pública suporta requisições feitas a partir do navegador.

---

## 💻 Como Executar o Projeto

### Pré-requisitos
- **Node.js** (versão 18 ou superior recomendada)
- **npm** ou gerenciador de pacotes equivalente

### Instalação

1. Clone ou baixe este repositório:
```bash
git clone <URL_DO_REPOSITORIO>
cd <PASTA_DO_REPOSITORIO>
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse a aplicação no seu navegador:
```text
http://localhost:3000
```

---

## 📜 Scripts Disponíveis

- `npm run dev`: Inicia o ambiente de desenvolvimento local.
- `npm run build`: Compila o código TypeScript e gera os assets otimizados para produção na pasta `dist/`.
- `npm run lint`: Executa a verificação estática de tipos do TypeScript sem emitir arquivos (`tsc --noEmit`).

---

## 🛡 Tratamento de Limites e Erros

A API pública gratuita do `cnpj.ws` possui um limite de **3 consultas por minuto por endereço IP**. A aplicação lida com essa e outras condições de forma amigável:

| Código / Cenário | Tratamento Visual |
|---|---|
| **429 (Muitas requisições)** | Alerta explicativo em destaque com cronômetro regressivo de liberação (~60s) e botão para testar com dados de demonstração sem gastar cota. |
| **404 (Não Encontrado)** | Alerta claro informando que o CNPJ não consta na base pública da Receita Federal. |
| **CNPJ com DV Inválido** | Alerta preventivo notificando que os dígitos verificadores informados falharam na checagem algorítmica. |
| **Falha de Conexão** | Captura de exceções de rede com detalhes técnicos e botão para nova tentativa. |
| **Cache Local** | Consultas já realizadas são gravadas no navegador, permitindo reabertura instantânea sem nova requisição à API. |

---

## 📄 Licença

Este projeto é disponibilizado para fins de consulta, estudo e uso profissional sob a licença [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0).
