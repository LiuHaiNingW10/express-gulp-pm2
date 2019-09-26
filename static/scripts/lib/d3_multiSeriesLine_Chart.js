/*
 *  @desc: d3 多折线图
 *  @author: haizhi
 *  @params: 参照 函数内data
 */

function d3MultiSeriesLineChart(config) {
    var data = {
        mainId: '',
        xSeries: {
            data: [
                "1月",
                "2月",
                "3月",
                "4月",
                "5月",
                "6月",
                "7月",
                "8月",
                "9月",
                "10月",
                "11月",
                "12月",
            ],
            reactFunc: null,
        },
        ySeriesLeft: [
            // {
            //     data: [11, 88, 33, 44, 99, 66, 77, 18, 99, 10, 12, 44],
            //     title: '综合贡献度',
            //     show: true,
            //     clickFunc: null,
            // },
            // {
            //     data: [12, 55, 7, 33, 55, 61, 47, 28, 69, 20, 55, 99],
            //     title: '规模贡献度',
            //     show: true,
            //     clickFunc: null,
            // },
            // {
            //     data: [11, 66, 4, 11, 51, 63, 57, 48, 58, 18, 100, 10],
            //     title: '关联贡献度',
            //     show: true,
            //     clickFunc: null,
            // },
        ],
        ySeriesRight: [
            // {
            //     data: [1100, 2200, 3300, 4400, 5500, 6600, 7700, 8800, 9900, 10000, 1000, 1000],
            //     title: '利润贡献度',
            //     show: true,
            //     clickFunc: null,
            // }
        ]
    }
    data = $.extend({},data,config);
    //私有函数
    var fn = {
        //绘制svg path直线
        createLine: function (container, datas, yFunc, index) {
            var line = d3.line()
                .x(function (d, i) { return xScale(i); })
                .y(function (d, i) { return yFunc(d); });
            container
                .append("path")
                .datum(datas)
                .transition()
                .attr('stroke', d3.schemeCategory10[index])
                .attr("d", line);
        },
        //创建react
        createReact: function (container, datas, clickFunc) {
            container.selectAll(".bar")
                .data(datas)
                .enter().append("rect")
                .attr("class", 'react')
                .attr("x", function (d, i) { return xScale(i); })
                .attr("y", 0)
                .attr("width", reactScale.bandwidth())
                .attr("height", height)
                .on('click', clickFunc)
        },
        //legend clickFunc
        clickFunc(type, title, data) {
            if (type) {
                for (var i = 0, length = data[type].length; i < length; i++) {
                    if (data[type][i].title === title) {
                        data[type][i].show = !data[type][i].show;
                    }
                }
            }
        },
        //d3 style
        setD3Style: function () {
            var strCss = '';
            if (document.getElementById("d3_style_" + data.mainId)) {
            } else {
                strCss = '#' + data.mainId + ' .tick text{ fill:#999;}; ';
                strCss += '#' + data.mainId + ' line{ stroke-width: 0.7px;stroke:#999;} ';
                strCss += '#' + data.mainId + ' .line{ fill: none;stroke-width: 1.5px;stroke-linejoin: round;stroke-linecap: round;}';
                strCss += '#' + data.mainId + ' .react {fill-opacity: 0.1;fill: #fff; cursor: pointer;} ';
                strCss += '#' + data.mainId + ' .react:hover {fill-opacity: 0.1;fill: #999;}  ';
                strCss += '#' + data.mainId + ' .legend {cursor: pointer} ';
                strCss += '#' + data.mainId + ' .disabled { cursor: pointer;fill: #999;} ';
                var css = document.createElement('style');
                css.id = 'd3_style_' + data.mainId;
                css.innerHTML = strCss;
                document.querySelector('head').append(css);
            }
        }
    }

    var yLengthMax_left = 100;
    var yLengthMax_right = 0;
    if (data.ySeriesRight.length > 0) {
        yLengthMax_right = d3.max(data.ySeriesRight[0].data)
    }
    var xLength = data.xSeries.data.length;
    var xTickNum = [];
    var yData_left = [];
    var yData_Right = [];
    for (var i = 0; i < xLength; i++) {
        xTickNum.push(i);
        yData_left.push({ x: i, y: (Math.random() * yLengthMax_left) });
    }
    var mainDiv = document.getElementById(data.mainId);
    var mainDivWidth = mainDiv.offsetWidth;
    var mainDivHeight = mainDiv.offsetHeight;
    //create svg
    d3.select('#' + data.mainId).append("svg").attr("class", "multi-series-line-" + data.mainId).attr("width", mainDivWidth).attr("height", mainDivHeight * 0.9);
    var svg = d3.select(".multi-series-line-" + data.mainId),
        margin = { top: 50, left: 50, bottom: 30, right:50 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;
    fn.setD3Style();

    //create scale
    var xScale = d3.scaleLinear().domain([0, xLength]).range([0, width]);
    var yScale_left = d3.scaleLinear().domain([0, yLengthMax_left]).range([height, 0]);
    var yScale_right = d3.scaleLinear().domain([0, yLengthMax_right]).range([height, 0]);

    var xAxis = d3.axisBottom(xScale)
        .tickSize(0)
        .tickValues(xTickNum)   //指定刻度
        .tickFormat(function (d, i) {     //对指定刻度进行转换
            return data.xSeries.data[i];
        });
    var yAxis_left = d3.axisLeft(yScale_left)
        .ticks(4)
        .tickSize(-width)
        .tickFormat(function (d) {
            return d + '分'
        })
    // .tickSizeOuter(6);
    var yAxis2 = d3.axisRight(yScale_right)
        .tickSize(0)
        .ticks(4)
        .tickFormat(function (d) { return d + '万' })

    //渲染 坐标轴
    var g_axis = svg.append('g').attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    g_axis.append("g").attr("class", "axis-x").attr("transform", "translate(0," + yScale_left(0) + ")")
        .call(xAxis)
        .selectAll(".tick text")
        .attr("text-anchor", "middle")
        .attr('transform', 'translate(' + (width / xLength) / 2 + ',0)')
        .attr('dy', '1rem')

    g_axis.append("g").attr("class", "axis-y")
        .call(yAxis_left)
        .select('.domain').remove()

    // g_axis.append("g").attr("class", "axis--y")
    //     .attr('transform', 'translate(' + width + ',0)')
    //     .call(yAxis2)
    //     .select('.domain').remove()

    //渲染所有的折线
    var pathLeft = g_axis.append("g").attr("class", "path").attr('transform', 'translate(' + (width / xLength) / 2 + ',0)');
    pathLeft.transition();
    var pathRight = g_axis.append("g").attr("class", "path").attr('transform', 'translate(' + (width / xLength) / 2 + ',0)');
    pathRight.transition();

    var updateySeries = function () {
        // 渲染left数据
        data.ySeriesLeft.forEach(function (val, index) {
            if (!val.show) return;
            var linePath = pathLeft.append('g');
            linePath.call(fn.createLine,
                val.data,
                yScale_left,
                index)
                .attr("class", 'line')
        });
        // 渲染right数据
        data.ySeriesRight.forEach(function (val, index) {
            if (!val.show) return;
            var linePath = pathRight.append('g');
            linePath.call(fn.createLine,
                val.data,
                yScale_right,
                data.ySeriesLeft.length + index)
                .attr("class", 'line')
                // .selectAll('path')
                // .attr("stroke-width", "4")
        });
    }
    updateySeries();

    //渲染react 块并绑定事件
    var reactScale = d3.scaleBand().domain(data.xSeries.data).rangeRound([0, width]);
    var rect_g = g_axis.append('g');
    rect_g.call(fn.createReact, data.xSeries.data, function (d, i) {
        if (data.xSeries.reactFunc) {
            data.xSeries.reactFunc(d, i)
        }
    });

    //渲染legend
    var legendIndex = 0;

    data.ySeriesLeft.forEach(function (val) {
        var legend = g_axis.append('g').attr('class', 'legend').attr('transform', 'translate(' + (width - 80 * legendIndex - 30) + ',-30)');
        legend.append("path")
            .attr("d", d3.symbol().type(d3.symbolCircle))
            .attr("class", 'circle')
            .attr("fill", d3.schemeCategory10[legendIndex])
        // .attr('transform', function (d) {
        //     return 'translate(0,0)';
        // })
        legend.append("text")
            .attr("font-size", "12px")
            .attr("fill", '#333')
            .attr('transform', 'translate(10,4)')
            .attr('data-type', 'ySeriesLeft')
            .text(val.title)
            .on('click', function () {
                var type = d3.select(this).attr('data-type');
                var title = d3.select(this).text();
                console.log(title)
                // 外部func
                if (val.clickFunc) {
                    val.clickFunc(type, title, data);
                }
                // 内部func
                fn.clickFunc(type, title, data);
                //更新 图表
                pathLeft.html('');
                pathRight.html('');
                updateySeries();
                //变灰 或者不变灰
                if (val.show) {
                    legend.select('path').attr('class', '')
                    legend.select('text').attr('class', '')
                } else {
                    legend.select('path').attr('class', 'disabled')
                    legend.select('text').attr('class', 'disabled')
                }
            })
        legendIndex++;
    })

    data.ySeriesRight.forEach(function (val) {
        var legend = g_axis.append('g').attr('class', 'legend').attr('transform', 'translate(' + (width - 80 * legendIndex - 30) + ',-30)');
        legend.append("path")
            .attr("d", d3.symbol().type(d3.symbolCircle))
            .attr("class", 'circle')
            .attr("fill", d3.schemeCategory10[legendIndex])
        // .attr('transform', function (d) {
        //     return 'translate(0,0)';
        // })
        legend.append("text")
            .attr("font-size", "12px")
            .attr("fill", '#333')
            .attr('transform', 'translate(10,4)')
            .attr('data-type', 'ySeriesRight')
            .text(val.title)
            .on('click', function () {
                var type = d3.select(this).attr('data-type');
                var title = d3.select(this).text();
                console.log(title)
                // 外部func
                if (val.clickFunc) {
                    val.clickFunc(type, title, data);
                }
                // 内部func
                fn.clickFunc(type, title, data);
                //更新 图表
                pathLeft.html('');
                pathRight.html('');
                updateySeries();
                //变灰 或者不变灰
                if (val.show) {
                    legend.select('path').attr('class', '')
                    legend.select('text').attr('class', '')
                } else {
                    legend.select('path').attr('class', 'disabled')
                    legend.select('text').attr('class', 'disabled')
                }
            })
        legendIndex++;
    })
}