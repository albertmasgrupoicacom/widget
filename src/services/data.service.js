const tipo = 'PREGUNTA'; //N
const numSerie = 4797; //6010;
const codEstudio = 14695;
const cuestionarioSeleccionado = 17697;
const preguntaSeleccionada = null;
const muestraSeleccionada = null;
const variableSeleccionada = 980820;
const variableCruce1Seleccionada = 980768;
const variableCruce2Seleccionada = 980943;

// const tipo = 'PREGUNTA';  //MV
// const numSerie = 4797; //6010;
// const codEstudio = 14664;
// const cuestionarioSeleccionado = 17664;
// const preguntaSeleccionada = 630886;
// const muestraSeleccionada = null;
// const variableSeleccionada = 961602;
// const variableCruce1Seleccionada = 961618;
// const variableCruce2Seleccionada = 961556;

//sexo: 980773
//edad: 980774
//partido pol: 980948
//escala ideo: 980820
//estudio: 14695
//id_cuestionario: 17697, "titulo": "BARÓMETRO DE MARZO 2023",

export class DataService {

    get type(){
        return tipo;
    }

    get variables(){
        if(this.type == 'PREGUNTA'){
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
        switch (this.type) {
            case 'SERIE':
                params = {'id': this.variables.id_serie}
                break;
            case 'PREGUNTA':
                params = {
                    'id_cuestionario': this.variables.id_cuestionario,
                    'id_pregunta':this.variables.id_pregunta,
                    'id_variable': this.variables.id_variable,
                    'id_muestra': this.variables.id_muestra,
                    'id_cruce1': this.variables.id_cruce1,
                    'id_cruce2': this.variables.id_cruce2
                }
                break;
        }
        return params;
    }

}