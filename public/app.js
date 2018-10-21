'use strict'

//all staff to create globe
const globe = new WorldWind.WorldWindow("globe");

globe.addLayer(new WorldWind.BMNGOneImageLayer());
globe.addLayer(new WorldWind.BMNGLandsatLayer());

var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
var placemarkLayer = new WorldWind.RenderableLayer("Placemark");

var padsAttributes = new WorldWind.PlacemarkAttributes(null);
var padsLayer = new WorldWind.RenderableLayer("Pads");
globe.addLayer(padsLayer);
globe.addLayer(placemarkLayer);
const list = document.getElementById('navbar-ul');

placemarkAttributes.imageOffset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION, 0.3,
    WorldWind.OFFSET_FRACTION, 0.0);

//placemarkAttributes.labelAttributes.color = WorldWind.Color.RED;
placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION, 0.5,
    WorldWind.OFFSET_FRACTION, 1.0);

padsAttributes.imageOffset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION, 0.3,
    WorldWind.OFFSET_FRACTION, 0.0);

padsAttributes.labelAttributes.color = WorldWind.Color.LIGHT_GRAY;
padsAttributes.labelAttributes.offset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION, 0.5,
    WorldWind.OFFSET_FRACTION, 1.0);


let statuses = [{}, {
    name: "GO",
    color: "WHITE"
}, {
    name: "NO-GO",
    color: "RED"
}, {
    name: "Success",
    color: "GREEN"
}, {
    name: "Failure",
    color: "RED"
}, {
    name: "HOLD",
    color: "MAGENTA"
}, {
    name: "In Flight",
    color: "WHITE"
}, {
    name: "Partial Failure",
    color: "RED"
}];

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

    
    

    $("[name=sliderDate]").change(function () {
        var newval = $(this).val();
        $("#missions-header").html('All Missions from ' + newval);
        fetchData('https://launchlibrary.net/1.4.1/launch/' + newval + '-01-01' + '/' + newval + '-12-31?limit=200', processLaunches);
    });

    $('input[name="daterange"]').daterangepicker({
        opens: 'left'
    }, function (start, end, label) {
        console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
        json = 'https://launchlibrary.net/1.4.1/launch/' + start.format('YYYY-MM-DD') + '/' + end.format('YYYY-MM-DD');
        console.log(json);
        $("#missions-header").html('All Missions from ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
        fetchData(json, processLaunches);
    });

    $("#missions-header").html('All Missions from ' + (new Date()).getFullYear());
    fetchData('https://launchlibrary.net/1.4.1/launch/' + (new Date()).getFullYear() + '-01-01' + '/' + (new Date()).getFullYear() + '-12-31?limit=200&status=1,3,4,5,6,7', processLaunches);
    fetchData('https://launchlibrary.net/1.4.1/pad?limit=200', processPads);

})


// fetch data from api
function fetchData(json, callback) {
    $(list).empty();
    fetch(json)
        .then(response => response.json())
        .then(callback);
}


function processPads(data) {
    //console.log(data.pads);
    data.pads.map(pad => createPad(pad))
}

function processLaunches(data) {
    placemarkLayer.removeAllRenderables();

    for (var d in window.countdowns) {
        window.clearInterval(window.countdowns[d]);
    }


    globe.goTo(new WorldWind.Location(data.launches[0].location.pads[0].latitude, data.launches[0].location.pads[0].longitude));

    data.launches.reverse().map(launch => createLaunch(launch));
}

// create pin
function createLaunch(launch) {

    let position = new WorldWind.Position(launch.location.pads[0].latitude, launch.location.pads[0].longitude, 100);

    let item = document.createElement('li');
    item.className = 'navbar__list__item';

    item.id = launch.id;


    item.innerHTML = "<h1>" + launch.name + "</h1><a id='countdown_" + launch.id + "'></a><div class='description'>" + (launch.missions[0] && launch.missions[0].description || "") + "</a>";
    if (launch.rocket.imageURL === 'https://s3.amazonaws.com/launchlibrary/RocketImages/placeholder_1920.png') {
        item.style.backgroundColor = '#111111';
    } else {
        item.style.backgroundImage = 'linear-gradient(rgba(0,0,0,30), rgba(0,0,0,0)),url(' + launch.rocket.imageURL + ')';
    }
    
    (launch.status == 1 || launch.status == 6) ? Countdown(launch.net, document.querySelector("#countdown_" + launch.id)) : $("#countdown_" + launch.id).html(statuses[launch.status].name);


    console.log(launch);
    list.appendChild(item);

    (launch.status == 1 || launch.status == 6) ? Countdown(launch.net, document.querySelector("#countdown_" + launch.id)) : $("#countdown_" + launch.id).html(statuses[launch.status].name);

    item.addEventListener("click", function () {
        globe.goTo(new WorldWind.Position(launch.location.pads[0].latitude, launch.location.pads[0].longitude));
        // $('.more-info').html('<div class="data-table"><ul><li><h1>Name</h1><p>' + launch.name + '</p></li><li><h1>Description</h1><p>' + launch.description + '</p></li><li><h1>Name</h1><p>' + launch.name + '</p></li></ul></div>')
    });

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
            a = "0" + a
        }
        return a
    };
    let count = function (u) {
        var r;
        var a = Date.parse(u);
        var q = new Date();
        var o = Math.floor((a - q) / 1000);
        var s = "L- ";
        if (o <= 0) {
            s = "L+ ";
            o = Math.floor((q - a) / 1000)
        }
        var t = Math.floor(o / 60);
        var p = Math.floor(t / 60);
        var b = Math.floor(p / 24);
        var v = padnumber((o % 60), 2);
        if (o < 60) {
            r = s + v
        }
        v = padnumber((t % 60), 2) + ":" + v;
        if (t < 60) {
            r = s + v
        }
        v = padnumber((p % 24), 2) + ":" + v;
        if (p < 24) {
            r = s + v
        }
        if (b > 1) {
            r = s + b + " days " + v
        } else {
            if (b == 1) {
                r = s + b + " day " + v
            }
        }
        return r
    };
    if (element) {
        let countdown = setInterval(function () {
            (document.getElementById(element) || element).innerHTML = count(date);
        }, 1000);
        (window.countdowns || []).push(countdown);
    }
    return count(date);
}
