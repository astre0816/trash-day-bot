const trashDaysForTest = [
    ["code", "name", "days1", "days2", "days3", "days4", "days5"],
    ["01", "一般ごみ", "毎週火曜日", "毎週金曜日", "", "", ""],
    ["02", "有害ごみ", "毎週火曜日", "毎週金曜日", "", "", ""],
    ["03", "プラスチック製容器包装", "毎週水曜日", "", "", "", ""],
    ["04", "びん", "第一月曜日", "第三月曜日", "", "", ""],
    ["05", "飲料かん", "第一月曜日", "第三月曜日", "", "", ""],
    ["06", "ペットボトル", "第二月曜日", "第四月曜日", "", "", ""],
    ["07", "繊維類", "第二月曜日", "第四月曜日", "", "", ""],
    ["08", "金属類", "第二火曜日", "第四火曜日", "", "", ""],
    ["09", "紙類", "第二火曜日", "第四火曜日", "", "", ""],
];

const specialDaysForTest  = [
    ["date", "code1", "code2", "code3", "code4", "code5"],
    ["0101", "", "", "", "", ""],
    ["0102", "", "", "", "", ""],
    ["0103", "", "", "", "", ""],
];

const WEEKDAYS_JP = ["日","月","火","水","木","金","土"];

function getWeekDaysNumber() {
    let obj = {};
    WEEKDAYS_JP.forEach((day, index) => obj[day] = index);
    return obj
}

const WEEKDAYS_NUMBER = getWeekDaysNumber();

const KANJI_NUMBER = {
    "第一": 1,
    "第二": 2,
    "第三": 3,
    "第四": 4,
    "第五": 5
}

function convertArrayToObject(array) {
    let keys = array.shift();
    let obj = {};
    keys.forEach((key, index) => {
        obj[key] = [];
        array.forEach((row, i) => {
            obj[key][i] = row[index];
        });
    });
    return obj;
}

function conbineSeqKeys(obj, key) {
    let output = {};
    let array = [];
    for (let k in obj) {
        if (k.startsWith(key)) {
            let num = parseInt(k.substr(key.length), 10);
            if (isNaN(num)) {
                output[k] = obj[k];
                break;
            }

            array[num - 1] = obj[k];
        } else {
            output[k] = obj[k];
        }
    }
    let outputArray = [];
    array.forEach((values, i) => {
        values.forEach((value, j) => {
            if (outputArray[j] == undefined) {
                outputArray[j] = [];
            }
            outputArray[j][i] = array[i][j];
        });
    });
    output[key] = outputArray;
    return output;
}

function convertWeekdays(jp) {
    let sys = [];
    for (let i = 0; i < WEEKDAYS_JP.length; i++) {
        sys[i] = [0, 0, 0, 0, 0];
    }
    jp.forEach((str, index) => {
        let weekday = WEEKDAYS_NUMBER[str.substr(2,1)];
        let times = sys[weekday];
        if (str.substr(0,2) == "毎週") {
            times = [1, 1, 1, 1, 1];
        } else {
            times[KANJI_NUMBER[str.substr(0, 2)] - 1] = 1;
        }
        sys[weekday] = times;
    });
    return sys;
}

function readTrashDays() {
    // let array = trashDaysForTest;
    let array = SHEET_TRASH_DAYS.getDataRange().getValues();
    let obj = convertArrayToObject(array);
    let obj2 = conbineSeqKeys(obj, "days");
    let trashDays = [];
    obj2["code"].forEach((code, index) => {
        let o = {};
        o["code"] = obj2["code"][index];
        o["name"] = obj2["name"][index];
        o["days"] = obj2["days"][index].filter(days => days != "");
        trashDays[trashDays.length] = o;
    });
    trashDays.forEach((days, index) => {
        trashDays[index]["days"] = convertWeekdays(days["days"]);
    });
    return trashDays;
}

function readSpecialDays() {
    // let array = specialDaysForTest;
    let array = SHEET_SPECIAL_DAYS.getDataRange().getValues();
    let obj = convertArrayToObject(array);
    let obj2 = conbineSeqKeys(obj, "code");
    let specialDays = {};
    obj2["date"].forEach((date, index) => {
        specialDays[date] = obj2["code"][index];
    });
    for (code in specialDays) {
        specialDays[code] = specialDays[code].filter(str => str != "");
    }
    return specialDays;
}

const TRASH_DAYS = readTrashDays();

const SPECIAL_DAYS = readSpecialDays();

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
    return TRASH_DAYS.filter(trashDay => trashDay.days[weekday][times - 1]);
}

function createTomorrow() {
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
}

function convertTextToDate(text) {
    text = text.trim();

    if (text === "明日" || text === "あした") {
        return createTomorrow();
    }

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

function isSameDate(date1, date2) {
    return date1.getFullYear() == date2.getFullYear() &&
        date1.getMonth() == date2.getMonth() &&
        date1.getDate() == date2.getDate();
}

function createMessage(input, needNonTrashDayMessage) {
    try {
        let date = convertTextToDate(input);

        let trashDays = getTrashDays(date);

        let dateString = (isSameDate(date, createTomorrow()) ? "明日" : "")
            + convertDateToText(date);

        if (trashDays.length === 0) {
            return needNonTrashDayMessage ? dateString + "はゴミの日ではありません。" : "";
        }

        let message = dateString + "は\n";
        for (var trashDay of trashDays) {
            message += "　・" + trashDay.name + "\n";
        }
        message += "の日です。";
        return message;

    } catch(e) {
        console.log(e);
        return "「" + input + "」を日付に変換できませんでした。\n"
            + "日付は年月日を半角数字8桁（例：19700101）\n"
            + "または月日を半角数字4桁 （例：0401）で入力してください。";
    }
}
