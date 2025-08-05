const http = require('http')
const { readFile } = require('./helpers/readFile');

http.createServer(async (req, res) => {

    if (req.url === '/api/users' && req.method === 'GET') {
        const users = await readFile('db', 'users.json')
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(users)
        return res.end();
    } else if (req.url.match(/^\/api\/users\/\d+$/) && req.method === 'GET') {
        const id = req.url.split('/').pop(); 
        const data = await readFile('db', 'users.json');
        if (data) {
            const users = JSON.parse(data);
            const user = users.find(u => u.id === id);
            if (user) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(user, null, 2));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'User not found' }, null, 2));
            }
        } else {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
        return;
    }
    const fileName = req.url === '/' && req.method === 'GET'
        ? 'index.html'
        : 'error.html';

    const statusCode = fileName === 'error.html' ? 404 : 200;
    const html = await readFile('pages', fileName);

    if (html) {
        res.writeHead(statusCode, { 'Content-Type': 'text/html' });
        res.end(html);
    } else {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>Internal Server Error</h1>');
    }
})
    .listen(3000, () => console.log('Server is Running'))

