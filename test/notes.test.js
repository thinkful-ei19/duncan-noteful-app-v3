'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const {TEST_MONGODB_URI} = require('../config');

const Note = require('../models/note');
const seedNotes = require('../db/seed/notes');

const expect = chai.expect;

chai.use(chaiHttp);

 
describe('Tests for all CRUD endpoints', function(){
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI);
  });
    
  beforeEach(function () {
    return Note.insertMany(seedNotes)
      .then(() => Note.createIndexes());
  });
    
  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });
    
  after(function () {
    return mongoose.disconnect();
  });

  describe('GET api/notes', function(){

    it('should return the correct number of notes', function(){
      const dbPromise = Note.find({});
      const apiPromise = chai.request(app).get('/api/notes');
      
      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          res.body.forEach(function (item) {
            expect(item).to.be.a('object');
            expect(item).to.include.keys('id', 'title', 'content');
          });
          expect(res.body).to.have.length(data.length);
        });
    });
  });

  describe('GET /api/notes/:id', function () {
    it('should return correct notes', function () {
      let data;
      // 1) First, call the database
      return Note.findOne().select('id title content')
        .then(_data => {
          data = _data;
          // 2) **then** call the API
          return chai.request(app).get(`/api/notes/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'title', 'content','created');

          // 3) **then** compare
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
        });
    });
  });

  describe('POST /api/notes', function () {
    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        'title': 'The best article about cats ever!',
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
        'tags': []
      };
      let body;
      // 1) First, call the API
      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function (res) {
          body = res.body;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(body).to.be.a('object');
          expect(body).to.include.keys('id', 'title', 'content');
          // 2) **then** call the database
          return Note.findById(body.id);
        })
        // 3) **then** compare
        .then(data => {
          expect(body.title).to.equal(data.title);
          expect(body.content).to.equal(data.content);
        });
    });

    it('should return a 400 error for missing title if an incorrect object is added', function(){
      const newItem = {'foo' : 'bar'};
      let dbLength;
      return Note.find()
        .then(res => {
          dbLength = res.length;
          return chai.request(app).post('/api/notes').send(newItem);
        })
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
          return Note.find();
        })
        .then(data => {
          expect(data.length).to.equal(dbLength);
        });
    });
  });

  describe('PUT api/notes/:id', function(){
    it('should update item in database', function(){
      const updateItem = {
        'title' : 'New Title',
        'content' : 'New Content'
      };
      let updateItemId;
      return Note.findOne()
        .then(res => {
          updateItemId = res.id;
          return chai.request(app).put(`/api/notes/${res.id}`).send(updateItem);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'title', 'content');
          return Note.findById(updateItemId);
        })
        .then(data => {
          expect(data.title).to.equal(updateItem.title);
          expect(data.content).to.equal(updateItem.content);
        });
    });

    it('should send error when updating without title', function(){
      const updateItem = {'foo' : 'bar'};

      let updateItemId;
      let originalNote;
      return Note.findOne()
        .then(res => {
          updateItemId = res.id;
          originalNote = res;
          return chai.request(app).put(`/api/notes/${res.id}`).send(updateItem);
        })
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
          return Note.findById(updateItemId);
        })
        .then(data => {
          expect(data.title).to.equal(originalNote.title);
          expect(data.content).to.equal(originalNote.content);
        });
    });

  });
  describe('DELETE /api/notes/:id', function(){
    it('should delete an item from the database', function(){
      return chai.request(app).delete('/api/notes/000000000000000000000000')
        .then(res => {
          expect(res).to.have.status(204);
          return Note.findById('000000000000000000000000');
        })
        .then(data => {
          expect(data).to.equal(null);
        });
    });
  });
});
