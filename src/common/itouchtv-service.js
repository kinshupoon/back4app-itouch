const request = require("sync-request");
var request2 = require('request');
const CryptoJS = require("crypto-js");
const NodeRSA = require('node-rsa');
const MapExpire = require('map-expire/MapExpire');
var imei = require('./itouch/imei.js');
//缓存30分钟结果
var itouchMap = new MapExpire([], {capacity: 1000, duration: 5000});

// 荔枝网获取
class ItouchtvService {

    //发送options请求 通用方法 异步改同步。
    sendOptionsAsync = (url_getParam, opt_header) => {
        return new Promise((resolve, reject) => {
            request2.options(
                {
                    url: url_getParam,
                    headers: opt_header,
                    encoding: 'utf8'
                },
                function (error, response, body) {
                    //console.log(response);
                    //console.log(body);
                    if (!error && (response.statusCode == 200 || response.statusCode == 204)) {
                        console.log("发送options请求成功", url_getParam);
                        resolve(body);
                    } else {
                        console.log("发送options请求失败", url_getParam, opt_header);
                        reject(error);
                    }
                }
            );

        });
    }


    getWXDeviceID() {
        for (var t = [], r = new Date().getTime().toString(), n = 0; n < 36; n++) {
            t[n] = r.substr(Math.floor(16 * Math.random()), 1);
        }
        t[14] = "4", t[19] = r.substr(3 & t[19] | 8, 1), t[8] = t[13] = t[18] = t[23] = "-";
        return "WXAPP_" + t.join("");
    }

    //公钥解密结果，每次加密结果不一样，但位数一样。关注位数和是否能播放就行
    getV3DeviceIDA01(str) {

        //公钥 pkcs1格式
        const _pubKey  =
            '-----BEGIN PUBLIC KEY-----' +
            'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBALLUiZV6DVmAcJGOsWzftnYxDVpIdTlQ' +
            'ynYeTtq5Z1ZzUteINPX24GyeetbYjnIT8pq0IdXGEjjBtngvddR0YaMCAwEAAQ==' +
            '-----END PUBLIC KEY-----';

        const publicKey = new NodeRSA(_pubKey);
        publicKey.setOptions({encryptionScheme: 'pkcs1'});
        let decrypted = publicKey.encrypt(str, 'buffer').toString('base64');
        return decrypted;
    }

    getItouchv3wxappHeader(method, url, timestamp,wxdeviceid) {
        //需要用毫秒时间戳
        let m = method + "\n" + url + "\n" + timestamp + "\n";
        let key = "HGXimfS2hcAeWbsCW19JQ7PDasYOgg1lY2UWUDVX8nNmwr6aSaFznnPzKrZ84VY1";
        let sign = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(m, key));
        let header = {
            'X-ITOUCHTV-Ca-Key': '28778826534697375418351580924221',
            'X-ITOUCHTV-Ca-Signature': sign,
            'X-ITOUCHTV-APP-VERSION': '3.3.1',
            'X-ITOUCHTV-Ca-Timestamp': timestamp,
            //'X-ITOUCHTV-DEVICE-ID': 'WXAPP_8466-776-488-8829-872628912',
            'X-ITOUCHTV-DEVICE-ID': wxdeviceid,
            'X-ITOUCHTV-CLIENT': 'WX_APP',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.36(0x18002429) NetType/WIFI Language/zh_CN',
            'Referer': 'https://servicewechat.com/wxc5018ab64f4f2da5/17/page-frame.html'
        };
        return header;
    }

    getItouchv3Header(method, url, timestamp,deviceId) {
        //需要用毫秒时间戳
        let m = method + "\n" + url + "\n" + timestamp + "\n";
        let key = "qmiHeB9bKgowHqxRv0prc2cPN2EwXL1HOYu3DPiYCcaYxyxdFIyT5mAfBmr0UKPO";
        let sign = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(m, key));
        //let deviceId = 'IMEI_0000000000000001';
        //let deviceId = 'IMEI_'+imei();
        let refer = CryptoJS.MD5(deviceId).toString().substr(0, 16);
        let deviceIdA01 = this.getV3DeviceIDA01(refer);
        console.log("deviceId=",deviceId," deviceIdA01=",deviceIdA01);
        let header = {
            'X-ITOUCHTV-Ca-Key': '04039368653554864194910691389924',
            'X-ITOUCHTV-Ca-Signature': sign,
            'X-ITOUCHTV-Ca-Timestamp': timestamp,
            'referer': 'https://android.itouchtv.cn/'+refer,
            //'X-ITOUCHTV-DEVICE-ID':deviceId,
            'X-ITOUCHTV-A01': deviceIdA01,
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13.1.2;)',
            'X-ITOUCHTV-CLIENT': 'NEWS_APP',
            'X-ITOUCHTV-APP-VERSION': '4.9.2'

        };
        return header;
    }

    //获取options请求的header头
    getItouchv2OptionHeader() {
        let header = {
            'authority': 'api.itouchtv.cn',
            'accept': '*/*',
            'accept-language': 'zh-CN,zh;q=0.9',
            'access-control-request-headers': 'content-type,x-itouchtv-branch,x-itouchtv-ca-key,x-itouchtv-ca-signature,x-itouchtv-ca-timestamp,x-itouchtv-device-id,x-itouchtv-ts',
            'access-control-request-method': 'GET',
            'cache-control': 'no-cache',
            'origin': 'https://www.gdtv.cn',
            'pragma': 'no-cache',
            'referer': 'https://www.gdtv.cn/',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
        };
        return header;
    }

    getItouchv2Header(method, url, timestamp,deviceId) {
        //需要用毫秒时间戳
        let m = method + "\n" + url + "\n" + timestamp + "\n";
        let key = "qmiHeB9bKgowHqxRv0prc2cPN2EwXL1HOYu3DPiYCcaYxyxdFIyT5mAfBmr0UKPO";
        let sign = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(m, key));
        let header = {
            'x-itouchtv-branch': 'mj1',
            'X-ITOUCHTV-Ca-Key': '04039368653554864194910691389924',
            'X-ITOUCHTV-Ca-Signature': sign,
            'X-ITOUCHTV-Ca-Timestamp': timestamp,
            'X-ITOUCHTV-CLIENT': 'NEWS_APP',
            'X-ITOUCHTV-DEVICE-ID':deviceId,
            //'x-itouchtv-device-id': 'web_0',
            //'X-ITOUCHTV-APP-VERSION': '2.2.6',
            //'X-ITOUCH-WEBVIEW-UA': 'Mozilla/5.0 (Linux; Android 13.1.2;)',
            'x-itouchtv-ts': timestamp
        };
        return header;
    }

    itouchv3wxapp(channelId) {
        //v3版代码参考 wjxgzz https://www.right.com.cn/forum/forum.php?mod=viewthread&tid=8182650
        let res = "";
        let timestamp = new Date().getTime();
        let wxdeviceid = this.getWXDeviceID();

        let url = "https://tcdn-api.itouchtv.cn/getParam?fromSource=wxapp";
        let header = this.getItouchv3wxappHeader("GET", url, timestamp,wxdeviceid);
        //再发get请求
        var res_url_chinfo = request('GET', url,
            {
                headers: header,
                encoding: 'utf8'
            });
        console.log(res_url_chinfo.url);

        let node = "";
        if (res_url_chinfo && res_url_chinfo.statusCode == 200) {
            var body = res_url_chinfo.getBody().toString();
            console.log(body);
            var jsonbody = JSON.parse(body);
            node = jsonbody.node;
            console.log("node= " + node);
        }

        let url2 = "https://api.itouchtv.cn/liveservice/v3/tvChannelList?fromSource=wxapp&node=" + node;
        let header2 = this.getItouchv3wxappHeader("GET", url2, timestamp,wxdeviceid);

        //再发get请求
        var res_url2_chinfo = request('GET', url2,
            {
                headers: header2,
                encoding: 'utf8'
            });
        console.log(res_url2_chinfo.url);
        console.log(res_url2_chinfo);
        if (res_url2_chinfo && (res_url2_chinfo.statusCode == 200 || res_url2_chinfo.statusCode == 509)) {
            //509状态码不能调用getBody() 但可以调用body
            var body = res_url2_chinfo.body.toString();
            console.log(body);
            // HTTP/1.1 509 Unknown
            // {"timestamp":1687173893707,"status":509,"error":"Bandwidth Limit Exceeded","message":"系统繁忙,请稍后再试","path":"/liveservice/v3/tvChannelList"}
            var jsonbody = JSON.parse(body);
            if (jsonbody.hasOwnProperty("tvChannelList")) {
                jsonbody.tvChannelList.forEach(function (tvChannel) {
                    var pk = tvChannel.pk;
                    var name = tvChannel.name;
                    var url = tvChannel.url;
                    if (channelId == pk) {
                        res = url;
                        console.log(url);
                    }

                });
            }


        }
        return res;
    }

    itouchv3(channelId) {
        //v3版代码参考 wjxgzz https://www.right.com.cn/forum/forum.php?mod=viewthread&tid=8182650
        let res = "";
        let timestamp = new Date().getTime();
        //device随机imei地址
        let deviceId = 'IMEI_'+imei();
        //let refer = CryptoJS.MD5(deviceId).toString().substr(0, 16);


        let url = "https://tcdn-api.itouchtv.cn/getParam";
        let header = this.getItouchv3Header("GET", url, timestamp,deviceId);
        //再发get请求
        var res_url_chinfo = request('GET', url,
            {
                headers: header,
                encoding: 'utf8'
            });
        console.log(res_url_chinfo.url);

        let node = "";
        if (res_url_chinfo && res_url_chinfo.statusCode == 200) {
            var body = res_url_chinfo.getBody().toString();
            console.log(body);
            var jsonbody = JSON.parse(body);
            node = jsonbody.node;
            console.log("node= " + node);
        }

        let url2 = "https://api.itouchtv.cn/liveservice/v3/tvChannelList?node=" + node;
        let header2 = this.getItouchv3Header("GET", url2, timestamp,deviceId);

        //再发get请求
        var res_url2_chinfo = request('GET', url2,
            {
                headers: header2,
                encoding: 'utf8'
            });
        console.log(res_url2_chinfo.url);
        console.log(res_url2_chinfo);
        if (res_url2_chinfo && (res_url2_chinfo.statusCode == 200 || res_url2_chinfo.statusCode == 509)) {
            //509状态码不能调用getBody() 但可以调用body
            var body = res_url2_chinfo.body.toString();
            console.log(body);
            // HTTP/1.1 509 Unknown
            // {"timestamp":1687173893707,"status":509,"error":"Bandwidth Limit Exceeded","message":"系统繁忙,请稍后再试","path":"/liveservice/v3/tvChannelList"}
            var jsonbody = JSON.parse(body);
            if (jsonbody.hasOwnProperty("tvChannelList")) {
                jsonbody.tvChannelList.forEach(function (tvChannel) {
                    var pk = tvChannel.pk;
                    var name = tvChannel.name;
                    var url = tvChannel.url;
                    if (channelId == pk) {
                        res = url;
                        console.log(url);
                    }

                });
            }


        }
        return res;
    }

    async itouchv2(channelId) {
        let res = "";
        let timestamp = new Date().getTime();
        let deviceId = 'IMEI_' + imei();

        let url = "https://api.itouchtv.cn/liveservice/v2/tvChannelList";
        let optionheader = this.getItouchv2OptionHeader();
        //再发get请求
        /*var res_url_preflight = request('OPTIONS', url,
            {
                headers: optionheader,
                followRedirects: false
            });
        console.log(res_url_preflight.url);

        if (res_url_preflight && (res_url_preflight.statusCode == 204 || res_url_preflight.statusCode == 200)) {
            console.log(res_url_preflight.statusCode);
        }*/


        await this.sendOptionsAsync(url, optionheader).then(data => {
            console.log(data);
        }).catch(err => {
            console.log(err);
        });

        let url2 = url;
        let header2 = this.getItouchv2Header("GET", url2, timestamp,deviceId);


        //再发get请求deviceId
        var res_url2_chinfo = request('GET', url2,
            {
                headers: header2,
                encoding: 'utf8'
            }
        );
        console.log(res_url2_chinfo.url);
        console.log(res_url2_chinfo);
        if (res_url2_chinfo && (res_url2_chinfo.statusCode == 200 || res_url2_chinfo.statusCode == 509)) {

            //509状态码不能调用getBody() 但可以使用 .body
            //{"timestamp":1687179018804,"status":509,"error":"Bandwidth Limit Exceeded","message":"系统繁忙,请稍后再试","path":"/liveservice/v2/tvChannelList"}
            var body = res_url2_chinfo.body.toString();
            console.log(body);
            var jsonbody = JSON.parse(body);
            console.log(jsonbody);
            if (jsonbody.hasOwnProperty("tvChannelList")) {
                jsonbody.tvChannelList.forEach(function (tvChannel) {
                    var pk = tvChannel.pk;
                    var name = tvChannel.name;
                    var url = tvChannel.url;
                    if (channelId == pk) {
                        res = url;
                        console.log(url);
                    }
                });

            }

        }
        return res;
    }


    async get(vodId, fmt) {


        var res = vodId;
        //频道map
        let channelMap = new Map([
            //广东卫视
            ['gdws', 1182],
            //广东珠江
            ['gszj', 1183],
            //广东新闻
            ['gsxw', 1186],
            //广东民生
            ['gsms', 1185],
            //大湾区卫视
            ['dwqws', 1197],
            //广东4K超高清
            ['gdzy', 1198],
            //广东体育
            ['gdty', 1185],
            //广东影视
            ['gdys', 1199],
            //嘉佳卡通
            ['jjkt', 1187],
            //广东国际
            ['gdgj', 1191],
            //广东经济科教
            ['gdjjkj', 1196],
            //广东少儿
            ['gdse', 1200],
            //广东移动
            ['gdyd', 2463],
            //GRTN文化频道
            ['gdgrtnwh', 2511],

            //广播电台
            //广东新闻广播
            ['gdxwgb', 2512],
            //珠江经济
            ['zzjjgb', 2513],
            //音乐之声
            ['yyzs', 2514],
            //交通之声
            ['jtzs', 2515],
            //南方生活
            ['nfsh', 2518],
            //城市之声
            ['cszs', 2519],
            //故事广播
            ['gsgb', 2516],
            //文体广播
            ['wtgb', 2517]


        ]);

        if (channelMap.has(vodId) == false) {
            vodId = "gdws";
        }
        console.log("vodId=", vodId, " fmt=", fmt);

        let channelId = channelMap.get(vodId);
        console.log("channelId=", channelId);


        //全局变量map初始化
        if (itouchMap == undefined || Object.keys(itouchMap).length == 0) {
            itouchMap = new MapExpire([], {capacity: 1000, duration: 5000});
        }
        //如果全局map里有结果直接返回
        if (itouchMap.has(channelId + "@" + fmt)) {
            res = itouchMap.get(channelId + "@" + fmt);
            console.log("hit cache res=",res)
            return res;
        }
        switch (fmt) {
            case "v2":
                res = this.itouchv2(channelId);
                break;
            case "v3":
                res = this.itouchv3(channelId);
                break;
            case "v3wxapp":
                res = this.itouchv3wxapp(channelId);
                break;
            default:
                res = this.itouchv2(channelId);
        }
        if (!(res == "")) {
            itouchMap.set(channelId + "@" + fmt, res);
        }
        //如果v2 v3 v3wxapp没有获取到地址，则跳转到荔枝网代理
        if (res == "") {
            res = "/gdtv/video?vodId=" + vodId;
        }
        // 将查找到的数据返回
        return res;
    }

}

module.exports = {ItouchtvService};