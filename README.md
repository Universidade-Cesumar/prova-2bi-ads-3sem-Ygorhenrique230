# 🏥 Almoxarifado · Controle de Estoque — Enfermagem

Sistema web de controle de estoque de materiais hospitalares, desenvolvido para a disciplina de ADS (3º semestre).

---

## 📋 Sobre o Projeto

Aplicação front-end que permite o gerenciamento completo do estoque de materiais de enfermagem, com integração a uma API REST (MockAPI). O sistema oferece cadastro, retirada e exclusão de materiais, além de indicadores visuais de status do estoque.

---

## ✨ Funcionalidades

- **Cadastrar material** — nome, quantidade e categoria (POST)
- **Listar materiais** — tabela com barra de quantidade e status visual (GET)
- **Baixa de estoque** — retirada com validação (PUT)
- **Excluir material** — remoção permanente do servidor (DELETE)
- **Busca em tempo real** — filtragem local por nome
- **Indicadores de status** — OK / Baixo / Zerado com cores distintas
- **Estatísticas** — total de itens, estoque baixo e itens zerados
- **Relógio** — data e hora em tempo real no cabeçalho

---

## 🛡️ Validação de Retirada

A função `validarRetirada(estoqueAtual, quantidadeRetirada)` garante que:

- A quantidade retirada é maior que zero
- A quantidade retirada não excede o estoque disponível

```js
validarRetirada(10, 5)  // → true
validarRetirada(5, 10)  // → false (excede o estoque)
validarRetirada(5, 0)   // → false (valor inválido)
validarRetirada(5, -1)  // → false (negativo)
```

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|------------|-----|
| HTML5 | Estrutura semântica |
| CSS3 | Estilização e responsividade |
| JavaScript (ES6+) | Lógica e integração com API |
| MockAPI | Simulação de back-end REST |
| Google Fonts | Tipografia (DM Sans + Inter) |

---

## 🚀 Como Rodar

1. Clone o repositório:
   ```bash
   git clone https://github.com/Universidade-Cesumar/prova-2bi-ads-3sem-Ygorhenrique230.git
   ```

2. Entre na pasta do projeto:
   ```bash
   cd prova-2bi-ads-3sem-Ygorhenrique230
   ```

3. Abra o arquivo `index.html` no navegador.
   > Recomendado: use a extensão **Live Server** no VS Code para evitar problemas de CORS.

4. Certifique-se de que a URL da MockAPI está correta em `script.js`:
   ```js
   const API_URL = 'https://6a29e629f59cb8f65f1dbc02.mockapi.io/api/V1/materiais';
   ```

---

## 📁 Estrutura de Arquivos

```
📦 projeto
 ┣ 📄 index.html   — Estrutura da interface
 ┣ 📄 style.css    — Estilos e responsividade
 ┣ 📄 script.js    — Lógica e integração com a API
 ┗ 📄 README.md    — Documentação do projeto
```

---

## 📌 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/materiais` | Lista todos os materiais |
| POST | `/materiais` | Cadastra novo material |
| PUT | `/materiais/:id` | Atualiza quantidade (baixa) |
| DELETE | `/materiais/:id` | Remove um material |

---

## 📝 Histórico de Commits (padrão semântico)

```
feat: adiciona estrutura inicial HTML e CSS
feat: integra GET com MockAPI e renderiza tabela
feat: adiciona formulário de cadastro (POST)
feat: implementa exclusão de material (DELETE)
feat: adiciona módulo de retirada com validação (PUT)
feat: cria função validarRetirada com proteção contra negativos
docs: adiciona README com instruções e documentação
```

---

## 👨‍💻 Autor

Desenvolvido por **Ygor Henrique** — ADS 3º Semestre · Universidade UniCesumar
