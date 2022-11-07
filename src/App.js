
import React, { useState, useEffect } from "react";
import './App.css';
import * as joint from 'jointjs'
import svgPanZoom from 'svg-pan-zoom';
import nextId from "react-id-generator";
import data from './data.js'

function makeLink(parentElement, childElement) {
    return new joint.shapes.standard.Link({
        source: { id: parentElement.id },
        target: { id: childElement.id },
    });
}


function checkCondition(text) {
    var circleTemp = {
        id: nextId(),
        type: 'standard.Circle',
        position: {
            x: 100,
            y: 100
        },
        size: {
            width: 200,
            height: 100
        },
        attrs: {
            body: {
                fill: 'red',
            },
            label: {
                text: text,
                fill: 'white'
            }
        }
    }

}

var width = 100

const makeCell = (shape, text) => {
    width += 50;
    return {
        id: nextId(),
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

function addToCells(jsonData, cells) {
    jsonData.forEach(task => {
        
        if (task.dependencies) {
            // console.log("caoooo", Object.keys(a.dependencies)[1] );
            if (task.dependencies.type === "LogicalOperator") {
                // console.log("collected: ", deepDive(task.dependencies.elements, "", cells))
                deepDive(task.dependencies.elements, "", cells)
                task.dependencies.id = nextId()
                cells.push(makeCell("standard.Circle", task.dependencies.operator))
            }
        }
        cells.push(makeCell("standard.Rectangle", task.id));
    }
    )
    console.log(jsonData)
}

const deepDive = (node, parent, cells) => {
    // const collector = []
    // console.log("node ", node)
    for (const key in node) {
        console.log("loop to key ", node[key])
        if (node[key].type === "LogicalOperator") {
            // collector.push(deepDive(node[key].elements))
            // TODO: Ve hinh tron AND/OR
            console.log("Draw ", node[key])
            node[key].id = nextId()
            cells.push(makeCell("standard.Circle", node[key].operator))
            // TODO: noi hinh tron voi parent

            // Goi lai ham deepDive voi node = node[key].elements va parent = hinh tron
        } else if (node[key].type === "Task") {
            // console.log("task = ", node[key])
            // collector.push(node[key])
            // TODO: noi task voi parent cua no

        }
    }
    // return collector;
}

function App() {
    
    const jsonData = data;
    console.log(jsonData);
    var namespace = joint.shapes;
    var cells = []
    addToCells(jsonData, cells)
    var graph = new joint.dia.Graph({}, { cellNamespace: namespace });
    graph.resetCells(cells);

    useEffect(() => {

        var paper = new joint.dia.Paper({
            el: document.getElementById('myholder'),
            model: graph,
            width: '100%',
            height: '100%',
            gridSize: 20,
            cellViewNamespace: namespace,

        });
    });

    return (
        <div id='myholder'>
            <h1>aaaaaaaaaa</h1>
    
        </div>
    );

}

export default App;
