import mongoose from "mongoose";
import { config } from "dotenv";
import app from "./app";

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
