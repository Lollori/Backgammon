import express from "express";
import User from "./user.js"; 
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

const friendrouter = express.Router();
friendrouter.use(cors());
friendrouter.use(express.json())

// MongoDB connection
const mongoUri = `mongodb+srv://thomasbernardi2:YFaUnIw0VI2calIJ@backgammon.rguuk.mongodb.net/backgammon?retryWrites=true&w=majority&authSource=admin`;


mongoose.connect(mongoUri, {

})
  .then(() => {
    console.log('Connected to MongoDB, logsign');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });



//Route per ottenere la lista di amici
friendrouter.get("/api/amici", async (req,res) => {
    const {userID} = req.query;
    try{
        const user = await User.findById(userID).populate("friends", "username");
        if(!user){
            return res.status(404).json({message:"Utente non trovato"});
        }
        res.json(user.friends);//restituisce lista degli amici
    } catch(error){
        res.status(500).json({message: "Errore nella lista degli amici", error});
    }
});

//route per ottenere la lista di richieste di amicizia
friendrouter.get("/api/users/:userID/friend-requests", async (req, res) => {
    const { userID } = req.params; // Estrai userID dal parametro di route
    
    try{
        const user = await User.findById(userID)
        .populate('friendsRequest.from', 'username email') // Popola i dettagli dell'utente che ha inviato la richiesta
        .select('friendsRequest'); // Seleziona solo la proprietà friendsRequest

        if(!user) return res.status(404).json({message:"Utente non trovato"});

        res.status(200).json({userId, friendRequests: user.friendsRequest}); // Risposta con le richieste di amicizia

    } catch(error){
        res.status(500).json({message: "Errore nella lista delle richieste di amicizia", error});
    }
  });

//Route per inviare richiesta amicizia
friendrouter.post("/api/aggiungi-amici", async(req, res) => {
    const {userID, friendName} = req.body;

    try{
        //troviamo utente nel database
        const frined = await User.findOne({ username: friendName });
        if (!frined){
            return res.status(404).json({message: "User non trovato"});
        }

        //arriva la richiesta di amicizia al destinatario
        const request = {from: userID, status: "attesa"};
        await User.findByIdAndUpdate(frined._id, {$push: { friendsRequest: request}});

        res.json({message: "Richiesta di amicizia inviata!"});
    } catch (error) {
        res.status(500).json({message: "Impossibile inviare la richiesta di amicizia", error});
    }
});

friendrouter.post("/api/rispondi-amicizia", async (req,res) => {
    const {userID, requestID, risposta} = req.body;

    const rispostaValida = ["accettata", "rifiutata"];
    if (!rispostaValida.includes(risposta)) {
        return res.status(400).json({message: "Risposta non valida"});
    }
    try{
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ message: "User non trovato" });
        }

        const request = user.friendsRequest.id(requestID);
        if (!request) {
            return res.status(404).json({ message: "Richiesta non trovata." });
        }

        request.status = risposta;


        if (risposta == "accettata"){
            //i 2 user diventano amici
            await User.findByIdAndUpdate(userID, { $addToSet: { friends: request.from } });
            await User.findByIdAndUpdate(request.from, { $addToSet: { friends: userID } });
            await user.save();
            return res.json({message:"Ora siete amici!"})
        } else if (risposta === "rifiutata") {
            //lo stato della richiesta diventa "rifiutata"
            await user.save();
            return res.json({message :"L'utente ha rifiutato l'amicizia"});
        }
    }catch (error){
        res.status(500).json({ message: "Errore durante la richiesta dell'amicizia", error });
    }
});

module.exports = friendrouter;