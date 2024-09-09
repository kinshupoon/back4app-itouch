const Router = require('koa-router');
const router = new Router();
// 这是一个用于验证入参是否正确的包
const Joi = require('joi');
const { ItouchvideoController } = require('./controllers/itouchvideo-controller');
router.get('/', ctx => ctx.body = 'Web API Running Successfully.');
// 用于验证入参
// 第一个参数依旧是路由地址，第二个参数我们验证入参是否合格的函数放在这里，第三个参数是controller执行层
router.get('/itouch/video',  ItouchvideoController.get);
module.exports = router;