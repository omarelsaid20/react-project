const moment = require('moment');

const createdAt = moment(new Date().getTime()).format('LLL');

console.log(createdAt)