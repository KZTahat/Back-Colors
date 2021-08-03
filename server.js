'use strict';

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const utilities = require('./Modules');
const { default: axios } = require('axios');

const server = express();
require('dotenv').config();
server.use(cors());
server.use(express.json());
const PORT = process.env.PORT;

mongoose.connect(`${process.env.mongodb}`,{ useNewUrlParser: true, useUnifiedTopology: true });

// Proof of life
server.get('/', (req,res) => {
    res.send('All Good');
})

// get data from API
server.get('/apidata', getAPIdata);
function getAPIdata(req, res){
    utilities.colorModel.find((error, data) => {
        if(error){
            console.log('ERROR FINDING DATA');
        }else{
            if(data.length !== 0){
                console.log('getting from database');
                res.send(data);
            }else{
                axios.get(`https://ltuc-asac-api.herokuapp.com/allColorData`).then(foundData => {
                    const database = foundData.data.map(element => {
                        const {title, imageUrl} = element;
                        let newModel = new utilities.colorModel({
                            title: title,
                            imageUrl: imageUrl,
                        });
                        newModel.save();
                        return newModel;
                    })
                    res.send(database);
                    })
            }
        }
    })
    
}

// add to fav
server.post('/addtofav', addToFav);
function addToFav(req,res){
    const {title, email} = req.query;
    console.log(title, email);
    utilities.colorModel.findOne({title: title}, (error, foundData) => {
        if(error){
            console.log('ERROR FINDING DATA LINE 56', error);
        }else{
            utilities.favModel.findOne({email: email}, (error, data) => {
                if(error){
                    console.log('ERROR FINDING DATA LINE 60', error);
                }else{
                    if(data == null){
                        new utilities.favModel({
                            email: email,
                            colors: foundData,
                        }).save();
                        res.send(data);
                    }else{
                        data.colors.push(foundData);
                        data.save();
                        res.send(data);
                    }
                }
            })
        }
    })
}

// get favoraite data
server.get('/getfavs', getFavData);
function getFavData(req, res){
    const {email} = req.query;
    utilities.favModel.findOne({email: email}, (error, data) => {
        if(error){
            console.log('ERROR FINDING DATA', error);
        }else{
            if (data !== null) {
                res.send(data.colors);
            }else{
                res.send([]);
            }
        }
    } )
}

// delete from favoraite
server.delete('/deletecolor/:id', deleteFavColor);
function deleteFavColor(req, res){
    const id = Number(req.params.id);
    const {email} = req.query;
    utilities.favModel.findOne({email: email}, (error, foundData) => {
        if(error){
            console.log('ERROR FINDIND DATA LINE 101');
        }else{
            const newFav = foundData.colors.filter((element, index) => {
                if(index !== id){
                    return element;
                }
            })
            foundData.colors = newFav;
            foundData.save();
            res.send(newFav);
        }
    })
}

// update Color
server.post('/updatecolor', updateColor);
function updateColor(req, res){
    const {title, imageUrl, index, email} = req.body;
    utilities.favModel.findOne({email: email}, (error, foundData) => {
        if(error){
            console.log('ERROR FINDING DATA LINE 121');
        }else{
            let newColors = foundData.colors.map((element, index) => {
                if(index == index){
                    element.title = title;
                    element.imageUrl = imageUrl;
                }
                return element;
            })
            foundData.colors = newColors;
            foundData.save();
            res.send(newColors)
        }
    })
}

// Listening On PORT 3004
server.listen(PORT, () => {
    console.log('Listning On Port', PORT);
})