var codes = {
    Apple: {
        unknown: "01124500",
        iPhone: "01154600",
        iPhone3G: {
            MB496RS: "01174400",
            MB704LL: "01180800",
            MB496B: "01181200",
            A1241: "01193400"
        }
    },
    Samsung: {
        SMT5613474: "35951406",
        GalaxyS3: "35226005"
    },
    HTC: {
        WildFire: "35902803"
    },
    Nokia: {
        N9: "35166905",
        N9_2: "35792304",
        N9_3: "35929404",
        N1320: "35173506",
        N1320_2: "35173606"
    }
};
function SN() {
    return (Math.floor(Math.random() * (999999 - 100000)) + 100000).toString();
}

function upTo(digit){
    while (Number.isInteger(digit/10) == false) digit++;
    return digit;
}


function Luhn(line) {
    var summEven=0;
    var even=[];
    var summOdd =0;
    for(var i = 1; i< line.length;i=i+2){
        even.push(Number(line[i])*2);
        summOdd = summOdd + Number(line[i-1]);
        if(i==13) {
            break;
        }
    }
    for(var y = 0;y<even.length;y++){

        if(Number(even[y])/10<1) {
            summEven = summEven + Number(even[y]);
        }else
        {
            var st = Number(even[y].toString().charAt(0));
            var nd = Number(even[y].toString().charAt(1))
            summEven = summEven + st+nd;
        }



    }
    var Luhndigit = summEven+summOdd;
    Luhndigit = upTo(Luhndigit) - Luhndigit;
    return Luhndigit;
}
function GetRandom(){
    var randImei;
    var objLength = Object.keys(codes).length;
    var keys = Object.keys(codes)
    var randDevice = codes[keys[ keys.length * Math.random() << 0]];
    var SNs = Object.keys(randDevice);
    var randCode = randDevice[SNs[ SNs.length * Math.random() << 0]];
    if(typeof randCode!= "object") {
        randImei = randCode + SN();
        randImei = randImei + Luhn(randImei).toString();
        return randImei;
    }else
    {
        var deeper = Object.keys(randCode);
        randCode = randCode[deeper[deeper.length * Math.random() << 0]];
        randImei = randCode + SN();
        randImei = randImei + Luhn(randImei).toString();
        return randImei;
    }

}
module.exports = GetRandom;