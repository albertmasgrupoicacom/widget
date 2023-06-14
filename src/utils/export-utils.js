import jsPDF from 'jspdf';
import 'jspdf-autotable'
//const jsPDF = window.jspdf.jsPDF; // comentar local
import * as ExcelJS from 'exceljs';

export class ExportUtils {

    getParsedData(type, data){
        if(type == 'SERIE'){
            return {
                code: {pre: '', text: `${data.codigo} - ${data.titulo}`, fontSize: 12, bold: true, align: 'center'},
                sample: {pre: 'Muestra', text: data.muestra || '-', fontSize: 10, bold: true, align: 'left'},
                question: {pre: 'Pregunta', text: data.pregunta || '-', fontSize: 10, bold: true, align: 'left'},
                notes: {pre: 'Notas', text: data.notas || '-', fontSize: 10, bold: true, align: 'left'},
            }
        }
    }

    exportToPDF(type, data) {

        const pdf = new jsPDF('p', 'pt', 'a4');

        const logoWidth = 100;
        const logoHeight = 85;
        const logoX = 20;
        const logoY = 50;
        const logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Logotipo_del_CIS.png';
        pdf.addImage(logoUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);

        let offsetY = logoY + logoHeight + 30;

        if(type == 'SERIE'){
            offsetY = this.printPDFContainer(pdf, this.getParsedData(type, data), 0, offsetY).offset;
        }else{
            data.tabla.forEach((table, tableIndex) => {
                offsetY = this.printPDFContainer(pdf, this.getParsedData(type, table), tableIndex, offsetY);
            })
        }
        pdf.save(`${data.codigo}.pdf`);
    }

    printPDFContainer(pdf, data, tableIndex, offset){

        const gapSize = 20;
        const marginY = 40;
        const marginX = 40;

        Object.values(data).forEach(item => {
            const title = item.pre ? `${item.pre}: ${item.text}` : item.text;
            const titleSize = item.fontSize;
            const position = item.align == 'center' ? pdf.internal.pageSize.width / 2 : item.align == 'left' ? marginX : pdf.internal.pageSize.width - marginX;
            pdf.setFont('helvetica', item.bold ? 'bold' : 'normal');
            pdf.setFontSize(titleSize);
            pdf.text(title, position, offset, { align: item.align, maxWidth: pdf.internal.pageSize.width - (marginX * 2) });
            offset += pdf.getTextDimensions(title, { titleSize, maxWidth: pdf.internal.pageSize.width - (marginX * 2) }).h + gapSize;
        })
        
        const tableStyles = {fontStyle: 'normal', cellPadding: 1, fontSize: 8, valign: 'middle'};
        const tableHeaderStyles = {fontStyle: 'bold', fillColor: [0, 0, 0], textColor: [255, 255, 255]};
        const tableBodyStyles = {fontStyle: 'normal', cellPadding: 1, fontSize: 8};

        const tbl = document.getElementById(`graph_table_${tableIndex}`).firstChild;
        pdf.autoTable({html: tbl, didDrawCell: (data) => {
            if (data.column.index === 0) {
                data.cell.x = 100;
            }
          }, startY: offset, styles: tableStyles, headStyles: tableHeaderStyles, bodyStyles: tableBodyStyles, horizontalPageBreak: true, horizontalPageBreakRepeat: 0});

        pdf.addPage();
        const chart = document.getElementById(`graph_chart_${tableIndex}`);
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = chart.width;
        canvas.height = chart.height;
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.drawImage(chart, 0, 0);

        let elementSize = this.calculateAspectRatioFit(canvas.width, canvas.height, pdf.internal.pageSize.width - (marginX * 2));

        pdf.addImage(canvas, 'PNG', marginX, marginY, elementSize.width, elementSize.height);

        return {pdf, offset}
    }

    calculateAspectRatioFit(srcWidth, srcHeight, maxWidth) {
        var ratio = (maxWidth / srcWidth);
        return { width: srcWidth*ratio, height: srcHeight*ratio };
    }

    exportToExcel(type, data) {

        if(type == 'SERIE'){
            const workbook = new ExcelJS.Workbook();
            if(type == 'SERIE'){
                this.printExcelContainer(workbook, this.getParsedData(type, data), 0);
            }else{
                data.tabla.forEach((table, tableIndex) => {
                    this.printExcelContainer(workbook, this.getParsedData(type, table), tableIndex);
                })
            }
        }
    }

    printExcelContainer(workbook, data, tableIndex){
        const ws1 = workbook.addWorksheet('Ficha de serie');

        // Título
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

        const tbl = document.getElementById(`graph_table_${tableIndex}`).firstChild;
        const tableEndRow = this.addTableToWorksheet(tbl, ws1, 10);

        this.addLogoToWorkbook(workbook).then(() => {
            const originalCanvas = document.getElementById(`graph_chart_${tableIndex}`);
            let inMemoryCanvas = document.createElement('canvas');
            let ctx = inMemoryCanvas.getContext('2d');
            inMemoryCanvas.width = originalCanvas.width;
            inMemoryCanvas.height = originalCanvas.height;
            ctx.fillStyle = 'rgb(255,255,255)';
            ctx.fillRect(0, 0, originalCanvas.width, originalCanvas.height);
            ctx.drawImage(originalCanvas, 0, 0);
            const base64Image = inMemoryCanvas.toDataURL("image/png");
            this.addImageToWorkbook(workbook, tableEndRow, base64Image).then(() => {
                workbook.xlsx.writeBuffer().then(buffer => {
                    const excel = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    var blobUrl = URL.createObjectURL(excel);
                    let link = document.createElement("a");
                    link.href = blobUrl;
                    link.download = "output.xlsx";
                    link.innerHTML = "Click here to download the file";
                    link.click()
                });
            });
        });

    }
    
    getLogoAsBase64() {
        return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
    

        //  img.src = 'https://i.imgur.com/77syx2k.png';
        img.src = 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Logotipo_del_CIS.png';
        //img.src = 'https://webserver-cis-dev.lfr.cloud/documents/d/cis/logo-cis';
    
        img.onload = () => {
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            canvas.height = img.naturalHeight;
            canvas.width = img.naturalWidth;
            ctx.drawImage(img, 0, 0);
            let base64Image = canvas.toDataURL('image/png');
            resolve(base64Image);
        };
    
        img.onerror = error => {
            reject(error);
        };
        });
    }
    
    async addLogoToWorkbook(workbook) {
        const base64Logo = await this.getLogoAsBase64();
        const base64Data = base64Logo.split(',')[1];
        const blob = this.b64toBlob(base64Data, 'image/png');
        const buffer = await this.blobToArrayBuffer(blob);
    
        const logoId = workbook.addImage({
        buffer: buffer,
        extension: 'png',
        });
    
        const ws = workbook.getWorksheet('Ficha de serie');
        ws.addImage(logoId, {
        tl: { col: 0, row: 0 },
        br: { col: 1, row: 3 },
        editAs: 'absolute',
        });
    }
    
    addTableToWorksheet(table, worksheet, startRow = 10) {
        const rows = table.getElementsByTagName('tr');
        const headerHeight = 30; 
        const dataHeight = 20; 
    
        for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cells = i === 0 ? row.getElementsByTagName('th') : row.getElementsByTagName('td');
        const rowData = Array.from(cells).map(cell => cell.innerText);
        const rowAdded = worksheet.addRow(rowData);
        
        rowAdded.eachCell((cell) => {
            console.log(cell);
            
            if (cell.row.number === startRow) {
            cell.font = { bold: true };
            rowAdded.height = headerHeight;
            } else {
            cell.font = { bold: false };
            rowAdded.height = dataHeight;
            }
        });
    
        if (i === 0) { // Cabecera
            rowAdded.eachCell((cell) => {
            cell.font = { bold: true };
            });
        }
        }
    
        return startRow + rows.length;
    }
    
    async addImageToWorkbook(workbook, startRow, image) {
        
        const ws = workbook.getWorksheet('Ficha de serie');
    
        const base64Data = image.split(',')[1];
        const blob = this.b64toBlob(base64Data, 'image/png');
        const buffer = await this.blobToArrayBuffer(blob);
        
        const imageId = workbook.addImage({
        buffer: buffer,
        extension: 'png',
        });
        
        const startRowChart = startRow; 
        const endRowChart = startRowChart + 19;
    
        ws.addImage(imageId, {
        tl: { col: 0, row: startRowChart },
        br: { col: 6, row: endRowChart },
        editAs: 'absolute',
        });
    }
    
    b64toBlob(b64Data, contentType = '', sliceSize = 512) {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
    
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
    
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
    
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
        }
    
        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }
    
    blobToArrayBuffer(blob) {
        return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('loadend', (e) => {
            resolve(reader.result);
        });
        reader.addEventListener('error', reject);
        reader.readAsArrayBuffer(blob);
        });
    }

}