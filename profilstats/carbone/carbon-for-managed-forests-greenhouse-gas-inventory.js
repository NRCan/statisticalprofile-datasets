// Carbon for managed forests chart

(function () {
  var draw_chart2 = function (event) {
    // Read the CSV file
    d3.csv("https://raw.githubusercontent.com/BenoitJPage/Datasets/main/StatProfile-2024_data/Carbon/StatProfile_Carbon_TotalEmmissions_EN.csv")
            .then(function (data) {
                console.log(data);

                let unique = [...new Set(data.map(item => item.Measure))];

                // Get the dropdown element
                let dropdown = d3.select("#greenhouse_gas_inventory-select");

                // Append unique values as options
                dropdown.selectAll("option.data-option")
                    .data(unique)
                    .enter()
                    .append("option")
                    .classed("data-option", true)  // add a class for later reference
                    .text(d => d)
                    .attr("value", d => d)
                    .property("selected", d => d === 'Canada');

                // On change event for dropdown
                dropdown.on("change", function () {
                    let selectedValue = d3.select(this).property("value");
                    d3.selectAll('#greenhouse_gas_inventory-chart svg').remove()

                    barChart(data, selectedValue)
                });

                var selected = dropdown.property("value")
                barChart(data, selected)

            });

        function aggregateData(data, attribute) {
            const aggregated = d3.rollups(
                data,
                v => d3.sum(v, d => +d[attribute]),
                d => d.Year
            );

            return aggregated.map(([Year, Value]) => ({ Year, Value }));
        }

        function barChart(data, Measure) {
            data = data.filter(d => (d.Measure == Measure))
            data = aggregateData(data, 'Value');

            // const colors = ["#03662A", "#A62A1E"]; // green color , red color
            // var color;
            // if (d['Number'] < 0) {
            //     color = "#A62A1E"; // red color
            //     } 
            //     else {
            //         color = "#03662A"; // green color
            //     }

            // Setup SVG dimensions and margins
            const margin = { top: 70, right: 40, bottom: 61.5, left: 120 },
                width = 1080 - margin.left - margin.right,
                height = 550 - margin.top - margin.bottom;

            const svg = d3.select("#greenhouse_gas_inventory-chart")  // Append SVG to body or any other container you'd prefer
                .append("svg")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // Define scales
            const xScale = d3.scaleBand()
                .domain(data.map(d => +d.Year))
                .range([0, width])
                .padding(0.4);

            const yScale = d3.scaleLinear()
                .domain([d3.min(data, d => Math.min(0, d['Value'])), d3.max(data, d => Math.max(0, d['Value']))])
                .range([height, 0]).nice();

            // Define axes
            const xAxis = d3.axisBottom(xScale).ticks(15).tickFormat(d3.format("d")).tickSizeOuter(0);
            const yAxis = d3.axisLeft(yScale);


            svg.append("text")
                .attr("y", 40)
                .attr("x", width / 2)
                .attr("text-anchor", "middle")
                .attr("font-size", "13px")
                .text("Année").attr("transform", "translate(0," + height + ")");

            svg.append("g").transition().duration(1000).call(yAxis)
            const textElement = svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.right * 2)
                .attr("x", -height / 2)
                .attr("text-anchor", "middle") 
                .attr("font-size", "16px");

            textElement.append("tspan")
                .text("CO");

            textElement.append("tspan")
                .attr("baseline-shift", "sub")
                .attr("font-size", "10px") // Slightly smaller font size for the subscript
                .text("2");

            textElement.append("tspan")
                .attr("baseline-shift", "baseline")
                .attr("font-size", "13px") // Ensure consistent font size for uniform appearance
                .text(" e/an, mégatonnes"); // Append the rest of the text


            // Create a div for the tooltip
            const tooltip = d3.select("#tooltip");

            // Add bars
            svg.selectAll(".bar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", d => xScale(+d.Year))
                .attr("y", d => d['Value'] >= 0 ? yScale(d['Value']) : yScale(0))
                .attr("width", xScale.bandwidth())
                .attr("height", d => Math.abs(yScale(d['Value']) - yScale(0)))
                .attr("fill", "#03662A") // green color
                .on("mouseover", function () {
                    tooltip.style("display", "block");
                    d3.select(this).attr('fill', '#7D828B'); // gray color
                })
                .on("mousemove", function (event, d) {

                    tooltip
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY - 300}px`)
                        .html(`Year: <b>${d.Year}</b><br>Emission: <b>${( d['Value'] ).toLocaleString( 'en-CA' )}</b>`);
                })
                .on("mouseout", function () {
                    tooltip.style("display", "none");
                    d3.select(this).attr('fill', "#03662A"); // green color
                });


            // Add axes to SVG
            svg.append("g")
                .attr("transform", `translate(0,${yScale(0)})`)
                .call(xAxis)
        }
  };


  var myChart2;
  // Delay execution until loaded
  document.addEventListener("DOMContentLoaded", function (event) {
    myChart2 = draw_chart2(event);
  });
})();
