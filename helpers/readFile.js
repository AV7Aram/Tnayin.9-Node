const fs = require('fs').promises;
const path = require('path');

const readFile = async (folder, file) => {
    try {
        const filePath = path.join(__dirname, '..', folder, file);
        const data = await fs.readFile(filePath, 'utf-8');
        return data;
    } catch (err) {
        console.error(`Error reading file "${file}":`);
        return null
    }
};

module.exports = {
    readFile
};
