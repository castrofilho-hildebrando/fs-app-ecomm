import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";

import { Cart } from "../models/Cart";
import { Product } from "../models/Product";
import { Order } from "../models/Order";

import { OrderDomainService } from "../domain/services/OrderDomainService";
import { CheckoutService } from "../services/CheckoutService";
import { DomainError } from "../domain/errors/DomainError";

const orderDomainService = new OrderDomainService();
const checkoutService = new CheckoutService();

export const checkout = async (req: AuthRequest, res: Response) => {

    try {

        const userId = req.user?.userId;

        if (!userId) {

            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        const order = await checkoutService.execute(userId);

        return res.status(201).json({

            message: "Pedido criado com sucesso",
            order,
        });

    } catch (error) {

        if (error instanceof DomainError) {

            return res.status(400).json({ error: error.message });
        }

        console.error("Checkout error:", error);
        return res.status(500).json({
            error: "Erro ao finalizar checkout",
        });
    }
};

export const createOrder = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.userId)
            return res.status(401).json({ error: "Usuário não autenticado" });
        const { items, total } = req.body;

        const newOrder = new Order({
            userId: req.user.userId,
            items,
            total,
            status: "pending",
        });
        await newOrder.save();
        res.status(201).json({
            message: "Pedido criado com sucesso!",
            order: newOrder,
        });
    } catch (error) {
        res.status(500).json({ error: "Erro ao criar pedido" });
    }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.userId)
            return res.status(401).json({ error: "Usuário não autenticado" });
        const orders = await Order.find({ userId: req.user.userId });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: "Erro ao listar pedidos" });
    }
};

export const getAllOrders = async (req: AuthRequest, res: Response) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: "Erro ao listar todos os pedidos" });
    }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true },
        );

        if (!updatedOrder)
            return res.status(404).json({ error: "Pedido não encontrado" });

        res.json({
            message: "Status atualizado com sucesso!",
            order: updatedOrder,
        });
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar pedido" });
    }
};