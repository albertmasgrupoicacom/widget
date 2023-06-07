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
      
    // console.log('liferay->',Liferay.ThemeDisplay.getPathContext());
    // console.log('attri->',Liferay.Util.getAttributes());
    // console.log('portlet->',Liferay.Portlet);
    // console.log(id);
    // let cuestionarioSeleccionado = 3400
    // let preguntaSeleccionada = 406338
    // let variableSeleccionada = 36501
    // let muestraSeleccionada = 6994
    // let variableCruce1Seleccionada = 36505
    // let variableCruce2Seleccionada =  null;

    let graphic = null;

    let buttonPass = document.getElementById("buttonPass");
    if(buttonPass) {
        buttonPass.addEventListener("click", ()=> {
            if( tipo == 'SERIE') {
                console.log('numSerie',numSerie);
            } else {
                console.log('id_cuestionario', cuestionarioSeleccionado)
                console.log('id_pregunta', preguntaSeleccionada)
                console.log('id_variable', variableSeleccionada)
                console.log('id_muestra', muestraSeleccionada)
                console.log('id_cruce1', variableCruce1Seleccionada)
                console.log('id_cruce2', variableCruce2Seleccionada)
                console.log('tipo',tipo)
            }  
        });
    }

    let sltVariables = document.getElementById("sltVariables");
    if(sltVariables) {
        sltVariables.addEventListener("change", ()=> {
            console.log('change variable 2',sltVariables.value);
            //graphic = new Graphic(url_basse, call.type, call.details);
            this.graphic.refreshData(url_basse, call.type, call.details);
        });
    }
    
    const node = document.getElementById(portletElementId);
    node.innerHTML =`
    <div id="graph_container">
        <div>3</div>
        <div id="graph_table" class="table"></div>
        <canvas id="graph_chart"></canvas>
    </div>
    `;

    //const url_basse = 'https://webserver-cis-dev.lfr.cloud/o/cis';
    const url_basse = 'http://77.227.0.28:8180/cis/apijds';
    // const call = {type: 'PREGUNTA', details: {}};
    const call = {type: tipo, details: {}};

    

    switch (call.type) {
        case 'SERIE':
            call.details = {'id': numSerie};
            break;
        case 'PREGUNTA':
            call.details = {
                // 'id_cuestionario': cuestionarioSeleccionado ? cuestionarioSeleccionado : 3400,
                // 'id_pregunta': preguntaSeleccionada ?  preguntaSeleccionada : 406338,
                // 'id_variable': variableSeleccionada ? variableSeleccionada : 36501,
                // 'id_muestra': muestraSeleccionada ? muestraSeleccionada : 6994,
                // 'id_cruce1': variableCruce1Seleccionada ? variableCruce1Seleccionada : 36505,
                // 'id_cruce2': variableCruce2Seleccionada ? variableCruce2Seleccionada : 36506
                // 'id_cruce2': variableCruce2Seleccionada ? variableCruce2Seleccionada : null
                // 'id_cuestionario':3400,
                // 'id_pregunta': 406338,
                // 'id_variable': 36501,
                // 'id_muestra': 6994,
                // 'id_cruce1': 36505,
                // 'id_cruce2': 36506
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
            this.graphic = new HomeChart(url_basse, call.details);
            break;
        default:
            this.graphic = new Graphic(url_basse, call.type, call.details);
            break;
    }

   

    // document.getElementById('exportBtn').addEventListener('click', () => {
    //     graphic.exportToExcel();
    // });
    
    // document.getElementById('exportBtnPDF').addEventListener('click', () => {
    //     graphic.exportToPDF();
    // });
}