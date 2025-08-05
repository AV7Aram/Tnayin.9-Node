const http = require('http');
const { readFile } = require('./helpers/readFile');
const { sendResponse } = require('./helpers/sendResponse');

http.createServer(async (req, res) => {

    if (req.url === '/api/users' && req.method === 'GET') {
        const users = await readFile('db', 'users.json');
        return sendResponse(res, 200, users);
    } else if (req.url.match(/^\/api\/users\/\d+$/) && req.method === 'GET') {
        const id = req.url.split('/').pop();
        const data = await readFile('db', 'users.json');

        if (data) {
            const users = JSON.parse(data);
            const user = users.find(u => u.id === id);

            if (user) {
                return sendResponse(res, 200, user);
            } else {
                return sendResponse(res, 404, { message: 'User not found' });
            }
        }
    }

    const fileName = req.url === '/' && req.method === 'GET'
        ? 'index.html'
        : 'error.html';

    const statusCode = fileName === 'error.html' ? 404 : 200;
    const html = await readFile('pages', fileName);

    if (html) {
        return sendResponse(res, statusCode, html, 'text/html');
    }
})
    .listen(3000, () => console.log('Server is Running'));
