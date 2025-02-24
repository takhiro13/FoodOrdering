const path = require('path');

const ejsPath = (page) => path.resolve(__dirname, '../ejs-views', `${page}.ejs`);

module.exports = ejsPath;
