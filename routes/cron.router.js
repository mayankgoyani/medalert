import express from "express";
import cronService from "../service/cron.service";

const router = express.Router()

router.post('/notificationTask', cronService.notificationTask);



export default router;
