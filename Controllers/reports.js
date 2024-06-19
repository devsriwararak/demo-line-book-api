import pool from "../pool.js";

// ค้นหาจากวันที่ก่อน
export const searchDate = async (req, res) => {
  const { date } = req.body;
  try {
    const db = await pool.connect();
    let sql = `SELECT id, TO_CHAR(date , 'DD-MM-YYYY') AS date  , time_start, time_end  FROM booking `;
    let params = [];
    if (date) {
      sql += ` WHERE date = $1`;
      params.push(date);
    }
    const result = await db.query(sql, params);
    db.release();
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
};



export const GetReportUsers = async (req, res) => {
  const { date, id } = req.body;
  const db = await pool.connect();

  try {
    let sql = `SELECT 
        booking.id, 
        TO_CHAR( booking.date , 'DD-MM-YYYY') AS date  ,
       
        booking.time_start, 
        booking.time_end,
        booking.count,
        COALESCE(count_table.count, 0) AS sum_count
      FROM booking
      LEFT JOIN (
        SELECT booking_id, COUNT(id) AS count FROM add_class GROUP BY booking_id
      ) AS count_table
      ON
        booking.id = count_table.booking_id
       `;
    const params = [];
    if (date && id) {
      sql += ` WHERE  booking.date = $1 AND booking.id = $2 `;
      params.push(date, id);
    } else if (date) {
      sql += ` WHERE  booking.date = $1 `;
      params.push(date);
    }
    const result = await db.query(sql, params);

    res.status(200).json({
      data: result.rows,
      count: result.rows.reduce((acc, item)=> acc + parseInt(item.count, 10), 0).toString(),
      sum_count: result.rows.reduce((acc, item)=> acc + parseInt(item.sum_count, 10), 0).toString(),
    });
    // res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing SQL query:", error.message);
    res.status(500).json(error.message);
  }finally{
    db.release()
  }
};

// GET BY ID
export const getReportUserById = async(req,res)=> {
  const {id} = req.params
  const db = await pool.connect()
  try {
      const sql = `
    SELECT users.name , add_class.trade
    FROM add_class
    INNER JOIN users ON add_class.users_id = users.id
    WHERE add_class.booking_id = $1
    `
    const result = await db.query(sql, [id])
    res.status(200).json(result.rows)
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message)
  }finally{
    db.release()
  }
}


