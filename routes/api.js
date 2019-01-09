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
  // I can POST a thread to a specific message board by passing form data text and 
  // delete_password to /api/threads/{board}.(Recomend res.redirect to board page /b/{board}) 
  // Saved will be _id, text, created_on(date&time), bumped_on(date&time, starts same as created_on), 
  // reported(boolean), delete_password, & replies(array).
  
  app.route('/api/threads/:board')
    .post(function (req, res){
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
          res.json(doc.ops[0]);
        });
        db.close();
      });
       
  });
    
    
  app.route('/api/replies/:board')
  
// I can POST a reply to a thead on a specific board by passing form data text, delete_password, 
// & thread_id to /api/replies/{board} and it will also update the bumped_on date to the 
// comments date.(Recomend res.redirect to thread page /b/{board}/{thread_id}) In the thread's 
// 'replies' array will be saved _id, text, created_on, delete_password, & reported.
  .post(function (req, res){
      const board = req.body.board;
      const text = req.body.text;
      const delete_password = req.body.delete_password;
      const thread_id  = req.body.thread_id;
      const bumped_on = Date.now();
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        const collection = db.collection(board);
        collection.findAndModify(
          {_id:new ObjectId(thread_id)},
          [['_id',1]],
          {$push: {comments: comment}},
          {new: true},
          function(err,doc){
            (!err) ? res.json(doc.value) : res.send('could not add comment '+ req.params.id +' '+ err);
          }  
          text: text, 
          delete_password:delete_password,
          created_on:created_on,
          bumped_on:bumped_on,
          reported:reported,
          replies:replies     
        },function(err,doc){
          //doc._id = doc.insertedId;
          res.json(doc.ops[0]);
        });
        db.close();
      });
      
  });
  

};
