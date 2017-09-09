var scanf = require('scanf');

var details=[];

function isLegal(object,length){
    var year=/^((([0-9]{2})(0[48]|[2468][048]|[13579][26])|(0[48]|[2468][048]|[3579][26])00)-((((0[4,6,9]|11))-((0[1-9]|[1,2][0-9]|30)))|(((0[1,3,5,7,8]|1[0,2]))-((0[1-9]|[1,2][0-9]|3[0,1])))|(02-(0[1-9]|1[0-9]|2[0-9]))))|([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-((((0[4,6,9]|11))-((0[1-9]|[1,2][0-9]|30)))|(((0[1,3,5,7,8]|1[0,2]))-((0[1-9]|[1,2][0-9]|3[0,1])))|(02-(0[1-9]|1[0-9]|2[0-8])))$/;
    var hour=/^((09)|(1[0-9])|(2[0-2])):00~((09)|(1[0-9])|(2[0-2])):00$/;
    var flag=/^[A-D]$/;
    var timeLegal=parseInt(object.time.split("~")[0].split(":"))<parseInt(object.time.split("~")[1].split(":"))?true:false;
    if(length == 4
        &&year.test(object.date) && hour.test(object.time) && flag.test(object.place)
        && timeLegal){
        return true;
    }else if(length == 5
        && year.test(object.date) && hour.test(object.time) && flag.test(object.place) && object.flag == 'B'
        && timeLegal){
        return true;
    }else{
        return false;
    }

}

function main(){
    var init=scanf("%S");
    while(init != ""){
        var array=init.split(" ");
        var ID=array[0];
        var date=array[1];
        var time=array[2];
        var place=array[3];
        var legal;
        if(array.length ==4){
            legal=isLegal({ID,date,time,place},4)
            if(legal){
                console.log('Success: the booking is accepted!');
            }else{
                console.log("Error: the booking is invalid!");
            }
        }else if(array.length ==5){
            var flag=array[4];
            legal=isLegal({ID,date,time,place,flag},5);
            if(legal){
                console.log('Success: the booking is accepted!');
            }else{
                console.log("Error: the booking is invalid!");
            }
        }else{
            console.log("Error: the booking is invalid!");
        }
        init=scanf("%S");
    }
}

main();
