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
const cron = require("node-cron");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const deleteLogs = require("./middleware/deleteLogs");
const corsOptions = require("./config/cors");
const languageHandler = require("./helpers/languageHandler");

// Custom middleware logger
app.use(logger);

// View template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'views'));

// Assets path
app.use(express.static(path.join(__dirname, '/files')));
app.use(express.static(path.join(__dirname, '/public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Cookies
app.use(cookieParser());

// Session
app.use(session({
    store: new FileStore(fileStoreOptions),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 30,
        secure: process.env.NODE_ENV === "production",
    }
}));

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// app.use(csrfProtection());

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${ process.env.PORT }`);
});

const cartRouter = require("./routes/cart");
app.use("/api", cartRouter);

app.use("/:lang", function (req, res, next) {
    req.session.lang = req.params.lang ?? process.env.FALLBACK_LANG;
    console.log(req.session.lang);
    next();
});

//Routes
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
// const contactRouter = require("./routes/contact");
// const ordersRouter = require("./routes/orders");
// const searchRouter = require("./routes/search");
// const adminRouter = require("./routes/admin");
// const staticContentsRouter = require("./routes/staticContents");

// app.use("/api", staticContentsRouter);
// app.use("/api", contactRouter);
// app.use("/api", ordersRouter);
// app.use("/api", searchRouter);
// app.use("/api/admin", adminRouter);

app.get("*", (req, res) => {
    return res.status(404).render('404', {
        current_locale: req.session.lang ?? process.env.FALLBACK_LANG,
        title: languageHandler("errors.not_found", req.session.lang ?? process.env.FALLBACK_LANG)
    });
});

// Crons
cron.schedule('0 0 0 * * *', deleteLogs);

// Log the errors
app.use(errorHandler);
