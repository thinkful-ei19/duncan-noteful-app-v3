'use strict';

const express = require('express');
// const mongoose = require('mongoose');
// Create an router instance (aka "mini-app")
const Note = require('../models/note');
const router = express.Router();



/* ========== GET/READ ALL ITEM ========== */
router.get('/notes', (req, res, next) => {
  const searchTerm = req.query.searchTerm;
  let filter = {};

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.title = { $regex: re };
  }
  return Note
    .find(filter)
    .sort('created')
    .then(result => {
      res.json(result);
    })
    .catch(next);

});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/notes/:id', (req, res, next) => {
  const {id} = req.params;

  return Note.findById(id)
    .then(result => {
      res.json(result);
    })
    .catch(next);
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/notes', (req, res, next) => {
  const { title, content } = req.body;
  
  const newItem = {title, content};
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  return Note.create(newItem)
    .then(note => {
      res.location(`${req.originalUrl}/${note.id}`).status(201).json(note);
    })
    .catch(next);
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {
  const updateObj = {};
  const updateableFields = ['title', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  return Note.findByIdAndUpdate(req.params.id, {$set : updateObj}, {new : true})
    .then(note => {
      res.json(note);
    })
    .catch(next);
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/notes/:id', (req, res, next) => {
  return Note.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch(next);

});

module.exports = router;