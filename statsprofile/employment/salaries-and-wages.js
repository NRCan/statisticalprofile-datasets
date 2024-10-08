//Salaries and wages chart 

(function () {
    var draw_chart1 = function (event) {
      d3.csv("https://raw.githubusercontent.com/BenoitJPage/Datasets/main/StatProfile-2024_data/Employment/StatProfile_Employment_Wages_EN.csv")
          .then(function (data) {
              console.log(data);

              // Extract unique values from Jurisdiction column
          let unique = [...new Set(data.map(item => item.Jurisdiction))];

          // Get the dropdown element
          let dropdown = d3.select("#salaries_and_wages_jurisdiction-select");

          // Append unique values as options
          dropdown.selectAll("option.data-option")
              .data(unique)
              .enter()
              .append("option")
              .classed("data-option", true)  // add a class for later reference
              .text(d => d)
              .attr("value", d => d); 

           // Extract unique values from Sector column
           let uniqueSector = [...new Set(data.map(item => item.Sector))];
           
           // Get the dropdown element
           let dropdownSector = d3.select("#salaries_and_wages_sector-select");
           
           // Append unique values as options
           dropdownSector.selectAll("option.data-option")
                .data(uniqueSector)
                .enter()
                .append("option")
                .classed("data-option", true)  // add a class for later reference
                .text(d => d)
                .attr("value", d => d);

          // On change event for dropdown
          dropdown.on("change", function () {
              let selectedJurisdiction = dropdown.property("value");
              let selectedSector = dropdownSector.property("value");
              d3.selectAll('#salaries_and_wages-chart svg').remove()
              lineChart(data, selectedJurisdiction, selectedSector)
          });

          dropdownSector.on("change", function () {
              let selectedJurisdiction = dropdown.property("value");
              let selectedSector = dropdownSector.property("value");
              d3.selectAll('#salaries_and_wages-chart svg').remove()
              lineChart(data, selectedJurisdiction, selectedSector)
          });

          var selectedJurisdiction = dropdown.property("value")
          var selectedSector = dropdownSector.property("value")
          lineChart(data, selectedJurisdiction, selectedSector);

          });

      function lineChart(data, Jurisdiction, Sector) {
        data = data.filter(d => (d.Jurisdiction == Jurisdiction) && (d.Sector == Sector))
        console.log(data)

          // Setup SVG dimensions and margins
          const margin = { top: 40, right: 40, bottom: 50, left: 120 },
              width = 1080 - margin.left - margin.right,
              height = 550 - margin.top - margin.bottom;

          const svg = d3.select("#salaries_and_wages-chart")  // Append SVG to body or any other container you'd prefer
              .append("svg")
              .attr("preserveAspectRatio", "xMinYMin meet")
              .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          // Define scales
          const extent = d3.extent(data, d => +d.Year);
          const xScale = d3.scaleLinear()
              .domain([extent[0] - 1, extent[1] + 1])
              .range([0, width]);

          const yScale = d3.scaleLinear()
              .domain([0, d3.max(data, d => +d['Value (1,000 dollars)'])])
              .range([height, 0]).nice();

          // Define axes
          const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d")).tickSizeOuter(0);
          const yAxis = d3.axisLeft(yScale);

          // Add axes to SVG
          svg.append("g")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis)
              .selectAll(".tick")
              .filter((d, i, nodes) => (i === nodes.length - 1) || (i === 0))
              .remove();

          svg.append("text")
              .attr("y", 40)
              .attr("x", width / 2)
              .attr("text-anchor", "middle")
              .attr("font-size", "13px")
              .text("Year").attr("transform", "translate(0," + height + ")");

          svg.append("g").transition().duration(1000).call(yAxis)

          svg.append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", - margin.right * 2)
              .attr("x", -height / 2)
              .attr("text-anchor", "middle")
              .attr("font-size", "13px")
              .text("Wages and salaries (dollars)");

          // Line generator
          const line = d3.line()
              .x(d => xScale(+d.Year))
              .y(d => yScale(+d['Value (1,000 dollars)']));

          // Append the line to SVG
          svg.append("path")
              .data([data])
              .attr("class", "line")
              .attr("d", line)
              .attr('fill', 'none')
              .attr('stroke-width', '4px')
              .attr('stroke', '#03662A'); // green color

          // Create a div for the tooltip
          const tooltip = d3.select("#tooltip");

          // Append a circle to the SVG for the tooltip; will be hidden by default
          const tooltipCircle = svg.append("circle")
              .attr("r", 5)
              .attr("stroke", '#03662A') // green color
              .attr("fill", "white")
              .attr("stroke-width", 2)
              .style("display", "none");

          // Mouseover, mousemove, and mouseout event listeners for the line path
          svg.append("rect")
              .attr("width", width)
              .attr("height", height)
              .style("fill", "none")
              .style("pointer-events", "all")
              .on("mouseover", function () {
                  tooltip.style("display", "block");
                  tooltipCircle.style("display", null);
              })
              .on("mousemove", function (event) {
                  const mouseX = d3.pointer(event, this)[0];
                  const year = xScale.invert(mouseX);
                  const i = d3.bisector(d => +d.Year).left(data, year, 1);
                  const d0 = data[i - 1];
                  const d1 = data[i];
                  const d = year - d0.Year > d1.Year - year ? d1 : d0;

                  tooltipCircle
                      .attr("cx", xScale(+d.Year))
                      .attr("cy", yScale(+d['Value (1,000 dollars)']));

                  tooltip
                      .style("left", `${event.pageX + 10}px`)
                      .style("top", `${event.pageY - 300}px`)
                      .html(`Year: <b>${d.Year}</b><br>Wages and salaries: <b>${Number.parseInt( d['Value (1,000 dollars)'] ).toLocaleString( 'en-CA' )}</b>`);
              })
              .on("mouseout", function () {
                  tooltip.style("display", "none");
                  tooltipCircle.style("display", "none");
              });
      }
  
    }
  
    var myChart1;
    // Delay execution until loaded
    document.addEventListener("DOMContentLoaded", function(event){ myChart1 = draw_chart1(event); });
  
  })();