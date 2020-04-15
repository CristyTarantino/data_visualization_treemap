'use strict';

import 'normalize.css';

require('./styles/index.scss');

const projectName="tree-map";
localStorage.setItem('example_project', 'D3: Tree Map');

const fader = (color) => d3.interpolateRgb(color, "#fff")(0.2);
const color = d3.scaleOrdinal(d3.schemeCategory20.map(fader));

const DATASETS = {
  videogames:{
    TITLE: "Video Game Sales",
    DESCRIPTION: "Top 100 Most Sold Video Games Grouped by Platform",
    FILE_PATH:"https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json"
  },
  movies:{
    TITLE: "Movie Sales",
    DESCRIPTION: "Top 100 Highest Grossing Movies Grouped By Genre",
    FILE_PATH:"https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json"
  },
  kickstarter:{
    TITLE: "Kickstarter Pledges",
    DESCRIPTION: "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category",
    FILE_PATH:"https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json"
  }
};

const urlParams = new URLSearchParams(window.location.search);
const DEFAULT_DATASET = "videogames";
const DATASET = DATASETS[urlParams.get('data') || DEFAULT_DATASET];

const margin = {
    top: 100,
    right: 20,
    bottom: 60,
    left: 60
  },
  width = 1420 - margin.left - margin.right,
  height = 700 - margin.top - margin.bottom;

const svg = d3.select('main')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

const buildMap = (dataset) => {
  console.log(dataset);
  svg.append('text')
    .attr('id', 'title')
    .attr('x', (width / 2))
    .attr('y', 0 - (margin.top / 2))
    .attr('text-anchor', 'middle')
    .style('font-size', '30px')
    .text(DATASET.TITLE);

  svg.append('text')
    .attr('id', 'description')
    .attr('x', (width / 2))
    .attr('y', 35 - (margin.top / 2))
    .attr('text-anchor', 'middle')
    .style('font-size', '20px')
    .text(DATASET.DESCRIPTION);

  const graph = svg.append('g')
    .attr('class', 'graph');

  // tooltip
  const tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .attr('id', 'tooltip')
    .html(d => {
      tooltip.attr('data-value', d.data.value);
      return `Name: ${d.data.name} <br> Category: ${d.data.category} <br> Value: ${d.data.value}`;
    })
    .direction('n')
    .offset([-10, 0]);

  graph.call(tooltip);

  const treemap = d3.treemap().size([width, height]);

  const root = d3.hierarchy(dataset, (d) => d.children)
    .eachBefore( d =>
      d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name)
    .sum(d => d.value)
    .sort((a, b) => b.height - a.height || b.value - a.value);

  const tree = treemap(root);

  const leaf = graph
    .selectAll("g")
    .data(tree.leaves())
    .enter()
    .append("g")
    .attr("class", "leaf")
    .attr("transform", d => "translate(" + d.x0 + "," + d.y0 + ")");

  leaf.append("rect")
    .attr("id", d => d.data.id)
    .attr("class", "tile")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("data-name", d => d.data.name)
    .attr("data-category", d => d.data.category)
    .attr("data-value", d => d.data.value)
    .attr("fill", d => color(d.data.category))
    .on('mouseover', tooltip.show)
    .on('mouseout', tooltip.hide);

  leaf.append("text")
    .attr('class', 'tile-text')
    .selectAll("tspan")
    .data( d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .enter()
    .append("tspan")
    .attr("x", 4)
    .attr("y", (d,i) => 13 + i * 10)
    .text( d => d);

  // // Legend
  // const blockSize = 30;
  //
  // // create the legend
  // const legend = grath
  //   .append('g')
  //   .attr('id', 'legend')
  //   .attr('transform', 'translate(' + (width + margin.right - 130)/2 + ',' + 10 + ')');
  //
  // // create the rect colored
  // legend
  //   .selectAll('rect')
  //   .data(colorScale.domain())
  //   .enter()
  //   .append('rect')
  //   .attr('width', blockSize)
  //   .attr('height', blockSize/2)
  //   .attr('x', (d, i) => i * blockSize)
  //   .attr('y', 0)
  //   .style('fill', colorScale);
  //
  // // create the ticks
  // const legendX = d3.scaleLinear()
  //   .domain([min, max])
  //   .range([0, numOfColors * blockSize]);
  //
  // const legendXAxis = d3.axisBottom(legendX)
  //   .tickSize(blockSize/2 + 5)
  //   .tickFormat(d =>  Math.round(d) + '%' )
  //   .tickValues(colorScale.domain());
  //
  // legend.call(legendXAxis)
  //   // remove the top axis bar path
  //   .select(".domain")
  //   .remove();
};

d3.json(DATASET.FILE_PATH, (error, dataset) => !error && buildMap(dataset));
