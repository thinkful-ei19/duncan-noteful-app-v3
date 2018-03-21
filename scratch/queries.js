'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const searchTerm = 'lady gaga';
//     let filter = {};

//     if (searchTerm) {
//       const re = new RegExp(searchTerm, 'i');
//       filter.title = { $regex: re };
//     }

//     return Note.find(filter)
//       .sort('created')
//       .then(results => {
//         console.log(results);
//       })
//       .catch(console.error);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//       .then(() => {
//         console.info('Disconnected');
//       });
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     return Note.findByIdAndUpdate('5ab170b6272376c8c5d7a79f' , {$set : {title:'new bgfgdhghfghgfitle', content: 'newhgfhfghfhgh ccontent'}}, {new: true})
//       .then(note => {
//         console.log(note);
//       });
//   });

mongoose.connect(MONGODB_URI)
  .then(() => Note.createIndexes())
  .then(() => {
    return Note.find(
      { $text: { $search: 'cats' } })
      .then(results => {
        console.log(results);
      });
  })
  .then(() => {
    return mongoose.disconnect()
      .then(() => {
        console.info('Disconnected');
      });
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });