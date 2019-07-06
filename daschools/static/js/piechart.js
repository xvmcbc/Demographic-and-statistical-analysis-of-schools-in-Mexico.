//var url = "http://localhost:5000/info";
var url = "http://daschools.herokuapp.com/info";
var salesData;
var chartInnerDiv = '<div class="innerCont" style="overflow: auto;top:100px; left: 400px; height:91% ; Width:100% ;position: relative;overflow: hidden;"/>';
var truncLengh = 30;
var chartData = [];
var entidades = [];
var count_doct = 0;
var count_maest = 0;
var count_licenc = 0;

    $(document).ready(function () {
            const first_entidad = "CIUDAD DE MEXICO"
            Plot(first_entidad);
    });

    function Plot(state) {
        d3.json(url, function(data) {
            d3.select('#chart-title').text(state);
            chartData = [];
            for(var j = 0; j < 35055; j++){
                entidades.push(data[j].entidad_federativa);
                if(data[j].entidad_federativa == state){
                        chartData.push(data[j]);
                }  
            }
            distinct_entidades = [...new Set(entidades)];
            distinct_entidades.splice( distinct_entidades.indexOf('CIUDAD DE MEXICO'), 1 );
            distinct_entidades.unshift("CIUDAD DE MEXICO");
            //console.log(distinct_entidades);
            var selector = d3.select("#selDataset");
            distinct_entidades.forEach((entidad) => {
                selector
                  .append("option")
                  .text(entidad)
                  .property("value", entidad);
              });
            console.log(chartData.slice(1,5));
            TransformChartData(chartData, chartOptions, 0);
            BuildPie("chart", chartData, chartOptions, 0)
       });
    }

    function BuildPie(id, chartData, options, level) {
        var xVarName;
        var divisionRatio = 2.5;
        var legendoffset = (level == 0) ? 0 : -40;

        d3.selectAll("#" + id + " .innerCont").remove();
        $("#" + id).append(chartInnerDiv);
        chart = d3.select("#" + id + " .innerCont");

        var yVarName = options[0].yaxis;
        width = $(chart[0]).outerWidth(),
        height = $(chart[0]).outerHeight(),
        radius = Math.min(width, height) / divisionRatio;
        console.log(`width: ${width}`);

        if (level == 1) {
            xVarName = options[0].xaxisl1;
        }
        else {
            xVarName = options[0].xaxis;
        }

        var rcolor = d3.scale.ordinal().range(runningColors);

        arc = d3.svg.arc()
                .outerRadius(radius)
                .innerRadius(radius - 150
                    );

        var arcOver = d3.svg.arc().outerRadius(radius + 20).innerRadius(radius - 180);

        chart = chart
                .append("svg")  //append svg element inside #chart
                .attr("width", width)    //set width
                .attr("height", height)  //set height
                .append("g")
                .attr("transform", "translate(" + (width / divisionRatio) + "," + ((height / divisionRatio) + 30) + ")");

        var pie = d3.layout.pie()
                    .sort(null)
                    .value(function (d) {
                        return d.mat_total;
                    });

        var g = chart.selectAll(".arc")
                    .data(pie(runningData))
                    .enter().append("g")
                    .attr("class", "arc");

        var count = 0;

        var path = g.append("path")
                    .attr("d", arc)
                    .attr("id", function (d) { return "arc-" + (count++); })
                    .style("opacity", function (d) {
                        return d.data["op"];
                    });

        path.on("mouseenter", function (d) {
            d3.select(this)
                .attr("stroke", "white")
                .transition()
                .duration(200)
                .attr("d", arcOver)
                .attr("stroke-width", 1);
        })
            .on("mouseleave", function (d) {
                d3.select(this).transition()
                    .duration(200)
                    .attr("d", arc)
                    .attr("stroke", "none");
            })
            .on("click", function (d) {
                if (this._listenToEvents) {
                    // Reset inmediatelly
                    d3.select(this).attr("transform", "translate(0,0)")
                    // Change level on click if no transition has started
                    path.each(function () {
                        this._listenToEvents = false;
                    });
                }
                d3.selectAll("#" + id + " svg").remove();
                if (level == 1) {
                    TransformChartData(chartData, options, 0, d.data[xVarName]);
                    BuildPie(id, chartData, options, 0);
                }
                else {
                    var nonSortedChart = chartData.sort(function (a, b) {
                        return parseFloat(b[options[0].yaxis]) - parseFloat(a[options[0].yaxis]);
                    });
                    TransformChartData(nonSortedChart, options, 1, d.data[xVarName]);
                    BuildPie(id, nonSortedChart, options, 1);
                }

            });

        path.append("svg:title")
        .text(function (d) {
            return d.data["title"] + " (" + d.data[yVarName] + ")";
        });

        path.style("fill", function (d) {
            return rcolor(d.data[xVarName]);
        })
            .transition().duration(1000).attrTween("d", tweenIn).each("end", function () {
                this._listenToEvents = true;
            });


        g.append("text")
            .attr("transform", function (d) { return "translate(" + arc.centroid(d) + ")"; })
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .style("opacity", 1)
            .text(function (d) {
                return d.data[yVarName];
            });

        count = 0;
        var legend = chart.selectAll(".legend")
            .data(runningData).enter()
            .append("g").attr("class", "legend")
            .attr("legend-id", function (d) {
                return count++;
            })
            .attr("transform", function (d, i) {
                return "translate(15," + (parseInt("-" + (runningData.length * 10)) + i * 28 + legendoffset) + ")";
            })
            .style("cursor", "pointer")
            .on("click", function () {
                var oarc = d3.select("#" + id + " #arc-" + $(this).attr("legend-id"));
                oarc.style("opacity", 0.3)
                .attr("stroke", "white")
                .transition()
                .duration(200)
                .attr("d", arcOver)
                .attr("stroke-width", 1);
                setTimeout(function () {
                    oarc.style("opacity", function (d) {
                        return d.data["op"];
                    })
                    .attr("d", arc)
                    .transition()
                    .duration(200)
                    .attr("stroke", "none");
                }, 1000);
            });

        var leg = legend.append("rect");

        leg.attr("x", width / 2)
            .attr("width", 18).attr("height", 18)
            .style("fill", function (d) {
                return rcolor(d[yVarName]);
            })
            .style("opacity", function (d) {
                return d["op"];
            });
        legend.append("text").attr("x", (width / 2) - 5)
            .attr("y", 9).attr("dy", ".35em")
            .style("text-anchor", "end").text(function (d) {
                return d.caption;
            });

        leg.append("svg:title")
        .text(function (d) {
            return d["title"] + " (" + d[yVarName] + ")";
        });

        function tweenOut(data) {
            data.startAngle = data.endAngle = (2 * Math.PI);
            var interpolation = d3.interpolate(this._current, data);
            this._current = interpolation(0);
            return function (t) {
                return arc(interpolation(t));
            };
        }

        function tweenIn(data) {
            var interpolation = d3.interpolate({ startAngle: 0, endAngle: 0 }, data);
            this._current = interpolation(0);
            return function (t) {
                return arc(interpolation(t));
            };
        }

    }
    // This function returns an array of objects: each object contains a level (e.g Doctorate) and a number
    //of students at that level in the city selected. the array will contain 4 objects (Doctorate, Masters, 
    //Specialty, Undergrad)
    function TransformChartData(chartData, opts, level, filter) {
        var result = [];
        var resultColors = [];
        var counter = 0;
        var hasMatch;
        var xVarName;
        var yVarName = opts[0].yaxis;

        if (level == 1) {
            xVarName = opts[0].xaxisl1;

            for (var i in chartData) {
                hasMatch = false;
                for (var index = 0; index < result.length; ++index) {
                    var data = result[index];

                    if ((data[xVarName] == chartData[i][xVarName]) && (chartData[i][opts[0].xaxis]) == filter) {
                        result[index][yVarName] = result[index][yVarName] + chartData[i][yVarName];
                        hasMatch = true;
                        break;
                    }

                }
                if ((hasMatch == false) && ((chartData[i][opts[0].xaxis]) == filter)) {
                    if (result.length < 9) {
                        ditem = {}
                        ditem[xVarName] = chartData[i][xVarName];
                        ditem[yVarName] = chartData[i][yVarName];
                        ditem["caption"] = chartData[i][xVarName].substring(0, 10) + '...';
                        ditem["title"] = chartData[i][xVarName];
                        ditem["op"] = 1.0 - parseFloat("0." + (result.length));
                        result.push(ditem);

                        resultColors[counter] = opts[0].color[0][chartData[i][opts[0].xaxis]];

                        counter += 1;
                    }
                }
            }
        }
        else {
            xVarName = opts[0].xaxis;

            for (var i in chartData) {
                hasMatch = false;
                for (var index = 0; index < result.length; ++index) {
                    var data = result[index];
                    // This function sums the mat total of all the objects in chart data that have the same nivel
                    if (data[xVarName] == chartData[i][xVarName]) {
                        result[index][yVarName] = result[index][yVarName] + chartData[i][yVarName];
                        hasMatch = true;
                        break;
                    }
                }
                if (hasMatch == false) {
                    ditem = {};
                    ditem[xVarName] = chartData[i][xVarName];
                    ditem[yVarName] = chartData[i][yVarName];
                    ditem["caption"] = opts[0].captions != undefined ? opts[0].captions[0][chartData[i][xVarName]] : "";
                    ditem["title"] = opts[0].captions != undefined ? opts[0].captions[0][chartData[i][xVarName]] : "";
                    ditem["op"] = 1;
                    result.push(ditem);

                    resultColors[counter] = opts[0].color != undefined ? opts[0].color[0][chartData[i][xVarName]] : "";

                    counter += 1;
                }
            }
        }


        runningData = result;
        runningColors = resultColors;
        return;
    }



    chartOptions = [{
        "captions": [{ "MAESTRIA": "Masters", "LICENCIATURA": "Undergraduate", "DOCTORADO": "Doctorate","ESPECIALIDAD":"Specialty" }],
        "color": [{ "MAESTRIA": "#FFA500", "LICENCIATURA": "#0070C0", "DOCTORADO": "#ff0000", "ESPECIALIDAD": "#00cc00" }],
        "xaxis": "nivel",
        "xaxisl1": "mat_hombres",
        "xaxisl2": "mat_mujeres",
        "yaxis": "mat_total"
    }]

    // var chartData = [
    //     {
    //         "nivel": "DOCTORADO",
    //         "mat_hombres": "Model 1",
    //         "mat_total": 487
    //     },
    //     {
    //         "nivel": "DOCTORADO",
    //         "mat_hombres": "Model 2",
    //         "mat_total": 185
    //     },
    //     {
    //         "nivel": "DOCTORADO",
    //         "mat_hombres": "Model 3",
    //         "mat_total": 140
    //     },
    //     {
    //         "nivel": "DOCTORADO",
    //         "mat_hombres": "Model 4",
    //         "mat_total": 108
    //     },
    //     {
    //         "nivel": "DOCTORADO",
    //         "mat_hombres": "Model 5",
    //         "mat_total": 26
    //     },
    //     {
    //         "nivel": "DOCTORADO",
    //         "mat_hombres": "Model 6",
    //         "mat_total": 106
    //     },
    //     {
    //         "nivel": "DOCTORADO",
    //         "mat_hombres": "Model 7",
    //         "mat_total": 27
    //     },
    //     {
    //         "nivel": "DOCTORADO",
    //         "mat_hombres": "Model 8",
    //         "mat_total": 44
    //     },
    //     {
    //         "nivel": "DOCTORADO",
    //         "mat_hombres": "Model 9",
    //         "mat_total": 96
    //     },
    //     {
    //         "nivel": "MAESTRIA",
    //         "mat_hombres": "Model 1",
    //         "mat_total": 411
    //     },
    //     {
    //         "nivel": "MAESTRIA",
    //         "mat_hombres": "Model 2",
    //         "mat_total": 33
    //     },
    //     {
    //         "nivel": "MAESTRIA",
    //         "mat_hombres": "Model 3",
    //         "mat_total": 32
    //     },
    //     {
    //         "nivel": "MAESTRIA",
    //         "mat_hombres": "Model 4",
    //         "mat_total": 29
    //     },
    //     {
    //         "nivel": "MAESTRIA",
    //         "mat_hombres": "Model 5",
    //         "mat_total": 29
    //     },
    //     {
    //         "nivel": "LICENCIATURA",
    //         "mat_hombres": "Model 1",
    //         "mat_total": 7
    //     },
    //     {
    //         "nivel": "LICENCIATURA",
    //         "mat_hombres": "Model 2",
    //         "mat_total": 20
    //     },
    //     {
    //         "nivel": "LICENCIATURA",
    //         "mat_hombres": "Model 3",
    //         "mat_total": 232
    //     },
    //     {
    //         "nivel": "LICENCIATURA",
    //         "mat_hombres": "Model 4",
    //         "mat_total": 117
    //     }
    // ];
