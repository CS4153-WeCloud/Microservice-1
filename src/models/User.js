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

// Helper function to normalize time format to HH:mm:ss
function normalizeTime(timeValue) {
  if (!timeValue) return null;
  
  // If already in HH:mm:ss format, return as is
  if (/^\d{2}:\d{2}:\d{2}$/.test(timeValue)) {
    return timeValue;
  }
  
  // If ISO format (e.g., "18:20:56.019Z" or "2025-11-22T18:20:56.019Z")
  try {
    const date = new Date(timeValue);
    if (!isNaN(date.getTime())) {
      // Extract time part in HH:mm:ss format
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
  } catch (e) {
    // If parsing fails, try to extract time part directly
    const timeMatch = timeValue.match(/(\d{2}):(\d{2}):(\d{2})/);
    if (timeMatch) {
      return timeMatch[0];
    }
  }
  
  return timeValue; // Return as is if can't parse
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
    const normalizedTime = normalizeTime(preferredDepartureTime);
    const [result] = await db.query(
      'INSERT INTO users (email, first_name, last_name, phone, status, role, home_area, preferred_departure_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [email, firstName, lastName, phone || null, status || 'active', role || 'student', homeArea || null, normalizedTime]
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
    if (preferredDepartureTime !== undefined) { 
      const normalizedTime = normalizeTime(preferredDepartureTime);
      updateFields.push('preferred_departure_time = ?'); 
      updateValues.push(normalizedTime); 
    }
    
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

