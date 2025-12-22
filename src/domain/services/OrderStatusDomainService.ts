import { DomainError } from "../errors/DomainError"

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
            throw new DomainError(
                `Invalid status transition from ${currentStatus} to ${newStatus}`
            )
        }
    }

    validatePermission(
        actorRole: "admin" | "user",
        currentStatus: string,
        newStatus: string
    ) {
        if (actorRole !== "admin") {
            throw new DomainError("Only admin can change order status")
        }
    }
}
