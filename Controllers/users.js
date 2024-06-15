import pool from "../pool.js";


// อธิบายการทำงาน
export const getUsers = async(req,res)=> {
    const db = await pool.connect();
    try {
        const sql = `SELECT * FROM users ORDER BY id ASC`;
        const data = await db.query(sql);
        res.status(200).json(data.rows);
      } catch (error) {
        console.log(error);
        res.status(500).json(error.message);
      } finally {
        db.release()
      }
}

