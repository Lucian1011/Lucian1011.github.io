from urllib import request
import json

# 获取一段时间的累计净值，gap 表示间隔时间（单位是 天）
def get_累计净值_list_with_gap(result_json, gap):
    datas = result_json["Datas"]
    datas.reverse()
    print("len", len(datas))
    # 先把数据清空
    file_name = "dayday_JiJin_累计净值_间隔差_" + str(gap) + "天"
    file = open(file_name, "w")
    file.write("")
    file.close()
    file = open(file_name, "w+")
    for index in range(0, len(datas)-gap, 1):
        # print(datas[index+gap-1])
        last = float(datas[index+gap]["LJJZ"])
        first = float(datas[index]["LJJZ"])
        # print("收益率=(%f-%f)/%f=%f" %(last, first, first, (last-first)/first))
        file.write(str((last-first)/first) + "\n")
    file.close()

# 获取累计净值列表并写入文件
def get_累计净值_list(result_json):
    datas = result_json["Datas"]
    file = open("累计收益_list", "w")
    datas.reverse()
    for data in datas:
        file.write(data["DWJZ"] + "\n")
    file.close()

'''
for echarts
'''
# 获取累计净值列表
def get_LJJZ_list(result_json):
    datas = result_json["Datas"]
    datas.reverse()  # 先反转一下
    LJJZ = []
    for data in datas:
        LJJZ.append(data["LJJZ"])
    return LJJZ
    print(LJJZ)

# 获取日期列表
def get_date_list(result_json):
    datas = result_json["Datas"]
    # datas.reverse()  # 先调用 get_LJJZ_list，里面已经反转过一次，这里就不能再反转了
    date_list = []
    for data in datas:
        date_list.append(data["FSRQ"])
    return date_list
    print(date_list)

# 累计净值走势图
def create_json_LJJZ_list(fund_code, result_json):
    LJJZ_list = get_LJJZ_list(result_json)
    date_list = get_date_list(result_json)
    result_dict = {}
    result_dict["title"] = {"text": "累计净值"}
    result_dict["tooltip"] = {"trigger": "axis"}
    result_dict["dataZoom"] = {}
    result_dict["legend"] = {"data": "累计净值"}
    result_dict["xAxis"] = {"data": date_list}
    result_dict["yAxis"] = {"type": "value"}
    series_LJJZ = {"name": "净值", "type": "line", "data": LJJZ_list}
    series = []
    series.append(series_LJJZ)
    result_dict["series"] = series
    print(result_dict)
    return_json = json.dumps(result_dict)
    file = open("total_data.json", "w")
    file.write(return_json)
    file.close()

# 获取一段时间的累计净值涨幅，gap 表示间隔时间（单位是/天）
def get_LJJZ_list_with_gap(result_json, gap):
    datas = result_json["Datas"]
    datas.reverse()
    # print("len", len(datas))
    # 先把数据清空
    file_name = "dayday_JiJin_累计净值涨幅_间隔_" + str(gap) + "天"
    file = open(file_name, "w")
    file.write("")
    file.close()
    file = open(file_name, "w+")
    for index in range(0, len(datas)-gap, 1):
        # print(datas[index+gap-1])
        last = float(datas[index+gap]["LJJZ"])
        first = float(datas[index]["LJJZ"])
        # print("收益率=(%f-%f)/%f=%f" %(last, first, first, (last-first)/first))
        file.write(str((last-first)/first) + "\n")
    file.close()

if __name__ == "__main__":
    fund_code = "001986"
    pageSize = "10"
    url = "http://fundmobapi.eastmoney.com/FundMApi/FundNetDiagram.ashx?deviceid=app_danganye_f10&version=V2.1.0&product=EFund&plat=Iphone&FCODE=" + fund_code + "&pageIndex=1&pageSize=" + pageSize + "&_=1500108520818&callback=Zepto1500108520470"
    req = request.urlopen(url=url)
    result = req.read().decode("utf-8")
    result_json_format = json.loads(result[19:-1])
    # 拿到 totalCount
    pageSize = str(result_json_format["TotalCount"])
    print("pageSize = ", pageSize)
    url = "http://fundmobapi.eastmoney.com/FundMApi/FundNetDiagram.ashx?deviceid=app_danganye_f10&version=V2.1.0&product=EFund&plat=Iphone&FCODE=" + fund_code + "&pageIndex=1&pageSize=" + pageSize + "&_=1500108520818&callback=Zepto1500108520470"
    req = request.urlopen(url=url)
    result = req.read().decode("utf-8")
    result_json_format = json.loads(result[19:-1])

    # print(result_json_format)
    '''
    这里拿到了 result_json_format
    '''
    create_json_LJJZ_list(fund_code, result_json_format)
    print("OK")
