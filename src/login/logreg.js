import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import path from "path"; // Configura il percorso per i file statici
import dotenv from "dotenv";
import User from "./user.js"; 
import cors from "cors";
import jwt from "jsonwebtoken";

dotenv.config();
const JWT_SECRET='tuasecretkey'; // Chiave segreta per la generazione del token JWT
const logrouter = express.Router();

logrouter.use(cors());
logrouter.use(express.json())

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


// Route di Login
logrouter.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Credenziali non valide" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: "Credenziali non valide" });
        }

        // Log dei dati utente
        console.log("Utente trovato:", user);

        // Verifica la presenza della variabile JWT_SECRET
        console.log("JWT_SECRET:", JWT_SECRET);  // Log per verificare la presenza della variabile d'ambiente

        // Genera il token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,  // Usa la variabile d'ambiente JWT_SECRET
            { expiresIn: '1h' }
        );

        // Log del token generato
        console.log("Token generato:", token);

        res.status(200).json({ token });

    } catch (error) {
        console.error("Errore durante il login:", error);
        res.status(500).json({ message: "Errore durante il login", error: error.message });
    }
});


logrouter.get('/api/home', (req, res) => {
    if (req.session.userId) {
        res.send("Login effettuato con successo! Benvenuto nel gioco di backgammon!");
    } else {
        res.redirect("/login"); // Reindirizza alla pagina di login se non loggato
    }
});

//route per giocare come account ospite
logrouter.post('/api/guest-login', async(req, res) => {
   
    try{
        const guestUsername =  `guest_${Date.now()}`;
        //creo account ospite nel database
        const guestUser = new User({
            username: guestUsername,
            email: `${guestUsername}@guest.com`,
            password: await bcrypt.hash("guest", 10),
            friends: [],
            gameInvites: []
        });
        await guestUser.save();
        //l'ID ospite viene memorizzato nella sessione
        req.session.userId = guestUser._id;
       
        res.json({success: true, message:`Benvenuto ospite ${guestUsername}!`, guestUsername});
    } catch (error){
        console.error("Errore durante la creazione dell'utente ospite:", error);
        res.status(500).json({success: false, message: "Errore durante la creazione dll'account ospite", error });
    }
});

// Route di Logout
logrouter.post('/logout', async (req, res) => {
    try{
        if (req.session.userId) {
            const user = await User.findById(req.session.userId);

            // Elimina l'account ospite se presente
            if (user && user.username.startsWith("guest_")) {
                await User.findByIdAndDelete(req.session.userId);
            }

    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Errore nel logout" });
        }
        res.clearCookie("connect.sid"); // Pulisce il cookie di sessione
        res.json({ message: "Logout effettuato con successo" });
    });
} else {
    res.status(400).json({message:"Nessuna sessione trovata per il logout"});
}
} catch (error) {
    res.status(500).json({ message: "Errore durante il logout", error });
}
});




// Route di registrazione
logrouter.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.json({ message: "Registrazione completata!" });
    } catch (error) {
        res.status(500).json({ message: "Errore nella registrazione" });
    }
});


export default logrouter;