
# Fullstack E-commerce Backend (Showcase)

Este projeto é um **backend de e-commerce em Node.js + TypeScript** desenvolvido como **showcase arquitetural**, com foco em:

- clareza de domínio
- decisões explícitas
- regras de negócio protegidas
- testes confiáveis
- evolução incremental (sem overengineering)

Ele **não tenta ser um “DDD acadêmico”** nem um CRUD simplista.  
O objetivo é mostrar **como um sistema real pode evoluir de forma consciente**.

---

## Objetivos do projeto

- Demonstrar **boas práticas de arquitetura backend**
- Mostrar **como migrar de um CRUD procedural para um domínio rico**
- Explicitar decisões que normalmente ficam implícitas
- Ter testes que **realmente validam comportamento**, não apenas endpoints

Este projeto é pensado para ser **lido**, não apenas executado.

---

## Visão geral da arquitetura

A arquitetura adotada é uma **variação pragmática de Clean Architecture + DDD**, adaptada para Node.js e MongoDB:

Controllers (HTTP / Express) → Application Services → Domain (Entities, Domain Services, Events) → Infrastructure (Mongoose, MongoDB, EventBus)


### Princípios seguidos

- O **domínio não depende de frameworks**
- Controllers são **adaptadores**, não lugares de regra
- Regras de negócio vivem no **domínio**
- Testes refletem **uso real do sistema**
- Complexidade só é introduzida quando há valor claro

---

## Domínio rico (por que e como)
### Entidades de Domínio

Exemplo: `Order`

- Representa um conceito real do negócio
- Possui **estado**
- Possui **comportamento**
- Protege suas próprias invariantes

`pending → paid → shipped → completed`

Transições inválidas **não são permitidas**, nem por controllers, nem por services.
Isso evita:
- regras espalhadas
- ifs duplicados
- estados inválidos persistidos no banco

### Domain Services

Usados apenas **quando uma regra não pertence claramente a uma única entidade.**
Exemplo:
- cálculo de total
- validação cruzada entre itens e produtos

> Se a regra pertence à entidade, ela está na entidade.
Se não pertence, ela vira um Domain Service.

### Eventos de Domínio
O projeto usa **eventos de domínio simples**, como:
`OrderCreatedEvent`
Eles existem para:
- desacoplar reações a eventos importantes
- evitar efeitos colaterais escondidos
- permitir evolução futura (ex.: envio de email, analytics)

O `EventBus` é intencionalmente simples, pois:
- não há necessidade real de mensageria externa neste estágio
- complexidade só é adicionada quando necessária

### Application Services vs Domain Services
#### Application Services (ex.: CheckoutService)

Responsáveis por:
- orquestrar o fluxo
- iniciar transações
- chamar domínio
- persistir resultados
- publicar eventos

Eles podem **conhecer infraestrutura**, porque:
- fazem parte da camada de aplicação
- não são reutilizados fora do sistema

### Domain Services

- Não conhecem Express
- Não conhecem Mongo
- Não conhecem Mongoose
- Não conhecem HTTP

Eles existem **apenas para expressar regras.**

### Por que ainda existem services que importam Mongoose?

Essa é uma **decisão consciente**, não um erro.
#### Motivo principal: evolução incremental
Este projeto não começou com:
- repositories
- interfaces de persistência
- injeção de dependência completa

Ele começou como um backend funcional e foi **refatorado gradualmente.**

#### O que foi priorizado
- mover regras para o domínio
- proteger invariantes
- melhorar testes
- evitar big bang refactors

#### O que foi propositalmente adiado
- camada completa de repositories
- abstração total de Mongoose

#### Por quê?

Porque:

- **não havia necessidade real ainda**
- o custo cognitivo seria maior que o benefício
- a arquitetura já está preparada para isso

#### Adicionar repositories agora seria trivial, mas não obrigatório.

Este projeto mostra que:

> **Clean Architecture não é binária (tem / não tem)**
ela é um contínuo de decisões.
---

### Estratégia de testes
#### Tipos de testes presentes

- Testes de integração (HTTP + Mongo)
- Testes de fluxo real (checkout completo)
- Testes de autorização
- Testes de erro de domínio

#### O que NÃO foi feito (de propósito)
- mocks excessivos
- testes que dependem de estado global
- testes que “forçam” regras inválidas

#### Banco de dados nos testes
- MongoDB em memória
- Replica Set habilitado
- Transações reais funcionando

Isso garante que:
- testes refletem produção
- rollback funciona
- efeitos colaterais são detectados

### Segurança e decisões conscientes

- Erros evitam enumeração de usuários
- Autorização é testada explicitamente
- Usuário comum não pode:
-- atualizar status de pedido
-- pular etapas do fluxo
- Admin não pode:
-- finalizar checkout de carrinho alheio

Essas regras são **do domínio**, não “convenções”.

### O que este projeto NÃO tenta ser
- Um framework genérico
- Um boilerplate definitivo
- Um DDD “puro” acadêmico
- Um sistema completo de produção

Ele é um **showcase técnico**, focado em:
- decisões
- trade-offs
- clareza
- evolução

### Possíveis evoluções (intencionais)
Este projeto pode evoluir facilmente para:
- repositories (interfaces + adapters)
- testes unitários de entidades
- mensageria real
- pagamentos
- reembolsos
- webhooks

Nada disso foi feito **ainda**, porque:
>Arquitetura boa sabe quando parar.

## Conclusão

Este código não é o resultado de seguir um tutorial.
Ele é o resultado de **questionar decisões**, **corrigir rotas** e **respeitar o domínio**.

Se algo parece “incompleto”, provavelmente é **intencional**.

E se você chegou até aqui:
sim, a arquitetura foi pensada.

## Licença

MIT — use, critique, evolua.