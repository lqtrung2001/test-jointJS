
import React, { useState, useEffect } from "react";
import './App.css';
import * as joint from 'jointjs'
import svgPanZoom from 'svg-pan-zoom';
import nextId from "react-id-generator";
import data from './data.js'

var width = 2000;
var x = 0;

function makeLink(parentElementID, childElementID) {
    return new joint.shapes.standard.Link({
        source: { id: parentElementID },
        target: { id: childElementID },
    });
}

const makeCell = (shape, text, id) => {
    return {
        id: id,
        type: shape,
        position: {
            x: width,
            y: 0
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
        let cell = makeCell("standard.Rectangle", task.id, task.id);
        cells.push(cell);
        if (task.dependencies) {
            if (task.dependencies.type === "LogicalOperator") {
                // console.log("collected: ", deepDive(task.dependencies.elements, "", cells))
                task.dependencies.id = nextId();

                // node OR
                let operCells = makeCell("standard.Circle", task.dependencies.operator, task.dependencies.id)
                cells.push(operCells)

                deepDive(task.dependencies.elements, operCells, cells, links);

                let link = makeLink(operCells.id, cell.id)
                links.push(link);
            }
        }

    });
    // console.log(jsonData)
}

const deepDive = (node, parent, cells, links) => {
    // console.log("node ", node)
    for (let key in node) {
        if (node[key].type === "LogicalOperator") {
            // collector.push(deepDive(node[key].elements))
            // TODO: Ve hinh tron AND/OR
            // console.log("Draw ", node[key])
            node[key].id = nextId()
            let cell = makeCell("standard.Circle", node[key].operator, node[key].id)
            cells.push(cell);
            let link = makeLink(cell.id, parent.id)
            links.push(link);
            // TODO: noi hinh tron   voi parent
            deepDive(node[key].elements, cell, cells, links)
            // Goi lai ham deepDive voi node = node[key].elements va parent = hinh tron
        } else if (node[key].type === "Task") {
            // console.log("task = ", node[key])
            // TODO: noi task voi parent cua no
            let link = makeLink(node[key].id, parent.id);
            links.push(link);
        }
    }
}

function setYforMapCells(mapCells) {
    for (let i = 0; i < mapCells.length; i++) {
        let tem = 1;
        for (let j = i + 1; j < mapCells.length; j++) {

            if (mapCells[i].y == 0 && mapCells[j].x == mapCells[i].x) {
                // console.log(" mapCells[i].y " + mapCells[i].y + " mapCells[j].x " + mapCells[j].x + " mapCells[i].x " +mapCells[i].x)
                mapCells[j].y = tem++;
            }
        }
    }
}

function addToMapCells(jsonData, mapCells) {
    jsonData.forEach(task => {
        if (task.dependencies) {
            if (task.dependencies.type === "LogicalOperator") {
                let mapCellIndexOper = mapCells.findIndex((mapCell => mapCell.cell.id == task.dependencies.id));
                let mapCellOper = mapCells[mapCellIndexOper];
                // console.log('map cell index Oper', mapCellIndexOper);
                if (mapCellOper.x === 0 && mapCellOper.y === 0) mapCellOper.x = ++x;
                const operCells = makeCell("standard.Circle", task.dependencies.operator, task.dependencies.id)
                deepDiveMapCells(task.dependencies.elements, mapCells);
            }
        }
    });
}
const deepDiveMapCells = (node,  mapCells) => {
    let flag = 0;
    x++;
    for (const key in node) {
        let mapCellIndexOper = mapCells.findIndex((mapCell => mapCell.cell.id == node[key].id));
        let mapCellOper = mapCells[mapCellIndexOper];
        if (node[key].type === "LogicalOperator") {
            flag = 1;
            if (mapCellOper.x === 0 && mapCellOper.y === 0) {
                mapCellOper.x = x;
            }
            const cell = makeCell("standard.Circle", node[key].operator, node[key].id)
            deepDiveMapCells(node[key].elements, mapCells)
        } else if (node[key].type === "Task") {
            if (flag) {
                flag = 0;
                x--;
            }
            mapCellOper.x = x;
        }
    }
}
function setPosition(cells, mapCells) {
    cells.forEach((cell, index) => {
        cell.position = { x: cell.position.x - mapCells[index].x * 350, y: cell.position.y + mapCells[index].y * 250 }
    })
}
function putCellsToMapCells (cells, mapCells) {
    cells.forEach(cell => {
        mapCells.push({ cell, x: 0, y: 0 });
    })
}
function App() {
    const jsonData = data;
    var namespace = joint.shapes;
    var cells = [];
    var links = [];
    const mapCells = []
    

    addToCells(jsonData, cells, links, mapCells)
    putCellsToMapCells(cells, mapCells)
    addToMapCells(jsonData, mapCells)
    setYforMapCells(mapCells)
    setPosition(cells, mapCells);
    
    console.log('data', cells)
    console.log('data map', mapCells)

    var graph = new joint.dia.Graph({}, { cellNamespace: namespace });
    graph.resetCells([...cells, ...links]);


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

    }, []);

    return (
        <div id='myholder'>
            <h1>aaaaaaaaaa</h1>
        </div>
    );
}

export default App;
