import mongoose ,{Schema} from "mongoose";

const userSchema = new Schema({
    username: {
        name: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
        index: true
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
    },
    
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },

    avatar: {
        type: String, //URL
        required: true

    },

    coverImage: {
        type: String, //URL

    },

    watchHistory : [{
        type: Schema.Types.ObjectId,
        ref: "Video"
    }],


    password: {
        type: String,
        required: [true, "Password is required"]
    },

    refreshToken : {
        type: String
    }

},
{
    timestamps: true
})


export const User = mongoose.model("User", userSchema)