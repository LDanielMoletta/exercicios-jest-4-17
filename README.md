# Exercícios Jest 4–8 — Erros, Estrutura, Integração, Mocks e Cobertura

Projeto único com a continuação do módulo de Testes Automatizados (exercícios 4 a 8)
e, junto, uma versão enxuta do endpoint de soma do exercício anterior
(`POST /api/soma`), no mesmo padrão em inglês.

Código, nomes de variáveis, mensagens de erro e descrições de teste estão em inglês.
O contrato do endpoint anterior foi preservado: `POST /api/soma` responde
`{ "resultado": 8 }` ou, em entrada inválida, HTTP 400 com `{ "erro": "..." }`.

## Stack

| Item | Versão |
| --- | --- |
| Node.js | 24.14.0 |
| Express | 5.3.0 |
| Jest | 30.5.2 |
| Supertest | 7.3.1 |

## Estrutura

```
src/
├── app.js                  # Express app (sem listen) + /ping + /api/soma + 404
├── server.js               # apenas sobe o servidor (excluído da cobertura)
├── divide.js               # exercício 4
├── formatter.js            # exercício 5
├── userService.js          # exercício 7 (recebe o repositório por injeção)
├── sum.js                  # simulação do exercício anterior
└── __tests__/
    ├── divide.spec.js
    ├── formatter.spec.js
    ├── api.spec.js
    ├── userService.spec.js
    └── sum.integration.spec.js
evidencias/
├── coverage-before.txt     # cobertura só com os exercícios 4–5
├── coverage-after.txt      # após os exercícios 6–7
├── coverage-final.txt      # após cobrir a lacuna encontrada
└── test-output.txt         # npm test final
jest.config.js
```

Convenção escolhida: **pasta `src/__tests__/` com arquivos `.spec.js`**.
O projeto reúne cinco suítes de assuntos diferentes (funções puras, API, serviço
com mock e integração), então separar `src/` (produção) de `src/__tests__/`
(testes) mantém a raiz limpa e deixa claro o que é entregue. O Jest encontra os
arquivos automaticamente, sem configuração extra de `testMatch`.

## Como rodar

```bash
npm install
npm test                  # suíte completa
npm run test:coverage     # suíte + relatório + piso de cobertura
npm start                 # sobe o servidor na porta 3000 (opcional)
```

`npm test -- --coverage` é equivalente a `npm run test:coverage`.
O relatório visual fica em `coverage/lcov-report/index.html`.

---

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

### Antes e depois (números reais)

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

Na segunda medição, a única lacuna era o ramo do `?? {}` em `app.js` (linha 16):
todos os testes enviavam algum corpo JSON, então o lado direito do operador nulo
nunca era percorrido. Era também o arquivo com a menor cobertura de ramos
(87,5%, contra 100% nos demais). O teste
"should return 400 when the request has no body" (requisição sem corpo) fechou
esse ramo.

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

## Exercício anterior incluído (`POST /api/soma`)

Para atender ao pedido do professor de manter os testes de ontem junto, o mesmo
app inclui a simulação do endpoint:

- Requisição: `{ "a": 5, "b": 3 }`
- Sucesso: HTTP 200 `{ "resultado": 8 }`
- Inválido (string, `null`, ausente, sem corpo): HTTP 400
  `{ "erro": "The fields \"a\" and \"b\" must be valid numbers." }`
- Negativos e zero são válidos.

`src/__tests__/sum.integration.spec.js` cobre 10 cenários, com nomes em inglês e
padrão AAA, testando o app diretamente (sem `app.listen`).

## Resultado final

```
Test Suites: 5 passed, 5 total
Tests:       33 passed, 33 total
```

Distribuição: `divide` 9, `formatter` 4, `api` 5, `userService` 5 e
`sum.integration` 10.
