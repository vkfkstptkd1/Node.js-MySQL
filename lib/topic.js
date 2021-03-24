var db = require('./db');
var url = require('url');
var qs = require('querystring');
var template = require('./template.js');
exports.home = function(request, response) { //이 모듈은 API를 여러개 제공할거니까 s

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
}

exports.page = function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    db.query(`SELECT * FROM topic`, function(error, topics) { //topic값 가져옴
        if (error) { //topic을 못가져온다면 (에러값 생성)
            throw error; //error를 던저벼린다.(그다음 코드 실행하지 않고 console에 오류 표시하며 즉시 멈춤)
        }
        db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [queryData.id], function(error2, topic) { //?에 들어갈 값을 배열에 인자로 넣어줌.->사용자가 입력한 정보는 무조건 불신해야하므로 ${}대신 저렇게 씀. []가 그런걸 해결해줌.
            //글 상세보기
            if (error2) {
                throw error2;
            }
            console.log(topic[0].title);
            var title = topic[0].title;
            var description = topic[0].description;
            var list = template.list(topics);
            var html = template.HTML(title, list,
                `<h2>${title}</h2>${description}
                <p>by ${topic[0].name}</p>`, //누가썼는지 본문에 구현.
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
exports.create = function(request, response) {
    db.query(`SELECT * FROM topic`, function(error, topics) {
        db.query(`SELECT * FROM author`, function(error2, authors) {

            var title = 'Create';
            var list = template.list(topics);
            var html = template.HTML(title, list,
                ` <form action="/create_process" method="post">
                <p><input type="text" name="title" placeholder="title"></p>
                <p>
                 <textarea name="description" placeholder="description"></textarea>
                </p>
                <p>
                ${template.authorSelect(authors)}
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
    });
}
exports.create_process = function(request, response) {
    var body = '';
    request.on('data', function(data) {
        body = body + data;
    });
    request.on('end', function() {
        var post = qs.parse(body);

        db.query(`
            INSERT INTO topic (title, description, created, author_id) 
             VALUES(?,?, NOW(),?);`, [post.title, post.description, post.author],
            function(error, result) {
                if (error) {
                    throw error;
                }
                response.writeHead(302, { Location: `/?id=${result.insertId}` }); //삽입한 행의 id값= .insertId
                response.end();
            })
    });
}