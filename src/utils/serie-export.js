import jsPDF from 'jspdf';
import 'jspdf-autotable'
// const jsPDF = window.jspdf.jsPDF; // TODO: comentar local
import * as ExcelJS from 'exceljs';
import { Helpers } from './helpers';

jsPDF.autoTableSetDefaults({headStyles: {fillColor: '#EEEEEE', textColor: '#332C39', columnWidth: 100}, theme: "grid", styles: {overflow: 'linebreak', valign: 'middle'}, columnStyles: {0: {cellWidth: 200}}})

export class SerieExport {

    constructor() {
        this._helpers = new Helpers();
    }

    getParsedData(data){
        return {
            code: {pre: '', text: `${data.codigo} - ${data.titulo}`, fontSize: 12, bold: true, align: 'center'},
            sample: {pre: 'Muestra', text: data.muestra || '', fontSize: 10, bold: true, align: 'left'},
            question: {pre: 'Pregunta', text: this._helpers.stripHTML(data.pregunta || ''), fontSize: 10, bold: true, align: 'left'},
            notes: {pre: 'Notas', text: data.notas || '', fontSize: 10, bold: true, align: 'left'},
        }
    }

    exportToExcel(data) {
        let offset = 7;

        const workbook = new ExcelJS.Workbook();
        const ws1 = workbook.addWorksheet('Series');
        const columnA = ws1.getColumn('A');
        columnA.width = 30;
        columnA.font = { bold: true };
        
        const titleCell = ws1.getCell(`B${offset}`);
        titleCell.value = `${data.codigo} - ${data.titulo}`;
        titleCell.font = { bold: true, size: 16 };
        titleCell.alignment = { horizontal: 'left', vertical: 'middle' };
        offset++;

        if(data.muestra){
            ws1.getCell(`A${offset}`).value = 'Muestra';
            ws1.getCell(`A${offset}`).font = { bold: true };
            ws1.getCell(`B${offset}`).value = data.muestra;
            offset++;
        }

        if(data.pregunta){
            ws1.getCell(`A${offset}`).value = 'Pregunta';
            ws1.getCell(`A${offset}`).font = { bold: true };
            ws1.getCell(`B${offset}`).value = this._helpers.stripHTML(data.pregunta);
            offset++;
        }

        if(data.notas){
            ws1.getCell(`A${offset}`).value = 'Notas';
            ws1.getCell(`A${offset}`).font = { bold: true };
            ws1.getCell(`B${offset}`).value = data.notas;
            offset++;
        }

        const tbl = document.getElementById(`graph_table`).firstChild;
        offset = this._helpers.addTableToWorksheet(tbl, ws1, offset);

        this._helpers.addImageToWorkbook(workbook, ws1, 'logo', 0, 1, 6).then(() => {
            let defaultBase64 = this._helpers.getBase64Canvas('default');
            let mediaBase64 = this._helpers.getBase64Canvas('media');
            if(defaultBase64){
                this._helpers.addImageToWorkbook(workbook, ws1, defaultBase64, offset, 10).then((endRow) => {
                    if(mediaBase64){
                        offset = endRow + 2;
                        this._helpers.addImageToWorkbook(workbook, ws1, mediaBase64, offset, 10).then(() => {
                            this.saveExcel(workbook, data)
                        })
                    }else{
                        this.saveExcel(workbook, data)
                    }
                });
            }else{
                this.saveExcel(workbook, data)
            }
        })
    }

    saveExcel(workbook, data){
        workbook.xlsx.writeBuffer().then(buffer => {
            const excel = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            var blobUrl = URL.createObjectURL(excel);
            let link = document.createElement("a");
            link.href = blobUrl;
            link.download = `${data.codigo}.xlsx`;
            link.click();
        });
    }

    exportToPDF(rawData) {

        const gapSize = 20;
        const marginY = 40;
        const marginX = 40;

        const pdf = new jsPDF('p', 'pt', 'a4');

        // Logo
        const logoWidth = 100;
        const logoHeight = 85;
        const logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Logotipo_del_CIS.png';
        pdf.addImage(logoUrl, 'PNG', marginX, marginY, logoWidth, logoHeight);

        let offset = marginY + logoHeight + gapSize;

        // Header
        Object.values(this.getParsedData(rawData)).forEach(item => {
            if(item.text){
                const title = item.pre ? `${item.pre}: ${item.text}` : item.text;
                const titleSize = item.fontSize;
                const position = item.align == 'center' ? pdf.internal.pageSize.width / 2 : item.align == 'left' ? marginX : pdf.internal.pageSize.width - marginX;
                pdf.setFont('helvetica', item.bold ? 'bold' : 'normal');
                pdf.setFontSize(titleSize);
                pdf.text(title, position, offset, { align: item.align, maxWidth: pdf.internal.pageSize.width - (marginX * 2) });
                offset += pdf.getTextDimensions(title, { titleSize, maxWidth: pdf.internal.pageSize.width - (marginX * 2) }).h + gapSize;
            }
        })
        
        // Table
        const tbl = document.getElementById(`graph_table`).firstChild;
        pdf.autoTable({
            html: tbl,
            startY: offset,
            horizontalPageBreak: true, 
            horizontalPageBreakRepeat: 0,
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 0) {data.cell.styles.fontStyle = 'bold'}
                if (data.column.index === 0) {data.cell.x = 100}
            }
        });

        // Chart
        const chart = document.getElementById(`graph_chart`);
        if(chart){
            pdf.addPage();
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            canvas.width = chart.width;
            canvas.height = chart.height;
            ctx.fillStyle = 'rgb(255,255,255)';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.drawImage(chart, 0, 0);
            let elementSize = this._helpers.calculateAspectRatioFit(canvas.width, canvas.height, pdf.internal.pageSize.width - (marginX * 2));
            pdf.addImage(canvas, 'PNG', marginX, marginY, elementSize.width, elementSize.height);
        }
        
        // Save
        pdf.save(`${rawData.codigo}.pdf`);
    }

}