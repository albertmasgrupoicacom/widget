import jsPDF from 'jspdf';
import 'jspdf-autotable'
//const jsPDF = window.jspdf.jsPDF; // comentar local
import * as ExcelJS from 'exceljs';
import { Helpers } from './helpers';

export class SerieExport {

    constructor() {
        this._helpers = new Helpers();
    }

    getParsedData(data){
        return {
            code: {pre: '', text: `${data.codigo} - ${data.titulo}`, fontSize: 12, bold: true, align: 'center'},
            sample: {pre: 'Muestra', text: data.muestra || '-', fontSize: 10, bold: true, align: 'left'},
            question: {pre: 'Pregunta', text: data.pregunta || '-', fontSize: 10, bold: true, align: 'left'},
            notes: {pre: 'Notas', text: data.notas || '-', fontSize: 10, bold: true, align: 'left'},
        }
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
            const title = item.pre ? `${item.pre}: ${item.text}` : item.text;
            const titleSize = item.fontSize;
            const position = item.align == 'center' ? pdf.internal.pageSize.width / 2 : item.align == 'left' ? marginX : pdf.internal.pageSize.width - marginX;
            pdf.setFont('helvetica', item.bold ? 'bold' : 'normal');
            pdf.setFontSize(titleSize);
            pdf.text(title, position, offset, { align: item.align, maxWidth: pdf.internal.pageSize.width - (marginX * 2) });
            offset += pdf.getTextDimensions(title, { titleSize, maxWidth: pdf.internal.pageSize.width - (marginX * 2) }).h + gapSize;
        })
        
        // Table
        const tableStyles = {fontStyle: 'normal', cellPadding: 1, fontSize: 8, valign: 'middle'};
        const tableHeaderStyles = {fontStyle: 'bold', fillColor: [0, 0, 0], textColor: [255, 255, 255]};
        const tableBodyStyles = {fontStyle: 'normal', cellPadding: 1, fontSize: 8};

        const tbl = document.getElementById(`graph_table`).firstChild;
        pdf.autoTable({
            html: tbl,
            startY: offset, 
            styles: tableStyles, 
            headStyles: tableHeaderStyles, 
            bodyStyles: tableBodyStyles, 
            horizontalPageBreak: true, 
            horizontalPageBreakRepeat: 0,
            didDrawCell: (data) => {
                if (data.column.index === 0) {data.cell.x = 100}
            }
        });

        // Chart
        pdf.addPage();
        const chart = document.getElementById(`graph_chart`);
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = chart.width;
        canvas.height = chart.height;
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.drawImage(chart, 0, 0);
        let elementSize = this._helpers.calculateAspectRatioFit(canvas.width, canvas.height, pdf.internal.pageSize.width - (marginX * 2));
        pdf.addImage(canvas, 'PNG', marginX, marginY, elementSize.width, elementSize.height);
        
        // Save
        pdf.save(`${rawData.codigo}.pdf`);
    }

    exportToExcel(rawData) {
        const wsName = 'Ficha de serie';
        const workbook = new ExcelJS.Workbook();

        const ws1 = workbook.addWorksheet(wsName);

        const data = this.getParsedData(rawData);

        ws1.mergeCells('A4:F4');
        const titleCell = ws1.getCell('A4');
        titleCell.value = data.code.text || '-';
        titleCell.font = { bold: true, size: 16 };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        ws1.getRow(4).height = 40; 

        ws1.getCell('A6').value = data.sample.pre || '';
        ws1.getCell('B6').value = data.sample.text || '-';
        ws1.getCell('A6').font = { bold: true };

        ws1.getCell('A7').value = data.question.pre || '';
        ws1.getCell('B7').value = data.question.text || '-';
        ws1.getCell('A7').font = { bold: true };

        ws1.getCell('A8').value = data.notes.pre || '';
        ws1.getCell('B8').value = data.notes.text || '-';
        ws1.getCell('A8').font = { bold: true };

        const tbl = document.getElementById(`graph_table`).firstChild;
        const tableEndRow = this.addTableToWorksheet(tbl, ws1, 10);

        this._helpers.addLogoToWorkbook(workbook, ws1).then(() => {
            const originalCanvas = document.getElementById(`graph_chart`);
            let inMemoryCanvas = document.createElement('canvas');
            let ctx = inMemoryCanvas.getContext('2d');
            inMemoryCanvas.width = originalCanvas.width;
            inMemoryCanvas.height = originalCanvas.height;
            ctx.fillStyle = 'rgb(255,255,255)';
            ctx.fillRect(0, 0, originalCanvas.width, originalCanvas.height);
            ctx.drawImage(originalCanvas, 0, 0);
            const base64Image = inMemoryCanvas.toDataURL("image/png");
            this._helpers.addImageToWorkbook(workbook, ws1, tableEndRow, base64Image).then(() => {
                workbook.xlsx.writeBuffer().then(buffer => {
                    const excel = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    var blobUrl = URL.createObjectURL(excel);
                    let link = document.createElement("a");
                    link.href = blobUrl;
                    link.download = `${rawData.codigo}.xlsx`;
                    link.click();
                });
            });
        });
    }
    
    addTableToWorksheet(table, worksheet, startRow = 10) {
        const rows = table.getElementsByTagName('tr');
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const cells = i === 0 ? row.getElementsByTagName('th') : row.getElementsByTagName('td');
            const rowData = Array.from(cells).map(cell => cell.innerText);
            const rowAdded = worksheet.addRow(rowData);
            if (i === 0) {rowAdded.eachCell((cell) => {
                let columnId = cell._address.substring(0,1);
                worksheet.getColumn(columnId).width = columnId == 'A' ? 35 : 10
                cell.font = { bold: true }
            })}
        }
        return startRow + rows.length;
    }

}