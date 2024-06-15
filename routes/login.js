import express from 'express'
import { postLogin, postRegister } from '../Controllers/login.js'
const route = express.Router()

route.post('/register', postRegister)
route.post('/',postLogin)



export default route