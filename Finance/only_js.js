
// 基于准备好的dom，初始化echarts实例
var myChart = echarts.init(document.getElementById('main'));



function convert_str_to_json(str){
    return eval('(' + str + ')');
}

// 接口返回的 jsonp 转化成 json（掐头去尾）
function get_json_from_str(str){
  // 取出 json 字段
  str = str.substring(19);
  str = str.substring(0, str.length-1);
  return convert_str_to_json(str);
}

// 从数组中抽离指定字段的值组成新的数组
function get_keyword_array_from_array(keyword, array){
  var index;
  new_array = [];
  console.error("array", array.length);

  for(index=0; index < array.length; index++){
    item = array[index];
    console.error("item", item);
    new_array.push(item[keyword]);
  };
  new_array.reverse();  // 需要反转一下
  console.error("new_array = ", new_array);
  return new_array;
}

function get_result_json_format(fund_code, url){
  $.get(url).done(function (result){
    // console.error("result", result);
    // console.error("typeof(result)", typeof(result));
    let result_json = get_json_from_str(result)
    // console.error("result_json = ", result_json);
    let pageSize = result_json.TotalCount
    // console.error("pageSize = ", pageSize);
    let new_url = "http://fundmobapi.eastmoney.com/FundMApi/FundNetDiagram.ashx?deviceid=app_danganye_f10&version=V2.1.0&product=EFund&plat=Iphone&FCODE=" + fund_code + "&pageIndex=1&pageSize=" + pageSize + "&_=1500108520818&callback=Zepto1500108520470"
    $.get(new_url).done(function (result){
      myChart.hideLoading()
      let result_json = get_json_from_str(result)
      console.error("new result_json = ", result_json);
      myChart.setOption({
        title: {
            text: '累计净值'
        },
        tooltip: {
          "trigger": "axis"
        },
        legend: {
            data:['净值']
        },
        xAxis: {
            data: get_keyword_array_from_array("FSRQ", result_json.Datas)
        },
        yAxis: {},
        series: [{
            name: '净值',
            type: 'line',
            data: get_keyword_array_from_array("LJJZ", result_json.Datas)
        }]
      })
    })
  })
}

var fund_code = "001618"
var pageSize = 10
var url = "http://fundmobapi.eastmoney.com/FundMApi/FundNetDiagram.ashx?deviceid=app_danganye_f10&version=V2.1.0&product=EFund&plat=Iphone&FCODE=" + fund_code + "&pageIndex=1&pageSize=" + pageSize + "&_=1500108520818&callback=Zepto1500108520470"

get_result_json_format(fund_code, url)


myChart.showLoading
