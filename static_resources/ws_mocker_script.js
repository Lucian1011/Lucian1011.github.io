/**
 * Created by leiguiliang on 2017/9/6.
 */

function WS_Socket(ws_url,ws_received_msg_callback){
    const CMD_INIT = 'init';
    const CMD_ENABLE_LOGGER_FILTER = 'enable_wid_filter';
    const CMD_DISABLE_LOGGER_FILTER = 'disable_wid_filter';
    const CMD_ENABLE_MOCK = 'enable_mock';
    const CMD_DISABLE_MOCK = 'disable_mock';
    const CMD_PING = 'ping';
    const CMD_FORMAT_JS = 'format_js';

    var _ws_url = ws_url;
    var _ws_promise = false;
    var _ws_received_msg_callback = ws_received_msg_callback
    var req_id = 0
    var ws_callback_map = {};


    this.ws_open = function(){
        if(! _ws_promise){
            _ws_promise = new Promise(function(resolve,reject){
                var socket = new WebSocket(_ws_url);
                socket.onerror = function () {
                    _ws_promise = false
                    $('#network_error_alert').css("display",'block');
                    reject("onError")
                };
                socket.onclose = function (event) {
                    console.log('Client notified socket has closed', event);
                    _ws_promise = false
                    $('#network_error_alert').css("display",'block');
                    reject("onClosed")
                };
                socket.onopen = function (event) {
                    $('#network_error_alert').css("display",'none');
                    resolve(socket)
                };
                socket.onmessage = function (event) {
                    console.log('Client received a message', event);

                    var data = JSON.parse(event.data);
                    var req_id = data['req_id'];
                    var callback = ws_callback_map[req_id];
                    if (callback && typeof callback === 'function') {
                        callback(data)
                    }else{
                        _ws_received_msg_callback(event.data)
                    }
                };
            });
        }
        return _ws_promise
    };

    this.ws_send_ping = function(){
        var thiz = this;
        setInterval(function () {
            thiz.ws_open().then(function(socket){
                var data = {
                    'req_id': req_id++,
                    'cmd': CMD_PING
                };
                socket.send(JSON.stringify(data))
            });
        }, 2 * 1000);
    }

    this.ws_send_init = function(wid) {
        this.ws_open().then(function(socket){
            var data = {
                'req_id': req_id++,
                'cmd': CMD_INIT,
                'wid': wid
            };
            socket.send(JSON.stringify(data))
        })
    };

     this.ws_send_enable_filter = function() {
         this.ws_open().then(function(socket){
             var data = {
                 'req_id': req_id++,
                 'cmd': CMD_ENABLE_LOGGER_FILTER
             };
             socket.send(JSON.stringify(data))
         })
    };

    this.ws_send_disable_filter =function() {
        this.ws_open().then(function(socket){
            var data = {
                'req_id': req_id++,
                'cmd': CMD_DISABLE_LOGGER_FILTER
            };
            socket.send(JSON.stringify(data))
        })
    };

    this.ws_send_format_js = function(script, callback) {
        this.ws_open().then(function(socket){
            var rid = req_id++;
            var data = {
                'req_id': rid,
                'cmd': CMD_FORMAT_JS,
                'script': script
            };
            ws_callback_map[rid] = callback;
            socket.send(JSON.stringify(data));
        })
    };

    this.ws_send_enable_mock = function(script) {
        this.ws_open().then(function(socket){
            var data = {
                'req_id': req_id++,
                'cmd': CMD_ENABLE_MOCK,
                'script': script
            };
            socket.send(JSON.stringify(data))
        })
    };

    this.ws_send_disable_mock = function() {
        this.ws_open().then(function(socket){
                var data = {
                    'req_id': req_id++,
                    'cmd': CMD_DISABLE_MOCK
                };
                socket.send(JSON.stringify(data))

        })
    };

    this.ws_send_ping();
}


$(function () {
    const ACTION_UPDATE_WID_LIST = 'action_update_wid_list';
    const ACTION_APPEND_MOCK_LOG = 'action_append_mock_log';

    const DEFAULT_MOCK_SCRIPT = '' +
        'class MyMock(MockHere):\n' +
        '    def mock_req(self, request_content):\n' +
        '        return request_content\n' +
        '    def mock_resp(self, response_content):\n' +
        '        return response_content\n' +
        '\n';

    var ws_url = "ws://"+ location.host +"/mock_ws_client/echo";
    var ws_socket = new WS_Socket(ws_url, ws_received_msg);

    function ws_received_msg(msg) {
        var data = JSON.parse(msg);

        if (data.action == ACTION_UPDATE_WID_LIST) {
            var elm = $('#input_wid');
            elm.empty();
            var list = data.list;

            for (var i = 0; i < list.length; i++) {
                var wid = list[i];
                var html = '<option value="' + wid + '">' + wid + '</option>';
                elm.append(html);
            }
        } else if (data.action == ACTION_APPEND_MOCK_LOG) {
            var log_count = window.log_count || 1;
            log_count = parseInt(log_count)
            log_count = log_count + 1;
            var log = data.log;
            var clazz = data.clazz;
            var html = "<p class='" + clazz + "'>" + log + "</p>";
            $('#log_display').append(html);

            $('#log_display .mocked').last().prev('p').css("text-decoration", "line-through");
            $("#log_count").html(log_count + "");
            window.log_count = log_count;

        } else {
            //console.error("Unknown message: " + msg)
        }

    }



    // 开始 按钮的处理
    $('#btn_change_wid').click(function () {
        var wid = $('#input_wid').val();
        if (wid) {
            window.current_wid = wid;
            $('#selected_wid').html("当前wid：" + wid);
            ws_socket.ws_send_init(wid)
        }
    });

    if (window.editor.getValue() == "") {
        var last_script = localStorage.getItem("last_script")
        if (last_script) {
            //last_script = $.base64.atob(last_script)
            window.editor.setValue(last_script)
        } else {
            window.editor.setValue(DEFAULT_MOCK_SCRIPT)
        }
    }
    $('#reset_mock_script').click(function () {
        if (confirm("确认清除代码？")) {
            window.editor.setValue(DEFAULT_MOCK_SCRIPT)
        }
    });

    $('#cb_wid_filter').change(function () {
        var is_checked = $(this).is(":checked");
        if (is_checked) {
            if (!window.current_wid) {
                alert("请先选择wid。")
                $(this).prop("checked", false);
                return;
            }
            ws_socket.ws_send_enable_filter();
        } else {
            ws_socket.ws_send_disable_filter();
        }
    });

    $('#cb_mock_switch').change(function () {
        var is_checked = $(this).is(":checked");
        if (is_checked) {
            if (!window.current_wid) {
                alert("请先选择wid。")
                $(this).prop("checked", false);
                return;
            }
            var script = window.editor.getValue();

            //本地保存一下
            //var encoded = $.base64.btoa(script)
            localStorage.setItem("last_script", script)

            console.log(script);
            ws_socket.ws_send_enable_mock(script);
        } else {
            ws_socket.ws_send_disable_mock();
        }
    });
    $('#clean_log').click(function () {
        $('#log_display').empty();
    });

    $("#log_display").delegate("p", "click", function () {
        $('#log_display p').removeClass('selected');
        $(this).addClass('selected');

        try {
            var log = $(this).html();
            var REQ_DATA = JSON.parse(log);
            if (REQ_DATA) { //注意，对于非ws帧，这里可能会解析失败，所以需要判断一下
                //切换一下tab
                $('#tab_inspectors a').tab('show')

                var req_id = REQ_DATA['REQID'];
                var code = REQ_DATA['CODE'] || 0;
                var body = REQ_DATA['BODY'];
                var is_resp_frame = (typeof REQ_DATA['CODE'] == 'number')


                $("#data_req_id").html(req_id);
                $("#data_req_code").html(code);

                if(is_resp_frame){
                    $('#resp_result').css('display',"block");
                    $('#req_result').css('display',"none");
                    ws_socket.ws_send_format_js(body, function (data) {
                        if (window.ace_show) {
                            window.ace_show.setValue(data.msg)
                        }
                    });
                }else{
                    $('#resp_result').css('display',"none");
                    $('#req_result').css('display',"block");

                    var uri = REQ_DATA.URI.replace(/&amp;/g,"&")
                    var query_string = uri.split("?")[1]
                    var body_html = ""
                    var param_list = query_string.split("&")
                    param_list.forEach(function(item){
                        var tmp = item.split("=")
                        body_html += "<tr><td>" + tmp[0] +"</td><td>" + decodeURIComponent(tmp[1]) + "</td></tr>";
                    })
                    $("#params_table tbody").html(body_html);

                    var cookies = REQ_DATA.HEADER.Cookie
                    var param_list = cookies.split(";")
                    body_html = ""
                    param_list.forEach(function(item){
                        var tmp = item.split("=")
                        body_html += "<tr><td>" + tmp[0] +"</td><td>" + decodeURIComponent(tmp[1]) + "</td></tr>";
                    })
                    $("#cookies_table tbody").html(body_html);
                }
            }
        } catch (e) {
            console.error(e)
        }

    });


});
