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
const { logger } = require("./middleware/logEvents");
const deleteLogs = require("./jobs/deleteLogs");
const corsOptions = require("./config/cors");
const { showNotFoundPage, showForbiddenPage } = require("./helpers/showErrorPages");
const getAssetPath = require("./helpers/getAssetPath");

// Custom middleware logger
app.use(logger);

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

// API routes
const cartRouter = require("./routes/cart");
app.use("/api", cartRouter);

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

// Web routes
const homeRouter = require("./routes/home");
app.use("/:lang", homeRouter);

const employeesRouter = require("./routes/employees");
app.use("/:lang", employeesRouter);

const productsRouter = require("./routes/products");
app.use("/:lang", productsRouter);

const galleryRouter = require("./routes/gallery");
app.use("/:lang", galleryRouter);

const blogsRouter = require("./routes/blogs");
app.use("/:lang", blogsRouter);

const searchRouter = require("./routes/search");
app.use("/:lang", searchRouter);

const contactRouter = require("./routes/contact");
app.use("/:lang", contactRouter);

const ordersRouter = require("./routes/orders");
app.use("/:lang", ordersRouter);

const staticContentsRouter = require("./routes/staticContents");
app.use("/:lang", staticContentsRouter);

app.get("*", (req, res) => {
    return showNotFoundPage(req, res);
});

// Crons
cron.schedule('0 0 0 * * *', deleteLogs);
