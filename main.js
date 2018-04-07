var width = 720,
height = 720,
outerRadius = Math.min(width, height) / 2 - 10,
innerRadius = outerRadius - 24;
 
// var formatPercent = d3.format(".1%");
 
var arc = d3.arc()
.innerRadius(innerRadius)
.outerRadius(outerRadius);

// var path = d3.chord()
// .radius(innerRadius);