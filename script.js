const http = require('http');
const fs = require('fs').promises
const path = require('path');
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
    } else if (req.url.includes('?') && req.method === 'GET') {
        const searchPosition = req.url.indexOf('?')
        const value = req.url.slice(searchPosition + 1).split('=').at(-1)
        const users = JSON.parse(await readFile('db', 'users.json'))
        const newUsers = users.filter((user) => user.name.toLowerCase().indexOf(value.toLowerCase()) > -1)
        return sendResponse(res, 200, JSON.stringify(newUsers))
    } else if (req.url === '/api/users' && req.method === 'POST') {
        req.on('data', async (chunk) => {
            let body = JSON.parse(chunk.toString())
            const users = JSON.parse(await readFile('db', 'users.json'))
            users.push(body)
            await fs.unlink(path.join(__dirname, 'db', 'users.json'))
            await fs.appendFile(path.join(__dirname, 'db', 'users.json'), JSON.stringify(users))
            res.end(JSON.stringify(users))
        })
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
