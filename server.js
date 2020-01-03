// gobal veriables
__root = __dirname + '/'
// import
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const indexRouter = require('./routers/index');
const aboutRouter = require('./routers/about');
const ticketRouter = require('./routers/ticket');
const userRouter = require('./routers/user');
const contactRouter = require('./routers/contact');

// const
const app = express();
const SECRET_KEY = "secret"
const EXPIRES = 14 * 24 * 60 * 60 * 1000

// initial
app.use(express.static(__dirname + '/source'));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(session({
    secret: SECRET_KEY,
    cookie: { maxAge: EXPIRES }
}))
// 從 routers 設定 ejs 全域變數
app.use(function (req, res, next) {
    app.locals.req = req;
    app.locals.data = req.method === 'GET' ? req.query : req.body;
    app.locals.session = req.session;
    app.locals.userdata = req.session.userdata;
    next();
});

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
app.locals.copyrightYear = () => new Date().getFullYear();
app.locals.padZero = (num) => Math.floor(num).toString().padStart(2, '0');

app.locals.__views = __dirname + '/views/'

const server = app.listen(8080);