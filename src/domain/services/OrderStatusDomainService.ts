import { InvalidStatusTransactionError } from "../errors/InvalidStatusTransactionError"
import { OnlyAdminCanChangeOrderStatusError } from "../errors/OnlyAdminCanChangeOrderStatusError"

const allowedTransitions: Record<string, string[]> = {
    pending: ["paid"],
    paid: ["shipped"],
    shipped: ["delivered"],
}

export class OrderStatusDomainService {

    validateTransition(
        currentStatus: string,
        newStatus: string
    ) {
        const allowed = allowedTransitions[currentStatus] || []

        if (!allowed.includes(newStatus)) {
            throw new InvalidStatusTransactionError(
                'INVALID_STATUS_TRANSACTION', `Invalid status transition from ${currentStatus} to ${newStatus}`
            )
        }
    }

    validatePermission(
        actorRole: "admin" | "user",
        currentStatus: string,
        newStatus: string
    ) {
        if (actorRole !== "admin") {
            throw new OnlyAdminCanChangeOrderStatusError("ONLY_ADMIN_CAN_CHANGE_ORDER_STATUS", "Only admin can change order status")
        }
    }
}
