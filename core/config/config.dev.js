
import path from "path";

let config = {};

config.logFileDir = path.join(__dirname, '../../log');
config.logFileName = 'app.log';
config.dbHost = process.env.dbHost || 'localhost';
config.dbPort = process.env.dbPort || '27017';
config.dbName = process.env.dbName || 'medAlert';
config.serverPort = process.env.serverPort || 81;
config.superAdminLoginDetails = { email: "superAdmin@synergytop.com", password: "synergytop" }

config.isHTTPs = false;
config.sslKey = "core/sslkey/privkey1.pem";
config.sslCert = "core/sslkey/cert1.pem";
config.sslCabundle = "core/sslkey/fullchain1.pem";

export default config;