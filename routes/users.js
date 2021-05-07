const express = require('express');
const router = express.Router();
const User = require('../models/user');
const UNAUTHENTICATED_MESSAGE =  "You must be logged in to compconste this action"

router.get('/', (req, res) => {
    User.find((err, users) => {
        return res.send(users)
    })
})

router.post('/follow/:id', (req, res) => {

    // Follow a new user
    // const userToFollow = req.body.user_to_follow
    User.follow(req.user._id, req.params.id, (err, user) => {
        if(!user || err) {
        res.status(500).send({ message: "Unable to follow" })
        }
        else {
            res.send({ message: "Followed" });
        }
    });
})``


module.exports = router
