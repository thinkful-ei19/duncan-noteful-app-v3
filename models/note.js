'use strict';

const mongoose = require('mongoose');

const notesSchema = mongoose.Schema({
  title : {type : String, required: true},
  content : {type : String, required: true},
  created : {type: Date, default: Date.now }
});


// const Note = mongoose.model('Note', notesSchema);

// module.exports = {Note};

module.exports = mongoose.model('Note', notesSchema);