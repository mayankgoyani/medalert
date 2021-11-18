import mongoose from 'mongoose';

const ModelSchema = mongoose.Schema({

  userId: { type: mongoose.Schema.ObjectId },
  data: {},

  enabled: { type: String, default: "true", enum: ["true", "false"] }, //true-enabled, false-disabled
  deleted: { type: String, default: "false", enum: ["true", "false"] },  //false-not delete, true-deleted    

}, { timestamps: true, collection: 'userGraphData' });


let Model = mongoose.model('userGraphData', ModelSchema);


export default Model;