"use strict";

//all stuff to create globe
const apiUrl = "https://launchlibrary.net/1.4.1/"

const globe = new WorldWind.WorldWindow("globe");

globe.addLayer(new WorldWind.BMNGOneImageLayer());
globe.addLayer(new WorldWind.BMNGLandsatLayer());

var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
var placemarkLayer = new WorldWind.RenderableLayer("Placemark");

var padsAttributes = new WorldWind.PlacemarkAttributes(null);
var padsLayer = new WorldWind.RenderableLayer("Pads");
globe.addLayer(padsLayer);
globe.addLayer(placemarkLayer);
const list = document.getElementById("navbar-ul");

placemarkAttributes.imageOffset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION,
    0.3,
    WorldWind.OFFSET_FRACTION,
    0.0
);

//placemarkAttributes.labelAttributes.color = WorldWind.Color.RED;
placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION,
    0.5,
    WorldWind.OFFSET_FRACTION,
    1.0
);

padsAttributes.imageOffset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION,
    0.3,
    WorldWind.OFFSET_FRACTION,
    0.0
);

padsAttributes.labelAttributes.color = WorldWind.Color.LIGHT_GRAY;
padsAttributes.labelAttributes.offset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION,
    0.5,
    WorldWind.OFFSET_FRACTION,
    1.0
);

let statuses = [{},
    {
        name: "GO for Launch!",
        color: "GREEN"
    },
    {
        name: "NO-GO for Launch",
        color: "RED"
    },
    {
        name: "Launch Success",
        color: "GREEN"
    },
    {
        name: "Launch Failure",
        color: "RED"
    },
    {
        name: "Countdown HOLD",
        color: "MAGENTA"
    },
    {
        name: "In Flight",
        color: "WHITE"
    },
    {
        name: "Partial Failure",
        color: "RED"
    }
];

let layers = [
    // Imagery layers.
    {
        layer: new WorldWind.BMNGLayer(),
        enabled: true
    },
    // Add atmosphere layer on top of base layer.
    {
        layer: new WorldWind.AtmosphereLayer(),
        enabled: true
    }
];

for (var l = 0; l < layers.length; l++) {
    layers[l].layer.enabled = layers[l].enabled;
    globe.addLayer(layers[l].layer);
}

let json;
let geoDatas = [];

$(function () {


    $('#scroll-right').click(function (event) {
        console.log(event);
        event.preventDefault();
        $('#navbar-ul').animate({
            scrollLeft: "+=" + (parseInt($(".navbar__list__item").width()) + 100) + "px"
        }, "slow");
    });
    $('#scroll-left').click(function (event) {
        console.log(event);
        event.preventDefault();
        $('#navbar-ul').animate({
            scrollLeft: "-=" + (parseInt($(".navbar__list__item").width()) + 100) + "px"
        }, "slow");
    });

    $("[name=sliderDate]").attr("max", (new Date()).getFullYear() + 5);
    $("[name=sliderDate]").attr("value", (new Date()).getFullYear());
    $("[name=sliderDate]").change(function () {
        var newval = $(this).val();
        $("#missions-header").html('All Missions from ' + newval);
        fetchData(apiUrl + 'launch/' + newval + '-01-01' + '/' + newval + '-12-31?limit=200', processLaunches);

        $([document.documentElement, document.body]).animate({
            scrollTop: $(".navbar__control").offset().top
        }, "slow");

        $('input[name="daterange"]').datepicker({
            date: new Date(newval + '-01-01')
        })
    });
    //$("[name=sliderDate]").trigger("change");

    $('input[name="daterange"]').daterangepicker({
        opens: 'left'
    }, function (start, end, label) {
        $("#missions-header").html('All Missions from ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
        fetchData(apiUrl + '/launch/' + start.format('YYYY-MM-DD') + '/' + end.format('YYYY-MM-DD'), processLaunches);

        $([document.documentElement, document.body]).animate({
            scrollTop: $(".navbar__control").offset().top
        }, "slow");
    });

  
    $("#missions-header").html('Upcoming Launches:');
    fetchData(apiUrl + '/launch/' + (new Date()).getFullYear() + '-01-01' + '/' + (new Date()).getFullYear() + '-12-31?limit=200&status=1,5,6&sort=desc', processLaunches);
    fetchData(apiUrl + '/pad?limit=200', processPads);
});

// fetch data from api
function fetchData(json, callback) {
    $(list).empty();
    fetch(json)
        .then(response => response.json())
        .then(callback);
}

function fetchYearData(year, callback) {
  fetchData(apiUrl + '/launch/' + year + '-01-01' + '/' + year + '-12-31?limit=200&status=1,5,6&sort=desc', callback);
}

function processPads(data) {
    //console.log(data.pads);
    data.pads.map(pad => createPad(pad));
}

function processLaunches(data) {
    placemarkLayer.removeAllRenderables();

    for (var d in window.countdowns) {
        window.clearInterval(window.countdowns[d]);
    }

    data.launches.reverse().map(launch => createLaunch(launch));

    globe.goTo(new WorldWind.Location(data.launches[0].location.pads[0].latitude, data.launches[0].location.pads[0].longitude));


}

// create pin
function createLaunch(launch) {

    console.log(launch);

    let position = new WorldWind.Position(launch.location.pads[0].latitude, launch.location.pads[0].longitude, 100);

    let item = document.createElement('li');
    item.className = 'navbar__list__item';

    item.innerHTML = "<div class='item__content'><h1 class='launch-name'>" +
        launch.name + "</h1><p class='countdown' id='countdown_" +
        launch.id + "'></p> <p class='date'>" +
        launch.net + "</p><h1>Description</h1><p>" +
        (launch.missions[0] && launch.missions[0].description || "No description provided for this mission.</p>") +
        "<h1>Company</h1><a href='" + (launch.lsp.wikiURL || "") + "' target='_blank'>" +
        (launch.lsp.name || (launch.missions[0] && launch.missions[0].agencies[0] && launch.missions[0].agencies[0].name) || "Unknown") +
        "</a><h1>Launchsite</h1><a href='" + launch.location.pads[0].wikiURL + "' target='_blank'>" +
        launch.location.pads[0].name + "</a><h1>Watch</h1><a href='" + launch.vidURLs[0] + "'>" +
        (launch.vidURLs[0] && launch.vidURLs[0].split("//")[1].split("/")[0] || "No video available") + "</a></div>";

    if (launch.rocket.imageURL === 'https://s3.amazonaws.com/launchlibrary/RocketImages/placeholder_1920.png') {
        item.style.backgroundColor = '#111111';
    } else {
        item.style.backgroundImage = 'linear-gradient(rgba(0,0,0,80), rgba(0,0,0,0)),url(' + launch.rocket.imageURL + ')';
    }

    list.appendChild(item);

    (launch.status == 1 || launch.status == 6) ? Countdown(launch.net, document.querySelector("#countdown_" + launch.id)): $("#countdown_" + launch.id).html(statuses[launch.status].name);

    item.addEventListener("click", function () {
        $("html, body").animate({
            scrollTop: 0
        }, "slow");
        globe.goTo(new WorldWind.Position(launch.location.pads[0].latitude, launch.location.pads[0].longitude));
    });

    //BUG: all launches inherit the color of first launch
    placemarkAttributes.labelAttributes.color = WorldWind.Color[statuses[launch.status].color];

    let placemark = new WorldWind.Placemark(position, undefined, placemarkAttributes);
    placemark.label = launch.name + "\n" + statuses[launch.status].name + "\n" + launch.net;
    placemarkLayer.addRenderable(placemark);
}

//create pads
function createPad(pad) {
    let lat = parseFloat(pad.latitude);
    let long = parseFloat(pad.longitude);

    let position = new WorldWind.Position(lat, long, 100.0);

    let placemark = new WorldWind.Placemark(position, false, padsAttributes);

    placemark.label = pad.name;

    padsLayer.addRenderable(placemark);
}

function Countdown(date, element) {
    let padnumber = function (f, b) {
        var a = f + "";
        while (a.length < b) {
            a = "0" + a;
        }
        return a;
    };
    let count = function (u) {
        var r;
        var a = Date.parse(u);
        var q = new Date();
        var o = Math.floor((a - q) / 1000);
        var s = "L- ";
        if (o <= 0) {
            s = "L+ ";
            o = Math.floor((q - a) / 1000);
        }
        var t = Math.floor(o / 60);
        var p = Math.floor(t / 60);
        var b = Math.floor(p / 24);
        var v = padnumber(o % 60, 2);
        if (o < 60) {
            r = s + v;
        }
        v = padnumber(t % 60, 2) + ":" + v;
        if (t < 60) {
            r = s + v;
        }
        v = padnumber(p % 24, 2) + ":" + v;
        if (p < 24) {
            r = s + v;
        }
        if (b > 1) {
            r = s + b + " days " + v;
        } else {
            if (b == 1) {
                r = s + b + " day " + v;
            }
        }
        return r;
    };
    if (element) {
        let countdown = setInterval(function () {
            (document.getElementById(element) || element).innerHTML = count(date);
        }, 1000);
        (window.countdowns || []).push(countdown);
    }
    return count(date);
}

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
/////////////danger//////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

var margin = {top: 20, right: 20, bottom: 70, left: 40},
    width = 700 - margin.left - margin.right,
    height = 160 - margin.top - margin.bottom;

// Parse the date / time
var parseDate = d3.time.format("%Y-%m").parse;

var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(10);
    // .style("display", "none")
    // .tickFormat(d3.time.format("%Y-%m"));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);

var svg = d3.select(".navbar__control").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "navbar_svg")
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

d3.json("https://morning-beach-99281.herokuapp.com/stats", function(error, data) {
    data = Object.keys(data).map(function (key) { return {"value": data[key], "date": key} });
    console.log(data)
    // var years = Object.keys(data).map(function (key) { return key; });

    // data.forEach(function(d) {
    //     d.date = parseDate(d.date);
    //     d.value = +d.value;
    // });

  
  x.domain(data.map(function(d) { return d.date; }));
  y.domain([0, d3.max(data, function(d) { return d.value; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      // .attr("x", 100)
      .style("fill", "none")
      .call(xAxis)
    .selectAll("text")
      // .style("display", "inherit")
      .style("fill", "#111")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)" );

  // svg.append("g")
  //     .attr("class", "y axis")
  //     .call(yAxis)
  //   .append("text")
  //     .attr("transform", "rotate(-90)")
  //     .attr("y", 6)
  //     .attr("dy", ".71em")
  //     .style("text-anchor", "end")
  //     .text("Value ($)");

  svg.selectAll("bar")
      .data(data)
    .enter().append("rect")
      .style("fill", "#111")
      .attr("x", function(d) { return x(d.date); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); })
      .on("click", function(d) {
        console.log("wybrano mnie", d.date);
        $("#missions-header").html('All Missions from ' + d.date);
        fetchData(apiUrl + '/launch/' + d.date + '-01-01' + '/' + d.date + '-12-31?limit=200', processLaunches);
      })
      .on('mouseover', function(d){
    var nodeSelection = d3.select(this).style({opacity:'0.5'});
    // nodeSelection.select("text").style({opacity:'1.0'});
})  
.on('mouseout', function(d){
    var nodeSelection = d3.select(this).style({opacity:'1'});
    // nodeSelection.select("text").style({opacity:'0.5'});
})  

});