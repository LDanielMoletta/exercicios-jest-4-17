# Exercícios Jest 4–17 — Do básico a mocks, snapshots e assincronismo

Projeto único com a continuação do módulo de Testes Automatizados (exercícios 4 a 17).
Além dos exercícios novos, o projeto preserva o endpoint de soma do exercício anterior
(`POST /api/soma`), no mesmo padrão em inglês.

Código, nomes de variáveis, mensagens de erro e descrições de teste estão em inglês.
Os contratos do enunciado foram preservados: `/saudacao/:nome` responde `{ "mensagem": "Olá, ..." }`,
`POST /soma` responde `{ "resultado": ... }` ou HTTP 400 com `{ "erro": "..." }`, e rotas
desconhecidas respondem HTTP 404 com `{ "error": "Route not found." }`.

## Stack

| Item | Versão |
| --- | --- |
| Node.js | 24.14.0 |
| npm | 11.18.0 |
| Express | 5.3.0 |
| Jest | 30.5.2 |
| Supertest | 7.3.1 |

## Estrutura

```
src/
├── app.js                    # Express app (sem listen): /ping, /saudacao/:nome, /soma, /api/soma, 404
├── server.js                 # apenas sobe o servidor (excluído da cobertura)
├── divide.js                 # exercício 4
├── formatter.js              # exercício 5
├── userService.js            # exercício 7 (recebe o repositório por injeção)
├── sum.js                    # exercício anterior (POST /api/soma)
├── calculation.js            # exercício 9 (add, subtract)
├── arrayFilter.js            # exercício 11 (filterEvens)
├── userFactory.js            # exercício 12 (createUser)
├── counter.js                # exercício 13 (increment, getValue, reset)
├── dataService.js            # exercícios 14 e 15 (fetchData, fetchDataWithError)
├── message.js                # exercício 16 (getWelcomeMessage)
├── emailService.js           # exercício 17 (createEmailSender)
└── __tests__/
    ├── divide.spec.js
    ├── formatter.spec.js
    ├── api.spec.js
    ├── userService.spec.js
    ├── sum.integration.spec.js
    ├── calculation.spec.js
    ├── apiRoutes.spec.js
    ├── arrayFilter.spec.js
    ├── userFactory.spec.js
    ├── counter.spec.js
    ├── dataService.spec.js
    ├── message.spec.js
    ├── emailService.spec.js
    └── __snapshots__/
        └── message.spec.js.snap
evidencias/
├── coverage-before.txt             # cobertura só com os exercícios 4–5
├── coverage-after.txt              # após os exercícios 6–7
├── coverage-final.txt              # após cobrir a lacuna dos exercícios 4–8
├── coverage-module-final.txt       # cobertura da suíte completa (4–17)
├── test-output.txt                 # npm test final
├── toBe-vs-toEqual-failure.txt     # falha proposital do exercício 11
├── toEqual-id-failure.txt          # falha proposital do exercício 12
├── counter-without-beforeEach.txt  # falha proposital do exercício 13
├── counter-reversed-order.txt      # ordem dos it invertida, ainda verde (exercício 13)
├── missing-await.txt               # armadilha do await esquecido (exercício 14)
├── missing-await-assertions.txt    # mesma armadilha com expect.assertions
├── snapshot-diff.txt               # diff do snapshot alterado (exercício 16)
├── snapshot-update.txt             # atualização com -u (exercício 16)
├── snapshot-restore.txt            # restauração do snapshot original (exercício 16)
├── randomize.txt                   # npx jest --randomize (exercício 13)
└── mutation-failure.txt            # função quebrada de propósito (fechamento)
jest.config.js
```

Convenção escolhida: **pasta `src/__tests__/` com arquivos `.spec.js`**. O projeto reúne
treze suítes de assuntos diferentes (funções puras, API, serviços com mock, assincronismo
e snapshot), então separar `src/` (produção) de `src/__tests__/` (testes) mantém a raiz
limpa e deixa claro o que é entregue. O Jest encontra os arquivos automaticamente, sem
configuração extra de `testMatch`.

## Como rodar

```bash
npm install
npm test                  # suíte completa
npm run test:coverage     # suíte + relatório + piso de cobertura
npx jest --randomize      # suíte em ordem aleatória
npm start                 # sobe o servidor na porta 3000 (opcional)
```

`npm test -- --coverage` é equivalente a `npm run test:coverage`.
O relatório visual fica em `coverage/lcov-report/index.html`.

---

# Parte 1 — Exercícios 4 a 8

## Exercício 4 — Testando erros (`divide`)

`src/divide.js` lança `Error('division by zero')` quando `b === 0`.

| # | Entrada | Esperado | Matcher |
| --- | --- | --- | --- |
| 1 | `divide(10, 2)` | `5` | `toBe` |
| 2 | `divide(10, 0)` | lança erro | `toThrow` |
| 3 | `divide(-10, 2)` | `-5` | `toBe` |
| 4 | `divide(0, 5)` | `0` | `toBe` |
| 5 | `divide(7, 2)` | `3.5` | `toBe` |
| 6 | `divide(10, 5)` | não lança | `not.toThrow` |

As quatro variações do `toThrow` estão em testes separados:

```js
expect(() => divide(10, 0)).toThrow();              // qualquer erro
expect(() => divide(10, 0)).toThrow('division by zero'); // mensagem contém
expect(() => divide(10, 0)).toThrow(/zero/);        // regex
expect(() => divide(10, 0)).toThrow(Error);         // tipo
```

### Respostas

**Por que o `expect` precisa receber uma função?**
Porque o erro só existe quando `divide` executa. Em `expect(divide(10, 0)).toThrow()`
a chamada acontece antes de o `expect` receber algo: a exceção escapa e quebra o
teste, sem ser avaliada como asserção. Com `() => divide(10, 0)`, o Jest chama a
função dentro de um bloco protegido (`try/catch`) e consegue capturar e inspecionar
o erro.

**O que acontece se a função não lançar erro e o teste usar `toThrow`?**
O teste falha com "Received function did not throw". É o comportamento correto:
o teste esperava uma exceção que não ocorreu, então o caminho de erro não está
implementado como deveria.

**Por que verificar a mensagem é mais seguro que só verificar que houve erro?**
`toThrow()` sem argumento aceita qualquer erro — inclusive um `TypeError` causado
por bug interno, que faria o teste passar pelo motivo errado. Verificar mensagem
ou tipo amarra a falha à regra pretendida e evita falso positivo.

**Em que situação usaria `not.toThrow`?**
Para garantir que entradas válidas continuam aceitas — por exemplo, `divide(10, 5)`
não pode passar a lançar erro depois de uma refatoração. Também serve para fixar
fronteiras que devem permanecer válidas (zero no dividendo, números negativos).

## Exercício 5 — Estrutura de arquivos

Segunda função: `src/formatter.js`, que remove espaços das pontas, deixa a
primeira letra maiúscula e o restante minúsculo.

| # | Entrada | Esperado |
| --- | --- | --- |
| 1 | `'maria'` | `'Maria'` |
| 2 | `' joão '` | `'João'` |
| 3 | `'ANA'` | `'Ana'` |
| 4 | `''` | `''` |

Duas suítes: `divide.spec.js` (9 testes) e `formatter.spec.js` (4 testes).
Comandos do dia a dia: `npx jest --watch`, `npx jest divide`,
`npx jest --verbose`.

## Exercício 6 — Integração com API REST

`src/app.js` exporta o app Express sem `listen`; `src/server.js` é quem chama
`app.listen(3000)`. Rotas: `GET /ping` → `{ "status": "ok" }` e
`POST /api/soma` (versão do exercício anterior). Rota desconhecida → 404 JSON.

| # | Requisição | Status | Verificação |
| --- | --- | --- | --- |
| 1 | `GET /ping` | 200 | corpo `{ status: 'ok' }` |
| 2 | `GET /ping` | 200 | `content-type` JSON |
| 3 | `GET /unknown-route` | 404 | corpo `{ error: 'Route not found.' }` |
| 4 | `POST /ping` | 404 | método não registrado |

### Respostas

**Por que é integração e não unitário?**
Porque exercita a camada HTTP: roteamento do Express, middleware `express.json`,
status, cabeçalhos e serialização JSON. Mais de uma parte da aplicação participa,
mesmo sem abrir porta de rede.

**O que aconteceria se `app.listen` estivesse dentro de `app.js`?**
Importar o app para testar abriria uma porta real. Isso poderia causar
`EADDRINUSE` entre execuções, deixar handles abertos (Jest não encerra) e tornar
o teste dependente de porta livre. A separação deixa o app importável e sem
efeito colateral.

**Por que `toEqual` e não `toBe` no corpo?**
`response.body` é um objeto novo criado pelo parser JSON. `toBe` compara
identidade de referência e falharia; `toEqual` compara a estrutura e os valores.

## Exercício 7 — Simulando banco de dados

`src/userService.js` recebe o repositório por injeção e não o cria internamente:

```js
function createUserService(repository) {
  return {
    getUser(id) { return repository.findById(id); },
    async getUserAsync(id) { return repository.findById(id); },
  };
}
```

| # | Cenário | Verificação |
| --- | --- | --- |
| 1 | usuário encontrado | `toEqual(userMock)` |
| 2 | id correto | `toHaveBeenCalledWith(42)` |
| 3 | chamada única | `toHaveBeenCalledTimes(1)` |
| 4 | usuário inexistente | mock devolve `null` → `toBeNull()` |
| 5 | versão assíncrona | `mockResolvedValue` + `await` |

`beforeEach(() => jest.clearAllMocks())` evita que o histórico de chamadas de um
teste contamine o próximo.

### Respostas

**Verificar o retorno × verificar a chamada:** o retorno prova o resultado
entregue ao chamador; a chamada prova a colaboração (se o serviço consultou o
repositório, com qual id e quantas vezes). Um mock pode devolver o objeto certo
mesmo se o serviço consultar o id errado — por isso os dois tipos de asserção.

**Por que receber o repositório em vez de criá-lo?** Para substituí-lo por um
dublê no teste: sem banco instalado, execução rápida e determinística, e cenários
difíceis (usuário inexistente, falha de conexão) ficam triviais. Também torna a
dependência explícita.

**O que o mock não garante?** O comportamento real da integração: se a consulta
está correta, se o schema/índice existe, se a conexão e as transações funcionam,
se o banco devolve aquele formato. O mock só prova que o serviço usa a
dependência como esperado.

## Exercício 8 — Cobertura de código

### Antes e depois (números reais dos exercícios 4–8)

| Etapa | Suítes | Testes | Stmts | Branch | Funcs | Lines |
| --- | --- | --- | --- | --- | --- | --- |
| Só exercícios 4–5 | 2 | 13 | 26,47% | 33,33% | 20% | 28,12% |
| Após exercícios 6–7 | 5 | 32 | 100% | 91,66% | 100% | 100% |
| Após cobrir a lacuna | 5 | 33 | 100% | 100% | 100% | 100% |

Saídas completas em `evidencias/coverage-before.txt`, `coverage-after.txt` e
`coverage-final.txt`.

**Lacunas identificadas na primeira medição:** com apenas os exercícios 4–5, `app.js`,
`sum.js` e `userService.js` estavam em 0% — nenhum teste os executava. As funções
sem nenhuma cobertura eram:

- `app.js`: handler de `GET /ping`, handler de `POST /api/soma` e fallback 404;
- `sum.js`: `sum()`;
- `userService.js`: `createUserService()`, `getUser()` e `getUserAsync()`.

Na segunda medição, a única lacuna era o ramo do `?? {}` em `app.js`: todos os testes
enviavam algum corpo JSON, então o lado direito do operador nulo nunca era percorrido.
Era também o arquivo com a menor cobertura de ramos (87,5%, contra 100% nos demais).
O teste "should return 400 when the request has no body" (requisição sem corpo)
fechou esse ramo.

O piso configurado em `jest.config.js` é o do material: 80% statements/functions/
lines e 70% branches, com `src/server.js` e os próprios testes fora do cálculo.
Na primeira execução parcial, o piso **falhou de propósito** (26,47% < 80%),
mostrando que o limite funciona.

```js
collectCoverageFrom: ['src/**/*.js', '!src/__tests__/**', '!src/server.js'],
coverageThreshold: {
  global: { statements: 80, branches: 70, functions: 80, lines: 80 },
},
```

### Respostas

**Instruções × ramos:** instruções medem linhas/comandos executados; ramos medem
cada decisão (`if/else`, ternário, `??`, `||`). Uma linha pode ser executada com
apenas um dos caminhos — em `divide`, testar só `divide(10, 2)` dá 100% de
instruções e 50% de ramos, porque o `if (b === 0)` nunca foi verdadeiro.

**100% de cobertura não significa código sem defeitos:** cobertura mede execução,
não verificação. Um teste sem asserção (ou com asserção fraca) executa o código e
conta como coberto; requisitos ausentes, regras erradas e bugs de integração não
aparecem no número.

**O que a cobertura nunca aponta:** funcionalidades que não foram escritas,
regra de negócio incorreta, contrato errado com banco/API externa, condições de
corrida, problemas de segurança/desempenho e falhas de usabilidade. Ela só indica
o que os testes existentes tocaram.

**Por que excluir arquivos:** `server.js` apenas chama `listen` e registra uma
mensagem — não há lógica de negócio para testar; incluí-lo baixaria a métrica sem
aumentar a qualidade. Arquivos de teste também ficam fora. Exclusões precisam de
justificativa: nunca se exclui lógica de negócio só para inflar o percentual.

**Piso para este projeto:** 80/70/80/80, como sugerido. Como a suíte real chegou
a 100% em tudo, o piso funciona como rede de segurança contra regressões com uma
margem confortável. Em projeto legado, o correto é começar no patamar atual e
subir aos poucos, em vez de definir um número que ninguém consegue manter.

---

# Parte 2 — Exercícios 9 a 17

## Exercício 9 — Boas práticas de testes

Arquivos: `src/calculation.js` e `src/__tests__/calculation.spec.js` (7 testes).

### Problemas do teste original

| Problema | Consequência |
| --- | --- |
| Nome genérico (`'teste1'`) | O relatório de falha não diz o que deixou de funcionar. |
| Várias asserções sem relação no mesmo teste | A primeira que falha interrompe as demais, que nem chegam a ser avaliadas. |
| Duas funções (`soma` e `subtrai`) no mesmo teste | Uma falha em `subtrai` aparece como falha do mesmo bloco de `soma`. |
| Sem agrupamento por função | A saída do Jest fica plana, sem indicar a que função cada caso pertence. |
| Sem padrão de nome | Não é possível ler o comportamento esperado sem abrir o código. |
| Casos repetitivos escritos à mão | Duplicação e risco de divergência entre casos equivalentes. |

### Versão refatorada

```js
describe('add', () => {
  it('should return 5 when adding 2 + 3', () => {
    const result = add(2, 3);
    expect(result).toBe(5);
  });

  it('should return 0 when adding -1 + 1', () => {
    const result = add(-1, 1);
    expect(result).toBe(0);
  });

  test.each([
    [0, 0, 0],
    [10, 5, 15],
    [-2, -3, -5],
  ])('should return %i when adding %i + %i', (a, b, expected) => {
    expect(add(a, b)).toBe(expected);
  });
});

describe('subtract', () => {
  it('should return 3 when subtracting 5 - 2', () => {
    expect(subtract(5, 2)).toBe(3);
  });

  it('should return -3 when subtracting 2 - 5', () => {
    expect(subtract(2, 5)).toBe(-3);
  });
});
```

Cada `it` tem uma responsabilidade única e segue o padrão `should [resultado]
when [condição]`, que é a versão em inglês do `deve ... quando ...` do material.
O `test.each` gera um teste por linha, cada um com seu próprio nome no relatório.

### Respostas

**Por que o nome do teste faz parte da sua qualidade?**
Porque o nome é a primeira — e muitas vezes a única — informação que aparece quando
o teste falha. Um nome como `should return 400 when field "b" is missing` já diz o
comportamento quebrado; `'teste1'` obriga a abrir o código e depurar para descobrir
o que deveria acontecer. Nome bom reduz o tempo de diagnóstico e documenta a regra.

**O que acontece com as asserções seguintes quando a primeira falha?**
O Jest lança a exceção da asserção e interrompe aquele `it`; as linhas seguintes não
são executadas. Por isso, várias asserções sem relação no mesmo teste escondem
falhas adicionais: você corrige a primeira, roda de novo e descobre a segunda.

**Qual a vantagem de agrupar os testes de uma função em um `describe`?**
A saída fica hierárquica (`add > should return...`), deixa claro a que unidade cada
caso pertence e permite aplicar ganchos (`beforeEach`, `afterEach`) só àquele
conjunto. Também facilita rodar um grupo isolado com `npx jest -t "add"`.

**Em que situação o `test.each` é melhor que escrever cada `it` separadamente?**
Quando vários casos exercitam a mesma regra e só mudam os dados de entrada/saída.
O `test.each` evita duplicação, mantém um único corpo de teste e ainda gera um caso
independente por linha no relatório — se um falhar, os outros continuam rodando.

## Exercício 10 — Projeto integrado

Arquivos: rotas em `src/app.js` e `src/__tests__/apiRoutes.spec.js` (7 testes).

- `GET /saudacao/:nome` → HTTP 200 `{ "mensagem": "Olá, <nome>" }`
- `POST /soma` → recebe `{ a, b }` e responde HTTP 200 `{ "resultado": a + b }`
- Entrada inválida → HTTP 400 `{ "erro": "The fields \"a\" and \"b\" must be valid numbers." }`
- Rota inexistente → HTTP 404 `{ "error": "Route not found." }`

| # | Requisição | Status | Verificação |
| --- | --- | --- | --- |
| 1 | `GET /saudacao/Maria` | 200 | `{ mensagem: 'Olá, Maria' }` |
| 2 | `GET /saudacao/Ana%20Paula` | 200 | nome com espaço tratado corretamente |
| 3 | `POST /soma` com `{ a: 2, b: 3 }` | 200 | `{ resultado: 5 }` |
| 4 | `POST /soma` com `{ a: -5, b: 2 }` | 200 | `{ resultado: -3 }` |
| 5 | `POST /soma` sem o campo `b` | 400 | mensagem de erro clara |
| 6 | `POST /soma` com `{ a: 'x', b: 3 }` | 400 | mensagem de erro clara |
| 7 | `GET /rota-inexistente` | 404 | resposta de rota não encontrada |

Todos os testes usam `await` e verificam **status e corpo**, nunca apenas um dos dois.
O `app` é importado diretamente; nenhum teste chama `app.listen`.

## Exercício 11 — Testando arrays

Arquivos: `src/arrayFilter.js` e `src/__tests__/arrayFilter.spec.js` (7 testes).

| # | Entrada | Resultado esperado | Matcher |
| --- | --- | --- | --- |
| 1 | `[1, 2, 3, 4, 5, 6]` | `[2, 4, 6]` | `toEqual` |
| 2 | `[1, 3, 5]` | `[]` | `toEqual` |
| 3 | `[]` | `[]` | `toEqual` |
| 4 | `[-4, -3, 0, 7]` | `[-4, 0]` | `toEqual` |
| 5 | `[10, 11, 12]` | contém `12` | `toContain` |
| 6 | `[2, 4, 6, 8]` | 4 elementos | `toHaveLength` |
| 7 | `[1, 3, 5]` | não contém `2` | `not.toContain` |

Zero é par e números negativos pares também entram no resultado — cobertos nos
casos 3 e 4.

### Por que o teste com `toBe` falha

```js
it('demonstra a diferença entre toBe e toEqual', () => {
  expect(filterEvens([1, 2, 3, 4])).toBe([2, 4]); // falha
});
```

Evidência: `evidencias/toBe-vs-toEqual-failure.txt`.

```
Expected: [2, 4]
Received: serializes to the same string
```

`toBe` usa `Object.is`, ou seja, compara **identidade de referência**. A função
devolve um array novo e o literal `[2, 4]` é outro array: os conteúdos são iguais,
mas os objetos são diferentes. `toEqual` faz comparação profunda (recursiva) de
arrays e objetos. Regra prática: `toBe` para primitivos (números, strings,
booleanos) e `toEqual` para arrays/objetos.

## Exercício 12 — Testando objetos

Arquivos: `src/userFactory.js` e `src/__tests__/userFactory.spec.js` (5 testes).
A função passou a gerar um `id` automático:

```js
function createUser(name, age) {
  return { id: nextId++, name, age };
}
```

| # | Verificação | Matcher |
| --- | --- | --- |
| 1 | Objeto completo corresponde ao esperado (incluindo `id` gerado) | `toEqual` com `expect.any(Number)` |
| 2 | Objeto possui a propriedade `name` | `toHaveProperty` |
| 3 | `age` vale exatamente `30` | `toHaveProperty('age', 30)` |
| 4 | Objeto contém ao menos os campos informados | `toMatchObject` |
| 5 | `name` não está vazio | `toBeTruthy` |

### Qual teste passou a falhar e por quê

O teste que compara o objeto completo com `toEqual({ name: 'Maria', age: 30 })`
passa a falhar depois da inclusão do `id`, porque `toEqual` exige **estrutura
exata**: uma propriedade a mais no recebido também é diferença.

Evidência: `evidencias/toEqual-id-failure.txt`.

```
- Expected  - 0
+ Received  + 1
  Object {
+   "id": 1,
    "age": 30,
    "name": "Maria",
  }
```

Para continuar verificando o objeto completo sem depender do valor do id, o teste
usa `toEqual({ id: expect.any(Number), name: 'Maria', age: 30 })`. Já
`toMatchObject({ name: 'Maria', age: 30 })` continua passando porque verifica
apenas o subconjunto informado, ignorando propriedades extras.

**Quando usar cada um:** `toEqual` quando o formato completo importa (contrato
fechado, resposta de API); `toMatchObject` quando o objeto pode crescer ou só um
subconjunto é relevante; `toHaveProperty` para uma propriedade específica.

## Exercício 13 — `beforeEach` e `afterEach`

Arquivos: `src/counter.js` e `src/__tests__/counter.spec.js` (3 testes).

O contador guarda `valor` no escopo do módulo — estado compartilhado entre testes.

### Por que o segundo teste falha sem o gancho

Evidência: `evidencias/counter-without-beforeEach.txt`.

```
● counter without beforeEach › should return 1 after one increment again
Expected: 1
Received: 2
```

O primeiro `it` incrementa o contador para `1` e não o reinicia. O segundo `it`
encontra o valor `1` e incrementa para `2`, embora o código seja idêntico. O teste
não é independente: ele depende do que o anterior deixou para trás.

### Correção

```js
describe('counter with beforeEach', () => {
  beforeEach(() => {
    reset(); // estado limpo antes de cada it
  });

  afterEach(() => {
    console.log('value at the end of the test:', getValue());
  });

  it('should return 1 after one increment', () => {
    expect(increment()).toBe(1);
  });

  it('should return 3 after three increments', () => {
    increment();
    increment();
    expect(increment()).toBe(3);
  });

  it('should return 0 after reset', () => {
    increment();
    reset();
    expect(getValue()).toBe(0);
  });
});
```

O `afterEach` imprime o valor final de cada teste, mostrando no console a ordem:
o teste executa, o `afterEach` roda, depois o próximo `beforeEach` limpa o estado.

### Independência comprovada

- Ordem invertida manualmente: os três testes continuam passando, porque cada um
  começa de `0`. Evidência em `evidencias/counter-reversed-order.txt`.
- Ordem aleatória (`npx jest --randomize`): 13 suítes / 75 testes passando.
  Evidência em `evidencias/randomize.txt`.

### Respostas

**Por que o estado compartilhado entre testes é um problema?**
Porque cria dependência invisível de ordem. Um teste passa sozinho e falha na
suíte (ou vice-versa), e a causa fica difícil de localizar. Estado compartilhado
também impede rodar um teste isolado e torna o resultado não determinístico.

**Qual a diferença entre `beforeAll` e `beforeEach`?**
`beforeAll` roda **uma vez** antes de todos os testes do bloco — bom para setup
caro e imutável (abrir conexão, carregar fixture). `beforeEach` roda **antes de
cada** teste — necessário quando o teste altera o estado e o próximo precisa de
um ambiente limpo.

**O que acontece com a suíte quando um teste depende do anterior e alguém muda a ordem?**
A suíte quebra mesmo que o código de produção esteja correto: o teste que rodar
primeiro cria o estado que o outro esperava. O resultado passa a depender da ordem
e do paralelismo, não do comportamento.

**Exemplo real de recurso que precisaria ser limpo em `afterEach`:**
Conexão com banco (fechar), arquivo temporário (apagar), tabela de teste (truncar),
servidor HTTP mockado (encerrar), timers/fake timers (restaurar), variáveis de
ambiente alteradas (restaurar), mocks (limpar histórico com `jest.clearAllMocks`).

## Exercício 14 — Testando promises

Arquivos: `src/dataService.js` e `src/__tests__/dataService.spec.js` (8 testes no total,
sendo 5 de sucesso).

```js
async function fetchData() {
  return { ok: true };
}
```

| # | Caso | Matcher |
| --- | --- | --- |
| 1 | resolve com o objeto completo | `resolves.toEqual({ ok: true })` |
| 2 | objeto resolvido possui `ok` | `resolves.toHaveProperty('ok', true)` |
| 3 | resolve com `ok` verdadeiro | `resolves.toMatchObject({ ok: true })` |
| 4 | devolve de fato uma promessa | `toBeInstanceOf(Promise)` |
| 5 | caminho `async/await` direto | `const r = await fetchData(); expect(r).toEqual(...)` |

### A armadilha do `await` esquecido

O teste abaixo foi executado em arquivo temporário com `fetchData` alterada para
devolver `{ ok: false }`:

```js
it('versão incorreta, sem await', () => {
  expect(fetchData()).resolves.toEqual({ ok: true });
});
```

Evidência: `evidencias/missing-await.txt`.

No ambiente deste projeto (Jest 30.5.2 / Node 24.14.0), o teste **não passa em
silêncio**: a promessa rejeitada fica flutuando, o worker do Jest é derrubado e a
execução termina com `JestAssertionError`. Ou seja, o erro aparece como crash do
worker, não como falha normal daquele `it`. O mesmo comportamento ocorre com
`expect.assertions(1)` (`evidencias/missing-await-assertions.txt`). Conclusão
prática: o `await` continua obrigatório, porque é ele que faz a asserção pertencer
ao teste e produzir um relatório de falha legível; não se deve depender do crash
do worker como mecanismo de detecção.

**O que `expect.assertions(n)` garante?**
Que exatamente `n` asserções foram executadas. Se um caminho alternativo (por
exemplo, uma promessa que resolve quando deveria rejeitar) pular o `expect`, o
teste falha mesmo sem nenhuma asserção ter falhado. É uma proteção contra falsos
verdes, especialmente em `try/catch`.

## Exercício 15 — Testando async e await

```js
async function fetchDataWithError() {
  throw new Error('failed to fetch data');
}
```

| # | Caso | Matcher |
| --- | --- | --- |
| 1 | sucesso com `async/await` | `const r = await fetchData(); expect(r).toEqual({ ok: true })` |
| 2 | rejeição com mensagem | `await expect(fetchDataWithError()).rejects.toThrow('failed to fetch data')` |
| 3 | rejeição é um `Error` | `rejects.toBeInstanceOf(Error)` |
| 4 | mesma verificação com `try/catch` | `expect.assertions(1)` + `expect(error).toBeInstanceOf(Error)` |

Forma com `try/catch`:

```js
it('should reject with an Error when using try/catch', async () => {
  expect.assertions(1);

  try {
    await fetchDataWithError();
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
  }
});
```

**Por que `expect.assertions` é especialmente importante no `try/catch`?**
Se a promessa resolver em vez de rejeitar, o bloco `catch` nunca executa e o teste
termina **sem nenhuma asserção**, passando por acidente. `expect.assertions(1)`
obriga a existência de uma asserção e transforma esse falso verde em falha.

Resumo dos modificadores:

| Situação | Forma recomendada |
| --- | --- |
| Promessa que resolve | `await expect(fn()).resolves.toEqual(valor)` |
| Promessa que rejeita | `await expect(fn()).rejects.toThrow(mensagem)` |
| Função `async` com valor simples | `const r = await fn(); expect(r).toBe(valor)` |
| Verificar o tipo do erro | `rejects.toBeInstanceOf(Error)` |

## Exercício 16 — Snapshot testing

Arquivos: `src/message.js`, `src/__tests__/message.spec.js` e
`src/__tests__/__snapshots__/message.spec.js.snap`.

Função original:

```js
function getWelcomeMessage(name) {
  return `Olá, ${name}! Bem-vindo à nossa plataforma.`;
}
```

Snapshot gerado:

```js
exports[`getWelcomeMessage should generate the welcome message 1`] =
  `"Olá, Maria! Bem-vindo à nossa plataforma."`;
```

### Diff capturado ao alterar a função

A mensagem foi trocada de `Bem-vindo` para `Seja bem-vindo`. Evidência completa em
`evidencias/snapshot-diff.txt`:

```
- Snapshot: "Olá, Maria! Bem-vindo à nossa plataforma."
+ Received: "Olá, Maria! Seja bem-vindo à nossa plataforma."
```

> Observação: o arquivo `.snap` é UTF-8 válido (o `á` é gravado como `C3 A1`).
> No console do Windows sem `chcp 65001` ele pode aparecer como `OlÃ¡` ou `Ol?`;
> é apenas artefato de exibição do terminal, não do snapshot.

Depois o snapshot foi atualizado com `npx jest message -u`
(`evidencias/snapshot-update.txt`) e, em seguida, a função foi restaurada e o
snapshot regravado com `-u` (`evidencias/snapshot-restore.txt`), deixando a suíte
verde com o texto original.

### Respostas

**O que o snapshot verifica que um `toBe` não verificaria?**
O snapshot grava a saída inteira e compara a estrutura completa, sem você escrever
o valor esperado à mão. Em textos longos (HTML, configuração, mensagens grandes),
ele detecta qualquer mudança de conteúdo, formatação ou tamanho — inclusive
alterações que um `toBe` com string parcial deixaria passar.

**Por que o arquivo `.snap` precisa ser versionado no git?**
Porque ele **é** o valor esperado do teste. Sem o `.snap`, o Jest grava tudo de novo
na próxima execução e o teste deixa de comparar qualquer coisa. Versionar permite
revisar o diff no code review e perceber mudanças não intencionais.

**Qual o risco de usar `-u` por hábito?**
Aceitar automaticamente qualquer saída nova anula o teste: um bug de comportamento
passa a ser registrado como correto. O `-u` só deve ser usado depois de ler o diff e
confirmar que a mudança foi intencional.

## Exercício 17 — Mock de função

Arquivos: `src/emailService.js` e `src/__tests__/emailService.spec.js` (4 testes).

```js
function createEmailSender(apiSend) {
  return function sendEmail(user) {
    return apiSend(user.email, 'Bem-vindo!');
  };
}
```

| # | Cenário | Verificação |
| --- | --- | --- |
| 1 | envio bem-sucedido | `toHaveBeenCalledWith(email, 'Bem-vindo!')` + retorno |
| 2 | chamada única | `toHaveBeenCalledTimes(1)` |
| 3 | dois usuários diferentes | `toHaveBeenNthCalledWith(1, ...)` e `(2, ...)` |
| 4 | falha no envio | `mockRejectedValue` + `rejects.toThrow('send failed')` |

`beforeEach(() => jest.clearAllMocks())` limpa o histórico entre os testes. Sem
isso, o segundo teste enxergaria as chamadas do primeiro e
`toHaveBeenCalledTimes(1)` falharia.

### Respostas

**Qual a diferença entre verificar o retorno e verificar que a função foi chamada?**
O retorno prova o valor entregue ao chamador; a verificação de chamada prova a
**colaboração**: que a dependência foi acionada, com quais argumentos e quantas
vezes. Um `sendEmail` poderia devolver `true` sem nunca chamar a API de e-mail —
só a asserção de chamada pega esse erro.

**Por que a função recebe `apiEnviar` em vez de importá-lo diretamente?**
Por injeção de dependência: o teste substitui a implementação real por `jest.fn()`
sem disparar e-mail, sem rede e sem variáveis de ambiente. Também deixa explícita
a dependência e permite testar falhas que seriam difíceis de reproduzir.

**O que um mock não consegue garantir que um teste de integração garantiria?**
O comportamento real do serviço externo: se o e-mail sai de verdade, se o provedor
aceita o payload, autenticação, limites, latência, formato da resposta e erros de
rede. O mock prova apenas que a função usa a dependência como esperado.

## Padrão AAA

Todos os testes novos seguem Arrange, Act, Assert, com comentários separando as
etapas. Nos casos de uma linha, `// Act & Assert` documenta a intenção. Nenhum
teste ficou sem asserção: todos terminam em pelo menos um `expect`, e o caso com
`try/catch` usa `expect.assertions(1)`.

## Verificações de fechamento

| Verificação | Resultado |
| --- | --- |
| Função quebrada de propósito | `add` alterada para `a + b + 1`; 5 testes falharam (`evidencias/mutation-failure.txt`) e depois foi restaurada |
| Suíte em ordem aleatória | 13 suítes / 75 testes passando (`evidencias/randomize.txt`) |
| Teste sem asserção | nenhum |
| Nomes dos testes | todos no padrão `should ... when ...` |
| Cobertura | 100% statements, branches, functions e lines (`evidencias/coverage-module-final.txt`) |

## Resultado final

Saída real de `npm test` (`evidencias/test-output.txt`):

```
Test Suites: 13 passed, 13 total
Tests:       75 passed, 75 total
Snapshots:   1 passed, 1 total
```

Distribuição dos 75 testes:

| Suíte | Testes |
| --- | --- |
| `divide.spec.js` | 9 |
| `formatter.spec.js` | 4 |
| `api.spec.js` | 5 |
| `userService.spec.js` | 5 |
| `sum.integration.spec.js` | 10 |
| `calculation.spec.js` | 7 |
| `apiRoutes.spec.js` | 7 |
| `arrayFilter.spec.js` | 7 |
| `userFactory.spec.js` | 5 |
| `counter.spec.js` | 3 |
| `dataService.spec.js` | 8 |
| `message.spec.js` | 1 |
| `emailService.spec.js` | 4 |

## Entrega

- Projeto completo, **sem `node_modules`**.
- Respostas escritas de cada exercício neste README.
- Saída real de `npm test` em `evidencias/test-output.txt`.
- Diff do snapshot do exercício 16 em `evidencias/snapshot-diff.txt`.
- Evidências das falhas propositais e da execução com `--randomize` em `evidencias/`.
