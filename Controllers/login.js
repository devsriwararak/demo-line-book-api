import becrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../pool.js";
import dotenv from 'dotenv';
dotenv.config();

export const postRegister = async (req, res) => {
  const { username, password } = req.body;
  const db = await pool.connect();
  try {
    const hashedPassword = await becrypt.hash(password, 10);
    const sql = `INSERT INTO users (username, password) VALUES ($1,$2) RETURNING *`;
    const result = await db.query(sql, [username, hashedPassword]);
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.log(error);
  }finally{
    db.release();
  }
};
export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);
  try {
    const db = await pool.connect();
    const sqlCheckUsername = `SELECT id, username, name, password FROM users WHERE username = $1`;
    const result = await db.query(sqlCheckUsername, [username]);
    db.release();

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Username ไม่ถูกต้อง" });
    }

    const user = result.rows[0];
    const isMatch = await becrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "password ไม่ถูกต้อง" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
