const db = require('../config/database');

// Helper function to convert snake_case to camelCase
function toCamelCase(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    status: row.status,
    role: row.role,
    homeArea: row.home_area,
    preferredDepartureTime: row.preferred_departure_time,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

class User {
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM users WHERE 1=1';
    const params = [];
    
    // Apply filters
    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }
    if (filters.homeArea) {
      query += ' AND home_area = ?';
      params.push(filters.homeArea);
    }
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    
    // Apply sorting
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'DESC';
    query += ` ORDER BY ${sortBy} ${sortOrder}`;
    
    const [rows] = await db.query(query, params);
    return rows.map(toCamelCase);
  }
  

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return toCamelCase(rows[0]);
  }

  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return toCamelCase(rows[0]);
  }

  static async create(userData) {
    const { email, firstName, lastName, phone, status, role, homeArea, preferredDepartureTime } = userData;
    const [result] = await db.query(
      'INSERT INTO users (email, first_name, last_name, phone, status, role, home_area, preferred_departure_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [email, firstName, lastName, phone || null, status || 'active', role || 'student', homeArea || null, preferredDepartureTime || null]
    );
    return this.findById(result.insertId);
  }

  static async update(id, userData) {
    const { email, firstName, lastName, phone, status, role, homeArea, preferredDepartureTime } = userData;
    const updateFields = [];
    const updateValues = [];
    
    if (email !== undefined) { updateFields.push('email = ?'); updateValues.push(email); }
    if (firstName !== undefined) { updateFields.push('first_name = ?'); updateValues.push(firstName); }
    if (lastName !== undefined) { updateFields.push('last_name = ?'); updateValues.push(lastName); }
    if (phone !== undefined) { updateFields.push('phone = ?'); updateValues.push(phone); }
    if (status !== undefined) { updateFields.push('status = ?'); updateValues.push(status); }
    if (role !== undefined) { updateFields.push('role = ?'); updateValues.push(role); }
    if (homeArea !== undefined) { updateFields.push('home_area = ?'); updateValues.push(homeArea); }
    if (preferredDepartureTime !== undefined) { updateFields.push('preferred_departure_time = ?'); updateValues.push(preferredDepartureTime); }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);
    
    await db.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = User;

