'use strict';

const mongoose = require('mongoose');

const notesSchema = mongoose.Schema({
  title : {type : String, required: true, index : true},
  content : {type : String, required: true, index : true},
  created : {type: Date, default: Date.now }
});


notesSchema.index({ title: 'text',  content: 'text'});

notesSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Note', notesSchema);