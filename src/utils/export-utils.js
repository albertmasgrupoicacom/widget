// import jsPDF from 'jspdf';
// import 'jspdf-autotable'
const jsPDF = window.jspdf.jsPDF; // comentar local
import * as ExcelJS from 'exceljs';

export class ExportUtils {

    exportToPDF(type, data) {
        if(type == 'SERIE'){
            const pdf = new jsPDF('p', 'pt', 'a3'); // A3 en lugar de A4
            const tbl = document.getElementById('graph_table').firstChild;
            const originalCanvas = document.getElementById('graph_chart');
            let inMemoryCanvas = document.createElement('canvas');
            let ctx = inMemoryCanvas.getContext('2d');
            inMemoryCanvas.width = originalCanvas.width;
            inMemoryCanvas.height = originalCanvas.height;
            ctx.fillStyle = 'rgb(255,255,255)';
            ctx.fillRect(0, 0, originalCanvas.width, originalCanvas.height);
            ctx.drawImage(originalCanvas, 0, 0);
            const base64Image = inMemoryCanvas.toDataURL("image/png");
        
            // Logo
            const logoWidth = 100;
            const logoHeight = 100;
            const logoX = 20;
            const logoY = 70;
            //const logoUrl = 'https://i.imgur.com/77syx2k.png';
            const logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Logotipo_del_CIS.png';
            //const logoUrl = 'https://webserver-cis-dev.lfr.cloud/documents/d/cis/logo-cis';
            pdf.addImage(logoUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);
        
            // Título
            const title = `${data.codigo} - ${data.titulo}`;
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(24);
            const titleWidth = pdf.getStringUnitWidth(title) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
            const titleOffset = (pdf.internal.pageSize.width - titleWidth) / 2;
            pdf.text(title, titleOffset, logoY + logoHeight + 30); // Título centrado y debajo del logo
            
        
            // Texto
            const text = `Muestra: ${data.muestra || '-'}`;
            const note = `Pregunta: ${data.pregunta || '-'}`;
            const question = `Notas: ${data.notas || '-'}`;
            const textX = 50;
            const textY = logoY + logoHeight + 70;
            const textFontSize = 10;
            const textWidth = pdf.getStringUnitWidth(text) * textFontSize / pdf.internal.scaleFactor;
            const textOffset = textX;
            pdf.setFontSize(textFontSize);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Muestra:', textOffset, textY);
            pdf.setFont('helvetica', 'normal');
            pdf.text(text.substr(9), textOffset + pdf.getStringUnitWidth('Muestra:') * textFontSize, textY);
        
            const noteX = textOffset;
            const noteY = textY + 20;
            pdf.setFont('helvetica', 'bold');
            pdf.text('Pregunta:', noteX, noteY);
            pdf.setFont('helvetica', 'normal');
            pdf.text(note.substr(9), noteX + pdf.getStringUnitWidth('Pregunta:') * textFontSize, noteY);
        
            const questionX = textOffset;
            const questionY = noteY + 20;
            pdf.setFont('helvetica', 'bold');
            pdf.text('Notas:', questionX, questionY);
            pdf.setFont('helvetica', 'normal');
            pdf.text(question.substr(6), questionX + pdf.getStringUnitWidth('Notas:') * textFontSize, questionY);
        
            // Tabla
            const styles = {
              fontStyle: 'normal',
              cellPadding: 1,
              fontSize: 8,
              cellHeight: 16,
            };
            pdf.autoTable({
            html: tbl,
            startY: questionY + 30, 
            styles: styles,
            headStyles: {
                fontStyle: 'bold',
                fillColor: [0, 0, 0],
                textColor: [255, 255, 255]
            },
            didDrawPage: (data) => {
                pdf.setFontSize(20);
            },
            });
        
            const rowCount = tbl.rows.length;
            const totalTableHeight = styles.cellHeight * rowCount;
        
            // Gráfico
            const imagePosition = { x: 15, y: questionY + totalTableHeight + 60, width: 800, height: 400 };
            pdf.addImage(base64Image, 'JPEG', imagePosition.x, imagePosition.y, imagePosition.width, imagePosition.height);
        
            // Borde gráfico
            pdf.rect(imagePosition.x, imagePosition.y, imagePosition.width, imagePosition.height);
            pdf.save('fichaDeSerie.pdf');
        }
    }

    exportToExcel(type, data) {
        if(type == 'SERIE'){

            const workbook = new ExcelJS.Workbook();
            const ws1 = workbook.addWorksheet('Ficha de serie');
        
            // Título
            ws1.mergeCells('A4:F4');
            const titleCell = ws1.getCell('A4');
            titleCell.value = `${data.codigo} - ${data.titulo}`;
            titleCell.font = { bold: true, size: 16 };
            titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
            ws1.getRow(4).height = 40; 
        
            // Texto
            ws1.getCell('A6').value = 'Muestra:';
            ws1.getCell('B6').value = data.muestra || '-';
            ws1.getCell('A6').font = { bold: true };
        
            ws1.getCell('A7').value = 'Pregunta:';
            ws1.getCell('B7').value = data.pregunta || '-';
            ws1.getCell('A7').font = { bold: true };
        
            ws1.getCell('A8').value = 'Notas:';
            ws1.getCell('B8').value = data.notas || '-';
            ws1.getCell('A8').font = { bold: true };
        
            const tbl = document.getElementById('graph_table').firstChild;
            const startRow = 14;
            const tableEndRow = this.addTableToWorksheet(tbl, ws1, startRow);
        
            this.addLogoToWorkbook(workbook).then(() => {
                const originalCanvas = document.getElementById('graph_chart');
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
    
    addTableToWorksheet(table, worksheet, startRow = 14) {
        const rows = table.getElementsByTagName('tr');
        const headerHeight = 30; 
        const dataHeight = 20; 
    
        for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cells = i === 0 ? row.getElementsByTagName('th') : row.getElementsByTagName('td');
        const rowData = Array.from(cells).map(cell => cell.innerText);
        const rowAdded = worksheet.addRow(rowData);
        rowAdded.eachCell((cell) => {
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
    
        worksheet.getColumn('A').width = 30;
        worksheet.getColumn('B').width = 20;
        worksheet.getColumn('C').width = 20;
        worksheet.getColumn('D').width = 20;
        worksheet.getColumn('E').width = 20;
        worksheet.getColumn('F').width = 20;
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
        
        const startRowChart = 18; 
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