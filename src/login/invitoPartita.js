import express from "express";
import User from "./user.js"; 
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

const router = express.Router();
router.use(cors());
router.use(express.json())

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

router.get("api/user/:userID/game-invites", async (req, res) => {
  const { userID } = req.params;

  try {
    const user = await User.findById(userID)
      .select("gameInvites")
      .populate("gameInvites.from", "username"); 
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }
    res.json({ invites: user.gameInvites });
  } catch (error) {
    res.status(500).json({ message: "Errore nel recupero degli inviti", error });
  }
});

  //route per inivare richiesta per una partita
  router.post("/api/invito-partita", async (req, res) => {
    const { userID, friendID } = req.body;
  
    try {
      const friend = await User.findById(friendID);
      if (!friend) {
        return res.status(404).json({ message: "Amico non trovato" });
      }
      const gameInvite = { from: userID, status: "attesa" };
      await User.findByIdAndUpdate(friendID, { $push: { gameInvites: gameInvite } });
      res.json({ message: "Richiesta di partita inviata con successo!" });
    } catch (error) {
      res.status(500).json({ message: "Errore durante l'invio della richiesta", error });
    }
  });

//Route per rispondere alla richiesta di partita
router.post("/api/rispondi-invito", async (req, res) => {
    const { userID, invitoID, risposta } = req.body;

    const rispostaValida = ["accettata", "rifiutata", "attesa"];
    //controlliamo se la risposta è valida
     if(!rispostaValida.includes(risposta)){
        return res.status(400).json({message:"Risposta non valida."});
     }

    try{
        //aggiorniamo stato invito
        await User.updateOne(
            {_id: userID, "gameInvites._id":invitoID},
            {$set:{"gameInvites.$.status": risposta}}
        );
        res.json({message: "Risposta all'invito aggiornata!"});

    } catch(error){
        res.status(500).json({message: "Errore nell'aggiornamento dell'invito", error});
    }
});

module.exports = router;