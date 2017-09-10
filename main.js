var scanf = require('scanf');
allCharges = require('./resources');
details = [];
bookCharge = [];

function splitDate(time) {
    var start=parseInt(time.split("~")[0].split(":"));
    var end=parseInt(time.split("~")[1].split(":"));
    return {start,end}
}

function isLegal(object) {
    var year = /^((([0-9]{2})(0[48]|[2468][048]|[13579][26])|(0[48]|[2468][048]|[3579][26])00)-((((0[4,6,9]|11))-((0[1-9]|[1,2][0-9]|30)))|(((0[1,3,5,7,8]|1[0,2]))-((0[1-9]|[1,2][0-9]|3[0,1])))|(02-(0[1-9]|1[0-9]|2[0-9]))))|([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-((((0[4,6,9]|11))-((0[1-9]|[1,2][0-9]|30)))|(((0[1,3,5,7,8]|1[0,2]))-((0[1-9]|[1,2][0-9]|3[0,1])))|(02-(0[1-9]|1[0-9]|2[0-8])))$/;
    var hour = /^((09)|(1[0-9])|(2[0-2])):00~((09)|(1[0-9])|(2[0-2])):00$/;
    var flag = /^[A-D]$/;
  //  var timeLegal = parseInt(object.time.split("~")[0].split(":")) < parseInt(object.time.split("~")[1].split(":")) ? true : false;
    var timeLegal=splitDate(object.time).start<splitDate(object.time).end?true:false;
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
    var start=splitDate(object.time).start;
    var end=splitDate(object.time).end;
    if (objects.length === 0) {
        return false;
    } else {
        for (var i = 0; i < objects.length; i++) {
            var unitStart=splitDate(objects[i].time).start;
            var unitEnd=splitDate(objects[i].time).end;
            if ((object.place === objects[i].place) &&
                (((start >= unitStart) && (start <= unitEnd))
                || ((end >= unitStart) && (end <= unitEnd)))
                && objects[i].isCancel == false) {
                return true;
            } else {
                return false;
            }
        }
    }
}

function buildOrderType(object) {
    var orderDate = new Date(object.date);
    var day = orderDate.getUTCDay();
    if (day >= 1 && day <= 5) {
        return {info: object, type: 'workingDay', discount: allCharges['workingDay'].discount};
    } else {
        return {info: object, type: 'offDay', discount: allCharges['offDay'].discount};
    }
}

function buildOrderCharge(object) {
    var start=splitDate(object.info.time).start;
    var end=splitDate(object.info.time).end;
    var key = object.type,myCharge = 0;
    var element = allCharges[key].items;
    for (var i = 0; i < element.length; i++) {
        var unitStart=splitDate(element[i].time).start;
        var unitEnd=splitDate(element[i].time).end;
        if ((start >= unitStart) && (end <= unitEnd)) {
            return {order: object, charge: (end - start) * element[i].unitPrice}
        } else if ((start >= unitStart && start <= unitEnd) ||
            (end >= unitStart && end <= unitEnd)) {
            var flag = start >= unitStart ? start : end;
            myCharge += (flag - unitStart) * element[i].unitPrice;
        }
    }
    return {order: object, charge: myCharge};
}


function buildCancelCharge(object, charges) {
    var objectString = "" + object.ID + object.date + object.time + object.place;
    for (var i = 0; i < charges.length; i++) {
        var info = charges[i].order.info;
        var unitString = "" + info.ID + info.date + info.time + info.place;
        if (objectString === unitString && (!charges[i].order.info.isCancel)) {
            charges[i].charge = charges[i].charge * charges[i].order.discount;
            charges[i].order.info.isCancel = true;
            return charges;
        }
    }

    return false;
}


function sortByPlace(charges) {
    var newArray = [],place_A = [],place_B = [],place_C = [],place_D = [];
    for (var i = 0; i < charges.length; i++) {
        switch (charges[i].order.info.place) {
            case 'A':
                place_A.push(charges[i]);
                break;
            case 'B':
                place_B.push(charges[i]);
                break;
            case 'C':
                place_C.push(charges[i]);
                break;
            case 'D':
                place_D.push(charges[i]);
                break;
            default:
                break;
        }
    }
    newArray.push({key: 'A', message: place_A}, {key: 'B', message: place_B},
        {key: 'C', message: place_C}, {key: 'D', message: place_D});

    return newArray;
}


function sortByTime(placeSort) {
    for (var i = 0; i < placeSort.length; i++) {
        if (placeSort[i].message.length != 0) {
            placeSort[i].message.sort((a, b)=> {
                return new Date(`${b.order.info.date} ${b.order.info.time}`)
                    - new Date(`${a.order.info.date} ${a.order.info.time}`);
            });
        }
    }
    return placeSort
}


function buildSubtotal(timeSort) {
    var total = 0;
    for (var i = 0; i < timeSort.length; i++) {
        var subtotal = 0;
        for (var j = 0; j < timeSort[i].message.length; j++) {
            subtotal += timeSort[i].message[j].charge
        }
        total += subtotal;
        timeSort[i].subtotal = subtotal;
    }
    return {detail: timeSort, total: total};
}


function buildOutput(subtotal) {
    var outputString = `
收入汇总
---
`;
    for (var i = 0; i < subtotal.detail.length; i++) {
        var updateLength=subtotal.detail[i].message.length ==0
            ? 1:subtotal.detail[i].message.length;
        for (var j = 0; j<updateLength; j++) {
           if(updateLength === 1){
               outputString+= `场地：${subtotal.detail[i].key}`;
           }else {
               var unitOrder = subtotal.detail[i].message[j].order.info;
               if(unitOrder.isCancel){
                   outputString += `场地：${subtotal.detail[i].key}
${unitOrder.date} ${unitOrder.time} 违约金 ${subtotal.detail[i].message[j].charge}元`;
               }else{
                   outputString += `场地：${subtotal.detail[i].key}
${unitOrder.date} ${unitOrder.time} ${subtotal.detail[i].message[j].charge}元`;
               }
           }
        }
        outputString += `
小计:${subtotal.detail[i].subtotal}元
        \n`;
    }

    return `${outputString}---
总计：${subtotal.total}`;
}

function main() {
    var init = scanf("%S");
    while (init != "") {
        var array = init.split(" ");
        var ID = array[0];
        var date = array[1];
        var time = array[2];
        var place = array[3];
        var legal,conflict;
        if (array.length == 4) {
            var unitInput = {ID, date, time, place, orderType: "Booked", isCancel: false};
            legal = isLegal(unitInput);
            conflict = isConflict(unitInput, details);
            if (legal) {
                if (conflict) {
                    console.log('Error: the booking conflicts with existing bookings!');
                } else {
                    details.push(unitInput);
                    var orderInfo = buildOrderType(unitInput);
                    var orderCharge = buildOrderCharge(orderInfo);
                    bookCharge.push(orderCharge);
                    console.log('Success: the booking is accepted!');
                }
            } else {
                console.log("Error: the booking is invalid!");
            }
        } else if (array.length == 5) {
            var temp = array[4];
            var unitInput = {ID, date, time, place, temp, orderType: "cancel"};
            legal = isLegal(unitInput);
            var cancelCharge = buildCancelCharge(unitInput, bookCharge);
            if (legal) {
                if (cancelCharge) {
                    bookCharge = cancelCharge;
                    console.log('Success: the booking is accepted!');
                } else {
                    console.log('Error: the booking being cancelled does not exist!');
                }
            } else {
                console.log("Error: the booking is invalid!");
            }
        } else {
            console.log("Error: the booking is invalid!");
        }
        init = scanf("%S");
    }

    var placeSort = sortByPlace(bookCharge);
    var sortTime = sortByTime(placeSort);
    var subtotal = buildSubtotal(sortTime);
    var output = buildOutput(subtotal);
    console.log(output);
}

main();
