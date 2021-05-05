const mongoose = require("mongoose");
const User = require("./user");
const Schema = mongoose.Schema;

const TweetSchema = new Schema({
  text: String,
  created: Date,
  updated: Date,
  tags: [String],
  creator: { type: Schema.Types.ObjectId, ref: "User" },
  liked: [{ type: Schema.Types.ObjectId, ref: "User" }],
  like: {
    type: Number,
    default: 0,
  },
});

TweetSchema.statics.like = function (userID, tweetID, callback) {
  this.findOne({ _id: tweetID })
    .populate('creator')
    .populate('liked')
    .then((tweet) => {
      if (tweet.liked.includes(userID)) {
        return callback('Tweet already liked')
      }
      tweet.liked.push(userID);
      tweet.like += 1;
      tweet.save();
      callback(null, tweet)
    }).catch((error) => callback(error, null));
};

TweetSchema.statics.unlike = function (userID, tweetID, callback) {
  this.findOne({ _id: tweetID })
    .populate('creator')
    .populate('liked')
    .then((tweet) => {
      if (!tweet.liked.includes(userID)) {
        return callback('You must like the post first');
      }
      tweet.liked.splice(tweet.liked.indexOf(userID), 1);
      tweet.like -= 1;
      tweet.save();
      callback(null, tweet)
    })
    .catch((error) => callback(error, null));
};

const Tweet = mongoose.model("Tweet", TweetSchema);
module.exports = Tweet;
