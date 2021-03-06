//버전관리할땐 보안을 위해서 db.js쓰지않고 이거 씀 
var mysql = require('mysql');
var db = mysql.createConnection({
    host: '',
    user: '',
    password: '',
    database: ''
});
db.connect();

//db.js를 외부에서도 쓸 수 있게 export해줌
module.exports = db;