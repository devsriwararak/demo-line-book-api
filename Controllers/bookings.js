import pool from "../pool.js";
import { format } from "date-fns";
import { th } from "date-fns/locale"; // นำเข้า locale ภาษาไทย

export const getBookings = async (req, res) => {
  const { date } = req.body;
  const db = await pool.connect();

  try {
    let sql = `SELECT id, time_start, time_end, count, date FROM booking`;
    const params = [];
    if (date) {
      sql += ` WHERE date = $1`;
      params.push(date);
    }
    const result = await db.query(sql, params);

    const NewResult = result.rows.map((row) => {
      const formattedDate = format(new Date(row.date), "dd-MM-yyyy", {
        locale: th,
      });
      return {
        ...row,
        date: formattedDate,
      };
    });
    res.status(200).json(NewResult);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }finally{
    db.release()
  }
};

// node.js express
// ต้องการแยกฟังชั่น ตรวจสอบเวลาออก และเรียกใช้ในนี้
export const postInsertBooking = async (req, res) => {
  const { date, time_start, time_end, count } = req.body;
  const db = await pool.connect();
  try {
   
    const sqlCheck = `SELECT time_start , time_end FROM booking WHERE date = $1`;
    const resultCheck = await db.query(sqlCheck, [date]);
    // console.log(resultCheck.rows);

    // ตรวจสอบการซ้อนทับของเวลา
    if (checkTimeOverlap(time_start, time_end, resultCheck.rows)) {
      return res
        .status(400)
        .json({ message: "ช่วงเวลาที่เลือกซ้อนทับกับการจองที่มีอยู่แล้ว" });
    }

    // INSERT
    const sql = `INSERT INTO booking (date, time_start, time_end, count) VALUES ($1,$2,$3,$4) RETURNING *`;
    const result = await db.query(sql, [date, time_start, time_end, count]);
    res.status(200).json({ message: "ทำรายการสำเร็จ" });
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }finally{
    db.release()
  }
};

// ลบ
export const deleteBooking = async (req, res) => {
  const { id } = req.params;
  const db = await pool.connect();
  try {
    
    const sql = `DELETE FROM booking WHERE id = $1`;
    await db.query(sql, [id]);
    const sqlDeleteAddClass = `DELETE FROM add_class WHERE booking_id = $1`
    await db.query(sqlDeleteAddClass, [id])
    res.status(200).json({ message: "ลบสำเร็จ" });
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }finally{
    db.release()
  }
};

// แก้ไข
export const editBooking = async (req, res) => {
  const { id } = req.params;
  const { date, time_start, time_end, count } = req.body;
  const db = await pool.connect();

  try {
    
    const sqlCheck = `SELECT time_start , time_end FROM booking WHERE date = $1`;
    const resultCheck = await db.query(sqlCheck, [date]);

    // ตรวจสอบการซ้อนทับของเวลา
    if (checkTimeOverlap(time_start, time_end, resultCheck.rows)) {
      console.log('11111111111');
      // return res
      //   .status(400)
      //   .json({ message: "ช่วงเวลาที่เลือกซ้อนทับกับการจองที่มีอยู่แล้ว" });
      throw new Error ('ช่วงเวลาที่เลือกซ้อนทับกับการจองที่มีอยู่แล้ว')
    }

    // เช็คว่าจองมาแล้วกี่คน
    const sqlCheckClass = `SELECT id FROM add_class WHERE booking_id = $1`
    const resultCheckClass = await db.query(sqlCheckClass, [id])
    if(count <= resultCheckClass.rows.length) {
      console.log('222222222222');
            throw new Error ('มีคนจองมากกว่าจำนวนที่ใส่มา กรุณาเพิ่มจำนวนอีก')
    }

    const sql = `UPDATE booking SET date=$1, time_start=$2, time_end=$3, count=$4 WHERE id = $5`
    await db.query(sql, [date, time_start, time_end, count , id])
    res.status(200).json({message: 'ทำรายการสำเร็จ'})
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }finally{
    db.release()
  }
};

// Function เช็คช่วงเลาซ้ำ
const checkTimeOverlap = (time_start, time_end, existingBookings) => {
  for (let row of existingBookings) {
    const existingStart = row.time_start;
    const existingEnd = row.time_end;
    // ตรวจสอบการซ้อนทับของเวลา
    if (
      (time_start >= existingStart && time_start < existingEnd) ||
      (time_end > existingStart && time_end <= existingEnd) ||
      (time_start <= existingStart && time_end >= existingEnd) ||
      (time_end <=  time_start )
    ) {
      return true; // มีการซ้อนทับของเวลา
    }
  }
  return false; // ไม่มีการซ้อนทับของเวลา
};
