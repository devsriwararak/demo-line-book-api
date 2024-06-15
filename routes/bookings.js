import express from 'express'
import { deleteBooking, editBooking, getBookings, postInsertBooking } from '../Controllers/bookings.js'
import auth from '../Middleware/Auth.js'

const router = express.Router()

router.post('/', auth, getBookings)
router.post('/insert', auth, postInsertBooking)
router.delete('/:id', auth,  deleteBooking)
router.put('/:id', auth, editBooking)

export default router