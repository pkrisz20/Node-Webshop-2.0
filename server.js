require('dotenv').config();
const path = require("path");
const express = require("express");
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
// const csrf = require('csurf');
const app = express();
app.engine('ejs', require('express-ejs-extend'));

// Custom middleware logger
app.use(logger);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'views'));

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// CSRF
// const csrfProtection = csrf({
//     cookie: true,
//     httpOnly: true,
//     maxAge: 3600,
//     domain: process.env.APP_URL,
//     secure: process.env.NODE_ENV === "production",
// });

// app.use(csrfProtection());

// Assets path
app.use(express.static(__dirname + '/files'));
app.use(express.static(__dirname + '/public'));

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${ process.env.PORT }`);
});

app.get("/", (req, res) => {
    var params = {
        title: 'Page Title',
        description: 'Page Description',
        class_name: "home"
    };

    res.render('home', params);
});

// Cron
cron.schedule('0 0 0 * * *', deleteLogs);

//Routes
// const cartRouter = require("./routes/cart");
// const productsRouter = require("./routes/products");
// const homeRouter = require("./routes/home");
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
// app.use("/api", homeRouter);
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
