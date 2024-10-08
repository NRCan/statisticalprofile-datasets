// Area certified chart

    (function () {
      var draw_chart1 = function (event) {
        // Read the CSV file
        d3.csv("https://raw.githubusercontent.com/BenoitJPage/Datasets/main/StatProfile-2024_data/Management/Third-party-certification/StatProfile_Management_certification_EN.csv")
            .then(function (data) {
                console.log(data);

                // Extract unique values from NAICS column
                let unique = [...new Set(data.map(item => item.Jurisdiction))];
                //unique.unshift('Canada');

                // Get the dropdown element
                let dropdown = d3.select("#area_certified-select");

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
                    d3.selectAll('#area_certified-chart svg').remove()

                    barChart(data, selectedValue)
                });

                var selected = dropdown.property("value")
                barChart(data, selected)
            });

        // function aggregateData(data, attribute) {
        //     const aggregated = d3.rollups(
        //         data,
        //         v => d3.sum(v, d => +d[attribute]),
        //         d => d.Year
        //     );

        //     return aggregated.map(([Year, Area]) => ({ Year, Area }));
        // }

        function barChart(data, Jurisdiction) {
            //if(Jurisdiction!='Canada')
            data = data.filter(d => (d.Jurisdiction == Jurisdiction))
            //data = aggregateData(data, 'Area');

            // Setup SVG dimensions and margins
            const margin = { top: 40, right: 40, bottom: 50, left: 120 },
                width = 1080 - margin.left - margin.right,
                height = 550 - margin.top - margin.bottom;

            const svg = d3.select("#area_certified-chart")  // Append SVG to body or any other container you'd prefer
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
                .domain([0, d3.max(data, d => +d['Area (hectares)'])])
                .range([height, 0]).nice();

            // Define axes
            const xAxis = d3.axisBottom(xScale).ticks(15).tickFormat(d3.format("d")).tickSizeOuter(0);
            const yAxis = d3.axisLeft(yScale);

            // Add axes to SVG
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)

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
                .text("Area (hectares)");


            // Create a div for the tooltip
            const tooltip = d3.select("#tooltip");

            // Add bars
            svg.selectAll(".bar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", d => xScale(+d.Year))
                .attr("y", d => yScale(d['Area (hectares)']))
                .attr("width", xScale.bandwidth())
                .attr("height", d => height - yScale(d['Area (hectares)']))
                .attr("fill", "#335075") // blue color
                .on("mouseover", function () {
                    tooltip.style("display", "block");
                    d3.select(this).attr('fill', '#7D828B'); // gray color
                })
                .on("mousemove", function (event, d) {

                    tooltip
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY - 300}px`)
                        .html(`Year: <b>${d.Year}</b><br>Area: <b>${Number.parseInt( d['Area (hectares)'] ).toLocaleString( 'en-CA' )}</b>`);
                })
                .on("mouseout", function () {
                    tooltip.style("display", "none");
                    d3.select(this).attr('fill', '#335075'); // blue color
                });

        }
      };


      var myChart1;
      // Delay execution until loaded
      document.addEventListener("DOMContentLoaded", function (event) {
        myChart1 = draw_chart1(event);
      });
    })();
