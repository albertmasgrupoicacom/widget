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
            br: { col: 1, row: 3 },
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
}