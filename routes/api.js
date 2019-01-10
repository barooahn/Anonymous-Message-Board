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
      const board = req.params.board;
      const post = {
        text:req.body.text,
        delete_password: req.body.delete_password,
        created_on: new Date(),
        bumped_on: new Date(),
        reported: false,
        replies: []
      };
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        const collection = db.collection(board);
        collection.insertOne(post,function(err,doc){
           res.redirect('/b/'+board+'/');
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
      
      const thread_id = req.body.thread_id;
      if(!ObjectId.isValid(thread_id)){return res.send('invalid thread id')}
      const delete_password = req.body.delete_password; 
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        const collection = db.collection(board);
        collection.findOne({_id: new ObjectId(thread_id)},function(err, doc) {
              if (err) {res.send('Cannot find id') }
              else if(doc.delete_password === delete_password) {
                  collection.remove();
                  res.send('success');
              } 
              else {
                res.send('incorrect password');
              }
              
              db.close();
        });
      });
    })
  
    .put(function (req,res){
      // I can report a thread and change it's reported value to true by sending a 
      // PUT request to /api/threads/{board} and pass along the thread_id. 
      // (Text response will be 'success')    
      const board = req.params.board;
      const thread_id = req.body.thread_id;
      if(!ObjectId.isValid(thread_id)){return res.send('invalid thread id')}
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
          const collection = db.collection(board);
          collection.findAndModify(
            {_id : new ObjectId(thread_id)},
            [],
            {$set: {reported : true}}, 
            function(err, doc) {
              if(err) { res.send('database error: ' +err)}
              else if(doc.lastErrorObject.updatedExisting == false) {
                res.send('incorrect id');} 
              else {          
                res.send('success');
              }
            }
          ) 
    })
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
      if(!ObjectId.isValid(thread_id)){return res.send('invalid thread id')}
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        const collection = db.collection(board);
        const date = new Date();
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
            (!err) ? res.redirect('/b/'+board+'/'+thread_id+'/')  : res.send('could not add reply ' + err);
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
      if(!ObjectId.isValid(thread_id)){return res.send('invalid thread id')}
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
            const collection = db.collection(board);
              collection.find({_id: new ObjectId(thread_id)},{reported:0, delete_password:0})
                .sort({bumped_on: -1})
                .toArray(function(err, docs) {
                  if(err) console.log(err);
                  const result = docs.map(doc => {
                    console.log(doc.replies);
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
    
  .delete(function (req,res){
    //   I can delete a post(just changing the text to '[deleted]') if I send a DELETE request to /api/replies/{board} 
    //and pass along the thread_id, reply_id, & delete_password. (Text response will be 'incorrect password' or 'success')
      const board = req.params.board;
      
      const thread_id = req.body.thread_id;
      if(!ObjectId.isValid(thread_id)){return res.send('invalid thread id')}
      const reply_id = req.body.reply_id; 
      if(!ObjectId.isValid(reply_id)){return res.send('invalid reply id')}
      const delete_password = req.body.delete_password; 
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        const collection = db.collection(board); 
        collection.findAndModify(
        {
          _id: new ObjectId(thread_id),
          replies: { $elemMatch: { _id: new ObjectId(reply_id), delete_password: delete_password } },
        },
        [],
        { $set: { "replies.$.text": "[deleted]" } },
        function(err, doc) {
            console.log(doc);
            if(err) { res.send('Database error ' + err) } 
            else if(doc.lastErrorObject.updatedExisting == false) {
                res.send('incorrect password')
            } else {          
            res.send('success');
            }
          }  
        );
        db.close();
      })
    })
  
  .put(function(req,res) {
  //   I can report a reply and change it's reported value to true by sending a PUT request 
  //   to /api/replies/{board} and pass along the thread_id & reply_id. 
  //   (Text response will be 'success')
    
    const board = req.params.board;
    const thread_id = req.body.thread_id;
    if(!ObjectId.isValid(thread_id)){return res.send('invalid thread id')}
    const reply_id = req.body.reply_id; 
    if(!ObjectId.isValid(reply_id)){return res.send('invalid reply id')}
    
    MongoClient.connect(MONGODB_CONNECTION_STRING, function(err,db) {
      const collection = db.collection(board);
      collection.findAndModify(
          {  _id : new ObjectId(thread_id),
            replies: { $elemMatch: { _id: new ObjectId(reply_id)}}
          },
          [],
          {$set: {"replies.$.reported": true }},
          function(err,doc){
            if(err) { res.send('database error: ' +err)}
            else if(doc.lastErrorObject.updatedExisting == false) {
              res.send('incorrect id');} 
            else {          
              res.send('success');
            }
          }
      )
    });
  })
};
