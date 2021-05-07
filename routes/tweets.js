const express = require("express");
const router = express.Router();
const Tweet = require("../models/tweet");
const User = require("../models/user");
const UNAUTHENTICATED_MESSAGE =
  "You must be logged in to compconste this action";

router.get("/", (req, res) => {
  // List all of the logged in user's tweets
  console.log(req.isAuthenticated());
  if (req.isAuthenticated()) {
    Tweet.find({ creator: req.user._id })
      .populate('creator')
      .populate('liked')
      .then((results, errors) => {
        res.send(results);
      });
  } else {
    res.send(UNAUTHENTICATED_MESSAGE);
  }
});

router.post("/", async (req, res) => {
  // Create a new tweet
  if (req.isAuthenticated()) {
    const text = req.body.text;
    const created = Date.now();
    const updated = created;
    const tags = [];
    const creator = req.user._id;
    // Grab the hashtags from the text of the post.
    const grabHashTags = new RegExp("#[A-z]+", "g"); //Global flag so that it can continue after the first match
    let wordToAdd;
    do {
      wordToAdd = grabHashTags.exec(text);
      if (wordToAdd) {
        // Notes: The first element of the array will be the word that we are adding
        // We also need to keep the words lowercase so that we can later search through them
        // Otherwise we would need to shift cases, or oftentimes just miss out on results.
        tags.push(wordToAdd[0].toLowerCase());
      }
    } while (wordToAdd);
    //Create the tweet using the shorthand operator to save a bit of typing.
    try {
      const t = await Tweet.create({
        text,
        created,
        updated,
        tags,
        creator,
      });
      res.send(t);
    } catch (error) {}
  } else {
    res.send(UNAUTHENTICATED_MESSAGE);
  }
});

router.get("/feed", (req, res) => {
  // View the most recent tweets from people the logged in user if following.

  //Find tweets created by people you are following, softed by newest first
  // We cant just use req.user.following because if you follow somebody during a session
  // They will not be in the array, so we need to find the user first.
  if (req.isAuthenticated()) {
    User.findById(req.user._id)
      .then((user) => {
        const following = user.following; //Array
        Tweet.find({ $and: [
          { creator: following },
          { creator: req.user._id}
        ]})
          .sort({ created: -1 })
          .then((result) => {
            res.send(result);
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Unable to load your feed");
      });
  } else {
    res.status(401).send(UNAUTHENTICATED_MESSAGE);
  }
});

router.get("/tag/:tag", (req, res) => {
  // Search for tweets with a given tag, note that you must leave out the hashtag.

  const searchTag = String("#" + req.params.tag);

  console.log(searchTag);
  Tweet.find({ tags: searchTag })
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      res.send("Unable to compconste search");
    });
});

router.get("/:userID", (req, res) => {
  const userID = req.params.userID;
  Tweet.find({ creator: userID })
    .then((results, errors) => {
      console.log(results);
      if (!results || errors) {
        res.send("Unable to find matching tweets");
        console.log(`Errors when finding tweets for ${userID} :: ${errors}`);
      } else {
        res.send(results);
      }
    })
    .catch((error) => {
      console.log("Error performing search " + error);
      res.send("Unable to find any results");
    });
});

// Like route done
router.post("/like/:id", (req, res) => {
  Tweet.like(req.user._id, req.params.id, (err, tweet) => {
    console.log(err, tweet);
    if (!tweet || err) {
      return res.status(500).send({ message: err || "Unable to like" });
    }
    return res.send(tweet);
  });
});

// Unlike route done
router.post("/unlike/:id", (req, res) => {
  Tweet.unlike(req.user._id, req.params.id, (err, tweet) => {
    console.log(err);
    if (!tweet || err) {
      return res.status(500).send({ message: err || "Unable to unlike" });
    }
    return res.send(tweet);
  });
});

module.exports = router;
