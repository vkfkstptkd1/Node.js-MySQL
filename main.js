var http = require('http');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var db = require('./lib/db');
var topic = require('./lib/topic');
var author = require('./lib/author');
const { authorSelect } = require('./lib/template.js');

var app = http.createServer(function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if (pathname === '/') {
        if (queryData.id === undefined) {
            topic.home(request, response);
        } else { //글 목록 불러오는 코드
            topic.page(request, response);
        }
    } else if (pathname === '/create') {
        topic.create(request, response);
    } else if (pathname === '/create_process') { //사용자가 입력한 글생성
        topic.create_process(request, response);
    } else if (pathname === '/update') { //글수정
        topic.update(request, response);
    } else if (pathname === '/update_process') { //submit로 날라온 데이터 어떻게 처리할건가.
        topic.update_process(request, response);
    } else if (pathname === '/delete_process') { //글 삭제
        topic.delete_process(request, response);
    } else if (pathname === '/author') {
        author.home(request, response);
    } else {
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3000);