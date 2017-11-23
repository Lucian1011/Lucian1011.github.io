

var json_data
// var fund_code = "001986"
var fund_code = "161725"
var pageSize = 10
var url = "http://fundmobapi.eastmoney.com/FundMApi/FundNetDiagram.ashx?deviceid=app_danganye_f10&version=V2.1.0&product=EFund&plat=Iphone&FCODE=" + fund_code + "&pageIndex=1&pageSize=" + pageSize + "&_=1500108520818&callback=?"

var date_list = []  // 日期列表
var LJJZ_list = [] // 累计净值列表
var DWJZ_list = [] // 单位菁池列表

// function afterget(json_data_inside){
//   console.error("inside func json_data_inside", json_data_inside);
// }
//
// $.get(url,function (json_result){
//   console.error(json_result);
//   let TotalCount = json_result.TotalCount
//   pageSize = TotalCount
//   url = "http://fundmobapi.eastmoney.com/FundMApi/FundNetDiagram.ashx?deviceid=app_danganye_f10&version=V2.1.0&product=EFund&plat=Iphone&FCODE=" + fund_code + "&pageIndex=1&pageSize=" + pageSize + "&_=1500108520818&callback=?"
//   $.get(url, function (json_result){
//     console.error(".........");
//     console.error(json_result);
//     json_data = json_result;
//     console.error("json_data", json_data);
//     afterget(json_data)
//   }, 'jsonp')
// }, 'jsonp')
//
// console.error("outside json_data", json_data);

// $.get(url, 'jsonp').done(function (json_result){
//   console.error(json_result);
// })
function get_total_count(fund_code){
  let url = "http://fundmobapi.eastmoney.com/FundMApi/FundNetDiagram.ashx?deviceid=app_danganye_f10&version=V2.1.0&product=EFund&plat=Iphone&FCODE=" + fund_code + "&pageIndex=1&pageSize=10&_=1500108520818&callback=?"
  return new Promise((resolve, reject) =>{
    $.get(url, function (ret){
      console.error("get_total_count | ret", ret);
      pageSize = ret.TotalCount
      resolve(pageSize);
    }, 'jsonp')
  })
}


function get_all_records(fund_code){
  return json_data ? json_data : new Promise((resolve, reject) =>{
    console.error("json_data is undefined, here to return promise");
    get_total_count(fund_code).then(function(pageSize){
        let url = "http://fundmobapi.eastmoney.com/FundMApi/FundNetDiagram.ashx?deviceid=app_danganye_f10&version=V2.1.0&product=EFund&plat=Iphone&FCODE=" + fund_code + "&pageIndex=1&pageSize=" + pageSize + "&_=1500108520818&callback=?"
        $.get(url, function (ret){
          console.error("get_all_records | ret", ret);
          json_data = ret.Datas;
          resolve(ret.Datas);
        }, 'jsonp')
      })
  })
}

// 获得累计净值、单位净值、日期列表
function get_all_lists(fund_code){
  return new Promise((resolve, reject) => {
    get_all_records(fund_code).then(function(datas){
      let i;
      for(i=0; i<datas.length; i++){
        LJJZ_list.push(datas[i].LJJZ)
        DWJZ_list.push(datas[i].DWJZ)
        date_list.push(datas[i].FSRQ)
      }
      // datas.forEach(function(item){
      //   console.error("jjjjjj");
      //   LJJZ_list.push(item.LJJZ)
      //   DWJZ_list.push(item.DWJZ)
      //   date_list.push(item.FSRQ)
      // })
      resolve();
    })
  })
}

// 基于准备好的dom，初始化echarts实例
var myChart = echarts.init(document.getElementById('main'));
myChart.showLoading()

get_all_lists(fund_code).then(function(){
  console.error("各个列表啊");
  console.error("LJJZ_list", LJJZ_list);
  console.error("DWJZ_list", DWJZ_list);
  console.error("date_list", date_list);
  LJJZ_list.reverse();
  DWJZ_list.reverse();
  date_list.reverse();
  myChart.hideLoading();
  myChart.setOption({
    title: {
      text: fund_code + '累计净值'
    },
    tooltip: {
      "trigger": "axis"
    },
    dataZoom: {

    },
    legend: {
      data:['累计净值','单位净值']
    },
    xAxis: {
      data: date_list
    },
    yAxis: {
      min: 'dataMin',
      max: 'dataMax'
    },
    series: [{
      name: '累计净值',
      type: 'line',
      data: LJJZ_list
    },{
      name: '单位净值',
      type: 'line',
      data: DWJZ_list
    }]
  })
})

console.error("outside, json_data", json_data);
