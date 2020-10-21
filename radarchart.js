"use strict";

function radarChart() {
  let SELECTION,
    innerRadius = 10,
    outerRadius = 150,
    seriesArcHeight = 40,
    margin = 10,
    windowWidth,
    windowHeight,
    width,
    height,
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
    sectors,
    svg,
    startAngle = (-90 * Math.PI) / 180,
    legend,
    tooltipContent = (d) => {
      let content = `<div class="t-item"><div class="t-head">${d.data.series}</div>`,
        data = legend.data();

      if (data[0].active)
        content += `<div class="t-content">
                      <img src="/img/info.png" class="t-img" />
                      <div class="t-text">
                        <u><b>Acquired</b></u>
                        Innovation: ${d.data.av}
                      </div>
                    </div></div>`;

      if (data[1].active)
        content += `<div class="t-content">
                      <img src="/img/checked.png" class="t-img" />
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
      sectors = data.length;

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

      for (let i = 0; i < sectors; i++) {
        let endAngle =
          (-90 * Math.PI) / 180 + (2 * Math.PI * (i + 1)) / sectors;

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
            () =>
              `rotate(${(((-90 * Math.PI) / 180 + endAngle) * 180) / Math.PI})`
          );

        // Append pies for Series
        svg
          .append("path")
          .attr("class", "arc--series")
          .attr("d", outerLaberArc)
          .attr("id", `${SELECTION.id}-arc-series-${i}`)
          .style("fill", () => colorSeries(i));

        // Append Series labels
        const seriesLabels = svg
          .append("text")
          .attr("class", "label--series-arc")
          .attr("dx", "-0.5em")
          .attr("dy", "2em");

        seriesLabels
          .append("textPath")
          .attr("xlink:href", `#${SELECTION.id}-arc-series-${i}`)
          .style("text-anchor", "middle")
          .attr("startOffset", () =>
            startAngle > (90 * Math.PI) / 180 ? "75%" : "25%"
          )
          .text(data[i].series);

        // Handle multiline labels
        seriesLabels.each(function () {
          if (/Edge\/\d./i.test(navigator.userAgent)) {
            // Microsoft Edge calculates getComputedTextLength wrong
            if (this.getNumberOfChars() * 6 > outerRadius)
              wrap(d3.select(this), outerRadius);
          } else if (this.getComputedTextLength() > outerRadius) wrap(d3.select(this), outerRadius);
        });
      }

      // Pies for the Required Values should lie on top, so draw them next
      startAngle = (-90 * Math.PI) / 180;
      for (let i = 0; i < sectors; i++) {
        let endAngle =
          (-90 * Math.PI) / 180 + (2 * Math.PI * (i + 1)) / sectors;

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
        let endAngle =
          (-90 * Math.PI) / 180 + (2 * Math.PI * (i + 1)) / sectors;

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
          .attr("id", `${SELECTION.id}-arc-av-labels-${i}`);

        // Append labels
        svg
          .append("text")
          .attr("class", "label--arc")
          .attr("dy", () =>
            startAngle > (90 * Math.PI) / 180 ? "0.75em" : "-0.25em"
          )
          .append("textPath")
          .attr("xlink:href", `#${SELECTION.id}-arc-av-labels-${i}`)
          .style("text-anchor", "middle")
          .attr("startOffset", () =>
            startAngle > (90 * Math.PI) / 180 ? "75%" : "25%"
          )
          .text(data[i].av);
      }

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

      const pie = d3
        .pie()
        .sort(null)
        .value((d) => d.av);

      startAngle = (-90 * Math.PI) / 180;
      svg
        .selectAll(".arc--tooltip")
        .data(pie(data))
        .enter()
        .append("path")
        .attr("class", "arc--tooltip")
        .attr(
          "d",
          d3
            .arc()
            .innerRadius(0)
            .outerRadius(outerRadius + seriesArcHeight)
            .startAngle(() => startAngle)
            .endAngle((d, i) => {
              let endAngle =
                (-90 * Math.PI) / 180 + (2 * Math.PI * (i + 1)) / sectors;
              startAngle = endAngle;
              return endAngle;
            })
        )
        .on("mouseover", function (e, d) {
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
        .on("mouseout", function () {
          dottedLine.style("visibility", "hidden");

          tooltip.transition().duration(500).style("opacity", 0);
        });

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
