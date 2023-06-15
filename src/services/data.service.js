const tipo = 'PREGUNTA';
const numSerie = 16393;
const codEstudio = 14695;
const cuestionarioSeleccionado = 17697;
const preguntaSeleccionada = null;
const muestraSeleccionada = null; 
const variableSeleccionada = 980820;
const variableCruce1Seleccionada = 980773;
const variableCruce2Seleccionada = 980774;

//sexo: 980773
//edad: 980774
//partido pol: 980948
//escala ideo: 980820
//estudio: 14695
//id_cuestionario: 17697, "titulo": "BARÓMETRO DE MARZO 2023",

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