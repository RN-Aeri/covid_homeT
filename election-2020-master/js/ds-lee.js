var color = d3.scaleOrdinal(d3.schemePaired);
color(0);
color(1);
color(2);
color(3);
color(4);
color(5);
color(6);
color(7);
color(8);
color(9);
color(10);
  
var tooltip = d3.select("body")
    .append("div")
	//.attr("class", "tooltip")
  //.style("opacity", 100);
  

d3.json("data/lee-graph.json", function(error, graph) {
  if (error) throw error;
 	const svg = d3.select('svg'),
        width = +svg.attr('width'),
  			height = +svg.attr('height');


const simulation = d3.forceSimulation()
    .nodes(graph.nodes)
    .force('link', d3.forceLink().id(d => d.id))
    .force('charge', d3.forceManyBody().strength(-100).distanceMax(500).distanceMin(5))
    .force('center', d3.forceCenter(width / 2,  height / 2))
    .on('tick', ticked);

simulation.force('link')
    .links(graph.links);

const R = 10;

 
let link = svg.selectAll('line')
    .data(graph.links)
    .enter().append('line');

link  
    .attr('class', 'link')
  	.on('mouseover.tooltip', function(d) {
      	tooltip.transition()
        	.duration(300)
        	.style("opacity", .8);
      	tooltip.html("Source:"+ d.source.id + 
                     "<p/>Target:" + d.target.id +
                    "<p/>Strength:"  + d.value)
        	.style("left", (d3.event.pageX) + "px")
        	.style("top", (d3.event.pageY + 10) + "px");
    	})
    	.on("mouseout.tooltip", function() {
	      tooltip.transition()
	        .duration(100)
	        .style("opacity", 0);
	    })
  		.on('mouseout.fade', fade(1))
	    .on("mousemove", function() {
	      tooltip.style("left", (d3.event.pageX) + "px")
	        .style("top", (d3.event.pageY + 10) + "px");
      })
      .style("stroke-width", function(d) { return (d.value-1)^3.5; });
;

let node = svg.selectAll('.node')
    .data(graph.nodes)
    .enter().append('g')
    .attr('class', 'node')
    .call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended));;

  node.append('circle')
    .attr('r', R)
  	.attr("fill", function(d) { return color(d.group);}) 	
    .on('mouseover.tooltip', function(d) {
      	tooltip.transition()
        	.duration(300)
        	.style("opacity", .8);
      	tooltip.html("Name:" + d.id + "<p/>group:" + d.group)
        	.style("left", (d3.event.pageX) + "px")
        	.style("top", (d3.event.pageY + 10) + "px");
    	})
  	.on('mouseover.fade', fade(0.1))
    .on("mouseout.tooltip", function() {
        tooltip.transition()
	        .duration(100)
	        .style("opacity", 0);
	    })
  	.on('mouseout.fade', fade(1))
	    .on("mousemove", function() {
	      tooltip.style("left", (d3.event.pageX) + "px")
	        .style("top", (d3.event.pageY + 10) + "px");
	    })
  	.on('dblclick',releasenode)
    
	
node.append('text')
    .attr('x', 15)
    .attr('dy', '.35em')
    .text(d => d.id);

  

function ticked() {
  link
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y);

  node
    .attr('transform', d => `translate(${d.x},${d.y})`);
}

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
  //d.fx = null;
  //d.fy = null;
}
function releasenode(d) {
    d.fx = null;
    d.fy = null;
}
  
  const linkedByIndex = {};
  graph.links.forEach(d => {
    linkedByIndex[`${d.source.index},${d.target.index}`] = 1;
  });

  function isConnected(a, b) {
    return linkedByIndex[`${a.index},${b.index}`] || linkedByIndex[`${b.index},${a.index}`] || a.index === b.index;
  }

  function fade(opacity) {
    return d => {
      node.style('stroke-opacity', function (o) {
        const thisOpacity = isConnected(d, o) ? 1 : opacity;
        this.setAttribute('fill-opacity', thisOpacity);
        return thisOpacity;
      });

      link.style('stroke-opacity', o => (o.source === d || o.target === d ? 1 : opacity));

    };
  }

})