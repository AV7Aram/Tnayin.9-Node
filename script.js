const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const { readFile } = require('./helpers/readFile');
const { sendResponse } = require('./helpers/sendResponse');

const usersPath = () => path.join(__dirname, 'db', 'users.json');

const dataBody = (req) => {
    return new Promise((res) => {
        let body = ''
        req.on('data', chunk => body += chunk)
        req.on('end', () => {
            res(JSON.parse(body));
        });
    });
}

http.createServer(async (req, res) => {

    if (req.url === '/api/users' && req.method === 'GET') {
        const users = await readFile('db', 'users.json');
        return sendResponse(res, 200, JSON.parse(users));
    } else if (req.url.match(/^\/api\/users\/\d+$/) && req.method === 'GET') {
        const id = req.url.split('/').pop();
        const users = JSON.parse(await readFile('db', 'users.json'));
        const user = users.find(u => u.id === id);
        return user
            ? sendResponse(res, 200, user)
            : sendResponse(res, 404, { message: 'User not found' });
    } else if (req.url.startsWith('/api/users?') && req.method === 'GET') {
        const urlParams = new URLSearchParams(req.url.split('?')[1])
        console.log("urlParams", urlParams)
        let users = JSON.parse(await readFile('db', 'users.json'))
        const nameValue = urlParams.get('name');
        const ageSort = urlParams.get('age');
        if (nameValue) {
            users = users.filter(u => u.name.toLowerCase().includes(nameValue.toLowerCase()));
        }
        if (ageSort === 'min' || ageSort === 'max') {
            users = users.toSorted((a, b) => {
                const ageA = a.age;
                const ageB = b.age
                return ageSort === 'min' ? ageA - ageB : ageB - ageA
            });
        };
        return sendResponse(res, 200, users)
    } else if (req.url === '/api/users' && req.method === 'POST') {
        const body = await dataBody(req);
        const users = JSON.parse(await readFile('db', 'users.json'));
        const userEmail = users.find(u => u.email === body.email);
        if (userEmail) {
            return sendResponse(res, 409, { message: "Email already exists" });
        }
        if (!body.id) {
            body.id = Date.now().toString();
        }
        users.push(body);
        await fs.writeFile(usersPath(), JSON.stringify(users));
        return sendResponse(res, 201, { message: "User added", users });
    } else if (req.url.match(/^\/api\/users\/\d+$/) && req.method === 'PATCH') {
        const id = req.url.split('/').pop();
        const users = JSON.parse(await readFile('db', 'users.json'));
        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            return sendResponse(res, 404, { message: 'User not found' });
        }
        const updates = await dataBody(req)

        if (updates.email && updates.email !== users[userIndex].email) {
            const emailExist = users.find(u => u.email === updates.email);
            if (emailExist) {
                return sendResponse(res, 409, { message: 'Email already exists', existingUser: emailExist });
            }
        }
        users[userIndex] = {
            ...users[userIndex],
            ...updates,
            id: users[userIndex].id
        };
        await fs.writeFile(usersPath(), JSON.stringify(users));
        return sendResponse(res, 200, users[userIndex]);
    } else if (req.url.match(/^\/api\/users\/\d+$/) && req.method === 'DELETE') {
        const id = req.url.split('/').pop();
        const users = JSON.parse(await readFile('db', 'users.json'));
        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            return sendResponse(res, 404, { message: 'User not found' });
        }

        const deletedUser = users.splice(userIndex, 1);
        await fs.writeFile(usersPath(), JSON.stringify(users));
        return sendResponse(res, 200, {
            message: `User with id ${id} deleted`,
            deletedUser
        });
    }

    const fileName = req.url === '/' && req.method === 'GET'
        ? 'index.html'
        : 'error.html';

    const statusCode = fileName === 'error.html' ? 404 : 200;
    const html = await readFile('pages', fileName);
    return sendResponse(res, statusCode, html, 'text/html');

}).listen(3000, () => console.log('Server is Running'));
