const express = require('express');
const plaid = require('plaid');
const router = express.Router();
const passport = require('passport');
const moment = require('moment');
const mongoose = require('mongoose');

const Account  = require('../../models/Account');
const User = require('../../models/User');

const PLAID_CLIENT_ID = "5d6c3a9471c7d10013aeaabe";
const PLAID_SECRET = "59d38b68e7077ebf6959c32e46a68c";
const PLAID_PUBLIC_KEY = "cc3f3e20d85766f0b9eacb1928d48f";

const client = new plaid.Client(
    PLAID_CLIENT_ID,
    PLAID_SECRET,
    PLAID_PUBLIC_KEY,
    { version: "2019-09-01"}
);

var PUBLIC_TOKEN = null;
var ACCESS_TOKEN = null;
var ITEM_ID = null;

//Routes

//trade public token for access token and store credentials in db
//@route post
//@acess private
router.post("/account/add", passport.authenticate("jwt", { session: false }),
            (req, res) => {
                PUBLIC_TOKEN = req.body.public_token;
                const userId = req.user.id;
                const institution = req.body.metadata.institution;
                const { name, institution_id } = institution;

                if(PUBLIC_TOKEN) {
                    client
                        .exchangePublicToken(PUBLIC_TOKEN)
                        .then(exchangeResponse => {
                            ACCESS_TOKEN = exchangeResponse.access_token;
                            ITEM_ID = exchangeResponse.item_id;

                            //validation for user exists
                            Account.findOne({
                                userId: userId,
                                institution_id: institution_id,
                            })
                            .then(account => {
                                if(account) {
                                    console.log("Account already exists");
                                } else {
                                    const newAccount = new Account({
                                        userId: userId,
                                        accessToken: ACCESS_TOKEN,
                                        itemId: ITEM_ID,
                                        institutionId: institution_id,
                                        institutionName: name
                                    });
                                    newAccount.save().then(account => res.json(account));
                                }
                            })
                            .catch(err => console.log(err));
                        })
                        .catch(err => console.log(err));

                }
            }
);

//@route DELETE
//@Desc Delete account with given id
//@access private
router.delete("/accounts/:id", passport.authenticate("jwt", { session: false }),
              (req, res) => {
                  Account.findById(req.params.id).then(account => {
                      account.remove().then(() => res.json({ success: true }));
                  });
              }
)

module.exports = router;

