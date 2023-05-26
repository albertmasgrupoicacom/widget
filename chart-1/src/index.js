import { Graphic } from './graphic';
// import * as data from './mono_var.json';
export default function main({portletNamespace, contextPath, portletElementId}) {
      
    
    const node = document.getElementById(portletElementId);
    node.innerHTML =`
    <div id="graph_container">
        <div id="graph_table"></div>
        <canvas id="graph_chart"></canvas>
    </div>
    `;
    // new Graphic(data.default, 2776)

    const call = {
        type: '',
        details: {}
    };

    const tipo = 'SERIE';
    const url_basse = 'http://77.227.0.28:8180/cis/apijds';

    if(tipo === 'SERIE'){
        call.type = tipo;
        call.details.id = 2976;
    }
    else if ( tipo === 'PREGUNTA'){
        call.type = tipo;
        call.details = {
            'id_cuestionario': 3400,
            'id_pregunta': 406338, // ?
            'id_variable': 36501,
            'id_muestra': 6994,
            'id_cruce1': 36505,
            // 'id_cruce2': 36506
        }
    }
   
    new Graphic(url_basse,call.type,call.details)
}