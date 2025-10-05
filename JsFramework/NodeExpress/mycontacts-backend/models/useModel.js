const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please add the username"],
        unique: true,
    },
    email: {
        type: String,
        required: [true, "Please add the email address"],
        unique: [true,"Email address already exists"],
    },
    password: {
        type: String,
        required: [true, "Please add the password"],
    },
}, {
    timestamps: true,
});

const User = mongoose.model("User", userSchema);
module.exports = User;
