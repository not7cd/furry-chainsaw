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

placemarkAttributes.labelAttributes.color = WorldWind.Color.RED;
placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION, 0.5,
    WorldWind.OFFSET_FRACTION, 1.0);

padsAttributes.imageOffset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION, 0.3,
    WorldWind.OFFSET_FRACTION, 0.0);

padsAttributes.labelAttributes.color = WorldWind.Color.GREEN;
padsAttributes.labelAttributes.offset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION, 0.5,
    WorldWind.OFFSET_FRACTION, 1.0);


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

    fetchData('https://launchlibrary.net/1.4/pad?count=200', processPads);

    $("[name=sliderDate]").change(function () {
        placemarkLayer.removeAllRenderables();
        var newval = $(this).val();
        json = 'https://launchlibrary.net/1.4/launch/' + newval + '-01-01' + '/' + newval + '-12-31';
        console.log(json);
        fetchData(json, processLaunches);
    });

    $('input[name="daterange"]').daterangepicker({
        opens: 'left'
    }, function (start, end, label) {
        placemarkLayer.removeAllRenderables();
        console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
        json = 'https://launchlibrary.net/1.4/launch/' + start.format('YYYY-MM-DD') + '/' + end.format('YYYY-MM-DD');
        console.log(json);
        fetchData(json, processLaunches);
    });




})


// fetch data from api
function fetchData(json, callback) {
    $(list).empty();
    fetch(json)
        .then(response => response.json())
        .then(callback)
}


function processPads(data) {
    //console.log(data.pads);
    data.pads.map(pad => createPad(pad))
}

function processLaunches(data) {
    globe.goTo(new WorldWind.Location(data.launches[0].location.pads[0].latitude, data.launches[0].location.pads[0].longitude));

    data.launches.map(launch => createPin(launch))
}

// create pin
function createPin(launch) {
    let item = document.createElement('li');
    console.log(launch);
    item.innerHTML = "Mission: " + launch.missions[0].name + "</br>" + launch.missions[0].description;
    list.appendChild(item);

    let position = new WorldWind.Position(launch.location.pads[0].latitude, launch.location.pads[0].longitude, 100.0);

    let placemark = new WorldWind.Placemark(position, false, placemarkAttributes);

    placemark.label = "Start here\n" +
        "Lat " + placemark.position.latitude.toPrecision(4).toString() + "\n" +
        "Lon " + placemark.position.longitude.toPrecision(5).toString();
    placemark.alwaysOnTop = true;

    placemarkLayer.addRenderable(placemark);
    console.log(placemark);

}

//create pads
function createPad(pad) {
    let lat = parseFloat(pad.latitude);
    let long = parseFloat(pad.longitude);

    let position = new WorldWind.Position(lat, long, 100.0);

    let placemark = new WorldWind.Placemark(position, false, padsAttributes);

    placemark.label = "Pad\n" + pad.name;
    placemark.alwaysOnTop = true;

    padsLayer.addRenderable(placemark);
}