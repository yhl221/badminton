var scanf = require('scanf');

var details =
    [{
        time: "19:00~22:00",
        place: "A"
    }
];

function isLegal(object, length) {
    var year = /^((([0-9]{2})(0[48]|[2468][048]|[13579][26])|(0[48]|[2468][048]|[3579][26])00)-((((0[4,6,9]|11))-((0[1-9]|[1,2][0-9]|30)))|(((0[1,3,5,7,8]|1[0,2]))-((0[1-9]|[1,2][0-9]|3[0,1])))|(02-(0[1-9]|1[0-9]|2[0-9]))))|([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-((((0[4,6,9]|11))-((0[1-9]|[1,2][0-9]|30)))|(((0[1,3,5,7,8]|1[0,2]))-((0[1-9]|[1,2][0-9]|3[0,1])))|(02-(0[1-9]|1[0-9]|2[0-8])))$/;
    var hour = /^((09)|(1[0-9])|(2[0-2])):00~((09)|(1[0-9])|(2[0-2])):00$/;
    var flag = /^[A-D]$/;
    var timeLegal = parseInt(object.time.split("~")[0].split(":")) < parseInt(object.time.split("~")[1].split(":")) ? true : false;
    if (length == 4
        && year.test(object.date) && hour.test(object.time) && flag.test(object.place)
        && timeLegal) {
        return true;
    } else if (length == 5
        && year.test(object.date) && hour.test(object.time) && flag.test(object.place) && object.flag == 'B'
        && timeLegal) {
        return true;
    } else {
        return false;
    }
}

function isConflict(object, objects) {
    var start = parseInt(object.time.split("~")[0].split(":"));
    var end = parseInt(object.time.split("~")[1].split(":"));
    for (var i = 0; i < objects.length; i++) {
        var unitStart = parseInt(objects[i].time.split("~")[0].split(":"));
        var unitEnd = parseInt(objects[i].time.split("~")[1].split(":"));
        if((object.place === objects[i].place) && (start >= unitStart && end <= unitEnd)) {
                 return false;
        }else{
            return true;
        }
    }
}

function main() {
    var init = scanf("%S");
    while (init != "") {
        var array = init.split(" ");
        var ID = array[0];
        var date = array[1];
        var time = array[2];
        var place = array[3];
        var legal;
        var conflict;
        if (array.length == 4) {
            legal = isLegal({ID, date, time, place}, 4);
            conflict = isConflict({ID, date, time, place}, details);
            if (legal && conflict) {
                console.log('Success: the booking is accepted!');
            } else {
                console.log("Error: the booking is invalid!");
            }
        } else if (array.length == 5) {
            var flag = array[4];
            legal = isLegal({ID, date, time, place, flag}, 5);
            conflict = isConflict({ID, date, time, place, flag}, details);
            if (legal && conflict) {
                console.log('Success: the booking is accepted!');
            } else {
                console.log("Error: the booking is invalid!");
            }
        } else {
            console.log("Error: the booking is invalid!");
        }
        init = scanf("%S");
    }
}

main();
