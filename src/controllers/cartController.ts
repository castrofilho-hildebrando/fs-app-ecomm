import { Request, Response } from "express";

import { makeGetCartUseCase } from "../infra/factories/getCartFactory";
import { makeAddItemToCartUseCase } from "../infra/factories/addItemToCartFactory";
import { makeRemoveItemFromCartUseCase } from "../infra/factories/removeItemFromCartFactory";
import { makeClearCartUseCase } from "../infra/factories/clearCartFactory";

/**
 * GET /cart
 */
export async function getCart(req: Request, res: Response) {

    try {

        const user = req.user;
        if (!user) {

            return res.status(401).json({ message: "Unauthorized" });
        }

        const useCase = makeGetCartUseCase();
        const cart = await useCase.execute({

            userId: user.id
        });

        return res.status(200).json(cart);
    } catch (error) {

        return res.status(500).json({

            message: (error as Error).message
        });
    }
}

/**
 * POST /cart/add
 */
export async function addToCart(req: Request, res: Response) {

    try {

        const user = req.user;
        if (!user) {

            return res.status(401).json({ message: "Unauthorized" });
        }

        const { productId, quantity } = req.body;

        if (!productId || typeof quantity !== "number") {

            return res.status(400).json({

                message: "productId and quantity are required"
            });
        }

        const useCase = makeAddItemToCartUseCase();
        await useCase.execute({

            userId: user.id,
            productId,
            quantity
        });

        return res.status(204).send();
    } catch (error) {

        return res.status(400).json({

            message: (error as Error).message
        });
    }
}

/**
 * POST /cart/remove
 */
export async function removeFromCart(req: Request, res: Response) {

    try {

        const user = req.user;
        if (!user) {

            return res.status(401).json({ message: "Unauthorized" });
        }

        const { productId } = req.body;

        if (!productId) {

            return res.status(400).json({

                message: "productId is required"
            });
        }

        const useCase = makeRemoveItemFromCartUseCase();
        await useCase.execute({

            userId: user.id,
            productId
        });

        return res.status(204).send();
    } catch (error) {

        return res.status(400).json({

            message: (error as Error).message
        });
    }
}

// POST /cart/clear
export async function clearCart(req: Request, res: Response) {

    if (!req.user) return res.sendStatus(401);

    const useCase = makeClearCartUseCase();
    await useCase.execute({ userId: req.user.id });

    return res.sendStatus(204);
}

