// Logging table

(function () {
  var draw_table1 = function (event) {
    // Load the data from "data.csv"
    d3.csv(
      "https://raw.githubusercontent.com/BenoitJPage/Datasets/main/StatProfile-2024_data/Economy/StatProfile_Economy_revenue_logging_EN.csv",
      ).then(function (data) {
        // Get the keys from the data
        var columns = Object.keys(data[0]);
        
        // Create the table header
        var thead = d3.select("#logging-table")
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
        var tbody = d3.select("#logging-table")
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
    var mytable1;
    // Delay execution until loaded
    document.addEventListener("DOMContentLoaded", function (event) {
      mytable1 = draw_table1(event);
    });
  })();
