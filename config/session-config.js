const fileStoreOptions = {
    path: "./sessions",
    ttl: 60 * 60 * 24 * 30,
    retries: 2,
    logFn: console.log
};

module.exports = fileStoreOptions;
