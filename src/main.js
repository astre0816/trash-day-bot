var USER_ID = PropertiesService.getScriptProperties().getProperty("USER_ID");
var ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty("ACCESS_TOKEN");
var PUSH_URL = PropertiesService.getScriptProperties().getProperty("PUSH_URL");
var REPLY_URL = PropertiesService.getScriptProperties().getProperty("REPLY_URL");

function doPost(e) {
    console.log(e);
    var json = JSON.parse(e.postData.contents);
    reply(json);
}

function doGet(e) {
    console.log(e);
    return ContentService.createTextOutput("SUCCESS");
}

function push() {
    var pushText = createPushMessage();

    if (pushText == "") {
        return;
    }

    var headers = {
        "Content-Type": "application/json; charset=UTF-8",
        "Authorization": "Bearer " + ACCESS_TOKEN
    };

    var postData = {
        "to": USER_ID,
        "messages": [
            {
                "type" : "text",
                "text" : pushText,
                "wrap" : true
            }
        ]
    };

    var options = {
        "method": "POST",
        "headers": headers,
        "payload": JSON.stringify(postData)
    };

    return UrlFetchApp.fetch(PUSH_URL, options);
}

function reply(data) {
    var postMsg = data.events[0].message.text;
    var replyToken = data.events[0].replyToken;

    var replyText = createReplyMessage(postMsg);

    if (replyText == "") {
        return;
    }

    var postData = {
        "replyToken": replyToken,
        "messages": [
            {
                "type": "text",
                "text": replyText,
                "wrap": true
            }
        ]
    };

    var headers  = {
        "Content-Type": "application/json; charset=UTF-8",
        "Authorization": "Bearer " + ACCESS_TOKEN
    };

    var options = {
        "method": "POST",
        "headers": headers,
        "payload": JSON.stringify(postData)
    };

    return UrlFetchApp.fetch(REPLY_URL, options);
}
