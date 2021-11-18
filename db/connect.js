
import Mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.load();

/**
 * [@Promise : native promises add to mongoose promise variable]
 * @type {[object]}
 */
Mongoose.Promise = global.Promise;

/**
 * @description [Connect with mongodb with host and port]
 * @return {[object]}
 */


const connectToDb = async () => {
    try {
        // let connectionString = `mongodb://USERNAME:PASSWORD@localhost:27017/medAlert?authSource=admin&retryWrites=true&w=majority`;
        // await Mongoose.connect(connectionString, { useMongoClient: true, autoIndex: false });
        await Mongoose.connect(process.env.connectionString, { useMongoClient: true, autoIndex: false });


        console.log('Connected to mongo!!!');
        return 1;
    } catch (err) {
        console.log('Could not connect to MongoDB', err);
        return 0;
    }
}

export default connectToDb;