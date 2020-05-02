const USER_ID = PropertiesService.getScriptProperties().getProperty("USER_ID");
const ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty("ACCESS_TOKEN");
const PUSH_URL = PropertiesService.getScriptProperties().getProperty("PUSH_URL");
const REPLY_URL = PropertiesService.getScriptProperties().getProperty("REPLY_URL");
const SPREADSHEET_KEY = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_KEY");
const SPREADSHEET = SpreadsheetApp.openByKey(SPREADSHEET_KEY);
const SHEET_TRASH_DAYS = SPREADSHEET.getSheetByName("TRASH_DAYS");
const SHEET_SPECIAL_DAYS = SPREADSHEET.getSheetByName("SPECIAL_DAYS");

function doPost(e) {
    console.log(e);
    let json = JSON.parse(e.postData.contents);
    reply(json);
}

function doGet(e) {
    console.log(e);
    return ContentService.createTextOutput("SUCCESS");
}

function push() {
    let pushText = createMessage("明日", false);

    if (pushText == "") {
        return;
    }

    let headers = {
        "Content-Type": "application/json; charset=UTF-8",
        "Authorization": "Bearer " + ACCESS_TOKEN
    };

    let postData = {
        "to": USER_ID,
        "messages": [
            {
                "type" : "text",
                "text" : pushText,
                "wrap" : true
            }
        ]
    };

    let options = {
        "method": "POST",
        "headers": headers,
        "payload": JSON.stringify(postData)
    };

    return UrlFetchApp.fetch(PUSH_URL, options);
}

function reply(data) {
    let postMsg = data.events[0].message.text;
    let replyToken = data.events[0].replyToken;

    let replyText = createMessage(postMsg, true);

    if (replyText == "") {
        return;
    }

    let postData = {
        "replyToken": replyToken,
        "messages": [
            {
                "type": "text",
                "text": replyText,
                "wrap": true
            }
        ]
    };

    let headers  = {
        "Content-Type": "application/json; charset=UTF-8",
        "Authorization": "Bearer " + ACCESS_TOKEN
    };

    let options = {
        "method": "POST",
        "headers": headers,
        "payload": JSON.stringify(postData)
    };

    return UrlFetchApp.fetch(REPLY_URL, options);
}
