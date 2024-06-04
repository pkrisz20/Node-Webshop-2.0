require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const session = require("express-session");
const FileStore = require('session-file-store')(session);
const fileStoreOptions = require("./config/session-config");
const csrfProtection = require('csurf');
const cron = require("node-cron");
const deleteLogs = require("./jobs/deleteLogs");
const corsOptions = require("./config/cors");
const { showNotFoundPage, showForbiddenPage } = require("./helpers/showErrorPages");
const getAssetPath = require("./helpers/getAssetPath");

// Trust proxy if it's in production
if (process.env.APP_DEBUG === 'false') {
    app.set('trust proxy', 1);
}

// View template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'views'));

// Assets path
app.use(express.static(path.join(__dirname, '/files')));
app.use(express.static(path.join(__dirname, '/public')));

// JSON body parser
app.use(bodyParser.json({ limit: '300mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '300mb' }));
app.use(express.json());

// Cookies
app.use(cookieParser());

// Session
app.use(session({
    store: new FileStore(fileStoreOptions),
    secret: process.env.SESSION_SECRET,
    key: "website_session",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 30,
        secure: process.env.APP_DEBUG === 'false',
    }
}));

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// CSRF
app.use(csrfProtection({ cookie: { httpOnly: true, secure: process.env.APP_DEBUG === 'false' } }));

// error handler for bad CSRF token
app.use(function (err, req, res, next) {
    if (err.code === 'EBADCSRFTOKEN') return showForbiddenPage(req, res);
    return next();
});

// Add the getAssetPath function globally
app.use((req, res, next) => {
    res.locals.getAssetPath = getAssetPath;
    next();
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${ process.env.PORT }`);
});

// Ajax routes
const ajaxRouter = require('./routes/ajaxRoutes');
app.use("/ajax", ajaxRouter);

// Admin routes
const adminRouter = require("./routes/admin");
app.use("/admin", adminRouter);

const adminFormsRouter = require("./routes/admin-forms");
app.use("/admin", adminFormsRouter);

// Redirect to the lang slug version
app.get('/', (req, res) => {
    res.redirect(`/${ req.session.lang ?? process.env.FALLBACK_LANG }`);
});

// Language slug handler
app.use("/:lang", function (req, res, next) {

    if ( req.params.lang !== 'en' && req.params.lang !== 'sr' && req.params.lang !== 'hu' )
    {
        return showNotFoundPage(req, res);
    }

    req.session.lang = req.params.lang ?? process.env.FALLBACK_LANG;
    return next();
});

// Import routers
const homeRouter = require("./routes/home");
const employeesRouter = require('./routes/employees');
const productsRouter = require('./routes/products');
const galleryRouter = require('./routes/gallery');
const blogsRouter = require('./routes/blogs');
const searchRouter = require('./routes/search');
const contactRouter = require('./routes/contact');
const ordersRouter = require('./routes/orders');
const staticContentsRouter = require('./routes/staticContents');

// Use the middleware in routes
app.use("/:lang", homeRouter);
app.use('/', employeesRouter);
app.use('/', contactRouter);
app.use('/', ordersRouter);
app.use('/', searchRouter);
app.use('/', staticContentsRouter);
app.use('/', productsRouter); // Not working properly
app.use('/', galleryRouter); // Not working properly
app.use('/', blogsRouter);

app.get("*", (req, res) => {
    return showNotFoundPage(req, res);
});

// Crons
cron.schedule('0 0 0 * * *', deleteLogs);
