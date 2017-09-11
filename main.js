var scanf = require('scanf');
allCharges = require('./resources');
details = [];
bookCharge = [];

function splitDate(time) {
    var start = parseInt(time.slice(0, 2));
    var end = parseInt(time.slice(6, 8));
    return {start, end};
}

function isLegal(object, length) {
    var year = /^((([0-9]{2})(0[48]|[2468][048]|[13579][26])|(0[48]|[2468][048]|[3579][26])00)-((((0[4,6,9]|11))-((0[1-9]|[1,2][0-9]|30)))|(((0[1,3,5,7,8]|1[0,2]))-((0[1-9]|[1,2][0-9]|3[0,1])))|(02-(0[1-9]|1[0-9]|2[0-9]))))|([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-((((0[4,6,9]|11))-((0[1-9]|[1,2][0-9]|30)))|(((0[1,3,5,7,8]|1[0,2]))-((0[1-9]|[1,2][0-9]|3[0,1])))|(02-(0[1-9]|1[0-9]|2[0-8])))$/;
    var hour = /^((09)|(1[0-9])|(2[0-2])):00~((09)|(1[0-9])|(2[0-2])):00$/;
    var flag = /^[A-D]$/;
    var timeLegal = splitDate(object.time).start < splitDate(object.time).end ? true : false;
    var judge = (year.test(object.date) && hour.test(object.time) && flag.test(object.place) && timeLegal);
    var cancelTag = (object.temp == 'C');
    return length === 4 ? judge : (judge && cancelTag);
}

function mapObjects(element, objects) {
    for (var i = 0; i < objects.length; i++) {
        var unitStart = splitDate(objects[i].time).start;
        var unitEnd = splitDate(objects[i].time).end;
        return ( (element.start <= unitEnd || element.end <= unitStart) && objects[i].isCancel == false) == true;
    }
}

function isConflict(object, objects) {
    var start = splitDate(object.time).start;
    var end = splitDate(object.time).end;
    return objects.length === 0 ? false : mapObjects({start, end}, objects);
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
    var start = splitDate(object.info.time).start;
    var end = splitDate(object.info.time).end;
    var key = object.type, myCharge = 0;
    allCharges[key].items.map((element)=> {
        var unitStart = splitDate(element.time).start;
        var unitEnd = splitDate(element.time).end;
        if ((start >= unitStart) && (end <= unitEnd)) {
            myCharge += (end - start) * element.unitPrice;
        } else if ((start >= unitStart && start <= unitEnd) && end >= unitEnd) {
            myCharge += (unitEnd - start) * element.unitPrice;
            start = unitEnd;
        } else if ((start >= unitStart && start <= unitEnd) && end <= unitEnd) {
            myCharge += (end - unitStart) * element.unitPrice
        }
    });
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
    var newArray = [], place_A = [], place_B = [], place_C = [], place_D = [];
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
    newArray.push({key: 'A', message: place_A}, {key: 'B', message: place_B}, {key: 'C', message: place_C}, {
        key: 'D',
        message: place_D
    });
    return newArray;
}


function sortByTime(placeSort) {
   var afterSortTime=[];
    for (var i = 0; i < placeSort.length; i++) {
        if (placeSort[i].message.length != 0) {
            var  byDate = placeSort[i].message.slice(0);
            byDate.sort(function(a,b) {
                var date_a=`${a.order.info.date} ${a.order.info.time.slice(0,5)}`;
                var date_b=`${b.order.info.date} ${b.order.info.time.slice(0,5)}`;
                return new Date(date_a).getTime()-new Date(date_b).getTime();
            });
            afterSortTime.push({key:placeSort[i].key,message:byDate});
        }else{
            afterSortTime.push(placeSort[i]);
        }
    }
    return afterSortTime;
}

function buildSubtotal(timeSort) {
    var total = 0;
    timeSort.map((element)=> {
        var subtotal = 0;
        element.message.map((element)=> {
            subtotal += element.charge
        });
        total += subtotal;
        element.subtotal = subtotal;
    });
    return {detail: timeSort, total: total};
}


function buildOutput(subtotal) {
    var outputString = `\n收入汇总\n---\n`;
    subtotal.detail.map((item)=> {
        outputString += `场地：${item.key}`;
        item.message.map((element)=> {
            outputString += `\n${element.order.info.date} ${element.order.info.time} `;
            if (element.order.info.isCancel) {
                outputString += `违约金 ${element.charge}元`;
            } else {
                outputString += `${element.charge}元`;
            }
        });
        outputString += `\n小计:${item.subtotal}元\n\n`;
    });
    return `${outputString}---\n总计：${subtotal.total}元`;
}

function detailOrder(orderInput) {
    details.push(orderInput);
    var orderInfo = buildOrderType(orderInput);
    var orderCharge = buildOrderCharge(orderInfo);
    bookCharge.push(orderCharge);
    return 'Success: the booking is accepted!';
}

function orderPlace(orderInput) {
    var legal = isLegal(orderInput, 4);
    var conflict = isConflict(orderInput, details);
    return legal == true ?
        (conflict == true ? 'Error: the booking conflicts with existing bookings!' : detailOrder(orderInput))
        : 'Error: the booking is invalid!';
}

function cancelPlace(cancelInput) {
    var legal = isLegal(cancelInput, 5);
    var cancelCharge = buildCancelCharge(cancelInput, bookCharge);
    var flag = legal == true ? (cancelCharge == false ? 'Error: the booking being cancelled does not exist!' : true) : 'Error: the booking is invalid!';
    if (flag === true) {
        bookCharge = cancelCharge;
        return 'Success: the booking is accepted!'
    } else {
        return flag;
    }
}

function main() {
    var init = scanf("%S");
    while (init != "") {
        var array = init.split(" ");
        var input = array.length == 4 ?
        {ID: array[0], date: array[1], time: array[2], place: array[3], isCancel: false}
            : {ID: array[0], date: array[1], time: array[2], place: array[3], temp: array[4]};
        var warning = array.length === 4 ? orderPlace(input) : (array.length === 5 ? cancelPlace(input) : "Error: the booking is invalid!");
        console.log(warning);
        init = scanf("%S");
    }
    var placeSort = sortByPlace(bookCharge);
    var sortTime = sortByTime(placeSort);
    var subtotal = buildSubtotal(sortTime);
    var output = buildOutput(subtotal);
    console.log(output);
}

main();

