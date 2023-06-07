import { HomeChart } from './home-chart';
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
    
    const node = document.getElementById(portletElementId);
    node.innerHTML =`<div id="graph_page"></div>`;

    //const url_basse = 'https://webserver-cis-dev.lfr.cloud/o/cis';
    const url_basse = 'http://77.227.0.28:8180/cis/apijds';
    const call = {type: 'SERIE', details: {}};

    let graphic = null;

    switch (call.type) {
        case 'SERIE':
            call.details = {'id': 16393};
            break;
        case 'PREGUNTA':
            call.details = {
                'id_cuestionario': 3400,
                'id_pregunta': 406338,
                'id_variable': 36501,
                'id_muestra': 6994,
                'id_cruce1': 36505,
                //'id_cruce2': 36506
            }
            break;
    }
   
    switch (call.type) {
        case 'HOME':
            graphic = new HomeChart(url_basse, call.details);
            break;
        default:
            graphic = new Graphic(url_basse, call.type, call.details);
            break;
    }

    // document.getElementById('exportBtn').addEventListener('click', () => {
    //     graphic.exportToExcel();
    // });
    
    // document.getElementById('exportBtnPDF').addEventListener('click', () => {
    //     graphic.exportToPDF();
    // });
}