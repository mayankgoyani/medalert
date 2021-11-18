import mongoose from 'mongoose';

const ModelSchema = mongoose.Schema({

  userId: { type: mongoose.Schema.ObjectId },
  idArr: [],
  msg: { type: String, default: "" },
  data: [{
    userId: { type: mongoose.Schema.ObjectId },
    enabled: { type: String, default: "true", enum: ["true", "false"] },
    userActionDate: { type: Date, default: Date.now }
  }],

  enabled: { type: String, default: "true", enum: ["true", "false"] }, //true-enabled, false-disabled
  deleted: { type: String, default: "false", enum: ["true", "false"] },  //false-not delete, true-deleted 

}, { timestamps: true, collection: 'msg' });


let MsgModel = mongoose.model('msg', ModelSchema);


export default MsgModel;