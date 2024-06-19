import express  from 'express'
import { getUserDate, getUsers, postUserBooking } from '../Controllers/users.js'
import auth from '../Middleware/Auth.js'
const route = express.Router()

route.get('/', auth, getUsers)
route.get('/date', auth, getUserDate)
route.post('/booking', auth , postUserBooking )

export default route