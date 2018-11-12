import esriConfig = require("esri/config");
import EsriMap = require("esri/Map");
import SceneView = require("esri/views/SceneView");
import SimpleRenderer = require("esri/renderers/SimpleRenderer");
import PolygonSymbol3D = require("esri/symbols/PolygonSymbol3D");
import ExtrudeSymbol3DLayer = require("esri/symbols/ExtrudeSymbol3DLayer");
import Legend = require("esri/widgets/Legend");
import FeatureLayer = require("esri/layers/FeatureLayer");
import WebTileLayer = require("esri/layers/WebTileLayer");
import Home = require("esri/widgets/Home");
import Extent = require("esri/geometry/Extent");
import PopupTemplate = require("esri/PopupTemplate");
import dom = require("dojo/dom");
import domClass = require("dojo/dom-class");
import _WidgetBase = require("dijit/_WidgetBase");
import lang = require("dojo/_base/lang");
import on = require("dojo/on");
import CameraStatus = require("./cameraStatus");

class Btw2017 extends _WidgetBase {


    private partycolors: PartyProperties = {
        "afd": [0, 158, 224, 1.0],
        "cducsu": [0, 0, 0, 1.0],
        "fdp": [255, 237, 0, 1.0],
        "spd": [226, 0, 26, 1.0],
        "linke": [227, 6, 19, 1.0],
        "gruene": [31, 175, 18, 1.0]
        }
    private partyname: PartyProperties = {
        "afd":"AfD",
        "cducsu": "CDU/CSU",
        "fdp": "FDP",
        "spd":"SPD",
        "linke": "Die Linke",
        "gruene": "B90/Die Grünen"
        }
    private partymax: PartyProperties = {
        "afd": 36,
        "cducsu": 55,
        "fdp": 20,
        "spd": 38,
        "linke": 30,
        "gruene": 22
        }
    
    constructor(args?: Array<any>) {
        super(lang.mixin({baseClass: "jimu-Btw2017"}, args));

        if (!esriConfig || !esriConfig.request || !esriConfig.request.corsEnabledServers) {
            esriConfig.request.corsEnabledServers = [];
        }
        esriConfig.request.corsEnabledServers.push(
            "a.tile.stamen.com",
            "b.tile.stamen.com",
            "c.tile.stamen.com",
            "d.tile.stamen.com"
          );

        console.log("constructor");
        this.startup();
    }

    startup() {        
        this.initScene();      
    }

    addMenuFunctionality(btwLayer: FeatureLayer) {
        // functionality for nav anchors
        Object.keys(this.partyname).map(name => {
            on(dom.byId(name), "click", () => {
                btwLayer.renderer = this.defineRenderer(name);
                btwLayer.popupTemplate = this.defineInfoTemplate(name);
                this.activateMenuButton(name);
            });
        });
        // functionality for select options
        on(dom.byId("selectParty"), "change", (evt: any) => {
            console.log("selectParty", evt, evt.srcElement.selectedOptions[0].value);
            if (evt && evt.srcElement && evt.srcElement.selectedOptions && evt.srcElement.selectedOptions[0]) {
                btwLayer.renderer = this.defineRenderer(evt.srcElement.selectedOptions[0].value);
                btwLayer.popupTemplate = this.defineInfoTemplate(evt.srcElement.selectedOptions[0].value);
            }
        });
    }

    activateMenuButton(activate: string) {
        this.deactivateAllMenuItemsBut([activate]);
        domClass.add(dom.byId(activate), "is-active");
    }

    deactivateAllMenuItemsBut(dontDeactivate: string[]) {
        Object.keys(this.partyname).map(name => {
            if (dontDeactivate.indexOf(name) === -1) {
                domClass.remove(dom.byId(name), "is-active");
            }
        });
    }

    initScene() {
        console.log("initScene");

        var btwLayer: FeatureLayer = this.createBtwLayer();
        this.addMenuFunctionality(btwLayer);

        var esrimap: EsriMap = this.createMap(btwLayer);

        // The clipping extent for the scene
        let btwExtent = { // autocasts as new Extent()
            xmin: 653028.001899999,
            ymin: 5986277.1178,
            xmax: 1674447.2595,
            ymax: 7373205.4343,
            spatialReference: { // autocasts as new SpatialReference()
                wkid: 102100
            }
        } as Extent;   // TS definitions don't support Extent autocast in ArcGIS JS 4.5 yet

        var sceneView = this.createSceneView(esrimap, btwExtent);

        sceneView.when(function() {
            var legend = new Legend({
                view: sceneView,
                layerInfos: [{
                layer: btwLayer,
                title: "Ergebnis pro Partei"
                }]
            });
            sceneView.ui.add(legend, "bottom-right");
    
            var cameraStatus = new CameraStatus({
                sceneView: sceneView
            });
            sceneView.ui.add(cameraStatus, "bottom-left");

        });
    }

    defineInfoTemplate(party: string): PopupTemplate {
        var arcadeExpressionInfos = [
            {
            name: "gains-losses-arcade",
            title: "Gewinne und Verluste der " + this.partyname[party] + " in diesem Wahlkreis",
            expression: "($feature.btw17_WKR_" + party + "_zweit - $feature.btw17_WKR_" + party + "_zweit13)"
            },
            {
            name: "gains-losses-%-arcade",
            title: "Gewinne und Verluste der " + this.partyname[party] + " in diesem Wahlkreis (%)",
            expression: "($feature.btw17_WKR_" + party + "_zweit - $feature.btw17_WKR_" + party + "_zweit13) / $feature.btw17_WKR_" + party + "_zweit13 *100"
            }
        ];

        var infoTemplate = new PopupTemplate({
            title: "{Wahlkreise17_Wahlkreise17_WKR_1}, {Wahlkreise17_Wahlkreise17_LAND_}",
            fieldInfos: [{
            fieldName: "btw17_WKR_W17_zweit_vor",
            label: "Zeitstimmen gesamt 2017",
            format: {
                digitSeparator: true,
                places: 0
            }
            },  {
            fieldName: "btw17_WKR_W13_zweit",
            label: "Zeitstimmen gesamt 2013",
            format: {
                digitSeparator: true,
                places: 0
            }
            }, {
                fieldName: "btw17_WKR_" + party + "_zweit",
                label: "Zeitstimmen der " + this.partyname[party] + " 2017",
                format: {
                    digitSeparator: true,
                    places: 0
                }
                },  {
                fieldName: "btw17_WKR_" + party + "_zweit13",
                label: "Zeitstimmen der " + this.partyname[party] + " 2013",
                format: {
                    digitSeparator: true,
                    places: 0
                }
            }, {
            fieldName: "expression/gains-losses-arcade",
            format: {
                digitSeparator: true,
                places: 0
            }
            }, {
                fieldName: "expression/gains-losses-%-arcade",
                format: {
                    digitSeparator: true,
                    places: 0
                }
                }],
            expressionInfos: arcadeExpressionInfos,
            content: [{
                // It is also possible to set the fieldInfos outside of the content
                // directly in the popupTemplate. If no fieldInfos is specifically set
                // in the content, it defaults to whatever may be set within the popupTemplate.
                type: "fields"
            }]
        });

        return infoTemplate;
    }

    createBtwLayer() {
        var party = "cducsu";

        var btwLayer: FeatureLayer = new FeatureLayer({
            //url: "https://services.arcgis.com/OLiydejKCZTGhvWg/arcgis/rest/services/Wahlkreise_2017_amtlichesErgebnis/FeatureServer/0",
            url: "https://services2.arcgis.com/jUpNdisbWqRpMo35/arcgis/rest/services/Wahlkreise_2017_amtlichesErgebnis/FeatureServer/0",
            renderer: this.defineRenderer(party),
            popupTemplate: this.defineInfoTemplate(party),
            outFields: ["*"],
        });


        // Define elevationInfo and set it on the layer
        var currentElevationInfo = {
            mode: "relative-to-ground",
            offset: 1500,
            featureExpressionInfo: {
            expression: "Geometry($feature).z * 10"
            },
            unit: "meters"
        };

        btwLayer.elevationInfo = currentElevationInfo;

        return btwLayer;
    }

    createMap(btwLayer: FeatureLayer) {
        var esrimap = new EsriMap({
/*             basemap: "streets", */
            // ground: "world-elevation",
            layers: [btwLayer]
        });

        var tiledLayer = new WebTileLayer({
            urlTemplate:
              "http://{subDomain}.tile.stamen.com/toner/{level}/{col}/{row}.png",
            subDomains: ["a", "b", "c", "d"],
            copyright:
              'Map tiles by <a href="http://stamen.com/">Stamen Design</a>, ' +
              'under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. ' +
              'Data by <a href="http://openstreetmap.org/">OpenStreetMap</a>, ' +
              'under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
          });
        
          esrimap.add(tiledLayer);

        return esrimap;
    }

    createSceneView(esrimap: EsriMap, btwExtent: Extent) {
        var sceneViewProperties: __esri.SceneViewProperties = {
            container: "viewDiv",
            map: esrimap,
            // Indicates to create a local scene
            viewingMode: "local",
            // Use the exent defined in clippingArea to define the bounds of the scene
            clippingArea: btwExtent,
            extent: btwExtent,
            // Allows for navigating the camera below the surface
            constraints: {
            collision: {
                enabled: false
            },
            tilt: {
                max: 179.99
            }
            },
            camera: {
                position: {
                    latitude: 39.22,
                    longitude: 10.12,
                    z: -762850.07,
                    spatialReference: {wkid: 3857}
                },
                heading: 0.0,
                tilt: 115.84
            },
            environment: {
                atmosphere: {
                    quality: "high"
                },
                starsEnabled: true
            }
        };

        return new SceneView(sceneViewProperties);
    }
            
    postCreate() {
        console.log("postCreate");
    }
    
    defineRenderer(party: string) {
        var vvSize = {
        type: "size",
        valueExpression: "($feature.btw17_WKR_" + party + "_zweit - $feature.btw17_WKR_" + party + "_zweit13) / $feature.btw17_WKR_" + party + "_zweit13 *100", //Arcade Expression
        valueExpressionTitle: "Gewinn/Verlust",
        stops: [
        {
            value: -150,
            size: -200000,
            label: "-150%"
        },
        {
            value: 150,
            size: 200000,
            label: "+150%"
        }]
        };

        var vvColor = {
            type: "color",
            field: "btw17_WKR_" + party + "_zweitp",
            legendOptions: {
                title: this.partyname[party]
            },
            stops: [
            {
                value: 0,
                color: [255, 255, 255, 0.6],
                label: "0%"
            },
            {
                value: this.partymax[party],
                color: this.partycolors[party],
                label: this.partymax[party]+"%"
            }]
            };

            var renderer = new SimpleRenderer({
            symbol: new PolygonSymbol3D({
            symbolLayers: [new ExtrudeSymbol3DLayer()]
            }),
            visualVariables: [vvSize, vvColor]
        });
        return renderer;
    }
}

interface PartyProperties {
    [propName: string]: string | number | number[];
}


