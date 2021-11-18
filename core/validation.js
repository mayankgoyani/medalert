import Master from '../core/master';
const { check, validationResult, body } = require('express-validator');

let validation = {};

validation.check = function (req, res, next) {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		let msg = errors.array();
		return res.send({ "msg": (msg && msg[0]) ? msg[0]['msg'] : common.errorMSG, errors: errors.array() });
	} else {
		next();
	}
}

validation.login = [
	check('loginType').not().isEmpty().withMessage('loginType is required.'),
	check('deviceId').not().isEmpty().withMessage('deviceId is required.'),
	check('deviceToken').not().isEmpty().withMessage('deviceToken is required.'),
	check('deviceType').not().isEmpty().withMessage('deviceType is required.'),
	check('deviceType').isIn(["android", "ios"]),
];

export default validation;
