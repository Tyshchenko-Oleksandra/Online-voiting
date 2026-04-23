const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

const USERS_FILE = path.join(__dirname, 'data/users.json');
const POLLS_FILE = path.join(__dirname, 'data/polls.json');

function readJSON(file) {
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, '[]');
    return [];
  }
  try {
    const content = fs.readFileSync(file, 'utf-8').trim();
    if (!content) return [];
    return JSON.parse(content);
  } catch (e) {
    fs.writeFileSync(file, '[]');
    return [];
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'voting-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

//АВТОРИЗАЦІЯ

app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'admin') {
    req.session.user = { username: 'admin', role: 'admin' };
    return res.redirect('/admin');
  }

  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.render('login', { error: 'Невірний логін або пароль' });
  }

  req.session.user = { username: user.username, role: 'user' };
  res.redirect('/');
});

app.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('register', { error: null });
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin') {
    return res.render('register', { error: 'Це імʼя недоступне' });
  }

  if (!username || !password || username.trim().length < 2) {
    return res.render('register', { error: 'Введіть коректний логін і пароль' });
  }

  const users = readJSON(USERS_FILE);

  if (users.find(u => u.username === username)) {
    return res.render('register', { error: 'Такий користувач вже існує' });
  }

  users.push({ username: username.trim(), password });
  writeJSON(USERS_FILE, users);

  req.session.user = { username: username.trim(), role: 'user' };
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

//ПУБЛІЧНІ СТОРІНКИ

app.get('/', (req, res) => {
  const polls = readJSON(POLLS_FILE);
  res.render('index', { polls });
});

app.get('/polls/:id', (req, res) => {
  const polls = readJSON(POLLS_FILE);
  const poll = polls.find(p => p.id === req.params.id);
  if (!poll) return res.redirect('/');

  const alreadyVoted = req.session.user
    ? poll.votes.some(v => v.username === req.session.user.username)
    : false;

  res.render('poll-details', { poll, alreadyVoted });
});

app.post('/polls/:id/vote', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const polls = readJSON(POLLS_FILE);
  const poll = polls.find(p => p.id === req.params.id);
  if (!poll || poll.status !== 'active') return res.redirect('/');

  const alreadyVoted = poll.votes.some(v => v.username === req.session.user.username);
  if (alreadyVoted) return res.redirect(`/polls/${poll.id}`);

  const optionIndex = parseInt(req.body.optionIndex);
  if (isNaN(optionIndex) || !poll.options[optionIndex]) {
    return res.redirect(`/polls/${poll.id}`);
  }

  poll.votes.push({ username: req.session.user.username, optionIndex });
  poll.totalVotes = (poll.totalVotes || 0) + 1;
  writeJSON(POLLS_FILE, polls);

  res.redirect(`/polls/${poll.id}/results`);
});

app.get('/polls/:id/results', (req, res) => {
  const polls = readJSON(POLLS_FILE);
  const poll = polls.find(p => p.id === req.params.id);
  if (!poll) return res.redirect('/');

  const totalVotes = poll.totalVotes || 0;

  const results = (poll.options || []).map((option, i) => {
    const votes = poll.votes.filter(v => v.optionIndex === i).length;
    const percent = totalVotes > 0 ? Math.round(votes / totalVotes * 100) : 0;
    return { option, votes, percent };
  });

  res.render('results', { poll, totalVotes, results });
});

//АДМІН

app.get('/admin', (req, res) => {
  const polls = readJSON(POLLS_FILE);
  res.render('admin', { polls });
});

app.get('/admin/polls/new', (req, res) => {
  res.render('create-poll', { poll: null });
});

app.post('/admin/polls', (req, res) => {
  const { title, description } = req.body;

  let options = req.body['options[]'] || req.body.options || [];
  if (!options) options = [];
  if (!Array.isArray(options)) options = [options];
  options = options.map(o => o.trim()).filter(o => o.length > 0);

  if (!title || !description || options.length < 2) {
    return res.redirect('/admin/polls/new');
  }

  const polls = readJSON(POLLS_FILE);
  polls.push({
    id: Date.now().toString(),
    title: title.trim(),
    description: description.trim(),
    options,
    status: 'closed',
    createdAt: new Date().toLocaleDateString('uk-UA'),
    totalVotes: 0,
    votes: []
  });
  writeJSON(POLLS_FILE, polls);
  res.redirect('/admin');
});

app.get('/admin/polls/:id/edit', (req, res) => {
  const polls = readJSON(POLLS_FILE);
  const poll = polls.find(p => p.id === req.params.id);
  if (!poll) return res.redirect('/admin');
  res.render('create-poll', { poll });
});

app.post('/admin/polls/:id', (req, res) => {
  const { title, description } = req.body;

  let options = req.body['options[]'] || req.body.options || [];
  if (!options) options = [];
  if (!Array.isArray(options)) options = [options];
  options = options.map(o => o.trim()).filter(o => o.length > 0);

  const polls = readJSON(POLLS_FILE);
  const poll = polls.find(p => p.id === req.params.id);
  if (poll) {
    poll.title = title.trim();
    poll.description = description.trim();
    if (options.length >= 2) poll.options = options;
    writeJSON(POLLS_FILE, polls);
  }
  res.redirect('/admin');
});

app.post('/admin/polls/:id/start', (req, res) => {
  const polls = readJSON(POLLS_FILE);
  const poll = polls.find(p => p.id === req.params.id);
  if (poll) { poll.status = 'active'; writeJSON(POLLS_FILE, polls); }
  res.redirect('/admin');
});

app.post('/admin/polls/:id/stop', (req, res) => {
  const polls = readJSON(POLLS_FILE);
  const poll = polls.find(p => p.id === req.params.id);
  if (poll) { poll.status = 'closed'; writeJSON(POLLS_FILE, polls); }
  res.redirect('/admin');
});

app.post('/admin/polls/:id/delete', (req, res) => {
  let polls = readJSON(POLLS_FILE);
  polls = polls.filter(p => p.id !== req.params.id);
  writeJSON(POLLS_FILE, polls);
  res.redirect('/admin');
});

//ПОМИЛКИ

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Щось пішло не так');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});