// 引入service层的BookService
const { ItouchtvService } = require('../common/itouchtv-service');

// 创建class，其下是book相关逻辑函数
class ItouchvideoService {
    async get(vodId,fmt) {

        // 将之前引入的service实例化
        const douyintvService = new ItouchtvService();
        const res = await douyintvService.get(vodId,fmt);
        return res;
    }
}
module.exports = { ItouchvideoService };