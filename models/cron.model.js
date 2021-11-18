import mongoose from 'mongoose';

const Schema = mongoose.Schema({
    name: {},
}, { timestamps: true, collection: 'cron' });

let Model = mongoose.model('cron', Schema);


export default Model;