// 引入service层的BookService
const { ItouchvideoService } = require('../services/itouchvideo-service');
// 创建一个class，把相关的函数组织起来
class ItouchvideoController {
    // controller层我们使用static函数，静态函数是纯函数，没有状态。也使得在使用的时候不需要new即可直接使用
    // ctx是koa框架用户传输相关参数和返回的一个变量，这次我们获取的是全部书本的内容，没有入参，所以不需要组织
    static async get(ctx) {
       // 我们将入参从ctx.request.query中取出
        const vodId = ctx.request.query.vodId;
        const fmt =  (ctx.request.query.fmt =="" || ctx.request.query.fmt ==null|| ctx.request.query.fmt ==undefined )?"v2":ctx.request.query.fmt;
        console.log("fmt=",fmt);

        // 将之前引入的service实例化
        const douyinvideoService = new ItouchvideoService();
        // 使用get方法获取数据
        const res = await douyinvideoService.get(vodId,fmt);

        // 使用ctx.body将获取到的数据返回给api接口
        //ctx.body = res;

        //302重定向 301的重定向会被浏览器缓存
        ctx.response.status = 302
        ctx.response.set({
            // 重定向地址
            Location: res,
            Pragma: 'No-cache'
        })
        ctx.body = 'waiting...';

    }
}
module.exports = { ItouchvideoController: ItouchvideoController };