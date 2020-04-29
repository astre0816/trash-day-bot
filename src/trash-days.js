let TRASH_DAYS = [
    {
        "code": "01",
        "name": "一般ごみ",
        "weekday": [0, 0, 1, 0, 0, 1, 0],
        "times": [1, 1, 1, 1, 1]
    },
    {
        "code": "02",
        "name": "有害ごみ",
        "weekday": [0, 0, 1, 0, 0, 1, 0],
        "times": [1, 1, 1, 1, 1]
    },
    {
        "code": "03",
        "name": "プラスチック製容器包装",
        "weekday": [0, 0, 0, 1, 0, 0, 0],
        "times": [1, 1, 1, 1, 1]
    },
    {
        "code": "04",
        "name": "びん",
        "weekday": [0, 1, 0, 0, 0, 0, 0],
        "times": [1, 0, 1, 0, 0]
    },
    {
        "code": "05",
        "name": "飲料かん",
        "weekday": [0, 1, 0, 0, 0, 0, 0],
        "times": [1, 0, 1, 0, 0]
    },
    {
        "code": "06",
        "name": "ペットボトル",
        "weekday": [0, 1, 0, 0, 0, 0, 0],
        "times": [0, 1, 0, 1, 0]
    },
    {
        "code": "07",
        "name": "繊維類",
        "weekday": [0, 1, 0, 0, 0, 0, 0],
        "times": [0, 1, 0, 1, 0]
    },
    {
        "code": "08",
        "name": "金属類",
        "weekday": [0, 0, 1, 0, 0, 0, 0],
        "times": [0, 1, 0, 1, 0]
    },
    {
        "code": "09",
        "name": "紙類",
        "weekday": [0, 0, 1, 0, 0, 0, 0],
        "times": [0, 1, 0, 1, 0]
    }
];

let SPECIAL_DAYS = {
    "0101": [],
    "0102": [],
    "0103": []
};

let WEEKDAYS_JP = ["日","月","火","水","木","金","土"];

function getTrashDays(date) {
    if (date.toString() === "Invalid Date") {
        throw new Error("Invalid Date");
    }

    let mmdd = ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2);
    if (mmdd in SPECIAL_DAYS) {
        return TRASH_DAYS.filter(trashDay => SPECIAL_DAYS[mmdd].includes(trashDay.code));
    }

    let weekday = date.getDay();
    let times = Math.floor((date.getDate() - 1) / 7) + 1;
    return TRASH_DAYS.filter(trashDay => trashDay.weekday[weekday] && trashDay.times[times -1]);
}

function convertTextToDate(text) {
    text = text.trim();

    if (text.length == 4) {
        text = ("0" + new Date().getFullYear()).slice(-4) + text;
    }

    if (text.length !== 8) {
        throw new Error("Invalid input");
    }

    text = text.substr(0, 4) + "-" + text.substr(4, 2) + "-" + text.substr(6, 2);
    text = text + "T00:00:00+0900";

    return new Date(text);
}

function convertDateToText(date) {
    return date.getFullYear() + "/"
        + (date.getMonth() + 1) + "/"
        + date.getDate()
        + "(" + WEEKDAYS_JP[date.getDay()] + ")";
}

function isTomorrow(date) {
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return date.getFullYear == tomorrow.getFullYear() &&
        date.getMonth() == tomorrow.getMonth() &&
        date.getDate() == tomorrow.getDate();
}

function createReplyMessage(input) {
    try {
        date = convertTextToDate(input);

        let trashDays = getTrashDays(date);

        let dateString = (isTomorrow(date) ? "明日" : "")
            + convertDateToText(date);

        if (trashDays.length === 0) {
            return dateString + "はゴミの日ではありません。";
        }

        let message = dateString + "は\n";
        for (var trashDay of trashDays) {
            message += "　・" + trashDay.name + "\n";
        }
        message += "の日です。";
        return message;

    } catch(e) {
        return "「" + input + "」を日付に変換できませんでした。\n"
            + "日付は年月日を半角数字8桁（例：19700101）\n"
            + "または月日を半角数字4桁 （例：0401）で入力してください。";
    }
}

function createPushMessage() {
    let date = new Date();
    date.setDate(date.getDate() + 1);

    let trashDays = getTrashDays(date);

    let dateString = "明日" + convertDateToText(date);

    if (trashDays.length === 0) {
        return "";
    }

    let message = dateString + "は\n";
    for (var trashDay of trashDays) {
        message += "　・" + trashDay.name + "\n";
    }
    message += "の日です。";
    return message;
}
