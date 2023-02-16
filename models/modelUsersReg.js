const mongoose = require('mongoose');

const modelVarUserReg = new mongoose.Schema({
    modelUsername:{
        type: String,
        unique: true,
        required: [true, 'Username cannot be blank']
    },
    modelEmail:{
        type: String,
        unique: true,
        required: [true, 'email cannot be blank']
    },
    modelPassword:{
        type: String,
        required: [true, 'password cannot be blank']
    }
})

// Name of this model is defined to be 'User' and not modelVarUserReg
// User must be used as an instance while importing in server.js file as well as while peforming DB functions

//ColUsers - name of the collection in the DB
module.exports = mongoose.model('ColUsers', modelVarUserReg);

