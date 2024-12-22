import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    friends: [{  type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    friendsRequest: [ 
        {
            from:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
            status:{ type: String, enum:['attesa', 'accettata', 'rifiutata'], default:'attesa'}
        }
    ],
    gameInvites: [
        {
            from: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
            status: { type: String, enum: ['attesa', 'accettata', 'rifiutata'], default: 'attesa' }
        }
    ]
});

const User = mongoose.model('User', userSchema);

export default User;
