import express from 'express'
import { GetReportUsers, getReportUserById, searchDate } from '../Controllers/reports.js'

const router = express.Router()

router.post('/search/date', searchDate)
router.post('/users', GetReportUsers)
router.get('/users/:id',  getReportUserById)


export default router