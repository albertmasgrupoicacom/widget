import jsPDF from 'jspdf';
import 'jspdf-autotable'
//const jsPDF = window.jspdf.jsPDF; // comentar local
import * as ExcelJS from 'exceljs';
import { HttpClient } from './http-client';
import { base_url } from '../environments/environment.prod';
import { Helpers } from './helpers';

export class ResultExport {

    constructor() {
        this._http = new HttpClient();
        this._helpers = new Helpers();
    }

    getData(data){
        let promises = [
            this._http.get(`${base_url}/estudio/${data.ficha.pregunta.id_estudio}`),
            this._http.get(`${base_url}/pregunta/${data.ficha.pregunta.id}`),
        ]
        return Promise.all(promises)
    }
    
    // EXPORTACIÓN EXCEL
    async exportToExcel(rawData) {
        this.getData(rawData).then(data => {
            let study = data[0];
            let question = data[1];
            let tables = rawData;

            const workbook = new ExcelJS.Workbook();
            const ws1 = workbook.addWorksheet('Estudios');
            this._helpers.addLogoToWorkbook(workbook, ws1);
            const columnA = ws1.getColumn('A');
            columnA.width = 40;
            columnA.font = { bold: true };
        
            //Estudios
            const cuestionarioCell = ws1.getCell('A7');
            cuestionarioCell.value = 'ESTUDIOS';
            cuestionarioCell.font = { bold: true };
            cuestionarioCell.alignment = { vertical: 'middle', horizontal: 'center' };
            ws1.mergeCells('A7:B7');
        
            for(let i = 1; i <= 26; i++){ 
                ws1.getCell(7, i).fill = {
                    type: 'pattern',
                    pattern:'solid',
                    fgColor:{ argb:'FFD3D3D3' }
                };
            }
        
            ws1.getCell('A8').value = 'Nº Estudio';
            ws1.getCell('B8').value = study.ficha.estudio.id;
        
            ws1.getCell('A9').value = 'Fecha';
            ws1.getCell('B9').value = study.ficha.estudio.fecha;
        
            ws1.getCell('A10').value = 'Título';
            ws1.getCell('B10').value = study.ficha.estudio.titulo;
        
            ws1.getCell('A11').value = 'Autor(es)';
            ws1.getCell('B11').value = study.ficha.estudio.autores;
        
            ws1.getCell('A12').value = 'Encargo(es)';
            ws1.getCell('B12').value = study.ficha.estudio.encargo;
        
            ws1.getCell('A13').value = 'País';
            ws1.getCell('B13').value = study.ficha.estudio.pais;
        
            ws1.getCell('A14').value = 'Índice Temático';
            ws1.getCell('B14').value = study.ficha.estudio.indiceTematico;
            ws1.mergeCells('B14:E14');
            ws1.getCell('B14').alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
            ws1.getRow(14).height = 300;
        
            //Cuestionarios
            const cuestionarioCell1 = ws1.getCell('A15');
            cuestionarioCell1.value = 'CUESTIONARIOS';
            cuestionarioCell1.font = { bold: true };
            cuestionarioCell1.alignment = { vertical: 'middle', horizontal: 'center' };
            ws1.mergeCells('A15:B15');
        
            for(let i = 1; i <= 26; i++){ 
                ws1.getCell(15, i).fill = {
                    type: 'pattern',
                    pattern:'solid',
                    fgColor:{ argb:'FFD3D3D3' }
                };
            }
        
            const cuestionarios = study.ficha.cuestionarios;
            let currentRow = 16;
        
            for (let cuestionario of cuestionarios) {
                ws1.getCell(`A${currentRow}`).value = 'Nº Cuestionario';
                ws1.getCell(`B${currentRow}`).value = cuestionario.numero;
                currentRow++;
            
                ws1.getCell(`A${currentRow}`).value = 'Título';
                ws1.getCell(`B${currentRow}`).value = cuestionario.titulo;
                currentRow++;
            
                ws1.getCell(`A${currentRow}`).value = 'Fecha de inicio';
                ws1.getCell(`B${currentRow}`).value = cuestionario.fecha_inicio;
                currentRow++;
            
                ws1.getCell(`A${currentRow}`).value = 'Fecha de finalización';
                ws1.getCell(`B${currentRow}`).value = cuestionario.fecha_fin;
                currentRow++;
            
                ws1.getCell(`A${currentRow}`).value = 'Tipo de entrevista';
                ws1.getCell(`B${currentRow}`).value = cuestionario.tipo_entrevista;
                currentRow++;
        
                ws1.getCell(`A${currentRow}`).value = 'Variables Sociodemográficas';
                ws1.getCell(`B${currentRow}`).value = cuestionario.variables_sociodemograficas;
                currentRow++;
            
                ws1.getCell(`A${currentRow}`).value = 'Contenido';
                ws1.getCell(`B${currentRow}`).value = cuestionario.contenido;
                ws1.mergeCells(`B${currentRow}:E${currentRow}`);
                ws1.getCell(`B${currentRow}`).alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
                ws1.getRow(currentRow).height = 300;
                currentRow++;
            }
        
        
            //Muestras
            const cuestionarioCell2 = ws1.getCell('A23');
            cuestionarioCell2.value = 'MUESTRAS';
            cuestionarioCell2.font = { bold: true };
            cuestionarioCell2.alignment = { vertical: 'middle', horizontal: 'center' };
            ws1.mergeCells('A23:B23');
        
            for(let i = 1; i <= 26; i++){ 
                ws1.getCell(23, i).fill = {
                    type: 'pattern',
                    pattern:'solid',
                    fgColor:{ argb:'FFD3D3D3' }
                };
            }
        
            const muestras = study.ficha.muestras;
            let currentRow1 = 24;
        
            for (let muestra of muestras) {
                ws1.getCell(`A${currentRow1}`).value = 'Muestra';
                ws1.getCell(`B${currentRow1}`).value = muestra.nombre;
                currentRow1++;
            
                ws1.getCell(`A${currentRow1}`).value = 'Ámbito';
                ws1.getCell(`B${currentRow1}`).value = muestra.ambito;
                currentRow1++;
            
                ws1.getCell(`A${currentRow1}`).value = 'Universo';
                ws1.getCell(`B${currentRow1}`).value = muestra.universo;
                currentRow1++;
            
                ws1.getCell(`A${currentRow1}`).value = 'Sexo';
                ws1.getCell(`B${currentRow1}`).value = muestra.sexo;
                currentRow1++;
            
                ws1.getCell(`A${currentRow1}`).value = 'Edad';
                ws1.getCell(`B${currentRow1}`).value = muestra.edad;
                currentRow1++;
            
                ws1.getCell(`A${currentRow1}`).value = 'Tamaño Real';
                ws1.getCell(`B${currentRow1}`).value = muestra.tamano_real;
                currentRow1++;
            
                ws1.getCell(`A${currentRow1}`).value = 'Tamaño Teórico';
                ws1.getCell(`B${currentRow1}`).value = muestra.tamano_teorico;
                currentRow1++;
            
                ws1.getCell(`A${currentRow1}`).value = 'Afijación';
                ws1.getCell(`B${currentRow1}`).value = muestra.afijacion;
                currentRow1++;
            
                ws1.getCell(`A${currentRow1}`).value = 'Puntos de Muestreo';
                ws1.getCell(`B${currentRow1}`).value = muestra.puntos_muestreo;
                currentRow1++;
            
                ws1.getCell(`A${currentRow1}`).value = 'Error Muestral';
                ws1.getCell(`B${currentRow1}`).value = muestra.error_muestral;
                currentRow1++;
        
                ws1.getCell(`A${currentRow1}`).value = 'Método de Muestreo';
                ws1.getCell(`B${currentRow1}`).value = muestra.metodo_muestreo;
                ws1.mergeCells(`B${currentRow1}:E${currentRow1}`);
                ws1.getCell(`B${currentRow1}`).alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
                ws1.getRow(currentRow1).height = 300;
                currentRow1++;
            
                currentRow1++;
            }
            
            // Preguntas
            const cuestionarioCell3 = ws1.getCell('A47');
            cuestionarioCell3.value = 'PREGUNTAS';
            cuestionarioCell3.font = { bold: true };
            cuestionarioCell3.alignment = { vertical: 'middle', horizontal: 'center' };
            ws1.mergeCells('A47:B47');
            
            for(let i = 1; i <= 26; i++){ 
                ws1.getCell(47, i).fill = {
                    type: 'pattern',
                    pattern:'solid',
                    fgColor:{ argb:'FFD3D3D3' }
                };
            }

            ws1.getCell('A48').value = 'Pregunta';
            ws1.getCell('B48').value = question.ficha.titulo;

            ws1.getCell('A49').value = 'Texto';
            ws1.getCell('B49').value = this._helpers.stripHtmlTags(question.ficha.texto); 
            ws1.mergeCells('B49:E49');
            ws1.getCell('B49').alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
            ws1.getRow(49).height = 300;
        
            //Logo
            this._helpers.addLogoToWorkbook(workbook, ws1).then(() => {
                workbook.xlsx.writeBuffer().then((buffer) => {
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'Estudios.xlsx';
                    link.click();
                    URL.revokeObjectURL(url);
                });
            });

        })
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