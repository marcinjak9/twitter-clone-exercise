const express = require('express');
const router = express.Router();
const User = require('../models/user');
const _ = require('lodash')
const UNAUTHENTICATED_MESSAGE =  "You must be logged in to compconste this action"

// const mig = () => {
//     User.find((err, users) => {
//         users.map((u) => {
//             User.findOne({ _id: u.id }, (err, user) => {
//                 user.followers = []
//                 user.following = []
//                 user.save()
//             })
//         })
//     })
// }

// mig()


router.get('/', (req, res) => {
    User.find((err, users) => {
        return res.send(users)
    })
})

router.get('/profile', (req, res) => {
    console.log(req.user._id)
    User.findOne({ _id: req.user._id}, (err, user) => {
        if (err) {
            return res.status(400)
        }
        return res.send(user)
    })
})

router.get('/:id', (req, res) => {
    User.findOne({ _id: req.params.id }, (err, user) => {
        if (!user) {
            return res.status(400).send({ message: 'no user with this ID' })
        }
        return res.send(user)
    })
})
router.put('/profile', (req, res) => {
    User.findOne({ _id: req.user._id}, (err, user) => {
        const { name, bio, avatar } = req.body;
        if (name) {
            user.name = name
        }
        if (bio) {
            user.bio = bio
        }
        if (avatar) {
            user.avatar = avatar
        }
        user.save()
        return res.send(user)
    })
})

router.post('/follow/:id', (req, res) => {
    // Follow a new user
    // const userToFollow = req.body.user_to_follow
    User.follow(req.user._id, req.params.id, (err, user) => {
        if(!user || err) {
            res.status(500).send({ message: err })
        }
        else {
            res.send({ message: "Followed"});
        }
    });
})

router.post('/unfollow/:id', (req, res) => {
    // Follow a new user
    // const userToFollow = req.body.user_to_follow
    User.unfollow(req.user._id, req.params.id, (err, user) => {
        if(!user || err) {
            res.status(500).send({ message: err })
        }
        else {
            res.send({ message: "Unfollowed"});
        }
    });
})


module.exports = router
