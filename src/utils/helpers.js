export class Helpers {

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
            img.onerror = (error) => {
                reject(error);
            };
        });
    }
    
    async addLogoToWorkbook(workbook, worksheet) {
        const base64Logo = await this.getLogoAsBase64();
        const base64Data = base64Logo.split(',')[1];
        const blob = this.b64toBlob(base64Data, 'image/png');
        const buffer = await this.blobToArrayBuffer(blob);
        const logoId = workbook.addImage({buffer: buffer, extension: 'png'});
    
        worksheet.addImage(logoId, {
            tl: { col: 0, row: 0 },
            br: { col: 1, row: 5 },
            editAs: 'absolute',
        });
    }

    async addImageToWorkbook(workbook, worksheet, startRow, image) {
        const blob = this.b64toBlob(image.split(',')[1], 'image/png');
        const buffer = await this.blobToArrayBuffer(blob);
        const imageId = workbook.addImage({buffer: buffer, extension: 'png'});
        
        const startRowChart = startRow;
        const endRowChart = startRowChart + 19;
    
        worksheet.addImage(imageId, {
            tl: { col: 0, row: startRowChart },
            br: { col: 5, row: endRowChart },
            editAs: 'absolute',
        });
    }

    addTableToWorksheet(table, worksheet, startRow, resizeCols) {
        const rows = table.getElementsByTagName('tr');
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const cells = i === 0 ? row.getElementsByTagName('th') : row.getElementsByTagName('td');
            const rowData = Array.from(cells).map(cell => cell.innerText);
            const rowAdded = worksheet.addRow(rowData);
            if (i === 0) {rowAdded.eachCell((cell) => {
                cell.fill = {type: 'pattern', pattern:'solid', fgColor:{ argb:'FFD3D3D3' }};
                let columnId = cell._address.substring(0,1);
                resizeCols ? worksheet.getColumn(columnId).width = columnId == 'A' ? 35 : 10 : null;
                cell.font = { bold: true }
            })}
        }
        return startRow + rows.length;
    }

    getBase64Canvas(index){
        const originalCanvas = document.getElementById(`graph_chart_${index}`);
        let inMemoryCanvas = document.createElement('canvas');
        let ctx = inMemoryCanvas.getContext('2d');
        inMemoryCanvas.width = originalCanvas.width;
        inMemoryCanvas.height = originalCanvas.height;
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.fillRect(0, 0, originalCanvas.width, originalCanvas.height);
        ctx.drawImage(originalCanvas, 0, 0);
        return inMemoryCanvas.toDataURL("image/png");
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
        return new Blob(byteArrays, { type: contentType });
    }
    
    blobToArrayBuffer(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
        });
    }
    
    stripHtmlTags(str) {
        if ((str===null) || (str==='')){
            return false;
        }else{
            str = str.toString();
            return str.replace(/<[^>]*>/g, '').replace(/&iquest;/g, '¿').replace(/&nbsp;/g, ' ');
        }
    }
    
    stripHTML(html) {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }

    calculateAspectRatioFit(srcWidth, srcHeight, maxWidth) {
        var ratio = (maxWidth / srcWidth);
        return { width: srcWidth*ratio, height: srcHeight*ratio };
    }

    showInDecimal(number) {
        return number !== Math.round(number) ? parseFloat(number.toFixed(2)) : number;
    }

    getEtiqueta(label) {
        return (label.etiqueta_abrev && label.etiqueta_abrev !== '') ? label.etiqueta_abrev: label.etiqueta;
    }
}