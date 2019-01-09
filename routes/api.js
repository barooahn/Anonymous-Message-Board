/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;

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
       const cre
    
    console.log('board ', board);
    console.log('text ', text);
    console.log('delete_password ', delete_password);
    
  })
    
    
  app.route('/api/replies/:board');

};
