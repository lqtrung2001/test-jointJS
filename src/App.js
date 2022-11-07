
import React, { useState, useEffect } from "react";
import './App.css';
import * as joint from 'jointjs'
import svgPanZoom from 'svg-pan-zoom';
import nextId from "react-id-generator";
import data from './data.js'

function makeLink(parentElementID, childElementID) {
    return new joint.shapes.standard.Link({
        source: { id: parentElementID },
        target: { id: childElementID },
    });
}

function flattenJSON(obj){
    let res = {}, extraKey = '';
    for (let key in obj) {
        if (typeof obj[key] !== 'object') {
            res[extraKey + key] = obj[key];
        } else {
            flattenJSON(obj[key], res, `${extraKey}${key}.`);
        };
    };
    // console.log('res', res);
    return res;
}
var width = 100

const makeCell = (shape, text, id) => {
    width += 250;
    return {
        id: id,
        type: shape,
        position: {
            x: width,
            y: 100
        },
        size: {
            width: 200,
            height: 100
        },
        attrs: {
            body: {
                fill: 'blue',
            },
            label: {
                text,
                fill: 'white'
            }
        }
    }
}
function zoompaper(paper) {
    const panZoom = svgPanZoom(paper.svg, {

        viewportSelector: paper.layers,
        zoomEnabled: true,
        panEnabled: false,
        controlIconsEnabled: true,
        maxZoom: 2,
        minZoom: 0.1,
        onUpdatedCTM: (function () {
            let currentMatrix = paper.matrix();
            return function onUpdatedCTM(matrix) {
                const { a, d, e, f } = matrix;
                const { a: ca, d: cd, e: ce, f: cf } = currentMatrix;
                const translateChanged = (e !== ce || f !== cf)
                if (translateChanged) {
                    paper.trigger('translate', e - ce, f - cf);
                }
                const scaleChanged = (a !== ca || d !== cd);
                if (scaleChanged) {
                    paper.trigger('scale', a, d, e, f);
                }
                currentMatrix = matrix;
            }
        })()
    });


    paper.on('blank:pointerdown', function () {
        panZoom.enablePan();
    });

    paper.on('blank:pointerup', function () {
        panZoom.disablePan();
    });
}

function addToCells(jsonData, cells, links) {

    jsonData.forEach(task => {
        // console.log( 'flattan',flattenJSON(jsonData));
        const cell = makeCell("standard.Rectangle", task.id, task.id);
        cells.push(cell);
        if (task.dependencies) {
            if (task.dependencies.type === "LogicalOperator") {
                // console.log("collected: ", deepDive(task.dependencies.elements, "", cells))
                task.dependencies.id = nextId();
                const operCells = makeCell("standard.Circle", task.dependencies.operator, task.dependencies.id)
                deepDive(task.dependencies.elements, operCells, cells, links);
                cells.push(operCells)
                const link = makeLink(operCells.id, cell.id)
                links.push(link);
            }
        }

    });
    console.log(jsonData)
}

const deepDive = (node, parent, cells, links) => {
    // console.log("node ", node)
    for (const key in node) {

        if (node[key].type === "LogicalOperator") {
            // collector.push(deepDive(node[key].elements))
            // TODO: Ve hinh tron AND/OR
            // console.log("Draw ", node[key])
            node[key].id = nextId()
            const cell = makeCell("standard.Circle", node[key].operator, node[key].id)
            cells.push(cell);
            let link = makeLink(cell.id, parent.id)
            links.push(link);
            // TODO: noi hinh tron   voi parent
            // makeLink(parent, this)
            deepDive(node[key].elements, cell, cells, links)
            // Goi lai ham deepDive voi node = node[key].elements va parent = hinh tron
        } else if (node[key].type === "Task") {
            // console.log("task = ", node[key])
            // collector.push(node[key])
            // TODO: noi task voi parent cua no
            let link = makeLink(node[key].id, parent.id);
            links.push(link);
        }
    }
    // return collector;
}

function App() {
    // var jsonExemple = {"squadName": "Super hero squad","homeTown": "Metro City","formed": 206,"secretBase": "Super tower","active": true,"members": [{"name": "Molecule Man","age": 29,"secretIdentity": "Dan Jukes","powers": ["Radiation resistance","Turning tiny","Radiation blast"]}, {   "name": "Madame Uppercut","age": 39, "secretIdentity": "Jane Wilson", "powers": ["Million tonne punch", "Damage resistance",     "Superhuman reflexes"] },{"name": "Eternal Flame","age": 1000000,   "secretIdentity": "Unknown",      "powers": [        "Immortality",        "Heat Immunity","Inferno","Teleportation","Interdimensional travel"]} ]}
    const jsonData = data;
    var namespace = joint.shapes;
    var cells = [];
    var links = [];
    addToCells(jsonData, cells, links)
    var graph = new joint.dia.Graph({}, { cellNamespace: namespace });
    graph.resetCells([...cells, ...links]);

    // console.log( 'flattan',flattenJSON(jsonExemple));
    // console.log('data',jsonData)

    console.log('cell', cells[0].attrs.label.text)
    useEffect(() => {

        var paper = new joint.dia.Paper({
            el: document.getElementById('myholder'),
            model: graph,
            width: '100%',
            height: '100%',
            gridSize: 20,
            cellViewNamespace: namespace,
        });
        zoompaper(paper);
    });

    return (
        <div id='myholder'>
            <h1>aaaaaaaaaa</h1>

        </div>
    );
}

export default App;
