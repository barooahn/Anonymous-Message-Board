/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .post(function (req, res){
  // I can POST a thread to a specific message board by passing form data text and 
  // delete_password to /api/threads/{board}.(Recomend res.redirect to board page /b/{board}) 
  // Saved will be _id, text, created_on(date&time), bumped_on(date&time, starts same as created_on), 
  // reported(boolean), delete_password, & replies(array).
      const board = req.body.board;
      const text = req.body.text;
      const delete_password = req.body.delete_password;
      const created_on = Date.now();
      const bumped_on = created_on;
      const reported = false;
      const replies =[];
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        const collection = db.collection(board);
        collection.insertOne({
          text: text, 
          delete_password:delete_password,
          created_on:created_on,
          bumped_on:bumped_on,
          reported:reported,
          replies:replies     
        },function(err,doc){
          //doc._id = doc.insertedId;
          res.redirect('/b/'+board);
        });
        db.close();
      });
       
  })
  
    .get(function (req,res){ 
    // I can GET an array of the most recent 10 bumped threads on the board with only the most recent 3 replies 
    // from /api/threads/{board}. The reported and delete_passwords fields will not be sent.
    const board = req.params.board;
    })
    
    
  app.route('/api/replies/:board')
  
  .post(function (req, res){
// I can POST a reply to a thead on a specific board by passing form data text, delete_password, 
// & thread_id to /api/replies/{board} and it will also update the bumped_on date to the 
// comments date.(Recomend res.redirect to thread page /b/{board}/{thread_id}) In the thread's 
// 'replies' array will be saved _id, text, created_on, delete_password, & reported.
      const board = req.params.board;
      const text = req.body.text;
      const delete_password = req.body.delete_password;
      const thread_id  = req.body.thread_id;
      const bumped_on = Date.now();
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        const collection = db.collection(board);
        collection.findAndModify(
          {_id:new ObjectId(thread_id)},
          [['_id',1]],
          {$push: {replies:{
                      _id:thread_id,
                      text:text,
                      delete_password:delete_password,
                      created_on:Date.now(),
                      reported:false
                  }}},
          {$set: {bumped_on:bumped_on}},
          {new: true},
          function(err,doc){
            (!err) ? res.redirect('/b/'+board+'/'+thread_id)  : res.send('could not add reply ' + err);
          }
        );
        db.close();
      });
      
  });
  

};
