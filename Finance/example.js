// 基于准备好的dom，初始化echarts实例
var myChart = echarts.init(document.getElementById('main'));

// 指定图表的配置项和数据
var option = {
    title: {
        text: 'ECharts 入门示例'
    },
    tooltip: {},
    legend: {
        data:['销量']
    },
    xAxis: {
        data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
    },
    yAxis: {},
    series: [{
        name: '销量',
        type: 'bar',
        data: [5, 20, 36, 10, 10, 20]
    }]
};
myChart.setOption(option);

// function convert_str_to_json(str){
//     return eval('(' + str + ')')
// }
//
// // 使用刚指定的配置项和数据显示图表。
// // myChart.setOption(option);
//
// myChart.showLoading();
// // $.get('data.json').done(function (datas) {
// //
// //     console.error(typeof(datas));
// //     datas = convert_str_to_json(datas)
// //     console.error(typeof(datas));
// //
// //     myChart.hideLoading();
// //
// //     myChart.setOption({
// //         title: {
// //             text: 'ECharts 入门示例'
// //         },
// //         tooltip: {},
// //         legend: {
// //             data:['销量']
// //         },
// //         xAxis: {
// //             data: datas.name
// //         },
// //         yAxis: {},
// //         series: [{
// //             name: '销量',
// //             type: 'line',
// //             data: datas.data
// //         },{
// //             name: "销量 2",
// //             type: 'line',
// //             data: datas.data2
// //         }]
// //     });
// //
// // })
//
// $.get('total_data.json').done(function (total_data){
//     myChart.hideLoading();
//     total_data = convert_str_to_json(total_data)
//     myChart.setOption(total_data)
// })
