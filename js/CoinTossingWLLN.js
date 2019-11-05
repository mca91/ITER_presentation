// slider title
    d3.select("#tossess")
      .append("p")
      .style("margin", "10px 0 0 25px")
      .text("Number of trials (n)")
      .style("font","14px sans-serif");

// initialize slider
var tossess = d3.slider().min(0).max(10000).ticks(10).showRange(true).value(1000);

// render slider
d3.select('#tossess').call(tossess);


// number of tosses
var tosses = Math.round(tossess.value());

// simulate coin tosses
function sample(tosses) {
  var values = [];
  var averages = [];
  for(var i=0; i<tosses+1; i++) {
      values[i] = Math.round(Math.random());
  }
  values.reduce(function(a,b,i) { return averages[i] = a + b; },0);
  return averages.map(function(d,i) { return d*1/(i+1); });
}

// data sets
var data = sample(tosses); 

// path function
var pathr = d3.svg.line()
    .x(function(d,i) { return xWLLN(i); })
    .y(function(d) { return yWLLN(d); });


// margins
var margin = {top: 20, right: 30, bottom: 30, left: 30},
    width = 800 - margin.left - margin.right,
    height = 380 - margin.top - margin.bottom;

// scales

var xWLLN = d3.scale.linear()
      .domain([0, tosses])
      .range([0, width]);

var yWLLN = d3.scale.linear()
                .domain([1,0])
                .range([0,height]);
       

// Axis

var xAxis = d3.svg.axis()
              .scale(xWLLN)
              .orient("bottom");


var yAxis = d3.svg.axis()
              .scale(yWLLN)
              .tickFormat(d3.format(".2f"))
              .orient("left");

svg = d3.select("#vizwlln")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + yWLLN(0.5) + ")")
    .call(xAxis);

// text label for the x axis
svg.append("text")
        .attr("x", width + 10 )
        .attr("y", 0.5*height - 10 )
        .style("text-anchor", "middle")
        .style("font", "13px sans-serif")
        .text("n");

svg.append("text")
        .attr("x", 10 )
        .attr("y", 0)
        .style("text-anchor", "left")
        .style("font", "13px sans-serif")
        .text("estimated coefficient");

// remove 0 tick from x Axis
svg.selectAll(".tick")
    .each(function (d) {
        if ( d === 0 ) {
            this.remove();
        }
    });

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

// interpolation function for smooth transitions
function getSmoothInterpolation() {
  var interpolate = d3.scale.linear()
      .domain([0, 1])
      .range([1, data.length + 1]);

  return function(t) {
      var flooredX = Math.floor(interpolate(t));
      var interpolatedLine = data.slice(0, flooredX);
          
      if(flooredX > 0 && flooredX < data.length) {
          var weight = interpolate(t) - flooredX;
          var weightedLineAverage = data[flooredX].y * weight + data[flooredX-1].y * (1-weight);
          interpolatedLine.push( {"x":interpolate(t)-1, "y":weightedLineAverage} );
          }
  
      return pathr(interpolatedLine);
      }
  }

// draw path
svg.append("path")
        .attr("class", "share")
        .transition()
        .duration(10000)
        .attrTween('d', getSmoothInterpolation);


// refreshing with new data
var rep = window.setInterval(function() {

      svg.selectAll("path.share").remove();
      
      tosses = Math.round(tossess.value());
      
      xWLLN.domain([0, tosses]);
      xAxis.scale(xWLLN);
      
      svg.transition()
         .duration(3500)
         .select(".x.axis")
         .call(xAxis);

      svg.selectAll(".tick")
         .each(function (d) {
          if ( d === 0 ) {
            this.remove();
          }
      });

    svg.select(".y.axis").call(yAxis);

      data = sample(tosses);
      
      svg.append("path")
         .attr("class", "share")
         .transition()
         .duration(10000)
         .attrTween('d', getSmoothInterpolation);

    }, 11000);
