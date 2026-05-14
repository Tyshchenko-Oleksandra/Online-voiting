const express = require('express');
const path = require('path');
const session = require('express-session');

// Імпорт роутів
const viewRoutes = require('./routes/routes.js');
const apiRoutes = require('./routes/api');


const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "connect-src 'self' http://localhost:3000 ws://localhost:3000;"
  );
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'voting-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});


app.use('/', viewRoutes);      
app.use('/api', apiRoutes);   

app.use((err, req, res, next) => {
    console.error(err);
    if (req.path.startsWith('/api')) {
        return res.status(500).json({ success: false, message: 'Помилка сервера' });
    }
    res.status(500).send('Щось пішло не так');
});

app.listen(3000, () => {
    console.log(`Server running on http://localhost:3000`);
});
