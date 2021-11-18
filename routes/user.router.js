import express from "express";
import user from "../service/user.service";
import validation from "../core/validation";



const router = express.Router();

router.post('/login', user.login);

router.post('/logOut', user.logOut);

router.post('/addEditNurse', user.addEditNurse);

router.post('/removeNurse', user.removeNurse);

router.get('/getNurselist', user.getNurselist);

router.post('/addEditPatient', user.addEditPatient);

router.post('/removePatient', user.removePatient);

router.get('/getPatientList', user.getPatientList)

router.post('/getUserList', user.getUserList);

router.get('/getCategoryList', user.getCategoryList);

router.post('/addEditTask', user.addEditTask);

router.get('/getTaskList', user.getTaskList);

router.get('/changeTaskLocation', user.changeTaskLocation);

router.get('/changeTaskStatus', user.changeTaskStatus);

router.get('/removeTaskList', user.removeTaskList);


router.post('/sendMsg', user.sendMsg);
router.post('/disableNote', user.disableNote);
router.post('/graphApiData', user.graphApiData);
router.post('/addGraphData', user.addGraphData);
router.get('/getGraphData', user.getGraphData);
router.get('/removeGraphData', user.removeGraphData);
// router.get('/getPatientList', user.getPatientList);
router.post('/assignNurseToTask', user.assignNurseToTask);
router.post('/getTaskNameList', user.getTaskNameList);
router.post('/getNoteList', user.getNoteList);
router.post('/editDatabase', user.editDatabase);

export default router;