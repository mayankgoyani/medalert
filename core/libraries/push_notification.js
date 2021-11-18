
const push_notification = {};


push_notification.sendPushNotifications = async (pushData) => {

    push_notification.pushNotificationsAndroid(pushData);
    return true;
}



push_notification.pushNotificationsAndroid = async (notiData) => {

    var FCM = require('fcm-node');
    var serverKey = 'AAAAS6k9VFo:APA91bFjK-gacW1QqEMGSSnkDiP813hi_1VCJC5npOQKllhuQrBVolNMXYdyYRd4Bi7IGhbiIpWFo47MrWtRPUYdkbtOh8w46L-AmKkyYVWTh__QWv5ejTi7z3CY1yDrxeFmfsgrZ8VA'; //put your server key here
    var fcm = new FCM(serverKey);

    // let message = {
    //     "notification": {
    //         "body": "Notification from postman",
    //         "title": "You have a new message."
    //     },
    //     "priority": "high",
    //     "data": notiData.data,
    //     "to": "eUi3nB6NRp2ysasN30zRNm:APA91bGd9SwognF7dC0n4FgDya5Et7yPEhsMapUVLmoipLO0MDDo0SVs9cB5MqhwlzXRHClbq1zR7RN1MrDNXy94a6J3uy4uzvLWF9e1NX3NesmVsA2f-rNZulWxdzpRsi5H0jpD40AU"
    // }

    //console.log('----------------------------');

    fcm.send(notiData, function (err, response) {
        if (err) {
            console.log(err);
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
    //console.log(notiData);
    return true;
}


export default push_notification;
