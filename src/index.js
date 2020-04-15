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
      const {name, value, category} = d.data;
      tooltip.attr('data-value', value);
      return `Name: ${name} <br> Category: ${category} <br> Value: ${value}`;
    })
    .direction('n')
    .offset([-10, 0]);

  graph.call(tooltip);

  const treemap = d3.treemap().size([width, height]);

  // Constructs a root node from the specified hierarchical data.
  const root = d3.hierarchy(dataset, (d) => d.children)
    .eachBefore( d => d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name)
    // Evaluates the specified value function for this node and each descendant
    .sum(d => d.value)
    // Sorts the children of this node
    .sort((a, b) => b.height - a.height || b.value - a.value);

  const tree = treemap(root);

  const leaf = graph
    .selectAll("g")
    // Returns the array of leaf nodes in traversal order; leaves are nodes with no children.
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

  // create the legend
  const legend = graph
    .append('g')
    .attr('id', 'legend')
    .attr('transform', 'translate(' + 0 + ',' + height + ')');

  let categories = root.leaves().map(node => node.data.category);
  categories = [...new Set(categories)];

  const legendWidth = 500;
  const LEGEND_OFFSET = 10;
  const LEGEND_RECT_SIZE = 15;
  const LEGEND_H_SPACING = 150;
  const LEGEND_V_SPACING = 10;
  const LEGEND_TEXT_X_OFFSET = 3;
  const LEGEND_TEXT_Y_OFFSET = -2;
  const legendElemsPerRow = Math.floor(legendWidth/LEGEND_H_SPACING);

  // create the rect colored
  const legendElem = legend
    .selectAll('g')
    .attr("transform", "translate(60," + LEGEND_OFFSET + ")")
    .data(categories)
    .enter()
    .append('g')
    .attr("transform", (d, i) => 'translate(' +
      ((i%legendElemsPerRow)*LEGEND_H_SPACING) + ',' +
      ((Math.floor(i/legendElemsPerRow))*LEGEND_RECT_SIZE + (LEGEND_V_SPACING*(Math.floor(i/legendElemsPerRow)))) + ')'
    );

  legendElem.append('rect')
    .attr('width', LEGEND_RECT_SIZE)
    .attr('height', LEGEND_RECT_SIZE)
    .attr('class','legend-item')
    .style('fill', color);

  legendElem.append("text")
    .attr('x', LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET)
    .attr('y', LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET)
    .text(d => d);
};

d3.json(DATASET.FILE_PATH, (error, dataset) => !error && buildMap(dataset));
