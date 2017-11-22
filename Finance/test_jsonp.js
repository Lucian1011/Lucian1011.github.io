

var json_data
var fund_code = "001986"
var pageSize = 10
var url = "http://fundmobapi.eastmoney.com/FundMApi/FundNetDiagram.ashx?deviceid=app_danganye_f10&version=V2.1.0&product=EFund&plat=Iphone&FCODE=" + fund_code + "&pageIndex=1&pageSize=" + pageSize + "&_=1500108520818&callback=?"

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
  return new Promise((resolve, reject) =>{
  get_total_count(fund_code).then(function(pageSize){
      let url = "http://fundmobapi.eastmoney.com/FundMApi/FundNetDiagram.ashx?deviceid=app_danganye_f10&version=V2.1.0&product=EFund&plat=Iphone&FCODE=" + fund_code + "&pageIndex=1&pageSize=" + pageSize + "&_=1500108520818&callback=?"
      $.get(url, function (ret){
        console.error("get_all_records | ret", ret);
        resolve(ret);
      }, 'jsonp')
    })
  })
}

get_all_records(fund_code).then(function(json_data){
  console.error("finnally, I get the datas", json_data.Datas);
})
