import ObjectID from "bson-objectid";
import common from '../core/message/common.msg.js';
import push_notification from '../core/libraries/push_notification.js';


import User from '../models/user.model';
import Task from '../models/task.model';


import Master from '../core/master.js';



import Cron from '../models/cron.model';

const service = {};

service.notificationTask = async (req, res) => {

	console.log('notificationTask working...!');

	let data = await Task.find({ "taskStatus": { $in: [""] } });

	if (data) {
		for (let x in data) {
			var today = new Date();

			var dateFuture = new Date(data[x]['startTimeDate']);
			var endTimeDate = new Date(data[x]['endTimeDate']);

			let diffInMilliSeconds = (dateFuture - today) / 1000;
			const minutes = Math.floor(diffInMilliSeconds / 60);

			let endDiffInMilliSeconds = (endTimeDate - today) / 1000;
			const endMinutes = Math.floor(endDiffInMilliSeconds / 60);


			let userData = await Master.getOneDb(User, { _id: ObjectID(data[x]['userId']) });

			if ((minutes > 0 && minutes <= 15) && data[x]['notiStatus'] == "false") {

				let notiData = {
					"notification": {
						"body": "Task " + data[x]['taskName'] + " need to be start in 15 minutes",
						"title": common.NOTI_TITLE
					},
					"priority": "high",
					"data": {},
					"to": userData.deviceToken
				};

				await push_notification.sendPushNotifications(notiData);

				await Cron({ name: notiData }).save();

				await Master.updateOne(Task, { _id: ObjectID(data[x]['_id']) }, { notiStatus: "true" });

			}

			if (endMinutes < 0 && data[x]['notiStatus1'] == "false") {
				let notiData1 = {
					"notification": {

						"body": "Task " + data[x]['taskName'] + " end time is over",
						"title": common.NOTI_TITLE
					},
					"priority": "high",
					"data": {},
					"to": userData.deviceToken
				}
				await push_notification.sendPushNotifications(notiData1);

				await Cron({ name: notiData1 }).save();

				await Master.updateOne(Task, { _id: ObjectID(data[x]['_id']) }, { notiStatus1: "true" });
			}

		}
	}


	//return res.send({data});
}



export default service;