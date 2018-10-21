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

    fetchData('https://launchlibrary.net/1.4/launch/next/1', processLaunches);
    fetchData('https://launchlibrary.net/1.4/pad?count=200', processPads);

    $("[name=sliderDate]").change(function () {
        placemarkLayer.removeAllRenderables();
        var newval = $(this).val();
        json = 'https://launchlibrary.net/1.4/launch/' + newval + '-01-01' + '/' + newval + '-12-31';
        console.log(json);
        $("#missions-header").html('All Missions from ' + newval);
        fetchData(json, processLaunches);
    });

    $('input[name="daterange"]').daterangepicker({
        opens: 'left'
    }, function (start, end, label) {
        placemarkLayer.removeAllRenderables();
        console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
        json = 'https://launchlibrary.net/1.4/launch/' + start.format('YYYY-MM-DD') + '/' + end.format('YYYY-MM-DD');
        console.log(json);
        $("#missions-header").html('All Missions from ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
        fetchData(json, processLaunches);
    });



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
    globe.goTo(new WorldWind.Location(data.launches[0].location.pads[0].latitude, data.launches[0].location.pads[0].longitude));

    data.launches.map(launch => createPin(launch));
}

// create pin
function createPin(launch) {

    console.log(launch.rocket.imageURL);

    let position = new WorldWind.Position(launch.location.pads[0].latitude, launch.location.pads[0].longitude, 100);

    let item = document.createElement('li');
    item.className = 'navbar__list__item';

    item.id = launch.id;


    item.innerHTML = "<h1>" + launch.name + "</h1><div class='description' style='display: none'>" + (launch.missions[0] && launch.missions[0].description || "") + "</a>";
    if (launch.rocket.imageURL === 'https://s3.amazonaws.com/launchlibrary/RocketImages/placeholder_1920.png') {
        item.style.backgroundColor = '#111111';
    } else {
        item.style.backgroundImage = 'linear-gradient(rgba(0,0,0,30), rgba(0,0,0,0)),url(' + launch.rocket.imageURL + ')';

    }


    console.log(launch);
    list.appendChild(item);

    item.addEventListener("click", function () {
        globe.goTo(new WorldWind.Position(launch.location.pads[0].latitude, launch.location.pads[0].longitude));
        // $('.more-info').html('<div class="data-table"><ul><li><h1>Name</h1><p>' + launch.name + '</p></li><li><h1>Description</h1><p>' + launch.description + '</p></li><li><h1>Name</h1><p>' + launch.name + '</p></li></ul></div>')
    });

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