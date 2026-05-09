const db = require('../config/database');

const messageService = {
    saveMessage: async ({ userId, content }) => {
        const result = await db.runAsync(
            `INSERT INTO messages (user_id, content) VALUES (?, ?)`,
            [userId, content]
        );

        // Retornar el mensaje insertado consultándolo por su ID
        return await db.getAsync(
            `SELECT m.id, m.content, m.created_at, m.user_id 
             FROM messages m 
             WHERE m.id = ?`,
            [result.lastID]
        );
    },

    getRecentMessages: async (limit = 50) => {
        // Ordenamos por fecha ascendente para el frontend (los más viejos en la parte superior)
        return await db.allAsync(
            `SELECT m.id, m.content, m.created_at, u.username
             FROM (SELECT * FROM messages ORDER BY created_at DESC LIMIT ?) m
             JOIN users u ON m.user_id = u.id
             ORDER BY m.created_at ASC`,
            [limit]
        );
    }
};

module.exports = messageService;