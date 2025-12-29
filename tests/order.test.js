"use strict"
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value) }) }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)) } catch (e) { reject(e) } }
        function rejected(value) { try { step(generator["throw"](value)) } catch (e) { reject(e) } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected) }
        step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
}
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1] }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype)
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this }), g
    function verb(n) { return function (v) { return step([n, v]) } }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.")
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t
            if (y = 0, t) op = [op[0] & 2, t.value]
            switch (op[0]) {
            case 0: case 1: t = op; break
            case 4: _.label++; return { value: op[1], done: false }
            case 5: _.label++; y = op[1]; op = [0]; continue
            case 7: op = _.ops.pop(); _.trys.pop(); continue
            default:
                if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue }
                if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break }
                if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break }
                if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break }
                if (t[2]) _.ops.pop()
                _.trys.pop(); continue
            }
            op = body.call(thisArg, _)
        } catch (e) { op = [6, e]; y = 0 } finally { f = t = 0 }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true }
    }
}
Object.defineProperty(exports, "__esModule", { value: true })
var supertest_1 = require("supertest")
var app_1 = require("../src/app")
var testHelpers_1 = require("./helpers/testHelpers")
var clearDatabase_1 = require("./helpers/clearDatabase")
var mongoose_1 = require("mongoose")
var Cart_1 = require("../src/infra/models/Cart")
var Order_1 = require("../src/infra/models/Order")
var Product_1 = require("../src/infra/models/Product")
require("./setup")
describe("Order Routes", function () {
    // Inicializar variáveis com strings vazias para evitar ReferenceError caso o beforeEach falhe
    var userToken = ""
    var adminToken = ""
    var userId = ""
    var adminId = ""
    var productId = ""
    var PRODUCT_PRICE = 10
    var PRODUCT_STOCK = 5
    // Configuração robusta e paralela
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, user, admin, product
        return __generator(this, function (_b) {
            switch (_b.label) {
            case 0:
                (0, clearDatabase_1.clearDatabase)()
                return [4 /*yield*/, Promise.all([
                    (0, testHelpers_1.createTestUser)("user"),
                    (0, testHelpers_1.createTestUser)("admin"),
                    (0, testHelpers_1.createTestProduct)({ price: PRODUCT_PRICE, stock: PRODUCT_STOCK })
                ])]
            case 1:
                _a = _b.sent(), user = _a[0], admin = _a[1], product = _a[2]
                userToken = user.token
                userId = user.user._id.toString()
                adminToken = admin.token
                adminId = admin.user._id.toString()
                productId = product._id.toString() // ID do produto base preenchido aqui
                return [2 /*return*/]
            }
        })
    }) })
    // --- POST /api/orders/checkout ---
    describe("POST /api/orders/checkout", function () {
        it("deve criar um pedido com sucesso quando o estoque for suficiente", function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, user, token, product, response, productAfter, cartAfter
            return __generator(this, function (_b) {
                switch (_b.label) {
                case 0: return [4 /*yield*/, (0, testHelpers_1.createTestUser)()]
                case 1:
                    _a = _b.sent(), user = _a.user, token = _a.token
                    return [4 /*yield*/, Product_1.Product.create({
                        name: "Produto Teste",
                        price: 100,
                        stock: 10,
                    })]
                case 2:
                    product = _b.sent()
                    return [4 /*yield*/, Cart_1.Cart.create({
                        userId: user._id,
                        items: [
                            {
                                productId: product._id,
                                quantity: 2,
                            },
                        ],
                    })]
                case 3:
                    _b.sent()
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                        .post("/api/orders/checkout")
                        .set("Authorization", "Bearer ".concat(token))]
                case 4:
                    response = _b.sent()
                    expect(response.status).toBe(201)
                    expect(response.body).toHaveProperty("order")
                    expect(response.body.order.total).toBe(200)
                    return [4 /*yield*/, Product_1.Product.findById(product._id)]
                case 5:
                    productAfter = _b.sent()
                    expect(productAfter.stock).toBe(8)
                    return [4 /*yield*/, Cart_1.Cart.findOne({ userId: user._id })]
                case 6:
                    cartAfter = _b.sent()
                    expect(cartAfter.items.length).toBe(0)
                    return [2 /*return*/]
                }
            })
        }) })
        it("não deve criar pedido se o carrinho estiver vazio", function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, user, token, response
            return __generator(this, function (_b) {
                switch (_b.label) {
                case 0: return [4 /*yield*/, (0, testHelpers_1.createTestUser)()]
                case 1:
                    _a = _b.sent(), user = _a.user, token = _a.token
                    return [4 /*yield*/, Cart_1.Cart.create({
                        userId: user._id,
                        items: [],
                    })]
                case 2:
                    _b.sent()
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                        .post("/api/orders/checkout")
                        .set("Authorization", "Bearer ".concat(token))]
                case 3:
                    response = _b.sent()
                    expect(response.status).toBe(400)
                    expect(response.body.error).toContain("Carrinho vazio")
                    return [2 /*return*/]
                }
            })
        }) })
        it("não deve criar pedido se algum produto não existir", function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, user, token, fakeProductId, response
            return __generator(this, function (_b) {
                switch (_b.label) {
                case 0: return [4 /*yield*/, (0, testHelpers_1.createTestUser)()]
                case 1:
                    _a = _b.sent(), user = _a.user, token = _a.token
                    fakeProductId = new mongoose_1.default.Types.ObjectId()
                    return [4 /*yield*/, Cart_1.Cart.create({
                        userId: user._id,
                        items: [
                            {
                                productId: fakeProductId,
                                quantity: 1,
                            },
                        ],
                    })]
                case 2:
                    _b.sent()
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                        .post("/api/orders/checkout")
                        .set("Authorization", "Bearer ".concat(token))]
                case 3:
                    response = _b.sent()
                    expect(response.status).toBe(400)
                    expect(response.body.error).toContain("Produto")
                    expect(response.body.error).toContain("não encontrado")
                    return [2 /*return*/]
                }
            })
        }) })
        it("não deve criar pedido se o estoque for insuficiente", function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, user, token, product, response, productAfterFailure, orders
            return __generator(this, function (_b) {
                switch (_b.label) {
                case 0: return [4 /*yield*/, (0, testHelpers_1.createTestUser)()]
                case 1:
                    _a = _b.sent(), user = _a.user, token = _a.token
                    return [4 /*yield*/, Product_1.Product.create({
                        name: "Produto com Estoque Baixo",
                        price: 50,
                        stock: 1,
                    })]
                case 2:
                    product = _b.sent()
                    return [4 /*yield*/, Cart_1.Cart.create({
                        userId: user._id,
                        items: [
                            {
                                productId: product._id,
                                quantity: 5, // maior que o estoque
                            },
                        ],
                    })]
                case 3:
                    _b.sent()
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                        .post("/api/orders/checkout")
                        .set("Authorization", "Bearer ".concat(token))]
                case 4:
                    response = _b.sent()
                    expect(response.status).toBe(400)
                    expect(response.body.error).toContain("Estoque insuficiente")
                    return [4 /*yield*/, Product_1.Product.findById(product._id)]
                case 5:
                    productAfterFailure = _b.sent()
                    expect(productAfterFailure.stock).toBe(1)
                    return [4 /*yield*/, Order_1.Order.find({ userId: user._id })]
                case 6:
                    orders = _b.sent()
                    expect(orders.length).toBe(0)
                    return [2 /*return*/]
                }
            })
        }) })
    })
    // --- GET /api/orders/my ---
    describe("GET /api/orders/my", function () {
        it("deve listar apenas os pedidos do usuário logado", function () { return __awaiter(void 0, void 0, void 0, function () {
            var myOrder, response
            return __generator(this, function (_a) {
                switch (_a.label) {
                case 0:
                    myOrder = new Order_1.Order({
                        userId: userId,
                        items: [],
                        total: 100,
                        status: "pending",
                    })
                    return [4 /*yield*/, myOrder.save()
                        // Cria um pedido para outro usuário
                    ]
                case 1:
                    _a.sent()
                    // Cria um pedido para outro usuário
                    return [4 /*yield*/, new Order_1.Order({
                        userId: new mongoose_1.default.Types.ObjectId(),
                        items: [],
                        total: 50,
                        status: "completed",
                    }).save()]
                case 2:
                    // Cria um pedido para outro usuário
                    _a.sent()
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                        .get("/api/orders/my")
                        .set("Authorization", "Bearer ".concat(userToken))]
                case 3:
                    response = _a.sent()
                    expect(response.status).toBe(200)
                    expect(response.body).toHaveLength(1)
                    expect(response.body[0]._id).toBe(myOrder._id.toString())
                    return [2 /*return*/]
                }
            })
        }) })
    })
    // --- GET /api/orders (Admin) ---
    describe("GET /api/orders (Admin)", function () {
        it("deve listar todos os pedidos se for admin", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response
            return __generator(this, function (_a) {
                switch (_a.label) {
                case 0: return [4 /*yield*/, new Order_1.Order({ userId: userId, items: [], total: 100 }).save()]
                case 1:
                    _a.sent()
                    return [4 /*yield*/, new Order_1.Order({
                        userId: new mongoose_1.default.Types.ObjectId(),
                        items: [],
                        total: 200,
                    }).save()]
                case 2:
                    _a.sent()
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                        .get("/api/orders")
                        .set("Authorization", "Bearer ".concat(adminToken))]
                case 3:
                    response = _a.sent()
                    expect(response.status).toBe(200)
                    expect(response.body).toHaveLength(2)
                    return [2 /*return*/]
                }
            })
        }) })
        it("não deve permitir acesso a usuário comum", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response
            return __generator(this, function (_a) {
                switch (_a.label) {
                case 0: return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                    .get("/api/orders")
                    .set("Authorization", "Bearer ".concat(userToken))]
                case 1:
                    response = _a.sent()
                    expect(response.status).toBe(403)
                    return [2 /*return*/]
                }
            })
        }) })
        // --- PUT /api/orders/:id ---
        it("deve atualizar o status do pedido como admin", function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, user, userToken, adminToken, product, checkoutResponse, orderId, paidResponse, shippedResponse
            return __generator(this, function (_b) {
                switch (_b.label) {
                case 0: return [4 /*yield*/, (0, testHelpers_1.createTestUser)()]
                case 1:
                    _a = _b.sent(), user = _a.user, userToken = _a.token
                    return [4 /*yield*/, (0, testHelpers_1.createTestUser)("admin")]
                case 2:
                    adminToken = (_b.sent()).token
                    return [4 /*yield*/, Product_1.Product.create({
                        name: "Produto Teste",
                        price: 100,
                        stock: 10,
                    })]
                case 3:
                    product = _b.sent()
                    return [4 /*yield*/, Cart_1.Cart.create({
                        userId: user._id,
                        items: [
                            {
                                productId: product._id,
                                quantity: 1,
                            },
                        ],
                    })
                        // checkout como user
                    ]
                case 4:
                    _b.sent()
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                        .post("/api/orders/checkout")
                        .set("Authorization", "Bearer ".concat(userToken))]
                case 5:
                    checkoutResponse = _b.sent()
                    expect(checkoutResponse.status).toBe(201)
                    orderId = checkoutResponse.body.order._id
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                        .put("/api/orders/".concat(orderId))
                        .set("Authorization", "Bearer ".concat(adminToken))
                        .send({ status: "paid" })]
                case 6:
                    paidResponse = _b.sent()
                    expect(paidResponse.status).toBe(200)
                    expect(paidResponse.body.status).toBe("paid")
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                        .put("/api/orders/".concat(orderId))
                        .set("Authorization", "Bearer ".concat(adminToken))
                        .send({ status: "shipped" })]
                case 7:
                    shippedResponse = _b.sent()
                    expect(shippedResponse.status).toBe(200)
                    expect(shippedResponse.body.status).toBe("shipped")
                    return [2 /*return*/]
                }
            })
        }) })
        it("não deve permitir que usuário comum atualize status", function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, user, userToken, adminToken, product, checkoutResponse, orderId, response
            return __generator(this, function (_b) {
                switch (_b.label) {
                case 0: return [4 /*yield*/, (0, testHelpers_1.createTestUser)()]
                case 1:
                    _a = _b.sent(), user = _a.user, userToken = _a.token
                    return [4 /*yield*/, (0, testHelpers_1.createTestUser)("admin")]
                case 2:
                    adminToken = (_b.sent()).token
                    return [4 /*yield*/, Product_1.Product.create({
                        name: "Produto Teste",
                        price: 100,
                        stock: 10,
                    })]
                case 3:
                    product = _b.sent()
                    return [4 /*yield*/, Cart_1.Cart.create({
                        userId: user._id,
                        items: [
                            {
                                productId: product._id,
                                quantity: 1,
                            },
                        ],
                    })
                        // pedido nasce via checkout (como user)
                    ]
                case 4:
                    _b.sent()
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                        .post("/api/orders/checkout")
                        .set("Authorization", "Bearer ".concat(userToken))]
                case 5:
                    checkoutResponse = _b.sent()
                    expect(checkoutResponse.status).toBe(201)
                    orderId = checkoutResponse.body.order._id
                    return [4 /*yield*/, (0, supertest_1.default)(app_1.default)
                        .put("/api/orders/".concat(orderId))
                        .set("Authorization", "Bearer ".concat(userToken))
                        .send({ status: "shipped" })]
                case 6:
                    response = _b.sent()
                    expect(response.status).toBe(403)
                    return [2 /*return*/]
                }
            })
        }) })
    })
})
