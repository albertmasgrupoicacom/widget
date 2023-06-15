const tipo = 'SERIE';
const numSerie = 16393;
const codEstudio = 14706;
const cuestionarioSeleccionado = 17738; // 3400;
const preguntaSeleccionada = 634460; //406338;
const muestraSeleccionada = null; //6994;
const variableSeleccionada = 993194; //36501; // 993172
const variableCruce1Seleccionada = 993172; //36505;
const variableCruce2Seleccionada = null; //993301;

export class DataService {

    getType(){
        return tipo;
    }

    getVariables(){
        if(tipo == 'PREGUNTA'){
            return {
                type: tipo,
                id_estudio: codEstudio,
                id_cuestionario: cuestionarioSeleccionado,
                id_pregunta: preguntaSeleccionada,
                id_muestra: muestraSeleccionada,
                id_variable: variableSeleccionada,
                id_cruce1: variableCruce1Seleccionada,
                id_cruce2: variableCruce2Seleccionada
            }
        }else{
            return {
                type: tipo,
                id_serie: numSerie,
            }
        }
    }

    getParams(){
        let params;
        let variables = this.getVariables();
        switch (variables.type) {
            case 'SERIE':
                params = {'id': variables.id_serie}
                break;
            case 'PREGUNTA':
                params = {
                    'id_cuestionario': variables.id_cuestionario,
                    'id_pregunta': variables.id_pregunta,
                    'id_variable': variables.id_variable,
                    'id_muestra': variables.id_muestra,
                    'id_cruce1': variables.id_cruce1,
                    'id_cruce2': variables.id_cruce2
                }
                break;
        }
        return params;
    }

}