const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;
const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    avatar: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        default: ''
    },
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
})

UserSchema.statics.follow = function(userAddingID, userToAddID, callback){
    this.findOne({_id : userAddingID})
    .then((userAdding) => {
        // user.save();
        this.findOne({_id : userToAddID})
            .then((userToAdd) => {
                if (userAdding.following.includes(userToAddID) && userToAdd.followers.includes(userAddingID)) {
                    return callback('already following')
                }
                userAdding.following.push(userToAddID);
                userToAdd.followers.push(userAddingID)
                userAdding.save()
                userToAdd.save()
                callback(null, userToAdd)
            })
            .catch((e) => callback(e))
    })
    .catch(error => callback(error, null))
}

UserSchema.statics.unfollow = function(userAddingID, userToAddID, callback){
    this.findOne({_id : userAddingID})
    .then((userAdding) => {
        this.findOne({_id : userToAddID})
            .then((userToAdd) => {
                if (userAdding.following.includes(userToAddID) && userToAdd.followers.includes(userAddingID)) {
                    userAdding.following = userAdding.following.filter((f) => f.toString() !== userToAddID);
                    userToAdd.followers = userToAdd.followers.filter((f) => f.toString() !== userAddingID)
                    console.log(userAdding)
                    console.log(userToAdd)
                    userAdding.save()
                    userToAdd.save()
                    return callback(null, userToAdd)
                }
                callback('You are not following this user')
            })
            .catch((e) => callback(e))
    })
    .catch(error => callback(error, null))
}

UserSchema.virtual('followersCount').get(function () {
    return this.followers.length
});

UserSchema.virtual('followingCount').get(function () {
    return this.following.length
});

UserSchema.methods.isValidPassword = async function(password) {
    const user = this;
    const u = await User.findOne({ _id: user._id }).select('+password')
    console.log(u)
    console.log(password)
    const compare = await bcrypt.compare(password, u.password);
  
    return compare;
  }

UserSchema.pre(
    'save',
    async function(next) {
        if (!this.isModified("password")) {
            // Finish here
            return next();
        }
        const user = this;
        const hash = await bcrypt.hash(this.password, 10);

        this.password = hash;
        next();
    }
);
  
UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', UserSchema);
module.exports = User;