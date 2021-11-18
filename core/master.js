import nm from 'nodemailer';
import fs from 'fs';
import dotenv from "dotenv";
dotenv.load();
const master = {};

master.addDb = async (Model, data) => {
    return Model(data).save();
}


master.getCount = async (Model, query = {}) => {
    return Model.count(query);
}


master.getOneDb = async (Model, query = {}) => {
    return Model.findOne(query).lean();
}

master.getAllDb = async (Model, query = {}, select = {}) => {
    return Model.find(query, select).sort({ "createdAt": -1 }).lean();
}

master.updateOne = async (Model, query, data) => {
    return Model.updateOne(query, data);
}

master.updateDb = async (Model, query, data) => {
    return Model.update(query, data, { multi: true });
}

master.removeDb = async (Model, where = {}) => {
    return Model.remove(where);
}

master.updateMany = async (Model, query, data) => {
    return Model.updateMany(query, data, { multi: true });
}



export default master;