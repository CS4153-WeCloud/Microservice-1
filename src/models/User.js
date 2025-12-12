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
  
  // Extract time part using regex (handles formats like "18:22:48.343Z" or "2025-11-22T18:20:56.019Z")
  const timeMatch = timeValue.match(/(\d{2}):(\d{2}):(\d{2})/);
  if (timeMatch) {
    return timeMatch[0]; // Returns "HH:mm:ss"
  }
  
  // Try parsing as Date if regex fails
  try {
    const date = new Date(timeValue);
    if (!isNaN(date.getTime())) {
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
  } catch (e) {
    // Ignore parsing errors
  }
  
  return null; // Return null if can't parse
}

class User {
  /**
   * Find all users with filtering, sorting, and pagination
   * Supports: role, homeArea, status, sortBy, sortOrder, page, page_size
   */
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
    
    // Get total count for pagination
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countResult] = await db.query(countQuery, params);
    const totalCount = countResult[0].total;
    
    // Apply pagination
    const page = parseInt(filters.page) || 1;
    const pageSize = parseInt(filters.page_size) || 20;
    const offset = (page - 1) * pageSize;
    
    query += ' LIMIT ? OFFSET ?';
    params.push(pageSize, offset);
    
    const [rows] = await db.query(query, params);
    const users = rows.map(toCamelCase);
    
    // Return paginated response
    const totalPages = Math.ceil(totalCount / pageSize);
    return {
      data: users,
      pagination: {
        totalCount,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        links: {
          self: `/api/users?page=${page}&page_size=${pageSize}`,
          first: `/api/users?page=1&page_size=${pageSize}`,
          last: `/api/users?page=${totalPages}&page_size=${pageSize}`,
          next: page < totalPages 
            ? `/api/users?page=${page + 1}&page_size=${pageSize}` 
            : null,
          prev: page > 1 
            ? `/api/users?page=${page - 1}&page_size=${pageSize}` 
            : null
        }
      }
    };
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

