
import express from "express";
const router = express.Router()


import user from './user.router.js';


router.get('/index', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

export default router;
//export default {device, asset, region, zone, branch, user, usertype, assettype, router};
