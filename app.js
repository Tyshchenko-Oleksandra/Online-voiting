const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', {
    polls: []
  });
});

app.get('/polls/:id', (req, res) => {
  res.render('poll-details', {
    poll: {
      id: req.params.id,
      title: '',
      description: '',
      status: 'closed'
    },
    candidates: [],
    alreadyVoted: false
  });
});

app.get('/polls/:id/results', (req, res) => {
  res.render('results', {
    poll: {
      id: req.params.id,
      title: '',
      status: 'closed'
    },
    totalVotes: 0,
    results: []
  });
});

app.get('/admin', (req, res) => {
  res.render('admin', {
    polls: []
  });
});

app.get('/admin/polls/new', (req, res) => {
  res.render('create-poll', {
    poll: null,
    candidates: []
  });
});  

app.post('/admin/polls', (req, res) => {
  res.redirect('/admin');
});

app.get('/admin/polls/:id/edit', (req, res) => {
  res.render('create-poll', {
    poll: null ,
    candidates: []
  });
});

app.post('/admin/polls/:id', (req, res) => {
  res.redirect('/admin');
});

app.post('/admin/polls/:id/start', (req, res) => {
  res.redirect('/admin');
});

app.post('/admin/polls/:id/stop', (req, res) => {
  res.redirect('/admin');
});

app.post('/admin/polls/:id/delete', (req, res) => {
  res.redirect('/admin');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});