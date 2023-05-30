import { Graphic } from './graphic';
// import * as data from './mono_var.json';
export default function main({portletNamespace, contextPath, portletElementId}) {
      
    
    const node = document.getElementById(portletElementId);
    node.innerHTML =`
    <div id="graph_container">
        <div id="graph_table"></div>
        <button id="but_pie" class="btn"></button>
        <canvas id="graph_chart"></canvas>
    </div>
    `;
    // new Graphic(data.default, 2776)

    const call = {
        type: '',
        details: {}
    };

    const tipo = 'SERIE';
    // https://webserver-cis-dev.lfr.cloud/o/cis
    // Basic Y3VzdG9tZXI6eUkyc0ZxRnh0UkxKNVZOUWVYRnpmMXA4R1dNTDZZ
    const url_basse = 'http://77.227.0.28:8180/cis/apijds';

    if(tipo === 'SERIE'){
        call.type = tipo;
        call.details.id = 2976;
        // call.details.id = 16393; // más columnas
    }
    else if ( tipo === 'PREGUNTA'){
        call.type = tipo;
        call.details = {
            'id_cuestionario': 3400,
            'id_pregunta': 406338, // ?
            'id_variable': 36501,
            'id_muestra': 6994,
            'id_cruce1': 36505,
            'id_cruce2': 36506
        }
    }
   
    new Graphic(url_basse,call.type,call.details,null)
}