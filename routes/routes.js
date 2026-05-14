const express = require('express');
const router = express.Router();

// --- ПУБЛІЧНІ СТОРІНКИ ---

router.get('/', (req, res) => {
    res.render('index', { polls: [] });
});

router.get('/login', (req, res) => {
    res.render('login', { error: null });
});



router.get('/register', (req, res) => {
    res.render('register', { error: null });
});

// --- АДМІН-ПАНЕЛЬ ---

router.get('/admin', (req, res) => {
    res.render('admin', { 
        polls: [], 
        title: 'Панель адміністратора' 
    });
});

router.get('/admin/polls/new', (req, res) => {
    res.render('create-poll', { 
        poll: null, 
        title: 'Створення опитування' 
    });
});


// --- СИСТЕМНІ ---

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

router.get('/polls/:id', (req, res) => {
  res.render('poll-details', { poll: { title: '' } });
});

router.get('/polls/:id/results', (req, res) => {
  res.render('poll-results', {});
});

router.get('/moderate', (req, res) => {
  res.render('moderate', {});
});

module.exports = router;