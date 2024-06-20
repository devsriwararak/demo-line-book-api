import pool from "../pool.js";

export const getUsers = async (req, res) => {
  const db = await pool.connect();
  try {
    const sql = `SELECT * FROM users ORDER BY id ASC`;
    const data = await db.query(sql);
    res.status(200).json(data.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  } finally {
    db.release();
  }
};

export const getUserDate = async (req, res) => {
  const db = await pool.connect();
  try {
    const sql = `SELECT DISTINCT ON (TO_CHAR(date, 'DD-MM-YYYY')) id, TO_CHAR(date , 'DD-MM-YYYY') AS date, time_start, time_end FROM booking ORDER BY TO_CHAR(date, 'DD-MM-YYYY'), id`;
    const result = await db.query(sql);
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  } finally {
    db.release();
  }
};

export const postUserBooking = async (req, res) => {
  const { user_id, name, image, date, booking_id, trade } = req.body;
  const db = await pool.connect();
  try {
    if (!user_id) throw new Error("ไม่พบ User_id");
    // เช็คผู้ใช้งานซ้ำ
    const sqlCheckUser = `SELECT id FROM users WHERE user_id = $1 `;
    const resultCheckUser = await db.query(sqlCheckUser, [user_id]);

    // ถ้ายังไม่มี ให้เพิ่ม User ใหม่
    let return_id = 0;
    if (resultCheckUser.rows.length === 0) {
      const sql = `INSERT INTO users (user_id, image, name) VALUES ($1,$2,$3) RETURNING id`;
      const result = await db.query(sql, [user_id, image, name]);
      console.log("เพิ่มผู้ใช้งานใหม่ สำเร็จ", result.rows[0]);
      return_id = result.rows[0].id;
    }
    const resultId = return_id === 0 ? resultCheckUser.rows[0].id : return_id;

    // เช็คว่ามีข้อมูลมาครบไหม
    if (!booking_id || !trade)
      throw new Error("ไม่พบข้อมูล booking_id และ trade");

    // ป้องกันการจองซ้ำ
    const sqlCheck = `SELECT id FROM add_class WHERE users_id = $1 AND booking_id = $2`;
    const resultCheck = await db.query(sqlCheck, [resultId, booking_id]);
    console.log(resultCheck.rows);
    if (resultCheck.rows.length > 0)
      throw new Error("คุณได้จองวันนี้ และเวลานี้ไปแล้ว");

    const sqlCheckFullRoom = `
    SELECT 
        b.count, 
        COALESCE(COUNT(ac.id), 0) AS class_count
    FROM booking b
    LEFT JOIN add_class ac ON b.id = ac.booking_id
    WHERE b.id = $1
    GROUP BY b.count
`;
    const resultCheckFullRoom = await db.query(sqlCheckFullRoom, [booking_id]);
    const { count, class_count } = resultCheckFullRoom.rows[0];

    if (count == class_count) {
      throw new Error("ห้องเรียนเต็มแล้ว กรุณาจองเวลาใหม่");
    }

    // บันทึกการจออง
    const sqlAdd = `INSERT INTO add_class (users_id, booking_id, trade ) VALUES ($1,$2,$3)`;
    await db.query(sqlAdd, [resultId, booking_id, trade]);

    res.status(200).json({ message: "ทำรายการสำเร็จ" });
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  } finally {
    db.release();
  }
};

export const getMyUserData = async (req, res) => {
  const { user_id, date } = req.body;
  const db = await pool.connect();
  try {
    const sqlCheck = `SELECT id FROM users WHERE user_id = $1`;
    const resultCheck = await db.query(sqlCheck, [user_id]);

    if (resultCheck.rows.length > 0) {
      const id = resultCheck.rows[0].id;
      const params = [];
      let sql = ` 
      SELECT booking.id, booking.date, booking.time_start, booking.time_end, add_class.trade
      FROM booking 
      INNER JOIN add_class ON booking.id = add_class.booking_id
      WHERE add_class.users_id = $1
      `;
      params.push(id);
      if (date) {
        sql += ` AND  booking.date = $2`;
        params.push(date);
      }
      const result = await db.query(sql, params);
      res.status(200).json(result.rows);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  } finally {
    db.release();
  }
};
