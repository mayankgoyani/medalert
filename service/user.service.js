import User from '../models/user.model';
import ObjectID from "bson-objectid";
import Master from '../core/master.js';
import common from '../core/message/common.msg.js';
import Category from '../models/category.model';
import Task from '../models/task.model';
import Patient from '../models/patient.model';
import userGraphData from '../models/userGraphData.model';
import Msg from '../models/msg.model';
import master from '../core/master.js';
import utility from '../core/utility'
let randtoken = require('rand-token');



const service = {};

service.addEditNurse = async (req, res) => {
    try {
        let post = req.body;
        let data = {};
        let temp = randtoken.generate(10);
        let token;
        const userExists = await User.findOne({ email: post.email });


        post.fullName = post.firstName + " " + post.lastName;
        console.log(post);
        if (post._id) {
            let data1 = await Master.getOneDb(User, { _id: ObjectID(post._id) });
            token = utility.createJwtToken({
                userId: post._id,
                email: data1.email
            });
            post.token = token;
            if (post.oldPassword && post.newPassword) {
                let logged = await master.getOneDb(User, { _id: ObjectID(post._id) });
                // console.log(logged.salt);
                let oldPassword = logged.password;
                // console.log(oldPassword);
                let userPassword = utility.createPassword(logged.salt, post.oldPassword);
                // console.log('========',userPassword);
                if (oldPassword != userPassword) {
                    return res.send({ "success": false, "code": common.errorCODE, "msg": "Please enter correct password" });
                }
                let hashed_password = utility.createPassword(temp, post.newPassword);
                post.password = hashed_password;
                post.salt = temp;
            }
            data = await Master.updateOne(User, { _id: ObjectID(post._id) }, post);
        }
        else {
            if (!userExists) {
                // console.log("temp",temp);
                let hashed_password = utility.createPassword(temp, post.password);
                token = utility.createJwtToken({
                    userId: post._id,
                    email: post.email
                });
                post.token = token;
                post.password = hashed_password;
                post.salt = temp;
                data = await User(post).save();
            }
            else {
                return res.send({ "success": false, "code": common.sucessCODE, "msg": common.sucessMSG, "data": "User Already exist" });
            }
        }
        // console.log('=====================');
        return res.send({ "success": true, "code": common.sucessCODE, "msg": common.sucessMSG, "data": data, "token": token });
    }
    catch (error) {
        return res.send({ "success": false, "code": common.errorCODE, "msg": common.catchMsg, "err": error })
    }
}

service.addEditPatient = async (req, res) => {
    try {
        let post = req.body;
        let data = {};
        post.fullName = post.firstName + " " + post.lastName;
        if (post._id) {
            data = await Master.updateOne(Patient, { _id: ObjectID(post._id) }, post);
        } else {
            data = await Patient(post).save();
        }
        return res.send({ "success": true, "code": common.successCODE, "msg": common.sucessMSG, "data": data });
    } catch (error) {
        return res.send({ "success": false, "code": common.errorCODE, "msg": common.catchMsg, "err": error })
    }
}

service.removePatient = async (req, res) => {
    try {
        let post = req.body;
        if (post._id) {
            Master.removeDb(Patient, { _id: ObjectID(post._id) });
            return res.send({ "success": true, "code": common.sucessCODE, "msg": common.sucessMSG, "data": "user deleted" });
        }
    }
    catch (error) {
        return res.send({ "success": false, "code": common.errorCODE, "msg": common.catchMsg, "err": error })

    }
}

service.getPatientList = async (req, res) => {
    // console.log('-------------');
    try {
        let data = await master.getAllDb(Patient, {});
        console.log(data);
        for (let x in data) {
            let d1 = new Date();
            let d2 = new Date();

            d1.setHours(24, 0, 0, 0);
            d2.setHours(0, 0, 0, 0);
            // console.log(d1);
            // console.log(d2);
            // console.log(data[x].fullName);
            let totalCount = await master.getCount(Task, { $and: [{ patientName: data[x].fullName }, { startTimeDate: { $gte: d2, $lt: d1 } }] });
            let Completed = await master.getCount(Task, { $and: [{ patientName: data[x].fullName }, { taskStatus: "Completed" }, { startTimeDate: { $gte: d2, $lt: d1 } }] });

            // console.log("totalCount", totalCount);
            // console.log("Completed", Completed);

            let percentage = (Completed / totalCount) * 100;


            if (totalCount == 0) {
                percentage = 0;
            }
            console.log("percentage", percentage);

            data[x].percentage = Math.floor(percentage);
        }
        // let data = Patient.find({});
        return res.send({ "success": true, "code": common.successCODE, "msg": common.sucessMSG, "data": data });
    } catch (error) {
        return res.send({ "success": false, "code": common.errorCODE, "msg": common.catchMsg, "err": error })
    }
}

service.removeNurse = async (req, res) => {
    try {
        let post = req.body;
        if (post._id) {
            Master.removeDb(User, { _id: ObjectID(post._id) });
            return res.send({ "success": true, "code": common.sucessCODE, "msg": common.sucessMSG, "data": "user deleted" });

        }
    }
    catch (error) {
        return res.send({ "success": false, "code": common.errorCODE, "msg": common.catchMsg, "err": error })

    }
}

service.getUserList = async (req, res) => {
    try {
        let data
        if (req.body.userType) {
            data = await User.find({ userType: req.body.userType }, { firstName: 1, lastName: 1, fullName: 1, email: 1, userType: 1 });
        } else {
            data = await User.find({}, { firstName: 1, lastName: 1, fullName: 1, email: 1, userType: 1 });
        }
        if (data.length) {
            for (let x in data) {
                if (data[x].userType == "NURSE") {
                    let d1 = new Date();
                    let d2 = new Date();

                    d1.setHours(24, 0, 0, 0);
                    d2.setHours(0, 0, 0, 0);
                    // console.log(d1);
                    // console.log(d2);

                    let totalCount = await master.getCount(Task, { $and: [{ nurseId: ObjectID(data[x]._id) }, { startTimeDate: { $gte: d2, $lt: d1 } }] });
                    let Completed = await master.getCount(Task, { $and: [{ nurseId: ObjectID(data[x]._id) }, { taskStatus: "Completed" }, { startTimeDate: { $gte: d2, $lt: d1 } }] });

                    // console.log("totalCount", totalCount);
                    // console.log("Completed", Completed);

                    let percentage = (Completed / totalCount) * 100;


                    if (totalCount == 0) {
                        percentage = 0;
                    }
                    // console.log("percentage", percentage);

                    data[x]._doc.percentage = Math.floor(percentage);
                }
                else {
                    // data[x].percentage = null;
                }

            }

        }
        // console.log(data);
        return res.send({ "success": true, "code": common.successCODE, "msg": common.sucessMSG, "data": data });

    }
    catch (error) {
        return res.send({ "success": false, "code": common.errorCODE, "msg": common.catchMsg, "err": error })

    }
}

service.login = async (req, res) => {

    try {

        let where = {};
        let logged = {};

        // const errors = validationResult(req);
        // if(!errors.isEmpty()){
        //     let msg = errors.array();
        //     return res.send({ "success": false, "code": common.errorCODE,"msg":(msg && msg[0])?msg[0]['msg']:common.errorMSG, "err":errors.array()});
        // }else{


        where = { "email": req.body.email.toLowerCase(), "deleted": "false" };

        logged = await Master.getOneDb(User, where);

        if (logged) {



            let oldPassword = logged.password;
            let userPassword = utility.createPassword(logged.salt, req.body.password);

            if (oldPassword != userPassword) {
                return res.send({ "success": false, "code": common.errorCODE, "msg": "Please enter correct password" });
            }


            let token = utility.createJwtToken({
                userId: logged._id,
                email: logged.email
            });


            await Master.updateOne(User, { "_id": logged._id }, {
                token: token,
                deviceId: req.body.deviceId ? req.body.deviceId : '',
                deviceToken: req.body.deviceToken ? req.body.deviceToken : '',
                deviceType: req.body.deviceType ? req.body.deviceType : '',
                loginType: req.body.loginType ? req.body.loginType : 'web',
            });


            let userData = await Master.getOneDb(User, where);

            if (userData) {
                delete userData.password;
                delete userData.salt;
            }

            return res.send({ "success": true, "code": common.sucessCODE, "msg": common.sucessMSG, "data": userData });

        } else {
            return res.send({ "success": false, "code": common.errorCODE, "msg": "Please enter correct Email or UserType" });
        }

        // }


    } catch (error) {
        return res.send({ "success": false, "code": common.errorCODE, "msg": common.catchMsg, "err": error })
    }
}

service.logOut = async (req, res) => {
    let data = await master.getOneDb(User, { "_id": ObjectID(req.body._id) })
    try {
        if (data) {
            return res.send({ "success": true, "code": common.sucessCODE, "msg": common.sucessMSG, "data": data });
        }
        else {
            return res.send({ "success": false, "code": common.errorCODE, "msg": "User Not Found" });
        }
    } catch (error) {
        return res.send({ "success": false, "code": common.errorCODE, "msg": common.catchMsg, "err": error })
    }

}

service.getCategoryList = async (req, res) => {

    let data = await Category.find({ "deleted": "false", "enabled": "true", });

    data = (data && data.length) ? data : common.categoryDataList;

    return res.send({ "success": true, "code": common.sucessCODE, "msg": common.sucessMSG, "data": data });

}


service.addEditTask = async (req, res) => {



    let post = req.body;

    //let date = utility.dateFormatEmail(new Date());

    // let bookData = await Master.getOneDb(Task, {
    //     'categoryId' : post.categoryId, 
    //     'date' : new Date(post.date),
    //     'startTime': post.startTime, 
    //     'endTime': post.endTime, 
    //     'urgency' :  post.urgency, 
    // });

    // if(bookData){
    //     return res.send({ "success": false, "code": common.errorCODE, "msg": "please book another task" });
    // }

    let data = {};

    let startDate = new Date(post.date + " " + post.startTime);
    let endDate = new Date(post.date + " " + post.endTime);



    post.startTimeNumber = startDate.getTime();
    post.endTimeNumber = endDate.getTime();

    post.startTimeDate = post.startTimeutc;
    post.endTimeDate = post.endTimeutc;

    post.status = post.status;
    if (post.userId) {
        post.nurseId = ObjectID(post.userId);
        let nurseIdArr = [];
        nurseIdArr.push(ObjectID(post.userId))
        post.nurseIdList = nurseIdArr;
    }


    console.log(post);
    // return

    if (post._id) {
        data = await Master.updateOne(Task, { _id: ObjectID(post._id) }, post);
    } else {
        // data = await Master.addDb(Task,(post,{ nurseId: ObjectID(post.userId)}))
        data = await Task(post).save();
    }


    return res.send({ "success": true, "code": common.successCODE, "msg": common.sucessMSG, "data": data });



}

service.getTaskNameList = async (req, res) => {
    let where = { "deleted": "false", "enabled": "true" };

    if (req.body.taskNameArr) {
        where.taskName = { $in: req.body.taskNameArr };
    }

    let data = await Task.find(where, { 'taskName': 1 });

    return res.send({ "success": true, "code": common.successCODE, "msg": common.sucessMSG, "data": data, where });
}

service.getNoteList = async (req, res) => {
    let where = { "deleted": "false", "enabled": "true" };

    let post = req.body;

    if (req.body.userId) {
        where.idArr = { $in: [ObjectID(req.body.userId)] };
    }

    let data = await Msg.aggregate([
        { $match: where },
        {
            "$lookup": {
                "from": "user",
                "let": { "userId": "$userId" },
                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$_id", "$$userId"] } } },
                    { "$project": { "email": 1, "fullName": 1 } }
                ],
                "as": "userDocs"
            }
        },
        {
            $project: {
                data: 1,
                createdAt: 1,
                msg: 1,
                userId: 1,
                userData: { $arrayElemAt: ["$userDocs", 0] }
            }
        }
    ]);

    let result = [];
    if (data && data.length) {
        for (let x in data) {
            let in_data = data[x]['data'];
            let pushStatus = 1;

            if (in_data && in_data.length) {
                for (let y in in_data) {
                    if (in_data[y]['userId'].toString() == post.userId.toString() && in_data[y]['enabled'] == "false") {
                        pushStatus = 0;
                        console.log('amit')
                    }
                }
            }

            if (pushStatus == 1) {
                result.push(data[x]);
            }
        }
    }

    return res.send({ "success": true, "code": common.successCODE, "msg": common.sucessMSG, "data": result, where });
}
service.getTaskList = async (req, res) => {
    try {
        let where = { "deleted": "false", "enabled": "true" };
        if (req.query.taskLocation) {
            where.taskLocation = req.query.taskLocation;
        }

        if (req.query.urgency) {
            where.urgency = req.query.urgency;
        }

        if (req.query.nurseIdArr) {
            let nurseIdArr = req.query.nurseIdArr;

            nurseIdArr = JSON.parse(nurseIdArr);

            let n_arr = [];
            if (nurseIdArr && nurseIdArr.length) {
                for (let x in nurseIdArr) {
                    n_arr.push(ObjectID(nurseIdArr[x]));
                }
            }

            if (n_arr && n_arr.length) {
                where.nurseId = { $in: n_arr };
            }
        }

        if (req.query.taskNameArr) {
            let taskNameArr = req.query.taskNameArr;

            taskNameArr = JSON.parse(taskNameArr);


            where.taskName = { $in: taskNameArr };

        }

        let data = await Task.getTaskListData(where);


        let inArr = [];
        let outArr = [];
        let outArr1 = [];
        let inProgArr = [];
        let completedArr = [];
        let finalArr = [];

        if (data && data.length) {
            for (let x in data) {
                var today = new Date();
                // console.log(today);
                var Christmas = data[x]['startTimeDate'];
                var diffMs = (Christmas - today);
                // var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
                var diffMins = Math.round(diffMs / 60000); // minutes   
                // console.log('diffmins',diffMins);

                // diffMins = Math.abs(diffMins);

                data[x]['timeDuration'] = diffMins;


                if (diffMins >= 0 && diffMins <= 15) {
                    if (data[x]['taskStatus'] == "Completed") {
                        completedArr.push(data[x]);
                    } else if (data[x]['taskStatus'] == "In Progress") {
                        inProgArr.push(data[x]);
                    } else {
                        inArr.push(data[x]);
                    }

                } else if (diffMins > 15) {
                    if (data[x]['taskStatus'] == "Completed") {
                        completedArr.push(data[x]);
                    } else if (data[x]['taskStatus'] == "In Progress") {
                        inProgArr.push(data[x]);
                    } else {
                        outArr.push(data[x])
                    }

                }
                else if (diffMins < 0) {
                    if (data[x]['taskStatus'] == "Completed") {
                        completedArr.push(data[x]);
                    } else if (data[x]['taskStatus'] == "In Progress") {
                        inProgArr.push(data[x]);
                    } else {
                        outArr1.push(data[x]);
                    }

                }
            }
        }

        // inArr = inArr.sort(function(a,b){ return new Date(b.createdAt) - new Date(a.createdAt); });
        // outArr = outArr.sort(function(a,b){ return new Date(b.createdAt) - new Date(a.createdAt); });
        inProgArr = inProgArr.sort((a, b) => parseFloat(a.timeDuration) - parseFloat(b.timeDuration));

        finalArr = finalArr.concat(inProgArr);
        inArr = inArr.concat(outArr);
        inArr = inArr.sort((a, b) => parseFloat(a.timeDuration) - parseFloat(b.timeDuration));

        inArr = inArr.concat(outArr1);
        // console.log(inArr);

        inArr = inArr.concat(completedArr);
        finalArr = finalArr.concat(inArr);
        for (let y in finalArr) {
            let previousNurse = [];
            if (finalArr[y].nurseId) {
                for (let z in finalArr[y].nurseIdList) {
                    // console.log("nise",finalArr[y].nurseIdList[z]);
                    let nurseData = await master.getOneDb(User, { _id: ObjectID(finalArr[y].nurseIdList[z]) });
                    // console.log(nurseData.fullName, 'z', z);
                    previousNurse[z] = { name: nurseData.fullName, email: nurseData.email, _id: nurseData._id };
                }
                // console.log(previousNurse);
                finalArr[y].previousNurseData = previousNurse;
            }
            // console.log(finalArr[y].previousNurse);
        }
        // console.log(finalArr);
        // console.log(finalArr[0].previousNurse);
        // console.log(finalArr[3].nurseIdList);
        return res.send({ "success": true, "code": common.successCODE, "msg": common.sucessMSG, "data": finalArr, where });
    } catch (error) {
        return res.send({ "success": false, "code": common.errorCODE, "err": error });
    }
}


service.removeTaskList = async (req, res) => {
    try {


        if (!req.query._id) {
            return res.send({ "success": false, "code": common.errorCODE, "msg": "_id is required." });
        }

        let where = { "_id": ObjectID(req.query._id) };

        let data = await Task.remove(where);


        return res.send({ "success": true, "code": common.successCODE, "msg": common.sucessMSG, "data": data });

    } catch (error) {
        return res.send({ "success": false, "code": common.errorCODE, "err": error });
    }
}



service.changeTaskLocation = async (req, res) => {
    try {

        if (!req.query._id) {
            return res.send({ "success": false, "code": common.errorCODE, "msg": "_id is required." });
        }

        let taskLocation = req.query.taskLocation ? req.query.taskLocation : '';

        // let data = await Master.updateDb(Task, { _id: ObjectID(req.query._id) }, { taskLocation: taskLocation, taskStatusDate: new Date() });
        let data = await Master.updateDb(Task, { _id: ObjectID(req.query._id) }, { taskLocation: taskLocation });


        return res.send({ "success": true, "code": common.successCODE, "msg": common.sucessMSG, "data": data });

    } catch (error) {
        return res.send({ "success": false, "code": common.errorCODE, "err": error });
    }
}



service.changeTaskStatus = async (req, res) => {
    try {

        if (!req.query._id) {
            return res.send({ "success": false, "code": common.errorCODE, "msg": "_id is required." });
        }
        let data;
        let taskStatus = req.query.taskStatus ? req.query.taskStatus : '';
        if (taskStatus == "In Progress") {
            data = await Master.updateDb(Task, { _id: ObjectID(req.query._id) }, { taskStatus: taskStatus, taskStatusDate: new Date() });
        }
        else {
            data = await Master.updateDb(Task, { _id: ObjectID(req.query._id) }, { taskStatus: taskStatus });
        }


        return res.send({ "success": true, "code": common.successCODE, "msg": common.sucessMSG, "data": data });

    } catch (error) {
        return res.send({ "success": false, "code": common.errorCODE, "err": error });
    }
}




service.getNurselist = async (req, res) => {
    try {
        let data = await User.find({ userType: "NURSE" }, { fullName: 1, email: 1 });
        if (data.length) {
            for (let x in data) {
                let d1 = new Date();
                let d2 = new Date();

                d1.setHours(24, 0, 0, 0);
                d2.setHours(0, 0, 0, 0);
                // console.log(d1);
                // console.log(d2);

                let totalCount = await master.getCount(Task, { $and: [{ nurseId: ObjectID(data[x]._id) }, { startTimeDate: { $gte: d2, $lt: d1 } }] });
                let Completed = await master.getCount(Task, { $and: [{ nurseId: ObjectID(data[x]._id) }, { taskStatus: "Completed" }, { startTimeDate: { $gte: d2, $lt: d1 } }] });

                // console.log("totalCount", totalCount);
                // console.log("Completed", Completed);

                let percentage = (Completed / totalCount) * 100;


                if (totalCount == 0) {
                    percentage = 0;
                }
                console.log("percentage", percentage);

                data[x]._doc.percentage = Math.floor(percentage);
            }

        }
        console.log(data);
        return res.send({ "success": true, "code": common.successCODE, "msg": common.sucessMSG, "data": data });
    } catch (error) {
        return res.send({ "success": false, "code": common.errorCODE, "err": error });
    }
}



service.sendMsg = async (req, res) => {


    let post = req.body;

    let idArr = [];

    let dataArr = [];

    if (post.idArr) {
        for (let x in post.idArr) {
            idArr.push(ObjectID(post.idArr[x]));

            dataArr.push({
                userId: post.idArr[x]
            })
        }
    }
    post.idArr = idArr;
    //post.data = { $addToSet:{"data":dataArr}}

    let data = await master.addDb(Msg, post);

    if (data && data._id) {
        await master.updateOne(Msg, { _id: ObjectID(data._id) }, { "data": dataArr });
    }

    return res.send({ "success": true, "code": common.successCODE, "msg": common.sucessMSG, "data": data });

}

service.disableNote = async (req, res) => {

    let post = req.body;

    let data = await master.getOneDb(Msg, { _id: ObjectID(post._id) })

    if (data && data._id) {
        data = data.data;

        if (data && data.length) {
            let dataArr = [];
            for (let x in data) {
                dataArr.push({
                    userActionDate: data[x]['userActionDate'],
                    userId: data[x]['userId'],
                    enabled: (data[x]['userId'] == post.userId) ? "false" : data[x]['enabled'],
                })
            }
            await master.updateOne(Msg, { _id: ObjectID(post._id) }, { "data": dataArr });
        }
    }


    return res.send({ "success": true, "code": common.successCODE, "msg": common.sucessMSG, "data": data });

}


service.assignNurseToTask = async (req, res) => {
    let nurseIdList = []
    let post = req.body;
    let data1 = await master.getOneDb(Task, { _id: ObjectID(post.taskId) })
    if (data1.nurseIdList) {
        // console.log(data1.nurseIdList);
        nurseIdList = data1.nurseIdList;
    }
    // let xyz = ObjectID(post.nurseId);
    nurseIdList.unshift(ObjectID(post.nurseId));
    // console.log(nurseIdList);
    let data = await master.updateDb(Task, { _id: ObjectID(post.taskId) }, { nurseId: ObjectID(post.nurseId), nurseIdList: nurseIdList });

    return res.send({ "success": true, "code": common.successCODE, "msg": common.sucessMSG, data: data });

}


service.graphApiData = async (req, res) => {
    try {

        let post = req.body;

        let conditions = []

        conditions.push({ "enabled": "true" });

        if (post.taskStatus) {
            //conditions.push({"taskStatus" : { $in : post.taskStatus} });
        }

        if (post.patientName) {
            conditions.push({ "patientName": { $in: post.patientName } });
        }

        if (post.urgency) {
            conditions.push({ "urgency": { $in: post.urgency } });
        }

        if (post.nurseId) {
            let nurseArr = post.nurseId;
            conditions.push({ "nurseId": { $in: nurseArr } });
        }
        if (post.taskNameArr) {
            let taskArr = post.taskNameArr
            conditions.push({ "taskName": { $in: taskArr } })
        }

        if (post.category) {
            let categoryArr = post.category;
            conditions.push({ "categoryId": { $in: categoryArr } });
        }
        let complete = 0;
        let Incomplete = 0;
        let InProgress = 0;
        let notAssigned = 0;
        let late1 = 0;
        let late = 0;
        let late2 = 0;
        post.minTime = parseInt(post.minTime) * 60;
        post.maxTime = parseInt(post.maxTime) * 60;
        post.historyTime = parseInt(post.historyTime) * 60;
        if (post.minTime || post.maxTime) {

            let data = await master.getAllDb(Task, { $and: conditions });
            // let data = await Task.getTaskListData({$and: conditions});
            // console.log("data", data);
            if (data && data.length) {
                for (let x in data) {
                    let today = new Date();
                    let Christmas = data[x].startTimeDate;
                    // console.log(Christmas);
                    let diffMs = (Christmas - today);
                    let diffMins = (diffMs / 60000);
                    // console.log("diffMins", diffMins);
                    // console.log('data1111', data[x].taskStatus);
                    if (diffMins > post.minTime && diffMins <= post.maxTime) {
                        console.log(data[x].taskStatus);
                        if (data[x].taskStatus == "Completed") {
                            complete++;
                        }
                        if (data[x].taskStatus == "") {
                            Incomplete++
                        }
                        if (data[x].taskStatus == "In Progress") {
                            InProgress++;
                        }
                    }
                }
            }
        }
        else if (post.historyTime) {
            let data = await master.getAllDb(Task, { $and: conditions });

            // console.log("data", data);
            if (data && data.length) {
                for (let x in data) {
                    let today = new Date();
                    let Christmas = data[x].startTimeDate;
                    // console.log(Christmas);
                    let diffMs = (Christmas - today);
                    let diffMins = (diffMs / 60000);
                    diffMins = Math.abs(diffMins);
                    // console.log("diffMins", diffMins);
                    // console.log('data1111', data[x].taskStatus);
                    if (diffMins <= post.historyTime) {
                        // console.log('==================>',data[x].taskStatus);
                        if (data[x].taskStatus == "Completed") {
                            complete++;
                        }
                        if (data[x].taskStatus == "") {
                            Incomplete++
                        }
                        if (data[x].taskStatus == "In Progress") {
                            InProgress++;
                        }
                        if (data[x].taskStatus == "Completed" && ((data[x].startTimeDate - data[x].taskStatusDate) / 60000) < -10) {
                            late2++;
                            console.log((data[x].startTimeDate - data[x].taskStatusDate) / 60000);

                        }
                        if (data[x].taskStatus == "In Progress" && ((data[x].startTimeDate - data[x].taskStatusDate) / 60000) < -10) {
                            late++;
                            console.log((data[x].startTimeDate - data[x].taskStatusDate) / 60000);

                        }
                    }
                }
            }
            complete = complete - late2;
            InProgress = InProgress - late;
            late1 = late + late2;
        }
        else {
            late = await Task.getMintTaskData({ $and: conditions, $or: [{ taskStatus: "In Progress" }], "timeDifference": { "$lte": -10 } });
            late2 = await Task.getMintTaskData({ $and: conditions, $or: [{ taskStatus: "Completed" }], "timeDifference": { "$lte": -10 } });
            complete = await master.getCount(Task, { $and: conditions, taskStatus: "Completed" });
            Incomplete = await master.getCount(Task, { $and: conditions, taskLocation: "Task Pool", "taskStatus": "" });
            InProgress = await master.getCount(Task, { $and: conditions, taskStatus: "In Progress" });
            notAssigned = await master.getCount(Task, { $and: conditions, taskLocation: "My Tasks", "taskStatus": "" });
            InProgress = InProgress - late.length;
            complete = complete - late2.length;
            late1 = late.length + late2.length;
            Incomplete = Incomplete + notAssigned;
        }
        //let delayed = await Task.getMintTaskData({ "timeDifference": { "$gte": 10, "$lte": 15 }});
        // let late = await Task.getMintTaskData({ $and: conditions, "timeDifference": { "$gte": 15 } });

        // console.log("late",late,"length",late1);

        // let late2 = (complete + Incomplete + InProgress) - late1;
        // let late2 = late1

        if (late1 <= 0) {
            late1 = 0;
        }

        let totalCount = 0;

        if (post.taskStatus) {
            let taskStatusArr = post.taskStatus;
            if (taskStatusArr.indexOf("Completed") >= 0) {
                totalCount += complete;
            }
            else {
                complete = 0;
            }
            if (taskStatusArr.indexOf("Incomplete") >= 0) {
                totalCount += Incomplete;
            }
            else {
                Incomplete = 0;
            }
            if (taskStatusArr.indexOf("InProgress") >= 0) {
                totalCount += InProgress;
            }
            else {
                InProgress = 0;
            }
            if (taskStatusArr.indexOf("late") >= 0) {
                totalCount += late1;
            }
            else {
                late1 = 0;
            }
        }
        else {
            totalCount = complete + Incomplete + InProgress + late1;

        }


        let data = {
            "complete": complete,
            "Incomplete": Incomplete,
            "InProgress": InProgress,
            "late": late1,
            // "notAssigned": notAssigned,

            "totalCount": totalCount,
        };

        return res.send({ "success": true, "code": common.successCODE, "msg": common.sucessMSG, "data": data, conditions });

    } catch (error) {
        return res.send({ "success": false, "code": common.errorCODE, "err": error });
    }
}

service.addGraphData = async (req, res) => {

    // let errors = validationResult(req);

    // if(!errors.isEmpty()){
    //     let msg = errors.array();
    //     return res.send({ "success": false, "code": common.errorCODE,"msg":(msg && msg[0])?msg[0]['msg']:common.errorMSG , "err":errors.array()});
    // }else{
    let post = req.body;

    let data;
    if (post._id) {
        data = await master.updateOne(userGraphData, { _id: ObjectID(post._id) }, post);
    } else {
        data = await master.addDb(userGraphData, post);
    }

    return res.send({ "success": true, "code": common.successCODE, "msg": common.sucessMSG, data: data });
    // }
}

service.getGraphData = async (req, res) => {

    if (!req.query.userId) {
        return res.send({ "success": false, "code": common.errorCODE, "msg": "userId is required." });
    }
    let data = await master.getAllDb(userGraphData, { 'userId': ObjectID(req.query.userId) });
    return res.send({ "success": true, "code": common.successCODE, "msg": common.sucessMSG, data: data });

}

service.removeGraphData = async (req, res) => {

    if (!req.query._id) {
        return res.send({ "success": false, "code": common.errorCODE, "msg": "_id is required." });
    }
    let data = await master.removeDb(userGraphData, { '_id': ObjectID(req.query._id) });
    return res.send({ "success": true, "code": common.successCODE, "msg": common.sucessMSG, data: data });

}

// service.getPatientList = async (req, res) => {
//     let data = await Task.aggregate([{ $project: { fullName: "$patientName" } }]);
//     return res.send({ "success": true, "code": common.successCODE, "msg": common.sucessMSG, data: data });
// }

service.editDatabase = async (req, res) => {
    let data = await master.updateOne(User, { "_id": req.body._id }, {
        fullName: req.body.fullName
    })
    return res.send({ "success": true, "code": common.successCODE, "msg": common.sucessMSG, data: data });
}


export default service;
