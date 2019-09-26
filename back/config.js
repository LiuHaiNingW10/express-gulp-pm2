var global_config;
if(process.env.NODE_ENV === 'development'){
    global_config = require('../global_config.dev')
} else if (process.env.NODE_ENV === 'uat') {
    global_config = require('../global_config.uat');
} else {
    global_config = require('../global_config');
}
// 默认
!global_config.BASE && (global_config.BASE = '');

module.exports = {
    ...global_config
}