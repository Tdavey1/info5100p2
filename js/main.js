



















function jqName(name) {
  return name.replace( /(:|\+|\.|\[|\]|,|=|@|#)/g, "\\$1" );
}

var nodeSize = d3.scaleSqrt().domain([20.0219326983115,126.571127129727]).range([10, 35]);

var svglegend = d3.select("#legendsvg");

svglegend.append("g")
  .attr("class", "legendSize")
  .attr("transform", "translate(20, 30)");

var legendSize = d3.legendSize()
  .scale(nodeSize)
  .shape('circle')
  .shapePadding(25)
  .labels(["Less Use", "", "", "", "More Use"])
  .labelOffset(20)
  .title("Frequency of Use")
  .orient('horizontal');

svglegend.select(".legendSize")
  .call(legendSize);


// var ordinal = d3.scaleOrdinal()
//   .domain(["General Programming", "Database/Backend", "Web Server", 
//     "Mobile App", "Shell","Front-End","Web","Java related", 
//     "Cloud Computing", "Distributed Systems", "Testing", "agile", 
//     "perl/regex", "excel"])
//   .range(d3.schemeCategory20.slice(0,15));

//   svglegend.append("g")
//   .attr("class", "legendOrdinal")
//   .attr("transform", "translate(20,280)");

// var legendOrdinal = d3.legendColor()
//   //.shape("path", d3.legendSymbol().type("triangle-up").size(150)())
//   .shapePadding(10)
//   .scale(ordinal);

// svglegend.select(".legendOrdinal")
//   .call(legendOrdinal);          

// svglegend.append("text")
//   .attr("transform", "translate(20,280)")
//   .wrap("<a xlink:href \"https://en.wiktionary.org/wiki/walktrap\"></a>")
//   .text("Different colors represent different groups, as specified by the dataset. The group is calculated via the walktrap algorithm.")

         
var lineSize = d3.scaleLog().domain([20.02193,126.57112]).range([1, 13]);

svglegend.append("g")
  .attr("class", "legendSizeLine")
  .attr("transform", "translate(20, 180)");

var legendSizeLine = d3.legendSize()
      .scale(lineSize)
      .shape("line")
      .orient("horizontal")
      //otherwise labels would have displayed:
      // 0, 2.5, 5, 10
      .labels(["Smaller Correlation", "", "", "", "Larger Correlation"])
      .labelWrap(30)
      .shapeWidth(55)
      .title("Degree of Relationship")
      .labelAlign("start")
      .shapePadding(10);

svglegend.select(".legendSizeLine")
  .call(legendSizeLine);

var svg = d3.select("#container");

var svg = d3.select("#container"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var linksBySkill;

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
  .force("link", d3.forceLink()
    .id(function(d) { 
      return d.name; 
    })
    .distance(90)
  )
  
  .force("charge", d3.forceManyBody())
  .force("center", d3.forceCenter(width / 2, height / 2));


d3.csv("../data/stack_network_links.csv", function(error, links) {
  
  if (error) throw error;
  d3.csv("../data/stack_network_nodes.csv", function(error, nodes){
    
    links.forEach(function(d) {
      d.value = Number(d.value);
    })
    var lscale = d3.scaleLog()
      .domain(d3.extent(links, d => d.value))
      .range([1, 13]);

    var link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
        .attr("stroke-width", function(d) { return lscale(d.value); })
        .attr("stroke", "#999")
        .attr("class", function(d) {
          return d.source + " " + d.target;
        })
    // console.log(nodes)
    // var label = svg.selectAll(null)
  //      .data(nodes)
    //     .enter()
    //     .append("text")
    //     .text(function (d) { return d.name; })
    //     .style("text-anchor", "middle")
    //     .style("fill", "#555")
    //     .style("font-family", "Arial")
    //     .style("font-size", 12);



    nodes.forEach(function(d) {
      d.nodesize = Number(d.nodesize);
    })
    var rscale = d3.scaleSqrt()
      .domain(d3.extent(nodes, d => d.nodesize))
      .range([10, 35]);

    // var node = svg.append("g")
    //  .attr("class", "nodes")
    //  .selectAll("circle")
    //  .data(nodes)
    //  .enter()
    //    .append("circle")
    //      .attr("r", function(d) { return rscale(d.nodesize) })
    //      .attr("fill", function(d) { return color(d.group); })
    //      .call(d3.drag()
    //          .on("start", dragstarted)
    //          .on("drag", dragged)
    //          .on("end", dragended));

    //console.log(nodes[0]);
    var node = svg.selectAll(".nodes")
      .data(nodes)
      .enter().append("g")
      // .attr("class", "nodes")
      .attr("id", d => "node_"+ d.name.replace(/\W/g, "_"))
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("circle")
      .attr("id", d => "node_"+ d.name.replace(/\W/g, "_")+"_circle")
      .attr("r", function(d) { return rscale(d.nodesize) })
      .attr("fill", function(d) { return color(d.group); });

    simulation
        .nodes(nodes)
        .force("collide", d3.forceCollide(d => rscale(d.nodesize + 100)))
        .on("tick", ticked);

      simulation.force("link")
          .links(links);

    function ticked() {
      
      node.attr("transform", function (d) {
        var upperx = Math.min(width-rscale(d.nodesize), d.x);
        d.x = Math.max(0+rscale(d.nodesize), upperx);
        var uppery = Math.min(height-rscale(d.nodesize), d.y);
        d.y = Math.max(0+rscale(d.nodesize), uppery);

                return "translate(" + d.x + "," + d.y + ")";
                });

      link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    }

    // Get linked skills by specific skill   
      function findSkill(skill) {
      var linksData = [];
      links.forEach(function(d) {
        if (d.source.name == skill) {
          linksData.push(d);
        }   
        });
        return linksData;
      }

      // Get skill node by element id 
      function findNode(skillid) {
      var skillnode;
      nodes.forEach(function(d) {
        if (skillid == d.name.replace(/\W/g, "_") ) {
          skillnode = d;
        } 
        });
        return skillnode;
      }

      var svgbar = d3.select("#bar-chart");
      //var bar = svgbar.selectAll("linked_bars"); 

      function barChart(nodeData, linkedSkills) {
        var barheight = 30, padding = 30;

        svgbar.attr("height", barheight*linkedSkills.length*2 + barheight + padding*2);
      var width = +svgbar.attr("width"),
        height = +svgbar.attr("height");
      
      var yScale = d3.scaleLinear()
      .domain([1, linkedSkills.length])
      .range([padding + barheight*3/2, height - padding - barheight*3/2]);


      // add circles for linked skills
      svgbar.selectAll(".linked_skills")
      .data(linkedSkills).enter()
      .append("circle")
      .attr("cx", width*2/5)
      .attr("cy", (d, i) => yScale(i+1))
      .attr("r", 5)
      .attr("fill", "lightgrey");

      // add links for skills
      svgbar.selectAll(".skill_links")
      .data(linkedSkills).enter()
      .append("path")
      .attr("d", (d, i) => 
        "M " + width/5 + " " + height/2 +
        " S " + (width/5+10) + " " + (yScale(i+1)+10) + " " +
        width*2/5 + " " + yScale(i+1))
      .attr("stroke-width", 1)
      .attr("stroke", "lightgrey")
      .attr("fill", "none");

      // add circle for clicked skill
      svgbar.append("circle")
      .attr("cx", width/5)
      .attr("cy", height/2)
      .attr("r", 5)
      .attr("fill", color(nodeData.group));

      svgbar.append("text")
      .attr("x", width/5)
      .attr("y", height/2+15)
      .text(nodeData.name[0].toUpperCase()+nodeData.name.substring(1))
      .attr("fill", "black")
      .attr("text-anchor", "middle");

      //add bars for lined skills 
      var barScale = d3.scaleLinear()
      .domain(d3.extent(links, d => d.value))
      .range([1, 1000]);

      // add 4 quantiles, 25%, 50%, 75%, 100%
      var values = [];
      links.forEach(function(d) {
        values.push(d.value);
      });
      //console.log(values);
      for (var i = 1; i < 5; i++) {
        
        var q = d3.quantile(values.sort(), 0.25*i);
        svgbar.append("line")
          .attr("x1", width*2/5 + 5+ barScale(q))
          .attr("y1", padding)
          .attr("x2", width*2/5 + 5+ barScale(q))
          .attr("y2", height-padding)
          .attr("stroke", "lightgrey")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "2 1");

        svgbar.append("text")
          .attr("x", width*2/5 + 5+ barScale(q))
          .attr("y", padding)
          .text("" + 25*i + "%")
          .attr("text-anchor", "middle")
          .attr("font-size", 11)
          .attr("fill", "darkgrey");

      }

      var bar = svgbar.selectAll(".linked_bars")
      .data(linkedSkills).enter()
      .append("g")
      .attr("class", "linked_bars")
      .attr("id", d => "bar_" + d.target.name.replace(/\W/g, "_"));

      bar.append("rect")
      .attr("x", width*2/5+5)
      .attr("y", (d, i) => yScale(i+1)-barheight/2)
      .attr("width", d => barScale(d.value))
      .attr("height", barheight)
      .attr("fill", d => color(d.target.group));

      // add texts
      bar
      .append("text")
      .attr("class", "linked_text")
      .attr("x", width*2/5+10)
      .attr("y", (d, i) => yScale(i+1))
      .text(d => d.target.name[0].toUpperCase()+d.target.name.substring(1))
      .attr("fill", "black");

      // click event on bars: switch the links
      bar.on("click", function() {
        var thisskill = d3.select(this).attr("id").substring(4);
        var thisnode = findNode(thisskill);
        var thislinkedSkills = findSkill(thisnode.name);
        thislinkedSkills = thislinkedSkills.sort(function(a, b) {
          return d3.descending(a.value, b.value);
        });
        svgbar.selectAll("*").remove();
        barChart(thisnode, thislinkedSkills);
      });

      // hover event on bars: hightlight
      bar.on("mouseenter", function() {
        var thisbar = d3.select(this);
        thisbar.attr("fill-opacity", 0.7);
      });

      bar.on("mouseout", function() {
        svgbar.selectAll("rect").attr("fill-opacity", 1);
      });

      // add axis and labels
      svgbar.append("line")
          .attr("x1", width*2/5 + 5)
          .attr("y1", padding + barheight/2)
          .attr("x2", width*2/5 + 5 + 1000)
          .attr("y2", padding + barheight/2)
          .attr("stroke", "black")
          .attr("stroke-width", 1);

      svgbar.append("text")
          .attr("x", width*2/5 + barScale(d3.quantile(values.sort(), 1) +10))
          .attr("y", padding)
          .text("Correlation value")
          .attr("text-anchor", "middle")
          .attr("font-size", 11)
          .attr("fill", "black");
      }


      

    // Click event: bar chart
      node.on("click", function() {
      
      svgbar.selectAll("*").remove();

      var nodeData = this.__data__;
      //console.log(nodeData);
      var linkedSkills = findSkill(nodeData.name);
      linkedSkills = linkedSkills.sort(function(a, b) {
        return d3.descending(a.value, b.value);
      });

      barChart(nodeData, linkedSkills);
      
      $('html, body').animate({
        scrollTop: $('#bar-chart').offset().top

      }, 200)

      $('#bar-chart-header').removeClass('hidden');

    });



      // highlight linked node 
      function highlight(nodedata) {


        var targetname = nodedata.target.name.replace(/\W/g, "_");
        svg.select("#node_"+targetname)
        .append("circle")
        .transition()
        .delay(100)
        .attr("class", "node_highlight")
        .attr("r", rscale(nodedata.target.nodesize)+2)
        .attr("fill", "none")
        .attr("stroke", color(nodedata.target.group))
        .attr("stroke-opacity", 0.5)
        .attr("stroke-width", 6);

        svg.select("#node_"+targetname)
        .append("text")
        .attr("class", "node_text")
          .attr("dx", d => rscale(d.nodesize)+1)
          .attr("dy", 0)
          .text(d => d.name[0].toUpperCase()+d.name.substring(1));
        

        console.log("=================")
        console.log(jqName(nodedata.source.name))
        console.log(jqName(nodedata.target.name))
        $("." + jqName(nodedata.source.name) + "." + jqName(nodedata.target.name)).attr("stroke", "#f48024");

      }

    // hover event: hightlight linked skills 
    node.on("mouseenter", function() {
      var nodeData = this.__data__;
      //console.log(nodeData);
      var linkedSkills = findSkill(nodeData.name);

      // console.log(svg.select("#node_"+nodeData.name.replace(/\W/g, "_")))


      // console.log(nodeData)

      // console.log(linkedSkills)

      console.log($(".c++.python"))
      console.log($(".c++"))
      console.log($(".linux.python"))

      svg.select("#node_"+nodeData.name.replace(/\W/g, "_"))
        .append("circle")
        .transition()
        .delay(100)
        .attr("class", "node_highlight")
        .attr("r", rscale(nodeData.nodesize)+1)
        .attr("fill", "none")
        .attr("stroke", "yellow")
        .attr("stroke-opacity", 0.5)
        .attr("stroke-width", 3)

      svg.select("#node_"+nodeData.name.replace(/\W/g, "_"))
      .append("text")
      .attr("class", "node_text")
        .attr("dx", d => rscale(d.nodesize)+1)
        .attr("dy", 0)
        .text(d => d.name[0].toUpperCase()+d.name.substring(1));
      
/*        nodeData.append("text")
        .attr("dx", d => rscale(d.nodesize)+1)
        .attr("dy", 0)
        .text(d => d.name[0].toUpperCase()+d.name.substring(1));*/

      linkedSkills.forEach(function(d) {
        highlight(d);
      });
    });

    node.on("mouseout", function() {
      var nodeData = this.__data__;
      var linkedSkills = findSkill(nodeData.name);
      linkedSkills.forEach(function(d) {
        $("." + jqName(d.source.name) + "." + jqName(d.target.name)).attr("stroke", "#999");
      });


      
      svg.selectAll(".node_highlight").remove();
      svg.selectAll(".node_text").remove();
    });

    // Group tags: word cloud
    var svgtag = d3.select("#tag-group-svg");
    //var svgword = d3.select("#word-cloud-svg");
    var groupNum = Array.from(Array(14), (x, i) => String(i + 1));

    // find skill arrays by group
    function findNameByGroup(group) {
      var skills = [];
      nodes.forEach(function(d) {
        if (d.group == group) {
          skills.push({"name": d.name,
            "nodesize": d.nodesize,
            "group": d.group});
        }
      });
      return skills;
    }

    // draw word cloud
    var wScale = d3.scaleLinear().domain([1, 23]).range([200, 360]);
    var hScale = d3.scaleLinear().domain([1, 23]).range([400, 600]);
    function drawWordCloud(skillNodes) {
        svgtag.selectAll("text").remove();

        var fontScale = d3.scaleLinear()
        .domain(d3.extent(skillNodes, d=>d.nodesize))
        .range([15, 40]);
        //var cloudPadding = 50;
        
        var width = svgtag.attr("width");
        var height = hScale(skillNodes.length);
        svgtag.attr("height", height);

        d3.layout.cloud().size([wScale(skillNodes.length), height])
          .timeInterval(20)
          .words(skillNodes)
          .font("Impact")
          .padding(1)
          .fontSize(d => fontScale(+d.nodesize))
          .text(d => d.name[0].toUpperCase()+d.name.substring(1))
          //.rotate(function() { return ~~(Math.random() * 2) * 90; })
          .rotate(function() { return 0; })
          .on("end", draw)
          .start();

        function draw(words) {
          var wordcloud = svgtag.append("g")
          .attr("class", "word-cloud")
          .attr("transform", "translate(" + [width/2, height/2.5] + ")");
           
          //console.log(words)   
          wordcloud.selectAll("text")
            .data(words)
            .enter().append("text")
              .style("font-size", d => fontScale(d.nodesize) + "px")
              .style("font-family", "Impact")
              .style("fill", d => color(d.group))
              .attr("text-anchor", "middle")
              .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
              })
              .text(function(d) { return d.name; });
        }

        d3.layout.cloud().stop();
    }

    // draw the color legend 
    var colorlegend = svgtag.append("g")
    .attr("class", "color-legend")
    .attr("transform", "translate(" + [svgtag.attr("width")/2-200, 10] + ")");

    var radius = 8;
    var cxScale = d3.scaleLinear().domain([1, 14]).range([radius/2, 360-radius/2]);
    
    var colorcircle = colorlegend.selectAll("circle")
    .data(groupNum).enter()
    .append("circle")
    .attr("id", d => "group"+d)
    .attr("cx", d => cxScale(Number(d)))
    .attr("cy", radius/2)
    .attr("r", radius)
    .attr("fill", d => color(d));
    
    //initialize as javascript group
    drawWordCloud(findNameByGroup("6"));
    d3.select("#group6")
      .attr("stroke", "yellow")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.7);

    //mouse event: click -> draw word cloud, highlight stroke
    colorcircle.on("click", function() {
      colorcircle.attr("stroke", "none");

      d3.select("#group"+this.__data__)
      .attr("stroke", "yellow")
      .attr("stroke-width", 3)
      .attr("stroke-opacity", 0.7);

      drawWordCloud(findNameByGroup(this.__data__));
    });

    colorcircle.on("mouseenter", function() {
      d3.select("#group"+this.__data__).attr("fill-opacity", 0.7);
    });

    colorcircle.on("mouseout", function() {
      d3.selectAll("circle").attr("fill-opacity", 1);
    });
  });

});



function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}