// 引入框架
const Koa = require('koa');
// 将koa实例化
const app = new Koa();
// 将刚才的写好的router文件引入到入口server.js文件中。tips：引用自己创建的模块而不是npm包的时候，使用路径引入，特别需要注意的是，"当前文件夹"必须使用'./'，否则node会去node_modules文件夹中找
const router = require('./router');
//允许代理访问 用户获取真实ip
app.proxy = true;
// 引入的router文件如下方式使用
app
    .use(router.routes())
    .use(router.allowedMethods())
app.listen(3000);
// 启动成功的话打印地址
console.log('Web server run on port 3000');
//访问示例14 触电新闻 广东卫视 http://localhost:3000/itouch/video?vodId=gdws 嘉佳卡通 http://localhost:3000/gdtv/video?vodId=jjkt v3版增加参数 fmt=v3


