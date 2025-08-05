const sendResponse = (res, statusCode, data, contentType = 'application/json') => {
    res.writeHead(statusCode, { 'Content-Type': contentType });
    res.end(
        typeof data === 'object' ? JSON.stringify(data, null, 2) : data
    );
};

module.exports = {
    sendResponse
};
