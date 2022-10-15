
const createClientConfig = require("./createClientConfig");
createClientConfig();
module.exports = createClientConfig().toConfig();