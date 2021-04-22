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
    name: {
        type: String,
        default: ''
    },
    // followersCount: {
    //     type: Number,
    //     default: 0
    // },
    // followingCount: {
    //     type: Number,
    //     default: 0
    // },
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    // likes: [{ type: Schema.Types.ObjectId, ref: 'Tweet' }],
})

// UserSchema.statics.findOrCreate = function(googleID, familyName, firstName, callback){
//     //Determine if the account exists, if not create it.
//     this.findOne({googleID: googleID})
//     .then((user) => {
//         if (!user ){
//             // If the result is null create a new user
//             this.create({
//                 name: firstName + " " + familyName,
//                 email: null, 
//                 googleID: googleID
//             })
//             .then((user) => {
//                 callback(null, user);
//             })
//         } else if (user) {
//             // If the user does exist return it to the callback
//             callback(null, user);
//         }
//     }) 
//     .catch((err) => {
//         callback(err, null);
//     })
// } 

UserSchema.statics.follow = function(userAddingID, userToAddID, callback){
    this.findOne({_id : userAddingID})
    .then((userAdding) => {
        console.log(userAdding, userToAddID)
        userAdding.following.push(userToAddID);
        // user.save();
        this.findOne({_id : userToAddID})
            .then((userToAdd) => {
                userToAdd.followers.push(userAddingID)
                userAdding.save()
                // userToAdd.save()
                callback(null, userToAdd)
            })
            .catch((e) => console.log(e))
        // .then(user => {
        //     user.followers.push(userAddingID);
        //     user.save();
        //     callback(null, user)
        // })
        // .catch(e => console.log(e))
    })
    // .then(() => {
    //     this.findOne({_id : userToAddID})
    //     .then(user => {
    //         user.followers.push(userAddingID);
    //         user.save();
    //         callback(null, user)
    //     })
    // })
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