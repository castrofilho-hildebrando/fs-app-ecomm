import mongoose from "mongoose";
import { config } from "dotenv";
import app from "./app";

import { EventBus } from "./domain/events/EventBus";
import { OrderCreatedEvent } from "./domain/events/OrderCreatedEvent";
import { SendOrderEmailHandler } from "./application/handlers/SendOrderEmailHandler";
import { UpdateSalesMetricsHandler } from "./application/handlers/UpdateSalesMetricsHandler";

export const eventBus = new EventBus();

eventBus.subscribe(
    OrderCreatedEvent,
    new SendOrderEmailHandler()
);

eventBus.subscribe(
    OrderCreatedEvent,
    new UpdateSalesMetricsHandler()
);

config();

const PORT = process.env.PORT || 4000;

mongoose
    .connect(process.env.MONGO_URI as string)
    .then(() => {
        console.log("Conectado ao MongoDB Atlas");
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Erro ao conectar ao MongoDB:", err);
    });
