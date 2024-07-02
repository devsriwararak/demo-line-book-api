import express from "express";
import pool from "./pool.js";
import cors from "cors";
import userRouter from './routes/users.js'
import bookingRouter from './routes/bookings.js'
import loginRouter from './routes/login.js'
import reportRouter from './routes/reports.js'

const app = express();
const PORT = process.env.PORT || 8080;
const corsOptions = {
  origin: ["http://localhost:5173"],
};
app.use(cors());
app.use(express.json());

app.get('/', (req,res)=> {
  res.send('ver-2')
})

app.use('/api/user', userRouter)
app.use('/api/booking', bookingRouter)
app.use('/api/login', loginRouter)
app.use('/api/report', reportRouter)


app.listen(PORT, () => {
  console.log("server is 5000");
});



