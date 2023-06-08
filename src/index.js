import { HomeChart } from './home-chart';
import { Graphic } from './graphic';

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

    // COMENTAR PARA LIFERAY
    // const cuestionarioSeleccionado = 3400;
    // const preguntaSeleccionada = 406338;
    // const variableSeleccionada = 36501;
    // const muestraSeleccionada = 6994;
    // const variableCruce1Seleccionada = 36505;
    // const variableCruce2Seleccionada = null;

    
    const node = document.getElementById(portletElementId);
    node.innerHTML =`<div id="graph_page"></div>`;

    // const url_basse = 'https://webserver-cis-dev.lfr.cloud/o/cis';
    const url_basse = 'http://77.227.0.28:8180/cis/apijds';
    // const call = {type: 'SERIE', details: {}};
    const call = {type: tipo, details: {}};

    let graphic = null;


    let sltVariables = document.getElementById("sltVariables");
    if(sltVariables) {
        sltVariables.addEventListener("change", ()=> {
            console.log('change variable 2',sltVariables.value);
            console.log('details',call.details);
            call.details.id_variable = sltVariables.value;
            if( graphic ) { graphic.refreshData(url_basse, call.type, call.details);}
        });
    }

    let sltCruce1 = document.getElementById("sltCruce1");
    if(sltCruce1) {
        sltCruce1.addEventListener("change", ()=> {
            console.log('change cruce 1',sltCruce1.value);
            console.log('details',call.details);
            call.details.id_cruce1 = sltCruce1.value;
            if( graphic ) { graphic.refreshData(url_basse, call.type, call.details);}
        });
    }

    let sltCruce2 = document.getElementById("sltCruce2");
    if(sltCruce2) {
        sltCruce2.addEventListener("change", ()=> {
            console.log('change cruce 2',sltCruce2.value);
            console.log('details',call.details);
            call.details.id_cruce2 = sltCruce2.value;
            if( graphic ) { graphic.refreshData(url_basse, call.type, call.details);}
        });
    }

    switch (call.type) {
        case 'SERIE':
            call.details = {'id': 16393};
            break;
        case 'PREGUNTA':
            call.details = {
                'id_cuestionario': cuestionarioSeleccionado,
                'id_pregunta': preguntaSeleccionada,
                'id_variable': variableSeleccionada,
                'id_muestra': muestraSeleccionada,
                'id_cruce1': variableCruce1Seleccionada,
                'id_cruce2': variableCruce2Seleccionada
            }
            break;
    }

    // remove null or undefined keys
    Object.keys(call.details).forEach(key => {
        if (call.details[key] == null) {
          delete call.details[key];
        }
    });
   
    switch (call.type) {
        case 'HOME':
            graphic = new HomeChart(url_basse, call.details);
            break;
        default:
            graphic = new Graphic(url_basse, call.type, call.details);
            break;
    }
}