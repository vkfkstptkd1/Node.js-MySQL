var mysql = require('mysql');
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '111111',
    database: 'opentutorials'
});
db.connect();

//db.js를 외부에서도 쓸 수 있게 export해줌
module.exports = db;