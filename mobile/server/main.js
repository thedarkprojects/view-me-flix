const { startExpressServer } = require("./app");

startExpressServer({ port: 3001 }, (options) => {
    console.log(`view more middleware running on port ${options.port}`);
});