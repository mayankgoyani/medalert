import mongoose from 'mongoose';
import AutoIncrement from "mongoose-auto-increment";
AutoIncrement.initialize(mongoose);
import common from '../core/message/common.msg.js';

const UserSchema = mongoose.Schema({


    firstName: { type: String },
    lastName: { type: String },


    clinicNumberName: { type: String, default: "" },
    clinicNumber: { type: Number, index: { unique: true } },

    clinicId: { type: String, default: "" },
    clinicStatus: { type: String, default: "false" },


    fullName: { type: String },
    email: { type: String, index: { unique: true } },
    phone: { type: String, index: { unique: true } },

    clinicContact: { type: String, default: "" },

    phoneCode: { type: String, default: "+1" },
    dob: { type: String, default: "" },

    profileImg: { type: String, default: "" },

    password: { type: String, default: "" },
    salt: { type: String, default: "" },
    temp_str: { type: String, default: "" },

    forgotToken: { type: String, default: "" },
    token: { type: String, default: "" },

    licenseNumber: { type: String, default: "" },
    licenseDoc: { type: String, default: "" },
    licenseExpDate: { type: Date, default: Date.now },


    socialSecurityNumber: { type: String, default: "" },

    npi: { type: String, default: "" },
    npiDoc: { type: String, default: "" },
    npiExpDate: { type: Date, default: Date.now },

    w9Form: { type: String, default: "" },
    w9FormDoc: { type: String, default: "" },
    w9FormExpDate: { type: Date, default: Date.now },

    w9WithEIN: { type: String, default: "" },
    w9WithEINDoc: { type: String, default: "" },
    w9WithEINExpDate: { type: Date, default: Date.now },

    insuranceNumber: { type: String, default: "" },
    insuranceDoc: { type: String, default: "" },
    insuranceExpDate: { type: Date, default: Date.now },


    gender: { type: String, default: '' },// enum:['male', 'female', 'other']

    address: { type: String, default: "" },
    address1: { type: String, default: "" },
    aptStreet: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zipCode: { type: String, default: "" },

    googleId: { type: String, default: "" },
    facebookId: { type: String, default: "" },

    loginType: { type: String, default: "other" },
    userType: { type: String, default: 'OTHER', enum: common.userTypeArr },


    activeStatus: { type: String, default: "true", enum: ["true", "false"] }, //true-enabled, false-disabled

    enabled: { type: String, default: "true", enum: ["true", "false"] }, //true-enabled, false-disabled
    deleted: { type: String, default: "false", enum: ["true", "false"] },  //false-not delete, true-deleted 

    blockStatus: { type: String, default: "false", enum: ["true", "false"] },  //false-not delete, true-deleted 
    blockDate: { type: Date, default: Date.now },

    medBridgeAccount: { type: String, default: "" },

    refralCode: { type: String, default: "" },
    userRating: { type: Number, default: 0 },
    userAppVersion: { type: String, default: "" },

    otp: { type: String, default: "" },
    otpVerify: { type: String, default: "false" },

    deviceId: { type: String, default: "" },
    deviceToken: { type: String, default: "" },
    latitude: { type: String, default: "" },
    longitude: { type: String, default: "" },
    deviceType: { type: String, default: "android" },

    paDocs: [
        {
            title: { type: String, default: "" },
            imgPath: { type: String, default: "" },
            size: { type: Number, default: 0 },
            isDefault: { type: String, default: "" },
        }
    ],

    medicalHistory: {
        medicalHistory: { type: String, default: "" },
        currentDate: { type: String, default: Date.now },
        medicationDosage: { type: String, default: "" },
        patientSignature: { type: String, default: "" },
        otherComment: { type: String, default: "" },
        medicalHistory: [],
    },

    walletAmount: { type: Number, default: 0 },
    totalWalletAmount: { type: Number, default: 0 },

}, { timestamps: true, collection: 'user' });


let UserModel = mongoose.model('users', UserSchema);

UserModel.getClinicNumber = (where) => {
    return UserModel.findOne(where, { clinicNumber: 1 }).sort({ 'clinicNumber': -1 });
}


UserModel.getPTList = (where, page = '') => {

    let pipline = [];

    if (where) {
        pipline.push({ $match: where });
    }


    if (page != '') {
        console.log('page', page)
        let skip = 0 * page;
        let limit = 10;
        pipline.push({ $limit: limit });
        pipline.push({ $skip: skip });
    }


    let clinicLookup = {
        from: "user",
        let: {
            clinicId: "$clinicId"
        },
        pipeline: [
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: ["$clinicNumberName", "$$clinicId"] },
                            { $ne: ["$clinicNumberName", ""] },
                        ]
                    }
                },
            },
        ],
        as: "clinicDetail",
    }
    pipline.push({ $lookup: clinicLookup });
    //pipline.push({ $unwind:"$clinicDetail" });

    let project = {
        _id: "$_id",
        firstName: "$firstName",
        lastName: "$lastName",
        fullName: "$fullName",
        clinicNumberName: "$clinicNumberName",

        email: "$email",
        phone: "$phone",
        phoneCode: "$phoneCode",
        enabled: "$enabled",
        profileImg: "$profileImg",

        longitude: "$longitude",
        latitude: "$latitude",

        price: "10",
        clinicName: { $arrayElemAt: ["$clinicDetail.fullName", 0] }
    }

    pipline.push({ $project: project });

    return UserModel.aggregate(pipline);

}

export default UserModel;