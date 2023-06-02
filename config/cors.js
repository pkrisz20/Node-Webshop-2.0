const whiteList = [process.env.APP_HOST, "http://127.0.0.1:3000", "http://localhost:3001"];

const corsOptions = {
    credentials: true,
    origin: (origin, callback) => {
        if (whiteList.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "DELETE"]
};

module.exports = corsOptions;
