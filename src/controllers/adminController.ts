import { Request, Response } from "express"
import { User } from "../models/User"
import { Product } from "../models/Product"
import { Order } from "../models/Order"
import { Cart } from "../models/Cart"

export const getStats = async (req: Request, res: Response) => {

    try {

        const { startDate, endDate } = req.query
        const start = startDate
            ? new Date(startDate as string)
            : new Date("1970-01-01")
        const end = endDate ? new Date(endDate as string) : new Date()

        // Filtro de data para todas as queries
        const dateFilter = { createdAt: { $gte: start, $lte: end } }

        // 1. Executar todas as consultas independentes em paralelo com Promise.all
        const [users, products, orders, ordersByStatus, carts, topSelling] =

            await Promise.all([

                // Usuários
                User.find(dateFilter),

                // Produtos
                Product.find(dateFilter),

                // Pedidos
                Order.find(dateFilter),

                // Pedidos por Status (Aggregation)
                Order.aggregate([
                    { $match: dateFilter },
                    { $group: { _id: "$status", count: { $sum: 1 } } },
                ]),

                // Carrinhos
                Cart.find(dateFilter),

                // Top Selling (Aggregation)
                Order.aggregate([
                    { $match: dateFilter },
                    { $unwind: "$items" },
                    {
                        $group: {
                            _id: "$items.productId",
                            sold: { $sum: "$items.quantity" },
                        },
                    },
                    { $sort: { sold: -1 } },
                    { $limit: 5 },
                ]),
            ])

        // 2. Cálculo e processamento dos resultados (Utilizando os dados já obtidos)

        // Processamento de Usuários
        const totalUsers = users.length
        const admins = users.filter((u) => u.role === "admin").length
        const normalUsers = users.filter((u) => u.role === "user").length

        // Processamento de Produtos
        const totalProducts = products.length

        // Processamento de Pedidos
        const totalOrders = orders.length
        const revenueTotal = orders.reduce((acc, o) => acc + o.total, 0)
        const avgTicket = totalOrders > 0 ? revenueTotal / totalOrders : 0

        // Processamento de Carrinhos
        const avgItems =
            carts.length > 0
                ? carts.reduce((acc, c) => acc + c.items.length, 0) /
                  carts.length
                : 0
        const conversionRate =
            carts.length > 0 ? totalOrders / carts.length : 0

        // 3. Resposta Final
        res.json({

            period: { start, end },
            users: { total: totalUsers, admins, users: normalUsers },
            products: { total: totalProducts, topSelling },
            orders: {
                total: totalOrders,
                revenueTotal,
                avgTicket,
                byStatus: ordersByStatus,
            },
            carts: { avgItems, conversionRate },
        })
    } catch (error) {

        res.status(500).json({
            error: "Erro ao gerar estatísticas consolidadas",
        })
    }
}
