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
      const created_on = Date.now().toLocaleString();
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
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
            const collection = db.collection(board);
              collection.find({},{reported:0, delete_password:0})
                .sort({bumped_on: -1})
                .limit(10)
                .toArray(function(err, docs) {
                  if(err) console.log(err);
                  console.log('get ',docs); 

                  const result = docs.map(doc => {
                    //console.log(doc.replies);
                    let count = doc.replies.length;
                    if(count > 0){
                      if(count > 3) count = 3;
                      for(let i=0;i<count;i++){
                         doc.replies[i] = {_id: doc.replies[i]._id, text: doc.replies[i].text, created_on: doc.replies[i].created_on};
                      }
                    }
                    return doc;
                  });
                           
                  console.log(result);
                  res.json(result)
                })
      })
    })
  
    .delete(function (req,res){
    //   I can delete a thread completely if I send a DELETE request to /api/threads/{board} 
    // and pass along the thread_id & delete_password. (Text response will be 'incorrect password' or 'success')   
    console.log('start delete'); 
      const board = req.params.board;
      
      const thread_id = req.query.thread_id;
      const delete_password = req.query.delete_password;
    
      console.log('req.query ',req.query);
      console.log('thread_id ',thread_id);
      console.log('delete_password pass ',delete_password);
    
    
//       MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
//         const collection = db.collection(board);
//         collection.findOne({_id: thread_id},function(err, doc) {
//               console.log('doc ',doc);
//               console.log('input pass ',delete_password);
//               if (err) {res.send('Cannot find id') }
//               else if(doc.delete_password === delete_password) {
//                   //collection.remove();
//                   res.send('success');
//               } else {
//                 res.send('incorrect password');
//               }
              
//               db.close();
//         });
      // });
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
      const bumped_on = Date.now().toLocaleString();
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        const collection = db.collection(board);
        const date= Date.now();
        collection.findAndModify(
          {_id:new ObjectId(thread_id)},
          [['_id',1]],
          {$push: {replies:{
                      _id:ObjectId(),
                      text:text,
                      delete_password:delete_password,
                      created_on:date,
                      reported:false
                  }}},
          {$set: {bumped_on:date}},
          {new: true},
          function(err,doc){
            (!err) ? res.redirect('/b/'+board+'/'+thread_id)  : res.send('could not add reply ' + err);
          }
        );
        db.close();
      });
      
  })
  
  .get(function (req,res){ 
   // I can GET an entire thread with all it's replies from /api/replies/{board}?thread_id={thread_id}. 
   //  Also hiding the same fields.
      const board = req.params.board;
      const thread_id = req.query.thread_id;
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
            const collection = db.collection(board);
              collection.find({thread_id: thread_id},{reported:0, delete_password:0})
                .sort({bumped_on: -1})
                .toArray(function(err, docs) {
                  if(err) console.log(err);
                  const result = docs.map(doc => {
                    //console.log(doc.replies);
                    let count = doc.replies.length;
                    if(count > 0){
                      for(let i=0;i<count;i++){
                         doc.replies[i] = {_id: doc.replies[i]._id, text: doc.replies[i].text, created_on: doc.replies[i].created_on};
                      }
                    }
                    return doc;
                  });                     
                  console.log(result);
                  res.json(result)
                })
      })
    })
    
  

};
