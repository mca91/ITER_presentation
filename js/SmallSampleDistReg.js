
			//Width and height
			var w = 800;
			var h = 350;
			var padding = 30;

			var betas = [];
			var	dataset = []; 
			var samplesize = 150;


		d3.select("#durations")
		  .append("p")
		  .style("margin", "10px 0 0 25px")
		  .text("Duration per sampling iteration (milliseconds)")
		  .style("font","14px sans-serif");

		var slider = d3.slider().min(0).max(3000).ticks(10).showRange(true).value(1500);

		d3.select('#durations').call(slider);

		var transdur = Math.round(slider.value());

	
		// reg line

						for (var i = 0; i < samplesize; i++) {				 		
							var X = Math.random()*100;	
							var Y = 100 + 3 * X + d3.random.normal(0,30)();
							dataset.push([X, Y]);					
						}

			var Xreg = dataset.map(function(value,index) { return value[0]; }); 

	 			var reg = LeastSquares(
	    			Xreg, 
	    			dataset.map(function(value,index) { return value[1]; })
	    			);

	    		betas.push(reg["m"]);


			//Create scale functions
			var xScaleReg = d3.scale.linear()
								 .domain([0, 100])
								 .range([padding, w/2 - padding * 2]);

			var yScaleReg = d3.scale.linear()
								 .domain([0, 500])
								 .range([h - padding, padding]);

			//Define X axis
			var xAxisReg = d3.svg.axis()
							  .scale(xScaleReg)
							  .orient("bottom")
							  .ticks(5);

			//Define Y axis
			var yAxisReg = d3.svg.axis()
							  .scale(yScaleReg)
							  .orient("left")
							  .ticks(6);

			//Create SVG element
			var svgReg = d3.select("#vizreg")
						.append("svg")
						.attr("width", w)
						.attr("height", h)
						.style(
		  	{
		  		"border-radius":"5px",
    			"border":"1px solid #ccc"
		  	});


			// path function
			var path = d3.svg.line()
    			.x(function(d,i) { return xScaleReg(d.x); })
    			.y(function(d) { return yScaleReg(d.y); });


    		var Yreg = Xreg.map(function(d) { return d * reg["m"]; })
    					   .map(function(d) { return d + reg["b"]; });

    		var regline = [
    			{"x": 0, "y": d3.min(Yreg)},
    			{"x": 100, "y": d3.max(Yreg)}
    		];

    		// draw path (estimated regression line)
			svgReg.append("path")
			.attr("class", "reg")
        	.style("stroke", "black")
        	.style("stroke-width", "1.5px")
        	.attr("d", path(regline))
        	.attr("clip-path", "url(#chart-area)");


        	// draw path (true regression line)

        	var tl = [
        			{"x": 0, "y": 100},
        			{"x": 100, "y": 400}	
        		];

        	svgReg.append("path")
			.attr("class", "trueline")
        	.style("stroke", "green")
        	.style("stroke-width", "1.5px")
        	.attr("d", path(tl))
   			.attr("clip-path", "url(#chart-area)");

        	
			//Define clipping path
			svgReg.append("clipPath")
				.attr("id", "chart-area")
				.append("rect")
				.attr("x", padding-2)
				.attr("y", padding-4)
				.attr("width", w/2 - padding * 2.8)
				.attr("height", h - padding * 1.8);

			//Create circles
			svgReg.append("g")
			   .attr("id", "circles")
			   .attr("clip-path", "url(#chart-area)")
			   .style("fill", "steelblue")
			   .style("opacity", 0.85)
			   .selectAll("circle")
			   .data(dataset)
			   .enter()
			   .append("circle")
			   .attr("cx", function(d) {
			   		return xScaleReg(d[0]);
			   })
			   .attr("cy", function(d) {
			   		return yScaleReg(d[1]);
			   })
			   .attr("r", 2.5);
			
			//Create X axis
			svgReg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + (h - padding) + ")")
				.call(xAxisReg);
			
			//Create Y axis
			svgReg.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(" + padding + ",0)")
				.call(yAxisReg);

			svgReg.append("text")
			   .attr("class", "equation")
			   .attr("x", 70)
			   .attr("y", 40)
			   .attr("text-anchor", "left")
			   .style({"font":"12px sans-serif"

					})
			   .text("Y = " + d3.round(reg["b"],2) + " + " + d3.round(reg["m"],2) + " * X");

// Histogram

	var color = "steelblue";

	// function for x axis ticks
	var tickvals = function(hist) {
	  var tickdistance = hist[1].x - hist[0].x;
	  var ticks = [];
	  for (var i=0;i<hist.length;i++) {
	    ticks[i] = hist[i].x;
	  } 
	  ticks = ticks.concat(hist[hist.length-1].x + tickdistance);
	  return ticks;
	}

	// A formatter for counts.
	var formatCount = d3.format(",.0f");



// scale for x 
var max = d3.max(betas);
var min = d3.min(betas);
var x = d3.scale.linear()
      .domain([min, max])
      .range([w/2 - padding, w - padding]);	

// Generate  histogram 
var data = d3.layout.histogram()
    .bins(19)
    (betas);

var yMax = d3.max(data, function(d){return d.length});
var yMin = d3.min(data, function(d){return d.length});
var colorScale = d3.scale.linear()
            .domain([yMin, yMax])
            .range([d3.rgb(color).brighter(), d3.rgb(color).darker()]);



var y = d3.scale.linear()
    .domain([0, yMax])
	.range([h - padding, 2*padding]);

var xAxisRegH = d3.svg.axis()
    .scale(x)
    .tickValues(tickvals(data))
    .tickFormat(d3.format(".2f"))
    .orient("bottom");

var bar = svgReg.selectAll(".bar")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "bar")
    .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });


bar.append("rect")
    .attr("x", 1)
    .attr("width", (x(data[0].dx) - x(0)) - 1)
    .attr("height", function(d) { return h - padding - y(d.y); })
    .attr("fill", function(d) { return colorScale(d.y) });

bar.append("text")
    .attr("dy", ".75em")
    .attr("y", -12)
    .attr("x", (x(data[0].dx) - x(0)) / 2)
    .attr("text-anchor", "middle")
    .style({
    	"fill": "#999999",
    	"font": "10px sans-serif"
    	   })
    .text(function(d) { return formatCount(d.y); });

svgReg.append("g")
    .attr("class", "x axis H")
	.attr("transform", "translate(0," + (h - padding) + ")")
    .call(xAxisRegH)
    .selectAll("text")
    .attr("dy", ".35em")
    .attr("x", 7)
    .attr("y", 3)
    .attr("transform", "rotate(55)")
    .style("text-anchor", "start");

   			// true value beta_1

    		  svgReg.append("line")
    		  		.attr("class", "trueval")
     				.attr("x1", x(3))
     			    .attr("y1", height-0.5*padding)
     				.attr("x2", x(3))
     				.attr("y2", 0+1.1*padding)
     				.style("stroke-dasharray", ("4, 5"))
     				.style("stroke-width","1.5")
     				.style("stroke", "green");

     		  svgReg.append("text")
     		  	 .attr("class", "truev")
     		  	 .attr("x", x(3))
     		  	 .attr("y", 0.8*padding)
     		  	 .text("3")
     		  	 .style("font", "8pt sans-serif")
     		  	 .style("text-anchor", "middle")
     		  	 .style("fill", "green");

// Refresh

var rep = function() {

					//New values for dataset
					var	dataset = [];  						 				 		
					for (var i = 0; i < samplesize; i++) {				 		
						var X = Math.random()*100;	
						var Y = 100 + 3 * X + d3.random.normal(0,30)()*Math.sqrt(i/15);
						dataset.push([X, Y]);					
					}

					//Update all circles
					svgReg.selectAll("circle")
					   .data(dataset)
					   .transition()
					   .duration(transdur*0.5)
					   .each("start", function() {
						   d3.select(this)
						     .attr("fill", "red")
						     .attr("r", 3.5);
					   })
					   .attr("cx", function(d) {
					   		return xScaleReg(d[0]);
					   })
					   .attr("cy", function(d) {
					   		return yScaleReg(d[1]);
					   })
					   .each("end", function() {
						   d3.select(this)
						     .transition()
						     .duration(transdur*0.5)
						     .attr("fill", "steelblue")
						     .attr("r", 2.5);
					   });

			// update reg line

				var Xreg = dataset.map(function(value,index) { return value[0]; }); 


	    		var reg = LeastSquares(
    						Xreg, 
    						dataset.map(function(value,index) { return value[1]; })
    			);

    			var Yreg = Xreg.map(function(d) { return d * reg["m"]; })
    					   	   .map(function(d) { return d + reg["b"]; });

    			betas.push(reg["m"]);

	    		var regline = [
	    			{"x": 0, "y": d3.min(Yreg)},
	    			{"x": 100, "y": d3.max(Yreg)}
	    		];


    			svgReg.select("text.equation")
    			   .transition()
    			   .duration(transdur)
    			   .text("Y = " + d3.round(reg["b"],2) + " + " + d3.round(reg["m"],2) + " * X");

    			// draw path
				svgReg.select("path.reg")
        		   .transition()
        		   .duration(transdur*0.5)
        		   .attr("d", path(regline));

					//Update X axis
					svgReg.select(".x.axis")
				    	.transition()
				    	.duration(transdur*0.5)
						.call(xAxisReg);

			// Update Hist

			var data = d3.layout.histogram().bins(19)(betas);


			  // scale for x 
			  max = d3.max(betas);
			  min = d3.min(betas);
			  x.domain([min, max]);

      		  xAxisRegH.scale(x)
      		  		.tickValues(tickvals(data));

      		 svgReg.select(".x.axis.H")
         		.call(xAxisRegH)
         		.selectAll("text")
         		.attr("dy", ".35em")
    		   	.attr("x", 7)
    		   	.attr("y", 3)
    		   	.attr("transform", "rotate(55)")
    		   	.style("text-anchor", "start");
		

         	var yMax = d3.max(data, function(d){return d.length});
			var yMin = d3.min(data, function(d){return d.length});
			y.domain([0, yMax]);
			var colorScale = d3.scale.linear()
            						 .domain([yMin, yMax])
            						 .range([d3.rgb(color).brighter(), d3.rgb(color).darker()]);

            var bar = svgReg.selectAll(".bar").data(data);

            svgReg.selectAll("line.trueval")
            	  .attr("x1", x(3))
     			  .attr("y1", height-0.5*padding)
     			  .attr("x2", x(3))
     			  .attr("y2", 0+1.1*padding);

     		svgReg.selectAll("text.truev")
     			  .attr("x", x(3));

			// Remove object with data
			bar.exit().remove();

			bar.transition()
			    .duration(transdur*0.5)
			    .attr("transform", function(d) { return "translate(" + x(d.x) + "," + (y(d.y)) + ")"; });

  bar.select("rect")
      .transition()
      .duration(transdur*0.5)
      .attr("x", 1)
      .attr("width", (x(data[0].dx) - x(0)) - 1)
      .attr("height", function(d) { return h - padding - y(d.y); })
      .attr("fill", function(d) { return colorScale(d.y) });

  bar.select("text")
      .transition()
      .duration(transdur*0.5)
      .attr("dy", ".75em")
      .attr("y", -12)
      .attr("x", (x(data[0].dx) - x(0)) / 2)
      .attr("text-anchor", "middle")
      .text(function(d) { return formatCount(d.y); });


      if(betas.length === 10000) { betas = []; }

};

var Int = setInterval(rep, transdur);

var update = function() {
			setTimeout(
				function () {
					console.log("5")
					transdur = Math.round(slider.value());
					clearInterval(Int);
					Int = setInterval(rep, transdur);
				}, transdur
			)
};

d3.select("#durations")
  .on("mouseup", update);

d3.selectAll(".bar")
	.on("click", function() { window.betas = [];});
		

ls

