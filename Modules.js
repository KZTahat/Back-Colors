'use strict';
const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
    title: String,
    imageUrl: String,
})

const favSchema = new mongoose.Schema({
    email: String,
    colors: [colorSchema],
})

const colorModel = mongoose.model('color', colorSchema);
const favModel = mongoose.model('fav', favSchema);

const utilities = {colorModel, favModel};

module.exports = utilities;