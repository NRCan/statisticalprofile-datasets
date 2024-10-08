//Area of defoliation by insect species chart 

(function insectDefoliation_Chart() {

    var draw_chart = function (event) {

      var data;
      var margin = { top: 80, right: 5, bottom: 0, left: 80 },
        width = 500 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;
      var svg = {}

      var xScale = d3.scaleBand().range([0, width]).padding(0.4),
        yScale = d3.scaleLinear().range([height, 0]);

      // const speciesList = ["Spruce beetle", "Spruce budworm", "Jack pine budworm", "Balsam fir sawfly",
      //   "Forest tent caterpillar", "Mountain pine beetle", "Western spruce budworm", "Spongy moth"];
      d3.csv("https://raw.githubusercontent.com/BenoitJPage/Datasets/main/StatProfile-2024_data/Disturbance/StatProfile_Disturbance_InsectSpp_EN.csv").then(function (dataset) {
        data = dataset;

        // Assuming `data` is the updated data
        var allGroup = new Set(data.map(d => d.Jurisdiction))
        allGroup = Array.from(allGroup); // Convert the Set to an Array
        //allGroup.unshift("Canada"); // Add 'Canada' to the beginning of the array

        // add the options to the button
        d3.select("#selectButton")
          .selectAll('myOptions')
          .data(allGroup)
          .enter()
          .append('option')
          .text(function (d) { return d; }) // text showed in the menu
          .attr("value", function (d) { return d; })

        createSVGs(data, 'Canada')

        d3.select("#selectButton").on("change", function () {
          var selectedJurisdiction = d3.select(this).property("value");
          createSVGs(data, selectedJurisdiction)
        });
      })
      function createSVGs(data, jurisdiction) {
        if (jurisdiction != 'Canada') {
          JurisdictionData = data.filter(d => d.Jurisdiction == jurisdiction && d['Defoliated area (hectares)'] != 0)
        }
        else {
          JurisdictionData = data.filter(d => d['Defoliated area (hectares)'] != 0)
        }
        const species = new Set(JurisdictionData.map(d => d['Insect species']));
        const speciesArray = [...species];

        // REMOVE 'Other' from the Insect species
        filteredSpeciesArray = speciesArray.filter( function( el ) {
          return !'Other'.includes( el );
        } );
        console.log(filteredSpeciesArray);

        d3.selectAll('.chart-container svg, .chart-container h2').remove();
        svg = {};

        filteredSpeciesArray.forEach((d, i) => {
          var g = d3.select(".chart-container")
            .append( "h2" )
            .append("svg")
            .attr("role", "img")
            .attr( "aria-label", "Insect defoliation by species charts - Data table in following section" )
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          g.append("text")
            .attr("x", -80)
            .attr("y", -50)
            .attr("text-anchor", "start")
            .text(d);

          svg[d] = g;

          g.append("g").attr("transform", "translate(0," + height + ")").attr("class", "x-axis");
          
          g.append("g").attr("transform", "translate(0," + height + ")").append("text")
            .attr("x", width / 2)
            .attr("y", + 40)
            .attr("text-anchor", "middle")
            .attr("font-size", "13px")
            .text("Year");
          
          g.append("g").attr("class", "y-axis");  
          
          g.append("g").append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x", - height / 2)
            .attr("dy", "-5.4em")
            .attr('text-anchor', 'middle')
            .attr("font-size", "13px")
            .text('Area (hectares)');
        });
        filteredSpeciesArray.forEach((d, i) => {
          createBarChart(data, d, jurisdiction, i)
        })
      }
      // function aggregateData(data, specie) {
      //   return Array.from(
      //     d3.rollup(
      //       data.filter((d) => d['Insect species'] == specie),
      //       (v) => d3.sum(v, (d) => +d['Defoliated area (hectares)']),
      //       (d) => d.Year
      //     ),
      //     ([Year, Area]) => ({ Year, Area })
      //   );
      // }

      function createBarChart(data, specie, selectedJurisdiction, index) {
        const colors = ["#335075", "#03662A"]; // blue color , green color
        var color;
        if (index % 4 === 0) {
          color = "#335075"; // blue color
        } else if (index % 4 === 1 || index % 4 === 2) {
          color = "#03662A"; // green color
        } else {
          color = "#335075"; // blue color
        }

        var filteredData = data.filter(function (d) { return d['Insect species'] == specie });
        // if (selectedJurisdiction != 'Canada') {
          filteredData = filteredData.filter(function (d) { return d.Jurisdiction == selectedJurisdiction; });
        // }
        // else {
        //   // Aggregate the data by year for the "Canada" selection
        //   filteredData = aggregateData(data, specie);
        // }
        xScale.domain(data.map(function (d) { return d.Year; }));
        yScale.domain([0, d3.max(filteredData, function (d) { return +d['Defoliated area (hectares)']; })]).nice();

        // Select and update the x-axis
        svg[specie].select(".x-axis")
          .transition()
          .duration(500)
          .call(d3.axisBottom(xScale).tickSizeOuter(0));

        // Select and update the y-axis
        svg[specie].select(".y-axis")
          .transition()
          .duration(500)
          .call(d3.axisLeft(yScale).ticks(10));

        // Select the existing bars and bind the updated data
        const bars = svg[specie].selectAll(".bar")
          .data(filteredData, function (d) { return d.Year; }); // Key function here

        // Update the attributes of the existing bars
        bars.attr("y", function (d) { return yScale(+d['Defoliated area (hectares)']); })
          .attr("height", function (d) { return height - yScale(+d['Defoliated area (hectares)']); });

        // Enter selection (new bars)
        bars.enter().append("rect")
          .attr("class", "bar")
          .attr("height", function (d) { return 0; }) // Start height at 0 for the enter transition
          .attr('fill', color)
          .merge(bars) // Combine with the update selection
          .on("mousemove", onMouseOver)
          .on("mouseout", onMouseOut)
          // .transition()
          // .ease(d3.easeLinear)
          // .duration(500)
          //.delay(function (d, i) { return i * 50 })
          .attr("x", function (d) { return xScale(d.Year); })
          .attr("y", function (d) { return yScale(+d['Defoliated area (hectares)']); })
          .attr("width", xScale.bandwidth())
          .attr("height", function (d) { return height - yScale(+d['Defoliated area (hectares)']); });

        bars.exit().remove();

        function onMouseOver(event, d) { 
          d3.select('#tooltip')
            .style('left', (event.pageX + 10) + 'px') 
            .style('top', (event.pageY - 300) + 'px') 
            .html(`Year: <b>${d.Year}</b><br>Area: <b>${Number.parseInt( d['Defoliated area (hectares)'] ).toLocaleString( 'en-CA' )}</b>`);

          d3.select('#tooltip').classed('hidden', false);
          d3.select(this).attr('class', 'highlight');
        }

        // Mouseout event handler
        function onMouseOut(event, d) {
          d3.select(this).attr('class', 'bar')
          d3.select('#tooltip').classed('hidden', true);
        }

      }

    }

    var myChart;
    // Delay execution until loaded
    document.addEventListener("DOMContentLoaded", function (event) { myChart = draw_chart(event); });

  })();