const innerRadius = 10,
  outerRadius = 150,
  seriesArcHeight = 40,
  margin = 10,
  width = outerRadius * 2 + seriesArcHeight * 2 + margin,
  height = outerRadius * 2 + seriesArcHeight * 2 + margin;

const data = [
  { series: "Innovation", av: 2.32, rv: 1.7 },
  { series: "Selling Skills", av: 2.92, rv: 2 },
  { series: "Territory Management & Business Skills", av: 1.6, rv: 2.3 },
  { series: "Customer Relations", av: 3.39, rv: 2 },
  { series: "Internal Communication", av: 3.2, rv: 2 },
  { series: "Competitiveness", av: 2.67, rv: 3.3 },
];

const color = d3
  .scaleOrdinal()
  .range(["#183153", "#d24518", "#03928d", "#1e9de0", "#b1165b", "#e8c600"]);

const y = d3.scaleLinear().range([innerRadius, outerRadius]).domain([0, 4]);

const pie = d3
  .pie()
  .sort(null)
  .value((d) => d);

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(${width / 2},${height / 2})`);

// Append circle ticks
svg
  .selectAll("circle")
  .data(y.ticks(4).slice(1))
  .enter()
  .append("circle")
  .attr("class", "circle")
  .attr("r", y);

const sectors = data.length;

let startAngle = (-90 * Math.PI) / 180;
for (let i = 0; i < sectors; i++) {
  let endAngle = (-90 * Math.PI) / 180 + (2 * Math.PI * (i + 1)) / sectors;

  // Arc generator for Acquired Values pies
  const arcAV = d3
    .arc()
    .innerRadius(innerRadius)
    .outerRadius(y(data[i].av))
    .startAngle(startAngle)
    .endAngle(endAngle);

  // Arc generator for Series pies
  const outerLaberArc = d3
    .arc()
    .innerRadius(outerRadius)
    .outerRadius(outerRadius + seriesArcHeight)
    .startAngle(startAngle)
    .endAngle(endAngle);

  startAngle = endAngle;

  // Append pies for Acquired Values
  svg.append("path").attr("class", "arc--av").attr("d", arcAV);

  // Append axes
  svg
    .append("path")
    .attr("d", `M${innerRadius},0 L${outerRadius},0`)
    .attr("class", "axis")
    .attr(
      "transform",
      (d) => `rotate(${(((-90 * Math.PI) / 180 + endAngle) * 180) / Math.PI})`
    );

  // Append pies for Series
  svg
    .append("path")
    .attr("class", "arc--series")
    .attr("d", outerLaberArc)
    .attr("id", "arc-series-" + i)
    .style("fill", () => color(i));

  // Append Series labels
  const seriesLabels = svg
    .append("text")
    .attr("class", "label--series-arc")
    .attr("dx", "-0.5rem")
    .attr("dy", "1.5rem");

  seriesLabels
    .append("textPath")
    .attr("xlink:href", `#arc-series-${i}`)
    .style("text-anchor", "middle")
    .attr("startOffset", () =>
      startAngle > (90 * Math.PI) / 180 ? "75%" : "25%"
    )
    .text(data[i].series);

  // Handle multiline labels
  seriesLabels.each(function () {
    if (this.getComputedTextLength() > outerRadius)
      wrap(d3.select(this), outerRadius);
  });
}

// Pies for the Required Values should lie on top, so draw them next
startAngle = (-90 * Math.PI) / 180;
for (let i = 0; i < sectors; i++) {
  let endAngle = (-90 * Math.PI) / 180 + (2 * Math.PI * (i + 1)) / sectors;

  // Arc generator for Required Values pies
  let arcRV = d3
    .arc()
    .innerRadius(innerRadius)
    .outerRadius(y(data[i].rv))
    .startAngle(startAngle)
    .endAngle(endAngle);

  startAngle = endAngle;

  // Append pies for Required Values
  svg.append("path").attr("class", "arc--rv").attr("d", arcRV);
}

// Acquired Values should lie on top, so draw them next
startAngle = (-90 * Math.PI) / 180;
for (let i = 0; i < sectors; i++) {
  let endAngle = (-90 * Math.PI) / 180 + (2 * Math.PI * (i + 1)) / sectors;

  // Arc generator for Acquired Values
  let arcValues = d3
    .arc()
    .innerRadius(y(data[i].av))
    .outerRadius(y(data[i].av))
    .startAngle(startAngle)
    .endAngle(endAngle);

  startAngle = endAngle;

  // Append helper arc for Acquired Values (used for aligning values along pie)
  svg
    .append("path")
    .attr("class", "arc-av-labels")
    .attr("d", arcValues)
    .attr("id", "arc-av-labels-" + i);

  // Append labels
  svg
    .append("text")
    .attr("class", "label--arc")
    .attr("dy", () =>
      startAngle > (90 * Math.PI) / 180 ? "0.75rem" : "-0.25rem"
    )
    .append("textPath")
    .attr("xlink:href", `#arc-av-labels-${i}`)
    .style("text-anchor", "middle")
    .attr("startOffset", () =>
      startAngle > (90 * Math.PI) / 180 ? "75%" : "25%"
    )
    .text(data[i].av);
}

// Helper function for wrapping labels
function wrap(text, width) {
  text.each(function () {
    let text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      dx = parseFloat(text.attr("dx")),
      dy = parseFloat(text.attr("dy")),
      textPath = text.select("textPath"),
      textPathOffset = textPath.attr("startOffset"),
      textPathLink = textPath.attr("xlink:href"),
      tspan;

    text.attr("dx", null).attr("dy", null).text(null);

    textPath = text
      .append("textPath")
      .attr("startOffset", textPathOffset)
      .style("text-anchor", "middle")
      .attr("xlink:href", textPathLink);

    tspan = textPath
      .append("tspan")
      .attr("dx", `${dx}rem`)
      .attr("dy", `${dy - 0.5}rem`)
      .attr("text-anchor", "middle");

    while ((word = words.pop())) {
      line.push(word);

      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];

        textPath = text
          .append("textPath")
          .attr("startOffset", textPathOffset)
          .style("text-anchor", "middle")
          .attr("xlink:href", textPathLink);

        tspan = textPath
          .append("tspan")
          .attr("dx", `${dx}rem`)
          .attr("dy", `${dy - 0.65}rem`)
          .attr("text-anchor", "middle")
          .text(word);
      }
    }
  });
}
