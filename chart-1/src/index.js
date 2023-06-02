import { Graphic } from './graphic';
// import * as data from './mono_var.json';

/**
 * This is the main entry point of the portlet.
 *
 * See https://tinyurl.com/js-ext-portlet-entry-point for the most recent 
 * information on the signature of this function.
 *
 * @param  {Object} params a hash with values of interest to the portlet
 * @return {void}
 */

export default function main({portletNamespace, contextPath, portletElementId,configuration}) {
      
    // console.log('liferay->',Liferay.ThemeDisplay.getPathContext());
    // console.log('attri->',Liferay.Util.getAttributes());
    // console.log('portlet->',Liferay.Portlet);
    // console.log(id);

    // buttonPass = document.getElementById("buttonPass");
    // buttonPass.addEventListener("click", ()=> {
    //    console.log('Dispatch');
    // });
    
    const node = document.getElementById(portletElementId);
    node.innerHTML =`
    <div id="graph_container">
        <div id="graph_table" class="table"></div>
        <button id="but_pie" class="graphic_btn"></button>
        <canvas id="graph_chart"></canvas>
    </div>
    <div>
        <span class="tag">Portlet Namespace:</span>
        <span class="value">${portletNamespace}</span>
    </div>
    <div>
        <span class="tag">Context Path:</span>
        <span class="value">${contextPath}</span>
    </div>
    <div>AB</div>
    <div>
        <span class="tag">Portlet Element Id:</span>
        <span class="value">${portletElementId}</span>
    </div>

    <div>
        <span class="tag">Configuration:</span>
        <span class="value pre">${JSON.stringify(configuration, null, 2)}</span>
    </div>
    `;

    const call = {
        type: '',
        details: {}
    };

    const tipo = 'SERIE';
    //const url_basse = 'https://webserver-cis-dev.lfr.cloud/o/cis';
    const url_basse = 'http://77.227.0.28:8180/cis/apijds';

    if(tipo === 'SERIE'){
        call.type = tipo;
        call.details.id = 16393; // 2976 -> más columnas
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
   
    new Graphic(url_basse, call.type, call.details, null)
}