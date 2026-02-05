const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const usserSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true,
            trim: true
        },
        email:{
            type: String,
            required: true,
            unique: true,
        },
        password:{
            type: String,
            required: true,
            minlength: 6,
            select: false
        }
    }
);

