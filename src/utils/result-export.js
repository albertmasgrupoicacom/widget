import jsPDF from 'jspdf';
import 'jspdf-autotable'
//const jsPDF = window.jspdf.jsPDF; // comentar local
import * as ExcelJS from 'exceljs';
import { HttpClient } from './http-client';
import { base_url } from '../environments/environment.prod';
import { Helpers } from './helpers';
import { DataService } from '../services/data.service';

export class ResultExport {

    constructor() {
        this._dataService = new DataService();
        this._http = new HttpClient();
        this._helpers = new Helpers();
    }

    getData(data){
        let promises = [
            this._http.get(`${base_url}/estudio/${data.ficha.pregunta.id_estudio}`),
            this._http.get(`${base_url}/pregunta/${data.ficha.pregunta.id}`),
        ]
        return Promise.all(promises);
    }
    
    // EXPORTACIÓN EXCEL
    async exportToExcel(rawData) {
        let offset = 7;
        this.getData(rawData).then(data => {
            let study = data[0];
            let question = data[1];
            let tables = rawData;

            const workbook = new ExcelJS.Workbook();
            const ws1 = workbook.addWorksheet('Estudio');
            const columnA = ws1.getColumn('A');
            const columnB = ws1.getColumn('B');
            columnA.width = 30;
            columnB.width = 50;
            columnA.font = { bold: true };

            //Estudio
            const estudioCell = ws1.getCell(`A${offset}`);
            estudioCell.value = 'ESTUDIO';
            estudioCell.font = { bold: true };
            estudioCell.alignment = { vertical: 'middle', horizontal: 'center' };
            estudioCell.fill = {type: 'pattern', pattern:'solid', fgColor:{ argb:'FFD3D3D3' }};
            ws1.mergeCells(`A${offset}:B${offset}`);
            offset++;
        
            ws1.getCell(`A${offset}`).value = 'Nº Estudio';
            ws1.getCell(`B${offset}`).value = study.ficha.estudio.id;
            offset++;
        
            ws1.getCell(`A${offset}`).value = 'Fecha';
            ws1.getCell(`B${offset}`).value = study.ficha.estudio.fecha;
            offset++;
        
            ws1.getCell(`A${offset}`).value = 'Título';
            ws1.getCell(`B${offset}`).value = study.ficha.estudio.titulo;
            offset++;
        
            ws1.getCell(`A${offset}`).value = 'Autor(es)';
            ws1.getCell(`B${offset}`).value = study.ficha.estudio.autores;
            offset++;
        
            ws1.getCell(`A${offset}`).value = 'Encargo(es)';
            ws1.getCell(`B${offset}`).value = study.ficha.estudio.encargo;
            offset++;
        
            ws1.getCell(`A${offset}`).value = 'País';
            ws1.getCell(`B${offset}`).value = study.ficha.estudio.pais;
            offset++;
        
            ws1.getCell(`A${offset}`).value = 'Índice Temático';
            ws1.getCell(`B${offset}`).value = study.ficha.estudio.indiceTematico;
            ws1.getCell(`B${offset}`).alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
            ws1.getRow(offset).height = 300;
            offset++;
        
            // Cuestionario
            if(this._dataService.variables.id_cuestionario){
                const cuestionario = study.ficha.cuestionarios.find(cuestionario => cuestionario.id == this._dataService.variables.id_cuestionario);
                if(cuestionario){
                    const cuestionarioCell = ws1.getCell(`A${offset}`);
                    cuestionarioCell.value = 'CUESTIONARIO';
                    cuestionarioCell.font = { bold: true };
                    cuestionarioCell.alignment = { vertical: 'middle', horizontal: 'center' };
                    cuestionarioCell.fill = {type: 'pattern', pattern:'solid', fgColor:{ argb:'FFD3D3D3' }};
                    ws1.mergeCells(`A${offset}:B${offset}`);
                    offset++;

                    ws1.getCell(`A${offset}`).value = 'Nº Cuestionario';
                    ws1.getCell(`B${offset}`).value = cuestionario.numero;
                    offset++;
                
                    ws1.getCell(`A${offset}`).value = 'Título';
                    ws1.getCell(`B${offset}`).value = cuestionario.titulo;
                    offset++;
                
                    ws1.getCell(`A${offset}`).value = 'Fecha de inicio';
                    ws1.getCell(`B${offset}`).value = cuestionario.fecha_inicio;
                    offset++;
                
                    ws1.getCell(`A${offset}`).value = 'Fecha de finalización';
                    ws1.getCell(`B${offset}`).value = cuestionario.fecha_fin;
                    offset++;
                
                    ws1.getCell(`A${offset}`).value = 'Tipo de entrevista';
                    ws1.getCell(`B${offset}`).value = cuestionario.tipo_entrevista;
                    offset++;
            
                    ws1.getCell(`A${offset}`).value = 'Variables Sociodemográficas';
                    ws1.getCell(`B${offset}`).value = cuestionario.variables_sociodemograficas;
                    offset++;
                
                    ws1.getCell(`A${offset}`).value = 'Contenido';
                    ws1.getCell(`B${offset}`).value = cuestionario.contenido;
                    ws1.getCell(`B${offset}`).alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
                    ws1.getRow(offset).height = 300;
                    offset++;
                }
            }
        
            //Muestra
            if(this._dataService.variables.id_muestra){
                const muestra = study.ficha.muestras.find(muestra => muestra.id == this._dataService.variables.id_muestra);
                if(muestra){
                    const muestraCell = ws1.getCell(`A${offset}`);
                    muestraCell.value = 'MUESTRA';
                    muestraCell.font = { bold: true };
                    muestraCell.alignment = { vertical: 'middle', horizontal: 'center' };
                    muestraCell.fill = {type: 'pattern', pattern:'solid', fgColor:{ argb:'FFD3D3D3' }};
                    ws1.mergeCells(`A${offset}:B${offset}`);
                    offset++;

                    ws1.getCell(`A${offset}`).value = 'Muestra';
                    ws1.getCell(`B${offset}`).value = muestra.nombre;
                    offset++;
                
                    ws1.getCell(`A${offset}`).value = 'Ámbito';
                    ws1.getCell(`B${offset}`).value = muestra.ambito;
                    offset++;
                
                    ws1.getCell(`A${offset}`).value = 'Universo';
                    ws1.getCell(`B${offset}`).value = muestra.universo;
                    offset++;
                
                    ws1.getCell(`A${offset}`).value = 'Sexo';
                    ws1.getCell(`B${offset}`).value = muestra.sexo;
                    offset++;
                
                    ws1.getCell(`A${offset}`).value = 'Edad';
                    ws1.getCell(`B${offset}`).value = muestra.edad;
                    offset++;
                
                    ws1.getCell(`A${offset}`).value = 'Tamaño Real';
                    ws1.getCell(`B${offset}`).value = muestra.tamano_real;
                    offset++;
                
                    ws1.getCell(`A${offset}`).value = 'Tamaño Teórico';
                    ws1.getCell(`B${offset}`).value = muestra.tamano_teorico;
                    offset++;
                
                    ws1.getCell(`A${offset}`).value = 'Afijación';
                    ws1.getCell(`B${offset}`).value = muestra.afijacion;
                    offset++;
                
                    ws1.getCell(`A${offset}`).value = 'Puntos de Muestreo';
                    ws1.getCell(`B${offset}`).value = muestra.puntos_muestreo;
                    offset++;

                    ws1.getCell(`A${offset}`).value = 'Error Muestral';
                    ws1.getCell(`B${offset}`).value = muestra.error_muestral;
                    offset++;
            
                    ws1.getCell(`A${offset}`).value = 'Método de Muestreo';
                    ws1.getCell(`B${offset}`).value = muestra.metodo_muestreo;
                    ws1.getCell(`B${offset}`).alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
                    ws1.getRow(offset).height = 300;
                    offset++;
                }
            }

            if(this._dataService.variables.id_pregunta){
                const pregunta = question.ficha;
                if(pregunta){
                    const preguntaCell = ws1.getCell(`A${offset}`);
                    preguntaCell.value = 'PREGUNTAS';
                    preguntaCell.font = { bold: true };
                    preguntaCell.alignment = { vertical: 'middle', horizontal: 'center' };
                    preguntaCell.fill = {type: 'pattern', pattern:'solid', fgColor:{ argb:'FFD3D3D3' }};
                    ws1.mergeCells(`A${offset}:B${offset}`);
                    offset++;
        
                    ws1.getCell(`A${offset}`).value = 'Pregunta';
                    ws1.getCell(`B${offset}`).value = question.ficha.titulo
                    offset++;
        
                    ws1.getCell(`A${offset}`).value = 'Texto';
                    ws1.getCell(`B${offset}`).value = this._helpers.stripHtmlTags(question.ficha.texto);
                    ws1.getCell(`B${offset}`).alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
                    ws1.getRow(offset).height = 300;
                    offset++
                }
            }
        
            //Logo
            this._helpers.addLogoToWorkbook(workbook, ws1).then(() => {
                if(rawData.ficha.tabla && rawData.ficha.tabla.length){
                    const dataCell = ws1.getCell(`A${offset}`);
                    dataCell.value = 'DATOS';
                    dataCell.font = { bold: true };
                    dataCell.alignment = { vertical: 'middle', horizontal: 'center' };
                    dataCell.fill = {type: 'pattern', pattern:'solid', fgColor:{ argb:'FFD3D3D3' }};
                    ws1.mergeCells(`A${offset}:B${offset}`);
                    offset ++;
    
                    rawData.ficha.tabla.forEach((table, index) => {
                        ws1.getCell(`A${offset}`).value = 'Título';
                        ws1.getCell(`B${offset}`).value = table.titulo;
                        offset++;

                        ws1.getCell(`A${offset}`).value = 'Cruce 1';
                        ws1.getCell(`B${offset}`).value = table.tituloCruce1;
                        offset++;
        
                        ws1.getCell(`A${offset}`).value = 'Cruce 2';
                        ws1.getCell(`B${offset}`).value = table.tituloCruce2;
                        offset += 2;
    
                        const tbl = document.getElementById(`graph_table_${index}`).firstChild;
                        offset = this._helpers.addTableToWorksheet(tbl, ws1, offset);

                        const chart = this._helpers.getBase64Canvas(index);
                        this._helpers.addImageToWorkbook(workbook, ws1, offset, chart).then(() => {
                            this.saveExcel(workbook);
                        })
                    })
                }else{
                    this.saveExcel(workbook);
                }
            });

        })
    }

    saveExcel(workbook){
        workbook.xlsx.writeBuffer().then(buffer => {
            const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Estudios.xlsx';
            link.click();
            URL.revokeObjectURL(url);
        });
    }

    // EXPORTACIÓN PDF
    exportToPDF(rawData) {
        this.getData(rawData).then(data => {

            let study = data[0];
            let question = data[1];
            let tables = rawData;
            
            const doc = new jsPDF();
    
            //Logo
            const logoWidth = 50;  
            const logoHeight = 50; 
            const logoX = 10;      
            const logoY = 10;      
            const logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Logotipo_del_CIS.png';
            doc.addImage(logoUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);
    
            //Estudios
            const estudioData = [
                ["Nº Estudio", study.ficha.estudio.id],
                ["Fecha", study.ficha.estudio.fecha],
                ["Título", study.ficha.estudio.titulo],
                ["Autor(es)", study.ficha.estudio.autores],
                ["Encargo(es)", study.ficha.estudio.encargo],
                ["País", study.ficha.estudio.pais],
                ["Índice Temático", study.ficha.estudio.indiceTematico],
            ];
    
            doc.setFontSize(14);
            doc.text("ESTUDIOS", 10, 70);
            doc.autoTable({
                startY: 80,
                body: estudioData,
                theme: "grid",
                didParseCell: function(data) {
                    if (data.section === 'body' && data.column.index === 0) {
                        data.cell.styles.fontStyle = 'bold';
                    }
                },
            });
    
            //Cuestionarios
            doc.addPage();
            doc.setFontSize(14);
            doc.text("CUESTIONARIOS", 10, 10);
            const cuestionarios = study.ficha.cuestionarios;
            cuestionarios.forEach((cuestionario, index) => {
                const cuestionarioData = [
                    ["Nº Cuestionario", cuestionario.numero],
                    ["Título", cuestionario.titulo],
                    ["Fecha de inicio", cuestionario.fecha_inicio],
                    ["Fecha de finalización", cuestionario.fecha_fin],
                    ["Tipo de entrevista", cuestionario.tipo_entrevista],
                    ["Variables Sociodemográficas", cuestionario.variables_sociodemograficas],
                    ["Contenido", cuestionario.contenido]
                ];
    
                doc.autoTable({
                    startY: 20 + (index * 30), 
                    body: cuestionarioData,
                    theme: "grid",
                    theme: "grid",
                    didParseCell: function(data) {
                        if (data.section === 'body' && data.column.index === 0) {
                            data.cell.styles.fontStyle = 'bold';
                        }
                    },
                });
            });
    
            //Muestras
            doc.addPage();
            doc.setFontSize(14);
            doc.text("MUESTRAS", 10, 10);
            const muestras = study.ficha.muestras;
            let startY = 20; 
    
            muestras.forEach(muestra => {
                const muestraData = [
                    ["Muestra", muestra.titulo],
                    ["Ámbito", muestra.ambito],
                    ["Universo", muestra.universo],
                    ["Sexo", muestra.sexo],
                    ["Edad", muestra.edad],
                    ["Tamaño Real", muestra.tamano_real],
                    ["Tamaño Teórico", muestra.tamano_teorico],
                    ["Afijación", muestra.afijacion],
                    ["Puntos de Muestreo", muestra.puntos_muestreo],
                    ["Error Muestral", muestra.error_muestral],
                    ["Método de Muestreo", muestra.metodo_muestreo],
                ];
    
                doc.autoTable({
                    startY: startY, 
                    body: muestraData,
                    theme: "grid",
                    didParseCell: function(data) {
                    if (data.section === 'body' && data.column.index === 0) {
                        data.cell.styles.fontStyle = 'bold';
                    }
                    },
                });
                startY = doc.autoTable.previous.finalY + 7; 
            }); 
    
            //Preguntas
            doc.addPage();
            doc.setFontSize(14);
            doc.text("PREGUNTAS", 10, 10);
    
            const preguntaData = [
                ["Pregunta", question.ficha.titulo],
                ["Texto", this._helpers.stripHTML(question.ficha.texto)],
            ];
    
            doc.autoTable({
                startY: 20,
                body: preguntaData,
                theme: "grid",
                didParseCell: function(data) {
                    if (data.section === 'body' && data.column.index === 0) {
                        data.cell.styles.fontStyle = 'bold';
                    }
                },
            });
        
            doc.save("FichaDeEstudios.pdf");

        })
    }

}