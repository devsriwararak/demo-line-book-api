import express  from 'express'
import { getUsers } from '../Controllers/users.js'
import auth from '../Middleware/Auth.js'
const route = express.Router()

route.get('/', auth, getUsers)

export default route