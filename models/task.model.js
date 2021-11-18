import mongoose from 'mongoose';
import common from '../core/message/common.msg.js';
const ModelSchema = mongoose.Schema({

    categoryId: { type: mongoose.Schema.ObjectId },

    userId: { type: mongoose.Schema.ObjectId },

    nurseId: { type: mongoose.Schema.ObjectId, default: common.objectIDLimit },
    nurseIdList: [{ type: mongoose.Schema.ObjectId, default: common.objectIDLimit }],

    taskName: { type: String, default: "" },
    patientName: { type: String, default: "" },
    roomNumber: { type: String, default: "" },

    description: { type: String, default: "" },

    date: { type: Date, default: Date.now },

    c_date: { type: Date, default: Date.now },

    startTime: { type: String, default: "" },
    endTime: { type: String, default: "" },

    startTimeNumber: { type: Number, default: 0 },
    endTimeNumber: { type: Number, default: 0 },

    startTimeDate: { type: Date, default: Date.now },
    endTimeDate: { type: Date, default: Date.now },

    taskStatus: { type: String, default: "" },//PENDING, INPROGRESS, COMPLETE

    urgency: { type: String, default: "" },
    taskLocation: { type: String, default: "" },

    taskStatusDate: { type: Date, default: Date.now },

    notiStatus: { type: String, default: "false" },
    notiStatus1: { type: String, default: "false" },

    enabled: { type: String, default: "true", enum: ["true", "false"] }, //true-enabled, false-disabled
    deleted: { type: String, default: "false", enum: ["true", "false"] },  //false-not delete, true-deleted    

}, { timestamps: true, collection: 'task' });


let Model = mongoose.model('task', ModelSchema);

Model.getAvailabilityList = (where, page = '') => {
    if (page != '') {
        return AvailabilityModel.find(where).skip(10 * page).limit(10).sort({ 'createdAt': -1 }).lean();
    } else {
        return AvailabilityModel.find(where).sort({ 'createdAt': -1 }).lean();
    }
}

Model.getTaskListData = (where) => {

    return Model.aggregate([
        { $match: where },

        { $lookup: { from: "category", localField: "categoryId", foreignField: "_id", as: "categoryDocs" } },
        { $unwind: "$categoryDocs" },


        {
            "$lookup": {
                "from": "user",
                "let": { "nurseId": "$nurseId" },
                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$_id", "$$nurseId"] } } },
                    { "$project": { "email": 1, "fullName": 1 } }
                ],
                "as": "userDocs"
            }
        },

        {
            $project: {
                categoryId: 1,
                taskName: 1,
                patientName: 1,
                roomNumber: 1,
                date: 1,
                startTime: 1,
                endTime: 1,
                startTimeDate: 1,
                endTimeDate: 1,
                urgency: 1,
                taskLocation: 1,
                taskStatus: 1,
                description: 1,
                taskStatusDate: 1,
                nurseId: 1,
                createdAt: 1,
                nurseIdList: 1,

                categoryName: "$categoryDocs.category",
                categoryPath: "$categoryDocs.path",

                nurseData: { $arrayElemAt: ["$userDocs", 0] }
            }
        }

    ]);
}

Model.getMintTaskData = (where) => {

    return Model.aggregate([
        {
            $project: {

                timeDifference: { $divide: [{ $subtract: ["$startTimeDate", "$taskStatusDate"] }, 60000] },

                "taskLocation": "$taskLocation",
                "taskStatus": "$taskStatus",
                "patientName": "$patientName",
                "nurseId": "$nurseId",
                "categoryId": "$categoryId",
                "urgency": "$urgency",
                "enabled": "$enabled",
                "taskName": "$taskName"


            }
        },

        { $match: where },

    ]);
}

export default Model;