var url = "http://localhost:5000/info";
//var url = "http://daschools.herokuapp.com/info";
//var data1 = [];
//var data2 = [];
var cuenta_pub = 0;
var cuenta_priv = 0;
var cuenta_H = 0;
var cuenta_M = 0;
var cuenta_Hpriv = 0;
var cuenta_Mpriv = 0;

// create 2 data_set with initial values
var data1 = [
   {group: "Public", value: 2708714},
   {group: "Particular", value: 1590100}
];

var data2 = [
   {group: "Public", value: 1397515},
   {group: "Particular", value: 728449}
];

// Grab the data with d3
d3.json(url, function(datab) {

  var tam = Object.keys(datab).length
  
  for (var j = 0; j < tam; j++) {

    if (datab[j].sostenibilidad == "PUBLICA"){
        cuenta_pub = cuenta_pub + datab[j].mat_total;
        cuenta_H = cuenta_H + datab[j].mat_hombres;
        cuenta_M = cuenta_M + datab[j].mat_mujeres;
      }
      if (datab[j].sostenibilidad == "PARTICULAR"){
        cuenta_priv = cuenta_priv + datab[j].mat_total;
        cuenta_Hpriv = cuenta_Hpriv + datab[j].mat_hombres;
        cuenta_Mpriv = cuenta_Mpriv + datab[j].mat_mujeres;
      }
  }
  
  data1 = [
    {group: "Public", value: cuenta_pub},
    {group: "Particular", value: cuenta_priv}
  ];
  
  data2 = [
  {group: "Public", value: cuenta_H},
  {group: "Particular", value: cuenta_Hpriv}
  ];
  
});

  //Results from the counting
setTimeout(function() {
  console.log(data1);
  console.log(data2);
}, (8 * 1000));


// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#plot")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// X axis
var x = d3.scaleBand()
  .range([ 0, width ])
  .domain(data1.map(function(d) { return d.group; }))
  .padding(0.2);
svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))

// Add Y axis
var y = d3.scaleLinear()
  .domain([0, 5000000])
  .range([ height, 0]);
svg.append("g")
  .attr("class", "myYaxis")
  .call(d3.axisLeft(y));

// A function that create / update the plot for a given variable:
function update(data) {

  var u = svg.selectAll("rect")
    .data(data)

  u
    .enter()
    .append("rect")
    .merge(u)
    .transition()
    .duration(1000)
      .attr("x", function(d) { return x(d.group); })
      .attr("y", function(d) { return y(d.value); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d.value); })
      .attr("fill", "#FF8C00")
}

update(data1);

