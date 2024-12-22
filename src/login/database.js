import mongoose from "mongoose";

import dotenv from "dotenv";

async function connectDB() {
    try {
        const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@backgammon.rguuk.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Database connesso con successo!");
    } catch (error) {
        console.error("Errore nella connessione al database:", error);
    }
}

export default connectDB;