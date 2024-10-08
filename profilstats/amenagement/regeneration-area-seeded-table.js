// Area seeded table
    
    (function () {
      var draw_table2 = function (event) {
        // Load the data from "data.csv"
        d3.csv(
          "https://raw.githubusercontent.com/BenoitJPage/Datasets/main/StatsProfile/Management/Regeneration/After_2000_NFD-Area_of_direct_seeding_by_ownership_and_application_method-EN_FR.csv",
          ).then(function (data) {
            // Get the keys from the data
            var columns = Object.keys(data[0]);
          
            // Create the table header
            var thead = d3.select("#area_seeded-table")
            .append("thead")
            .append("tr")
            .selectAll("th")
            .data(columns)
            .enter()
            .append("th")
            .text(function (column) {
              return column;
            });

            // Create the table rows
            var tbody = d3.select("#area_seeded-table")
            .append("tbody")
            .selectAll("tr")
            .data(data)
            .enter()
            .append("tr");
          
            // Create the table cells
            var cells = tbody.selectAll("td")
            .data(function (row) {
              return columns.map(function (column) {
                return row[column];
              });
            })
            .enter()
            .append("td")
            .text(function (d) {
              return d;
            });
          });
        };
        var mytable2;
        // Delay execution until loaded
        document.addEventListener("DOMContentLoaded", function (event) {
          mytable2 = draw_table2(event);
        });
      })();