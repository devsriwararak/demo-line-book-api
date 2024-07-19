import express  from 'express'
import { getMyUserData, getUserDate, getUsers, postUserBooking } from '../Controllers/users.js'
import auth from '../Middleware/Auth.js'
const route = express.Router()

route.get('/', auth, getUsers)
route.get('/date', auth, getUserDate)
route.post('/booking' , postUserBooking )
route.post('/mybook', auth, getMyUserData)

export default route