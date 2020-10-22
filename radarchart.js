"use strict";

function radarChart() {
  let SELECTION,
    innerRadius = 10,
    outerRadius = 200,
    seriesArcHeight = 40,
    margin = 10,
    windowWidth,
    windowHeight,
    width,
    height,
    highlightOffset = 10,
    colorSeries = d3
      .scaleOrdinal()
      .range([
        "#183153",
        "#d24518",
        "#03928d",
        "#1e9de0",
        "#b1165b",
        "#e8c600",
      ]),
    colorValues = d3.scaleOrdinal().range(["#0d5a9e", "#000000"]),
    y = d3.scaleLinear().range([innerRadius, outerRadius]).domain([0, 4]),
    pie = d3
      .pie()
      .sort(null)
      .value(1)
      .startAngle((-90 * Math.PI) / 180)
      .endAngle((-90 * Math.PI) / 180 + 2 * Math.PI),
    svg,
    avSlices,
    rvSlices,
    seriesSlices,
    avLabelSlices,
    legend,
    tooltipContent = (d) => {
      let content = `<div class="t-item"><div class="t-head">${d.data.series}</div>`,
        data = legend.data();

      if (data[0].active)
        content += `<div class="t-content">
                      <img src="img/info.png" class="t-img" />
                      <div class="t-text">
                        <u><b>Acquired</b></u>
                        Innovation: ${d.data.av}
                      </div>
                    </div></div>`;

      if (data[1].active)
        content += `<div class="t-content">
                      <img src="img/checked.png" class="t-img" />
                      <div class="t-text">
                        <u><b>Required</b></u>
                        Innovation: ${d.data.rv}
                      </div>
                    </div></div>`;
      return content;
    };

  function chart(selection) {
    SELECTION = selection.node();

    selection.each(function (data) {
      windowWidth = this.clientWidth;
      windowHeight = this.clientHeight;

      width = outerRadius * 2 + seriesArcHeight * 2 + margin;
      height = outerRadius * 2 + seriesArcHeight * 2 + margin;

      width = width > windowWidth ? width : windowWidth;
      height = height > windowHeight ? height : windowHeight;

      // Add parent SVG container and group
      svg = d3
        .select(this)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      // Append circle ticks
      svg
        .selectAll("circle")
        .data(y.ticks(4))
        .enter()
        .append("circle")
        .attr("class", "circle")
        .attr("r", y);

      // Arc generator for Acquired Values pies
      const arcAV = d3
        .arc()
        .innerRadius(innerRadius)
        .outerRadius((d) => y(d.data.av));

      // Append pies for Acquired Values
      avSlices = svg
        .selectAll(".arc--av")
        .data(pie(data))
        .enter()
        .append("path")
        .attr("class", "arc--av")
        .attr("d", arcAV);

      // Arc generator for Series pies
      const outerLaberArc = d3
        .arc()
        .innerRadius(outerRadius)
        .outerRadius(outerRadius + seriesArcHeight);

      // Append axes
      svg
        .selectAll(".axis")
        .data(pie(data))
        .enter()
        .append("path")
        .attr("d", `M${innerRadius},0 L${outerRadius},0`)
        .attr("class", "axis")
        .attr(
          "transform",
          (d) =>
            `rotate(${(((-90 * Math.PI) / 180 + d.endAngle) * 180) / Math.PI})`
        );

      // Append pies for Series
      seriesSlices = svg
        .selectAll(".arc--series")
        .data(pie(data))
        .enter()
        .append("path")
        .attr("class", "arc--series")
        .attr("d", outerLaberArc)
        .attr("id", (d) => `${SELECTION.id}-arc-series-${d.index}`)
        .style("fill", (d) => colorSeries(d.index));

      // Append Series labels
      const seriesLabels = svg
        .selectAll(".label--series-arc")
        .data(pie(data))
        .enter()
        .append("text")
        .attr("class", "label--series-arc")
        .attr("dx", "-0.5em")
        .attr("dy", "2em");

      seriesLabels
        .append("textPath")
        .attr("xlink:href", (d) => `#${SELECTION.id}-arc-series-${d.index}`)
        .style("text-anchor", "middle")
        .attr("startOffset", (d) =>
          d.startAngle > (90 * Math.PI) / 180 ? "75%" : "25%"
        )
        .text((d) => d.data.series);

      // Handle multiline labels
      seriesLabels.each(function () {
        if (/Edge\/\d./i.test(navigator.userAgent)) {
          // Microsoft Edge calculates getComputedTextLength wrong
          if (this.getNumberOfChars() * 6 > outerRadius)
            wrap(d3.select(this), outerRadius);
        } else if (this.getComputedTextLength() > outerRadius) wrap(d3.select(this), outerRadius);
      });

      // Pies for the Required Values should lie on top, so draw them next

      // Arc generator for Required Values pies
      let arcRV = d3
        .arc()
        .innerRadius(innerRadius)
        .outerRadius((d) => y(d.data.rv));

      // Append pies for Required Values
      rvSlices = svg
        .selectAll(".arc--rv")
        .data(pie(data))
        .enter()
        .append("path")
        .attr("class", "arc--rv")
        .attr("d", arcRV);

      // Acquired Values should lie on top, so draw them next

      // Arc generator for Acquired Values
      let arcValues = d3
        .arc()
        .innerRadius((d) => y(d.data.av))
        .outerRadius((d) => y(d.data.av));

      // Append pies for Required Values
      // Append helper arc for Acquired Values (used for aligning values along pie)
      avLabelSlices = svg
        .selectAll(".arc--av-labels")
        .data(pie(data))
        .enter()
        .append("path")
        .attr("class", "arc--av-labels")
        .attr("d", arcValues)
        .attr("id", (d) => `${SELECTION.id}-arc--av-labels-${d.index}`);

      // Append labels
      svg
        .selectAll(".label--arc")
        .data(pie(data))
        .enter()
        .append("text")
        .attr("class", "label--arc")
        .attr("dy", (d) =>
          d.startAngle > (90 * Math.PI) / 180 ? "0.75em" : "-0.25em"
        )
        .append("textPath")
        .attr("xlink:href", (d) => `#${SELECTION.id}-arc--av-labels-${d.index}`)
        .style("text-anchor", "middle")
        .attr("startOffset", (d) =>
          d.startAngle > (90 * Math.PI) / 180 ? "75%" : "25%"
        )
        .text((d) => d.data.av);

      // Append Legend
      const legendG = svg.append("g").attr("class", "legend");

      legend = legendG
        .selectAll("g")
        .data(["Acquired", "Required"])
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .datum((d, i) => ({ i, value: d, active: 1 }))
        .attr("transform", (d, i) => `translate(${i * 100}, 0)`)
        .on("click", function (e, d) {
          let active, newOpacity;
          if (d.i === 0) {
            active = d.active ? 0 : 1;
            newOpacity = active ? 1 : 0;
            svg
              .selectAll("path.arc--av")
              .transition()
              .duration(200)
              .style("opacity", newOpacity);
            svg
              .selectAll("text.label--arc")
              .transition()
              .duration(200)
              .style("opacity", newOpacity);
          } else {
            active = d.active ? 0 : 1;
            newOpacity = active ? 1 : 0;
            svg
              .selectAll("path.arc--rv")
              .transition()
              .duration(200)
              .style("opacity", newOpacity);
          }
          d3.select(this).classed("pushed", active ? false : true);
          d.active = active;
        });

      legend
        .append("rect")
        .attr("class", "legend-rect")
        .style("fill", (d, i) => colorValues(d.i))
        .attr("width", 30)
        .attr("height", 5)
        .attr("y", -5)
        .attr("rx", 5);

      legend
        .append("text")
        .attr("x", 35)
        .attr("dy", "0.15em")
        .attr("class", "legend-label")
        .text((d) => d.value);

      const bBox = legendG.node().getBBox();

      legendG.attr(
        "transform",
        () =>
          `translate(${-bBox.width / 2}, ${
            outerRadius + seriesArcHeight * 2 - margin
          })`
      );

      // Append tooltip
      const tooltip = d3
        .select(SELECTION)
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      // Append dotted line
      const dottedLine = svg
        .append("path")
        .attr("d", `M${innerRadius},0 L${outerRadius},0`)
        .attr("class", "dotted-line");

      // Arc generator for tooltips
      let arcTooltip = d3
        .arc()
        .innerRadius(0)
        .outerRadius(outerRadius + seriesArcHeight);

      svg
        .selectAll(".arc--tooltip")
        .data(pie(data))
        .enter()
        .append("path")
        .attr("class", "arc--tooltip")
        .attr("d", arcTooltip)
        .on("click", function () {
          window.location.href = "https://www.google.com";
        })
        .on("mouseover", function (e, d) {
          let arcAV_highlighted = d3
            .arc()
            .innerRadius(innerRadius + highlightOffset)
            .outerRadius(y(d.data.av) + highlightOffset);

          avSlices
            .filter((k, i) => d.index === i)
            .transition()
            .duration(200)
            .attr("d", arcAV_highlighted);

          let arcValues_highlighted = d3
            .arc()
            .innerRadius((d) => y(d.data.av) + highlightOffset)
            .outerRadius((d) => y(d.data.av) + highlightOffset);

          avLabelSlices
            .filter((k, i) => d.index === i)
            .transition()
            .duration(200)
            .attr("d", arcValues_highlighted);

          let arcRV_highlighted = d3
            .arc()
            .innerRadius(innerRadius + highlightOffset)
            .outerRadius((d) => y(d.data.rv) + highlightOffset);

          rvSlices
            .filter((k, i) => d.index === i)
            .transition()
            .duration(200)
            .attr("d", arcRV_highlighted);

          let outerLaberArc_highlighted = d3
            .arc()
            .innerRadius(outerRadius + 10)
            .outerRadius(outerRadius + seriesArcHeight + 10);

          seriesSlices
            .filter((k, i) => d.index === i)
            .transition()
            .duration(200)
            .attr("d", outerLaberArc_highlighted);

          const c = d3.pointer(e);

          dottedLine.style("visibility", "visible");
          dottedLine.attr("d", `M0,0 L${c[0]},${c[1]}`);
          dottedLine.raise();

          tooltip.transition().duration(200).style("opacity", 0.9);

          tooltip
            .html(tooltipContent(d))
            .style("left", `${e.pageX + 10}px`)
            .style("top", `${e.pageY}px`);
        })
        .on("mousemove", function (e, d) {
          const c = d3.pointer(e);

          dottedLine.attr("d", `M0,0 L${c[0]},${c[1]}`);

          tooltip
            .html(tooltipContent(d))
            .style("left", `${e.pageX + 10}px`)
            .style("top", `${e.pageY}px`);
        })
        .on("mouseout", function (e, d) {
          avSlices
            .filter((k, i) => d.index === i)
            .transition()
            .duration(200)
            .attr("d", arcAV);

          avLabelSlices
            .filter((k, i) => d.index === i)
            .transition()
            .duration(200)
            .attr("d", arcValues);

          rvSlices
            .filter((k, i) => d.index === i)
            .transition()
            .duration(200)
            .attr("d", arcRV);

          seriesSlices
            .filter((k, i) => d.index === i)
            .transition()
            .duration(200)
            .attr("d", outerLaberArc);

          dottedLine.style("visibility", "hidden");

          tooltip.transition().duration(500).style("opacity", 0);
        });
    });
  }

  // Helper function for wrapping long labels
  function wrap(text, width) {
    text.each(function () {
      let text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1,
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
        .attr("dx", `${dx}em`)
        .attr("dy", `${dy - 0.5}em`)
        .attr("text-anchor", "middle");

      while ((word = words.pop())) {
        line.push(word);

        tspan.text(line.join(" "));

        let getComputedTextLength;
        // Microsoft Edge calculates getComputedTextLength wrong
        if (/Edge\/\d./i.test(navigator.userAgent))
          getComputedTextLength = tspan.node().getNumberOfChars() * 6;
        else getComputedTextLength = tspan.node().getComputedTextLength();

        if (getComputedTextLength > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];

          textPath = text
            .append("textPath")
            .attr("startOffset", textPathOffset)
            .style("text-anchor", "middle")
            .attr("xlink:href", textPathLink);

          let hack =
            /Chrome/.test(navigator.userAgent) &&
            /Google Inc/.test(navigator.vendor)
              ? 5
              : 1;
          tspan = textPath
            .append("tspan")
            .attr("dx", `${dx}em`)
            .attr("dy", `${++lineNumber * lineHeight + dy / hack}em`)
            .attr("text-anchor", "middle")
            .text(word);
        }
      }
    });
  }

  return chart;
}
