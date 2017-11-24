
var json_data
// var fund_code = "001986"
// var fund_code = "161725"  // 白酒
// var fund_code = "001986"  // 前海开源人工智能
var fund_code = "001618"  // 天弘中证电子指数C
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
  // return json_data ? json_data : new Promise((resolve, reject) =>{
  return new Promise((resolve, reject) =>{  // 为了防止后面日期出错先这么处理
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
      // 需要把这几个反转一下
      LJJZ_list.reverse();
      DWJZ_list.reverse();
      date_list.reverse();
      resolve();
    })
  })
}

// 把小数转换成百分数，暂时取三位数
function toPercent(point){
    var str = Number(point*100).toFixed(3);
    // str += "%";
    return str;
}



var chart_DWJZ_LJJZ_lines;
var chart_LJJZ_gap;
//创建所有的图表对象
function init_all_echarts(){
  chart_DWJZ_LJJZ_lines = echarts.init(document.getElementById('DWJZ_LJJZ_lines'));
  chart_LJJZ_gap = echarts.init(document.getElementById('LJJZ_gap'));
  chart_DWJZ_LJJZ_lines.showLoading()
  chart_LJJZ_gap.showLoading()
}

function create_DWJZ_LJJZ_lines(){
  chart_DWJZ_LJJZ_lines.hideLoading();
  chart_DWJZ_LJJZ_lines.setOption({
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
}

// 创建 gap_list
function get_gap_list(gap, min_gap){
  let index;
  let LJJZ_list_with_gap = [];
  for(index=0; index<min_gap; index++){
    LJJZ_list_with_gap.push(0)
  }
  for(index=0; index<LJJZ_list.length-gap; index++){
    let first = LJJZ_list[index]
    let last = LJJZ_list[index+gap]
    LJJZ_list_with_gap.push(toPercent((last-first)/first))
  }
  return LJJZ_list_with_gap
}

function create_LJJZ_gap(gap){
  console.log(typeof gap === 'object');
  let LJJZ_list_with_gap = [];  // 大的 LJJZ_list_with_gap
  let legend_list = [];  // legend_list
  let date_list_clone = date_list.concat();
  // 如果 gap 是一个数组
  if(typeof gap === 'object'){
    // 处理一下日期列表，把 gap 数组里面的最小值拿出来
    gap_temp = gap.concat();
    gap_temp.sort();
    let min_gap = gap_temp[0]
    let index;
    for(index=0; index<min_gap; index++){
      date_list_clone.shift();
    }
    // 遍历 gap 根据 gap 处理出不同的 LJJZ_list_with_gap 并加入到大的 LJJZ_list_with_gap 数组
    for(index=0; index<gap.length; index++){
      LJJZ_list_with_gap.push({
        name: "LJJZ gap-" + gap[index],
        type: "line",
        data: get_gap_list(gap[index], min_gap)
      })
      legend_list.push("gap-"+gap[index])
    }
  }else{
    date_list_clone.shift();
    LJJZ_list_with_gap.push(get_gap_list(gap))
    legend_list.push("gap-"+gap)
  }

  chart_LJJZ_gap.hideLoading();
  let index;
  // let gap = 1;
  for(index=1; index<=gap; index++){
    date_list.shift();  // 去掉数组内的第一个元素
  }
  console.log("legend_list", legend_list);
  // console.log("LJJZ_list_with_gap", LJJZ_list_with_gap);
  // console.log("new date_list", date_list);
  chart_LJJZ_gap.setOption({
    title: {
      text: fund_code + '累计净值 gap' + gap
    },
    tooltip: {
      "trigger": "axis"
    },
    dataZoom: {

    },
    legend: {
      data: legend_list
    },
    xAxis: {
      data: date_list_clone
    },
    yAxis: {
      min: 'dataMin',
      max: 'dataMax'
    },
    series: LJJZ_list_with_gap
    // series: [{
    //   name: '累计净值_gap' + gap,
    //   type: 'line',
    //   data: LJJZ_list_with_gap
    // }]
  })
}


init_all_echarts();  // 先创建图表对象
get_all_lists(fund_code).then(function(){
  console.error("各个列表啊");
  console.error("LJJZ_list", LJJZ_list);
  console.error("DWJZ_list", DWJZ_list);
  console.error("date_list", date_list);
  create_DWJZ_LJJZ_lines();
  create_LJJZ_gap([3, 30]);
})
