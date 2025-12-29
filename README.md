# Fullstack E-commerce Backend

### Architectural Showcase (Node.js · TypeScript · MongoDB)

This project is a **Node.js + TypeScript e-commerce backend** built as an **architectural showcase**, with an explicit focus on:

* domain clarity
* conscious architectural decisions
* protected business rules
* realistic and reliable tests
* incremental evolution without overengineering

It is **neither an academic DDD exercise** nor a simplistic CRUD.
The goal is to demonstrate **how a real-world backend can evolve pragmatically**, balancing correctness, maintainability, and delivery.

> This project is designed to be **read, analyzed, and discussed**, not just executed.

---

## Project goals

* Demonstrate **backend architecture best practices in Node.js**
* Show how to apply **DDD + Clean Architecture pragmatically**
* Make **implicit architectural decisions explicit**
* Expose **real trade-offs**, not idealized solutions
* Provide tests that **validate behavior**, not only endpoints

This repository exists as a **technical reference and discussion artifact**.

---

## Architectural overview

The architecture follows a **pragmatic interpretation of Clean Architecture with DDD concepts**, adapted to the Node.js + MongoDB ecosystem:

```
HTTP / Express (Controllers)
        ↓
Application Layer (Use Cases)
        ↓
Domain (Entities, Domain Services, Events)
        ↓
Infrastructure (MongoDB, Mongoose, Event Bus, Outbox)
```

### Guiding principles

* The **domain does not depend on frameworks**
* Controllers act as **adapters**, not business logic holders
* Use cases **orchestrate flows**, they do not encode deep rules
* Business rules live in the **domain**
* Complexity is introduced **only when it provides clear value**

---

## Layers and responsibilities

### Controllers (Express)

Responsibilities:

* Adapt HTTP requests to use cases
* Extract request data
* Handle authentication and authorization
* Translate domain errors into HTTP responses

Controllers **do not contain business rules**.

---

### Application Layer (Use Cases)

Examples:

* `CheckoutUseCase`
* `AddItemToCartUseCase`
* `UpdateOrderStatusUseCase`
* `ClearCartUseCase`
* `ListMyOrdersUseCase`

Responsibilities:

* Orchestrate application flows
* Coordinate multiple repositories
* Manage transactions
* Persist results
* Publish application events

Use cases:

* Depend on **ports (interfaces)**
* Do not know Express
* Do not know MongoDB or Mongoose details

---

### Domain Layer

#### Domain entities

Example: `Order`

* Represents a real business concept
* Has state and behavior
* Protects its own invariants
* Controls valid state transitions

Allowed lifecycle:

```
pending → paid → shipped → completed
```

Invalid transitions are **not allowed**, regardless of the caller:

* controller
* use case
* service

This prevents:

* duplicated rules
* scattered conditionals
* invalid states being persisted

---

#### Domain services

Used **only when a rule does not clearly belong to a single entity**.

Examples:

* cross-entity validation
* rules involving multiple aggregates
* calculations without a clear owner

Simple rule:

> If the rule belongs to the entity, it stays in the entity.
> If it doesn’t, it becomes a Domain Service.

Domain services:

* Do not know HTTP
* Do not know MongoDB
* Do not know Mongoose

---

#### Domain errors

The domain defines explicit business errors such as:

* `OrderNotFoundError`
* `OrderCannotBeCancelledError`
* `OnlyAdminCanChangeOrderStatusError`
* `CartNotFoundError`

These errors:

* Represent **business failures**
* Are handled at the controller level
* Make behavior explicit and testable

---

## Events

The project deliberately uses **two levels of events**.

### Domain events

Example:

* `OrderCreatedEvent`

Used to:

* express important domain facts
* decouple reactions
* avoid hidden side effects

The internal `EventBus` is intentionally simple:

* no external messaging is required at this stage
* complexity is introduced only when necessary

---

### Outbox Pattern (application-level events)

The checkout flow persists events using an **Outbox Pattern**:

* Events are stored within the same transaction
* An asynchronous dispatcher processes them
* Handlers execute real side effects

This guarantees:

* eventual consistency
* failure tolerance
* no “ghost” side effects

This is a pattern commonly used in **production-grade distributed systems**.

---

## Infrastructure layer

Includes:

* Mongo repositories (`MongoOrderRepository`, etc.)
* Transaction manager
* Outbox implementation
* Mongoose models
* Event dispatchers

The infrastructure layer:

* Implements application ports
* Can be replaced without affecting the domain

---

## Testing strategy

### Types of tests included

* HTTP integration tests (Express)
* End-to-end flow tests (full checkout)
* Authorization tests
* Domain error tests

### Intentional decisions

* In-memory MongoDB
* Replica Set enabled
* Real transactions executed

This ensures:

* tests closely reflect production behavior
* rollback is validated
* side effects are detectable

### What was intentionally avoided

* excessive mocking
* fragile implementation-based tests
* artificial isolation with low value

---

## Security and explicit decisions

* Errors avoid user enumeration
* Authorization rules are explicitly tested
* Regular users cannot:

  * change order status
  * skip workflow steps
* Admins cannot:

  * checkout carts that are not theirs

These are **domain rules**, not controller conventions.

---

## What this project is NOT

* A generic framework
* A definitive boilerplate
* A “pure” academic DDD implementation
* A complete production system

It is a **technical showcase**, focused on:

* clarity
* trade-offs
* conscious decisions
* sustainable evolution

---

## Intended evolution paths

This project can naturally evolve into:

* explicit value objects (`Money`, `OrderStatus`, etc.)
* a richer domain model
* external messaging
* payments and refunds
* webhooks
* stronger idempotency guarantees

None of this was implemented **yet**, because:

> Good architecture knows when to stop.

---

## Conclusion

This codebase is not the result of following a tutorial.
It is the result of **questioning decisions**, **correcting course**, and **respecting the domain**.

If something looks “incomplete”, it is probably **intentional**.

If you made it this far:
yes, the architecture was carefully designed.

---

## License

MIT — use it, critique it, evolve it.
