var mysql = require('mysql');

// 비밀번호는 별도의 파일로 분리해서 버전관리에 포함시키지 않아야 합니다. 
var connection = mysql.createConnection({
    host: 'localhost', //host : db서버가 어떤 컴퓨터에 있는가, localhost면 nodejs와 같은 컴퓨터에 있다는 의미
    user: 'root',
    password: '111111',
    database: 'opentutorials'
});

connection.connect(); //connection에서 나타내는 값이 존재하면 connect()라는 함수를 통해 접속이 될 것이다.

//접속이 끝난 후
connection.query('SELECT * FROM topic', function(error, results, fields) {
    if (error) { //error안에 값이 있다면
        console.log(error);
    }
    console.log(results);
});

connection.end();