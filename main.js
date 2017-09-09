var scanf = require('scanf');
allCharges=require('./resources');
details = [{time: "13:00~14:00", place: "A"}];

function isLegal(object) {
    var year = /^((([0-9]{2})(0[48]|[2468][048]|[13579][26])|(0[48]|[2468][048]|[3579][26])00)-((((0[4,6,9]|11))-((0[1-9]|[1,2][0-9]|30)))|(((0[1,3,5,7,8]|1[0,2]))-((0[1-9]|[1,2][0-9]|3[0,1])))|(02-(0[1-9]|1[0-9]|2[0-9]))))|([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-((((0[4,6,9]|11))-((0[1-9]|[1,2][0-9]|30)))|(((0[1,3,5,7,8]|1[0,2]))-((0[1-9]|[1,2][0-9]|3[0,1])))|(02-(0[1-9]|1[0-9]|2[0-8])))$/;
    var hour = /^((09)|(1[0-9])|(2[0-2])):00~((09)|(1[0-9])|(2[0-2])):00$/;
    var flag = /^[A-D]$/;
    var timeLegal = parseInt(object.time.split("~")[0].split(":")) < parseInt(object.time.split("~")[1].split(":")) ? true : false;
    if (object.orderType === "Booked"
        && year.test(object.date) && hour.test(object.time) && flag.test(object.place)
        && timeLegal) {
        return true;
    } else if (object.orderType === "cancel"
        && year.test(object.date) && hour.test(object.time) && flag.test(object.place) && object.temp == 'C'
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

function buildOrderType(object) {
    var orderDate=new Date(object.date);
    var day=orderDate.getUTCDay();
    if(day>=1 && day<=5){
        return {info:object,type:'workingDay',discount:allCharges['workingDay'].discount};
    }else{
        return {info:object,type:'offDay',discount:allCharges['offDay'].discount};
    }
}

function buildOrderCharge(object) {
    var start=parseInt(object.info.time.split("~")[0].split(":"));
    var end=parseInt(object.info.time.split("~")[1].split(":"));
    var key=object.type;
    var element=allCharges[key].items;
    var myCharge=0;
    for(var i=0;i<element.length;i++){
       var unitStart=parseInt(element[i].time.split("~")[0].split(":"));
        var unitEnd=parseInt(element[i].time.split("~")[1].split(":"));
        if((start >=unitStart) && (end<=unitEnd)){
            return {order:object,charge:(end-start)*element[i].unitPrice}
        }else if((start>=unitStart && start <=unitEnd) ||
            (end>=unitStart && end<=unitEnd)){
            var flag=start>=unitStart?start:end;
            myCharge+=(flag-unitStart)*element[i].unitPrice;
        }
    }
    return {order:object,charge:myCharge};
}





function buildCancelCharge(object) {
    var objectString=""+object.ID+object.date+object.time+object.place;
    for(var i=0;i<details.length;i++){
        var unitString=""+details[i].ID+details[i].date+details[i].time+details[i].place;
        if(objectString === unitString){
            details.charge=details.charge*details[i].order.discount;
            return true;
        }
    }

    return false;
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
            var unitInput={ID, date, time, place,orderType:"Booked"};
            legal = isLegal(unitInput);
            conflict = isConflict(unitInput, details);
            console.log(legal,conflict);
            if (legal && conflict) {
                var orderInfo=buildOrderType(unitInput);
                var orderCharge=buildOrderCharge(orderInfo);
                details.push(orderCharge);
                console.log('Success: the booking is accepted!');
            } else {
                console.log("Error: the booking is invalid!");
            }
        } else if (array.length == 5) {
            var temp=array[4];
            var unitInput={ID, date, time, place,temp,orderType:"cancel"};
            legal = isLegal(unitInput);
            var cancleCharge=buildCancelCharge(unitInput);
            if (legal && cancleCharge) {
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
