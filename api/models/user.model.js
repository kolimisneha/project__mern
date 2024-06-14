import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique :true,

    },
    email:{
        type:String,
        required:true,
        unique :true,

    },

    password: {
        type:String,
        required:true,

    },
      avatar:{
        type:String,
        default:"https://www.pngall.com/wp-content/uploads/5/Profile.png"
},
createdAt: {
    type: Date,
    default: Date.now,
},
// updatedAt: {
//     type: Date,
//     default: Date.now,
// },
},
    {
        timestamps :true });

const User =mongoose.model('User', userSchema);
export default User;