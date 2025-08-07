const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const { readFile } = require('./helpers/readFile');
const { sendResponse } = require('./helpers/sendResponse');

http.createServer(async (req, res) => {

    if (req.url === '/api/users' && req.method === 'GET') {
        const users = await readFile('db', 'users.json');
        return sendResponse(res, 200, users);
    } else if (req.url.match(/^\/api\/users\/\d+$/) && req.method === 'GET') {
        const id = req.url.split('/').pop();
        const users = JSON.parse(await readFile('db', 'users.json'));
        const user = users.find(u => u.id === id);
        return user
            ? sendResponse(res, 200, user)
            : sendResponse(res, 404, { message: 'User not found' });
    } else if (req.url.includes('?') && req.method === 'GET') {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);

        const nameValue = urlParams.get('name');
        if (!nameValue) {
            return sendResponse(res, 400, { message: 'Missing name parameter' });
        }

        const users = JSON.parse(await readFile('db', 'users.json'));
        const filteredUsers = users.filter(user =>
            user.name.toLowerCase().includes(nameValue.toLowerCase())
        );

        return sendResponse(res, 200, filteredUsers);
    } else if (req.url === '/api/users' && req.method === 'POST') {
        let body = ''
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            const newUser = JSON.parse(body);
            const filePath = path.join(__dirname, 'db', 'users.json');
            const users = JSON.parse(await fs.readFile(filePath, 'utf-8'));
            newUser.id = newUser.id || Date.now()
            users.push(newUser);
            await fs.writeFile(filePath, JSON.stringify(users, null, 2));
            sendResponse(res, 201, newUser);
        });
        return
    } else if (req.url.match(/^\/api\/users\/\d+$/) && req.method === 'PATCH') {
        const id = req.url.split('/').pop();
        const filePath = path.join(__dirname, 'db', 'users.json');
        const users = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            return sendResponse(res, 404, { message: 'User not found' });
        }
        let body = ''
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            const updates = JSON.parse(body);
            const originalId = users[userIndex].id;
            users[userIndex] = {
                ...users[userIndex],
                ...updates,
                id: originalId
            };

            await fs.writeFile(filePath, JSON.stringify(users, null, 2));
            sendResponse(res, 200, users[userIndex]);
        });
        return;
    } else if (req.url.match(/^\/api\/users\/\d+$/) && req.method === 'DELETE') {
        const id = req.url.split('/').pop();
        const filePath = path.join(__dirname, 'db', 'users.json');
        const users = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        const userIndex = users.findIndex(u => u.id === id)

        if (userIndex === -1) {
            return sendResponse(res, 404, { message: 'User not found' });
        }
        const [deletedUser] = users.splice(userIndex, 1);
        await fs.writeFile(filePath, JSON.stringify(users, null, 2));
        sendResponse(res, 200, {
            message: `User with id ${id} deleted`,
            deletedUser
        });
    }

    const fileName = req.url === '/' && req.method === 'GET'
        ? 'index.html'
        : 'error.html';

    const statusCode = fileName === 'error.html' ? 404 : 200;
    const html = await readFile('pages', fileName);

    return html
        ? sendResponse(res, statusCode, html, 'text/html')
        : sendResponse(res, 404, 'Not Found', 'text/html');
}).listen(3000, () => console.log('Server is Running'));