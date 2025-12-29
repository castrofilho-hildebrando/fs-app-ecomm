import { OrderWithoutItemsError } from "../errors/OrderWithoutItemsError"
import { InvalidErrorTotalError } from "../errors/InvalidErrorTotalError"
import { InvalidStatusTransactionError } from "../errors/InvalidStatusTransactionError"
import { OrderCannotBeCancelledError } from "../errors/OrderCannotBeCancelledError"

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "completed"
  | "cancelled";

export interface OrderItem {
    productId: string;
    quantity: number;
}

export class Order {

    private _status: OrderStatus

    private readonly _items: OrderItem[]

    private readonly _total: number

    constructor(

        status: OrderStatus,
        items: OrderItem[],
        total: number
    ) {

        if (items.length === 0) {

            throw new OrderWithoutItemsError("ORDER_WITHOUT_ITEMS")
        }

        if (total <= 0) {

            throw new InvalidErrorTotalError("INVALID_ORDER_TOTAL")
        }

        this._status = status
        this._items = items
        this._total = total
    }

    // =====================
    // Getters
    // =====================

    get status() {

        return this._status
    }

    get total() {

        return this._total
    }

    get items() {

        return [...this._items]
    }

    // =====================
    // Comportamentos
    // =====================

    markAsPaid() {

        if (this._status !== "pending") {

            throw new InvalidStatusTransactionError(

                "INVALID_STATUS_TRANSITION",
                `Cannot pay order in status ${this._status}`
            )
        }

        this._status = "paid"
    }

    ship() {

        if (this._status !== "paid") {

            throw new InvalidStatusTransactionError(

                "INVALID_STATUS_TRANSITION",
                `Cannot ship order in status ${this._status}`
            )
        }

        this._status = "shipped"
    }

    complete() {

        if (this._status !== "shipped") {

            throw new InvalidStatusTransactionError(

                "INVALID_STATUS_TRANSITION",
                `Cannot complete order in status ${this._status}`
            )
        }

        this._status = "completed"
    }


    cancel() {

        if (this._status === "shipped") {

            throw new OrderCannotBeCancelledError(

                "ORDER_CANNOT_BE_CANCELLED",
                "Order already shipped"
            )
        }

        this._status = "cancelled"
    }
}
