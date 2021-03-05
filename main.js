var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var mysql = require('mysql');
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '111111',
    database: 'opentutorials'
});
db.connect();

var app = http.createServer(function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if (pathname === '/') {
        if (queryData.id === undefined) {
            db.query(`SELECT * FROM topic`, function(error, topics) {
                var title = 'Welcome';
                var description = 'Hello, Node.js';
                var list = template.list(topics);
                var html = template.HTML(title, list,
                    `<h2>${title}</h2>${description}`,
                    `<a href="/create">create</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        } else { //글 목록 불러오는 코드
            db.query(`SELECT * FROM topic`, function(error, topics) { //topic값 가져옴
                if (error) { //topic을 못가져온다면 (에러값 생성)
                    throw error; //error를 던저벼린다.(그다음 코드 실행하지 않고 console에 오류 표시하며 즉시 멈춤)
                }
                db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], function(error2, topic) { //?에 들어갈 값을 배열에 인자로 넣어줌.->사용자가 입력한 정보는 무조건 불신해야하므로 ${}대신 저렇게 씀. []가 그런걸 해결해줌.
                    if (error2) {
                        throw error2;
                    }
                    console.log(topic[0].title);
                    var title = topic[0].title;
                    var description = topic[0].description;
                    var list = template.list(topics);
                    var html = template.HTML(title, list,
                        `<h2>${title}</h2>${description}`,
                        `<a href="/create">create</a>
                         <a href="/update?id=${queryData.id}">update</a>
                         <form action="delete_process" method="post">
                           <input type="hidden" name="id" value="${queryData.id}">
                           <input type="submit" value="delete">
                         </form>`
                    );
                    response.writeHead(200);
                    response.end(html);
                })
            });

        }
    } else if (pathname === '/create') {
        db.query(`SELECT * FROM topic`, function(error, topics) {
            var title = 'Create';
            var list = template.list(topics);
            var html = template.HTML(title, list,
                ` <form action="/create_process" method="post">
                <p><input type="text" name="title" placeholder="title"></p>
                <p>
                  <textarea name="description" placeholder="description"></textarea>
                </p>
                <p>
                  <input type="submit">
                </p>
              </form>`,
                `<a href="/create">create</a>`
            );
            response.writeHead(200);
            response.end(html);
        });

    } else if (pathname === '/create_process') { //사용자가 입력한 글생성
        var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);

            db.query(`
                INSERT INTO topic (title, description, created, author_id) 
                 VALUES(?,?, NOW(),?);`, [post.title, post.description, 1],
                function(error, result) {
                    if (error) {
                        throw error;
                    }
                    response.writeHead(302, { Location: `/?id=${result.insertId}` }); //삽입한 행의 id값= .insertId
                    response.end();
                })
        });
    } else if (pathname === '/update') { //글수정
        db.query('SELECT * FROM topic', function(error, topics) {
            if (error) {
                throw error;
            }
            db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], function(error2, topic) {
                if (error2) {
                    throw error2;
                }
                var list = template.list(topics);
                var html = template.HTML(topic[0].title, list,
                    `
                <form action="/update_process" method="post">
                <input type="hidden" name="id" value="${topic[0].id}">
                <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
                <p>
                    <textarea name="description" placeholder="description">${topic[0].description}</textarea>
                </p>
                <p>
                    <input type="submit">
                </p>
                </form>
                `,
                    `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        });
    } else if (pathname === '/update_process') { //submit로 날라온 데이터 어떻게 처리할건가.
        var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            db.query(`UPDATE topic SET title=?, description=?, author_id=1 WHERE id=?`, [post.title, post.description, post.id], function(error, result) {
                response.writeHead(302, { Location: `/?id=${post.id}` });
                response.end();
            })
        });
    } else if (pathname === '/delete_process') { //글 삭제
        var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            db.query(`DELETE FROM topic WHERE id =?`, [post.id], function(error, result) {
                if (error) {
                    throw error;
                }
                response.writeHead(302, { Location: `/` }); //홈으로 이동해서 잘 동작했는지 확인
                response.end();
            });
        });
    } else {
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3000);