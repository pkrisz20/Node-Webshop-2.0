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
const i18Next = require("i18next");
const Backend = require("i18next-fs-backend");
const i18NextMiddleware = require("i18next-http-middleware");

// Custom middleware logger
app.use(logger);

// Multi language handler
i18Next
    .use(Backend)
    .use(i18NextMiddleware.LanguageDetector)
    .init({
        preload: ['en', 'sr', 'hu'],
        fallbackLng: process.env.FALLBACK_LANG,
        backend: {
            loadPath: "./locales/{{lng}}.json"
        }
    });

app.use(i18NextMiddleware.handle(i18Next));

// View template engine
app.engine('ejs', require('express-ejs-extend'));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, '/views'));

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// Language splitter
// app.use("/:lang", (req, res, next) => {
//     var match = req.url.match(/^\/([A-Z]{2})([\/\?].*)?$/i);
//     if (match){
//         req.lang = match[1];
//         req.url = match[2] || '/';
//     }
//     next();
// });

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

// app.use(csrfProtection());

// Assets path
app.use(express.static(path.join(__dirname, '/files')));
app.use(express.static(path.join(__dirname, '/public')));

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${ process.env.PORT }`);
});

// Cron
cron.schedule('0 0 0 * * *', deleteLogs);

//Routes
const homeRouter = require("./routes/home");
app.use("/", homeRouter);
// const cartRouter = require("./routes/cart");
// const productsRouter = require("./routes/products");
// const blogsRouter = require("./routes/blogs");
// const galleryRouter = require("./routes/gallery");
// const staticContentsRouter = require("./routes/staticContents");
// const contactRouter = require("./routes/contact");
// const employeesRouter = require("./routes/employees");
// const ordersRouter = require("./routes/orders");
// const searchRouter = require("./routes/search");
// const adminRouter = require("./routes/admin");

// app.use("/api", cartRouter);
// app.use("/api", productsRouter);
// app.use("/api", blogsRouter);
// app.use("/api", galleryRouter);
// app.use("/api", staticContentsRouter);
// app.use("/api", contactRouter);
// app.use("/api", employeesRouter);
// app.use("/api", ordersRouter);
// app.use("/api", searchRouter);
// app.use("/api/admin", adminRouter);

// Log the errors
app.use(errorHandler);
