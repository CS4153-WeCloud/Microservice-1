const db = require('../config/database');

class User {
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM users ORDER BY created_at DESC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async create(userData) {
    const { email, firstName, lastName, phone, status } = userData;
    const [result] = await db.query(
      'INSERT INTO users (email, first_name, last_name, phone, status) VALUES (?, ?, ?, ?, ?)',
      [email, firstName, lastName, phone || null, status || 'active']
    );
    return this.findById(result.insertId);
  }

  static async update(id, userData) {
    const { email, firstName, lastName, phone, status } = userData;
    await db.query(
      'UPDATE users SET email = ?, first_name = ?, last_name = ?, phone = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [email, firstName, lastName, phone, status, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = User;

