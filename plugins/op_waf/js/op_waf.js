
function owPost(method, args, callback){
    var loadT = layer.msg('正在获取...', { icon: 16, time: 0, shade: 0.3 });
    $.post('/plugins/run', {name:'op_waf', func:method, args:JSON.stringify(args)}, function(data) {
        layer.close(loadT);
        if (!data.status){
            layer.msg(data.msg,{icon:0,time:2000,shade: [0.3, '#000']});
            return;
        }

        if(typeof(callback) == 'function'){
            callback(data);
        }
    },'json'); 
}


function setRequestCode(ruleName, statusCode){
    layer.open({
        type: 1,
        title: "设置响应代码【" + ruleName + "】",
        area: '300px',
        shift: 5,
        closeBtn: 2,
        shadeClose: true,
        content: '<div class="bt-form pd20 pb70">\
                    <div class="line">\
                        <span class="tname">响应代码</span>\
                        <div class="info-r">\
                            <select id="statusCode" class="bt-input-text mr5" style="width:150px;">\
                                <option value="200" '+ (statusCode == 200 ? 'selected' : '') + '>正常(200)</option>\
                                <option value="404" '+ (statusCode == 404 ? 'selected' : '') + '>文件不存在(404)</option>\
                                <option value="403" '+ (statusCode == 403 ? 'selected' : '') + '>拒绝访问(403)</option>\
                                <option value="444" '+ (statusCode == 444 ? 'selected' : '') + '>关闭连接(444)</option>\
                                <option value="500" '+ (statusCode == 500 ? 'selected' : '') + '>应用程序错误(500)</option>\
                                <option value="502" '+ (statusCode == 502 ? 'selected' : '') + '>连接超时(502)</option>\
                                <option value="503" '+ (statusCode == 503 ? 'selected' : '') + '>服务器不可用(503)</option>\
                            </select>\
                        </div>\
                    </div>\
                    <div class="bt-form-submit-btn">\
                        <button type="button" class="btn btn-success btn-sm btn-title" onclick="setState(\''+ ruleName + '\')">确定</button>\
                    </div>\
                </div>'
    });
}

function setState(ruleName){
    var statusCode = $('#statusCode').val();
    owPost('set_obj_status', {obj:ruleName,statusCode:statusCode},function(data){
        var rdata = $.parseJSON(data.data);
        if (rdata.status){
            layer.msg(rdata.msg,{icon:0,time:2000,shade: [0.3, '#000']});
            wafGloabl();
        } else {
            layer.msg('设置失败!',{icon:0,time:2000,shade: [0.3, '#000']});
        }
    });
}

function setObjOpen(ruleName){
    owPost('set_obj_open', {obj:ruleName},function(data){
        var rdata = $.parseJSON(data.data);
        if (rdata.status){
            layer.msg(rdata.msg,{icon:0,time:2000,shade: [0.3, '#000']});
            wafGloabl();
        } else {
            layer.msg('设置失败!',{icon:0,time:2000,shade: [0.3, '#000']});
        }
    });
}

function setCcRule(cycle, limit, endtime, siteName, increase){
    var incstr = '<li style="color:red;">此处设置仅对当前站点有效。</li>';
    if (siteName == 'undefined') {
        incstr = '<li style="color:red;">此处设置的是初始值，新添加站点时将继承，对现有站点无效。</li>';
    }

}

function wafScreen(){

    owPost('waf_srceen', {}, function(data){
        var rdata = $.parseJSON(data.data);
        console.log(rdata);

        var con = '<div class="wavbox alert alert-success" style="margin-right:16px">总拦截<span>'+rdata.total+'</span>次</div>';
        con += '<div class="wavbox alert alert-info" style="margin-right:16px">安全防护<span>0</span>天</div>';

        con += '<div class="screen">\
            <div class="line"><span class="name">POST渗透</span><span class="val">'+rdata.rules.post+'</span></div>\
            <div class="line"><span class="name">GET渗透</span><span class="val">0</span></div>\
            <div class="line"><span class="name">CC攻击</span><span class="val">'+rdata.rules.cc+'</span></div>\
            <div class="line"><span class="name">恶意User-Agent</span><span class="val">'+rdata.rules.user_agent+'</span></div>\
            <div class="line"><span class="name">Cookie渗透</span><span class="val">'+rdata.rules.cookie+'</span></div>\
            <div class="line"><span class="name">恶意扫描</span><span class="val">0</span></div>\
            <div class="line"><span class="name">恶意HEAD请求</span><span class="val">0</span></div>\
            <div class="line"><span class="name">URI自定义拦截</span><span class="val">0</span></div>\
            <div class="line"><span class="name">URI保护</span><span class="val">0</span></div>\
            <div class="line"><span class="name">恶意文件上传</span><span class="val">0</span></div>\
            <div class="line"><span class="name">禁止的扩展名</span><span class="val">0</span></div>\
            <div class="line"><span class="name">禁止PHP脚本</span><span class="val">0</span></div>\
            </div>';

        con += '<div style="width:660px;"><ul class="help-info-text c7">\
            <li>在此处关闭防火墙后,所有站点将失去保护</li>\
            <li>网站防火墙会使nginx有一定的性能损失(&lt;5% 10C静态并发测试结果)</li>\
            <li>网站防火墙仅主要针对网站渗透攻击,暂时不具备系统加固功能</li>\
            </ul></div>';

        $(".soft-man-con").html(con);
    });
}


function wafGloabl(){
    owPost('waf_conf', {}, function(data){
        var rdata = $.parseJSON(data.data);

        var con = '<div class="divtable">\
            <table class="table table-hover waftable">\
                <thead><tr><th width="18%">名称</th>\
                <th width="44%">描述</th>\
                <th width="10%">响应</th>\
                <th style="text-align: center;" width="10%">状态</th>\
                <th style="text-align: right;">操作</th></tr>\
                </thead>\
                <tbody>\
                    <tr><td>CC防御</td>\
                        <td>防御CC攻击，具体防御参数请到站点配置中调整</td>\
                        <td><a class="btlink" onclick="setRequestCode(\'cc\','+rdata.cc.status+')">'+rdata.cc.status+'</a></td>\
                        <td><div class="ssh-item">\
                            <input class="btswitch btswitch-ios" id="closecc" type="checkbox" '+(rdata.cc.open ? 'checked' : '')+'>\
                            <label class="btswitch-btn" for="closecc" onclick="setObjOpen(\'cc\')"></label></div>\
                        </td>\
                        <td class="text-right"><a class="btlink" onclick="setCcRule(80,120,60,\'undefined\',false)">初始规则</a></td>\
                    </tr>\
                </tbody>\
            </table>\
            </div>';


        con += '<div style="width:645px;"><ul class="help-info-text c7">\
            <li>继承: 全局设置将在站点配置中自动继承为默认值</li>\
            <li>优先级: IP白名单>IP黑名单>URL白名单>URL黑名单>CC防御>禁止国外IP访问>User-Agent>URI过滤>URL参数>Cookie>POST</li>\
            </ul></div>';
        $(".soft-man-con").html(con);
    });
}


function wafSite(){
    var con = '<div class="divtable">\
        <table class="table table-hover waftable" style="color:#fff;">\
            <thead>\
                <tr><th width="18%">站点</th>\
                <th>GET</th>\
                <th>POST</th>\
                <th>UA</th>\
                <th>Cookie</th>\
                <th>CDN</th>\
                <th>CC</th>\
                <th>状态</th>\
                <th>操作</th></tr>\
            </thead>\
        </table>\
        </div>';
    $(".soft-man-con").html(con);
}



function wafHistory(){

    var con = '<button class="btn btn-success btn-sm" onclick="UncoverAll()">解封所有</button>';
    con += '<div class="divtable mt10">\
        <table class="table table-hover waftable" style="color:#fff;">\
            <thead><tr><th width="18%">开始时间</th>\
            <th width="44%">IP</th>\
            <th width="10%">站点</th>\
            <th width="10%">封锁原因</th>\
            <th width="10%">封锁时长</th>\
            <th style="text-align: center;" width="10%">状态</th>\
            </thead>\
        </table>\
        </div>';
    $(".soft-man-con").html(con);
}


function wafLogs(){
    var con = '<div class="divtable">\
        <table class="table table-hover waftable" style="color:#fff;">\
            <thead><tr><th width="18%">名称</th>\
            <th width="44%">描述</th>\
            <th width="10%">响应</th>\
            <th style="text-align: center;" width="10%">状态</th>\
            <th style="text-align: right;">操作</th></tr>\
            </thead>\
        </table>\
        </div>';    
    $(".soft-man-con").html(con);
}