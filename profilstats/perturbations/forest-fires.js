//Area burned and number of fires chart 

(function (){
    
    var draw_chart = function(event) {
        d3.csv("https://raw.githubusercontent.com/BenoitJPage/Datasets/main/StatProfile-2024_data/Disturbance/StatProfile_Disturbance_Fires_EN.csv")
            .then(function (data) {
                console.log(data);

                // Extract unique values from NAICS column
                let unique = [...new Set(data.map(item => item.Jurisdiction))];
                //unique.unshift('Canada');

                // Get the dropdown element
                let dropdown = d3.select("#dropdown");

                // Append unique values as options
                dropdown.selectAll("option.data-option")
                    .data(unique)
                    .enter()
                    .append("option")
                    .classed("data-option", true)  // add a class for later reference
                    .text(d => d)
                    .attr("value", d => d);
                    //.property("selected", d => d === 'Canada');

                // On change event for dropdown
                dropdown.on("change", function () {
                    let selectedValue = d3.select(this).property("value");
                    d3.selectAll('#charts svg, #charts h2').remove()

                    barChart(data, selectedValue)
                    lineChart(data, selectedValue)
                });

                console.log(dropdown)
                var selected = dropdown.property("value")
                barChart(data, selected)
                lineChart(data, selected)

            });

        function aggregateData(data, attribute) {
            const aggregated = d3.rollups(
                data,
                v => d3.sum(v, d => +d[attribute]),
                d => d.Year
            );

            return aggregated.map(([Year, Number]) => ({ Year, Number }));
        }

        function barChart(data, Jurisdiction) {
            if (Jurisdiction != 'Canada')
                data = data.filter(d => (d.Jurisdiction == Jurisdiction))
            data = aggregateData(data, 'Area (hectares)');

            // Setup SVG dimensions and margins
            const margin = { top: 70, right: 40, bottom: 61.5, left: 120 },
                width = 1080 - margin.left - margin.right,
                height = 550 - margin.top - margin.bottom;

                const svg = d3.select("#charts")
                .append( "h2" )
				.text( "Forest area burned in Canada" )
				.append("svg")
				.attr("role", "img")
				.attr( "aria-label", "Forest area burned in Canada chart - Data table in following section" )
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
                .domain([0, d3.max(data, d => +d['Number'])])
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
                .text("Area burned (hectares)");


            // Create a div for the tooltip
            const tooltip = d3.select("#tooltip");

            // Add bars
            svg.selectAll(".bar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", d => xScale(+d.Year))
                .attr("y", d => yScale(d['Number']))
                .attr("width", xScale.bandwidth())
                .attr("height", d => height - yScale(d['Number']))
                .attr("fill", "#335075") // blue color
                .on("mouseover", function () {
                    tooltip.style("display", "block");
                    d3.select(this).attr('fill', '#7D828B'); // gray color
                })
                .on("mousemove", function (event, d) {

                    tooltip
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY - 300}px`)
                        .html(`Year: <b>${d.Year}</b><br>Area burned: <b>${Number.parseInt( d['Number'] ).toLocaleString( 'en-CA' )}</b>`);
                })
                .on("mouseout", function () {
                    tooltip.style("display", "none");
                    d3.select(this).attr('fill', '#335075'); // blue color
                });

        }


        function lineChart(data, Jurisdiction) {
            if (Jurisdiction != 'Canada')
                data = data.filter(d => (d.Jurisdiction == Jurisdiction))
            data = aggregateData(data, 'Number');

            // Setup SVG dimensions and margins
            const margin = { top: 70, right: 40, bottom: 61.5, left: 120 },
                width = 1080 - margin.left - margin.right,
                height = 550 - margin.top - margin.bottom;

                const svg = d3.select("#charts")
                .append( "h2" )
				.text( "Number of forest fires in Canada" )
				.append("svg")
				.attr("role", "img")
				.attr( "aria-label", "Number of forest fires in Canada chart - Data table in following section" )
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
                .domain([0, d3.max(data, d => +d['Number'])])
                .range([height, 0]).nice();

            // Define axes
            const xAxis = d3.axisBottom(xScale).ticks(20).tickFormat(d3.format("d")).tickSizeOuter(0);
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
                .text("Number of fires");

            // Line generator
            const line = d3.line()
                .x(d => xScale(+d.Year))
                .y(d => yScale(+d['Number']));

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
                        .attr("cy", yScale(+d['Number']));

                    tooltip
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY - 300}px`)
                        .html(`Year: <b>${d.Year}</b><br>Number of fires: <b>${Number.parseInt( d['Number'] ).toLocaleString( 'en-CA' )}</b>`);
                })
                .on("mouseout", function () {
                    tooltip.style("display", "none");
                    tooltipCircle.style("display", "none");
                });

            
        }
  
    }
  
    var myChart;
    // Delay execution until loaded
    document.addEventListener("DOMContentLoaded", function(event){ myChart = draw_chart(event); 
    });
  
})();
