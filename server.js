// import
const express = require('express');
const indexRouter = require('./routers/index');
const aboutRouter = require('./routers/about');
const ticketRouter = require('./routers/ticket');
const userRouter = require('./routers/user');
const contactRouter = require('./routers/contact');

// const
const app = express();

// initial
app.use(express.static(__dirname + '/source'));
// routers
app.use('/', indexRouter);
app.use('/about', aboutRouter);
app.use('/ticket', ticketRouter);
app.use('/user', userRouter);
app.use('/contact', contactRouter);
// render
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// extension methods
app.locals.js = (path) => { return '<script src="' + path + '"></script>' }
app.locals.css = (path) => { return '<link rel="stylesheet" href="' + path + '">' }
app.locals.copyrightYear = () => { return new Date().getFullYear(); };

const server = app.listen(8080);