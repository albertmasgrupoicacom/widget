import Chart from 'chart.js/auto';
import { serieButtons, colors, zoomButtonIcon } from './utils/utils';
import { SerieExport } from './utils/serie-export';
import { HttpClient } from './utils/http-client';
import { base_url } from './environments/environment.prod';
import { DataService } from './services/data.service';

// function showPopUp(canvasId){
//   console.log(canvasId);
// }

export class SerieChart {

    constructor() {
        this._dataService = new DataService()
        this._http = new HttpClient();
        this._exportUtils = new SerieExport();
    }
    
    init(){
        this.removeContainer();
        this._http.get( `${base_url}/serie/${this._dataService.getParams().id}`).then(data => {
            this.data = data;
            if(data && data.ficha) {
                this.printContainer(data);
            }
        }).catch(error => {
            console.error('Error', error);
        });
    }

    getParsedData(rawData, multiVariable){
        const data = JSON.parse(JSON.stringify(rawData));

        let labels = data.ficha.serie_temporal.map(label => label.fecha);
        let secondfileLabels = data.ficha.serie_temporal.map(sublabel => `${sublabel.estudio} ${sublabel.codigo}`);
        let anchors = data.ficha.serie_temporal.map(item => this.getUrl(item.idEstudio, item.idPregunta, item.idVariable));
        
        let filas = data.ficha.filas;
        let columnas = data.ficha.columnas;
        let datasets = [];
        let colorIndex = 0;
        if ( multiVariable) {
            filas.forEach(fila => {
                datasets.push({label: fila, data: [], backgroundColor: colors[colorIndex], borderColor: colors[colorIndex],subLabels: []});
                colorIndex == colors.length - 1 ? colorIndex = 0 : colorIndex++;
            });
            data.ficha.serie_temporal.map(x => {
                filas.map ((fila, index) => {
                    let variable = [];
                    columnas.map( (columna ,index_col) => {
                        variable.push(x.datos[index][index_col]);
                    })
                    datasets[index].data.push(variable);
                });
            })

        } else {
            filas.forEach(fila => {
                datasets.push({label: fila, data: [], backgroundColor: colors[colorIndex], borderColor: colors[colorIndex]});
                colorIndex == 6 ? colorIndex = 0 : colorIndex++;
            });
            data.ficha.serie_temporal.map(x => {
                filas.map ((fila, index) => {
                    let a = x.datos[index];
                    if( a && a.replace) {
                        a = a.replace('(', '')
                        a = a.replace(')', '')
                    } else {
                        a= '-'
                    }
                    datasets[index].data.push(a)
                });
            })
        }

        return {titulo: data.ficha.titulo, labels: labels, anchors: anchors, secondfileLabels: secondfileLabels, datasets: datasets, subLabels: columnas };
    }

    printContainer(data){
        const page = document.getElementById('graph_page');
        let container = document.createElement('div');
        container.id = `graph_container`;
        page.appendChild(container);
        this.printHeader(data);
    }

    printHeader(data){
        const container = document.getElementById("graph_container");
        const htmlHeader = `
            <div><h4>Serie:</h4><p>${data.ficha.codigo || '-'}</p>&nbsp;-&nbsp;<p>${data.ficha.titulo || '-'}</p></div>
            <div><h4>Muestra:</h4><p>${data.ficha.muestra || '-'}</p></div>
            <div><h4>Pregunta:</h4>${data.ficha.pregunta || '-'}</div>
            <div><h4>Notas:</h4><p>${data.ficha.notas || '-'}</p></div>`;
        container.insertAdjacentHTML( 'afterbegin', htmlHeader);
        const multivariable = data.ficha.multiVariable;
        this.printTable(this.getParsedData(data, multivariable),multivariable);
    }

    printTable(data,multivariable){
        const container = document.getElementById(`graph_container`);
        const tbl = document.createElement('div');
        tbl.id = `graph_table`;
        tbl.classList.add('table', 'table-responsive', 'border-0');

        const tblTable = document.createElement('table');
        tblTable.id = `table`;
        tblTable.classList.add('cis-tabla', 'mb-5');

        const tThead = document.createElement('thead');
        const headerrow = document.createElement('tr');

        this.addHeaderCell(headerrow, '');
        data.labels.forEach((label,index) => this.addHeaderCell(headerrow, label, data.anchors[index], data.secondfileLabels[index], data.subLabels ? data.subLabels.length : 0))
        tThead.appendChild(headerrow);

        //SUBHEADER
        if ( multivariable ) {
            const subHeaderrow = document.createElement('tr');
            this.addHeaderCell(subHeaderrow, '', true, 0);
            data.datasets[0].data.map((dataset,index) => {
                data.subLabels.forEach(item => {
                    this.addHeaderCell(subHeaderrow, item, 0);
                })
            });
            tThead.appendChild(subHeaderrow);
        }

        tblTable.appendChild(tThead);

        const tblBody = document.createElement('tbody');

        if ( multivariable ) {  // MULTIVARIABLE

            data.datasets.forEach(dataset => {
                const row = document.createElement('tr');
                this.addCell(row, dataset.label, dataset.label);
                dataset.data.forEach(item => this.addCellWithColumns(row, item, dataset.label))
                tblBody.appendChild(row);
            })

        }else{
            data.datasets.forEach(dataset => {
                const row = document.createElement('tr');
                this.addCell(row, dataset.label, dataset.label);
                dataset.data.forEach(item => this.addCell(row, item, dataset.label))
                tblBody.appendChild(row);
            })
        }
       

        tblTable.appendChild(tblBody);
        tbl.appendChild(tblTable);
        container.appendChild(tbl);
        let chartConfig = container.getAttribute('config') ? JSON.parse(container.getAttribute('config')) : serieButtons[0]
        if(!multivariable) {
            this.printChart('default', this.getSplitMediaData(data), chartConfig);
            let medias = this.getMedia(data);
            if(medias){
                this.printChart('media', this.getSplitMediaData(data, medias), chartConfig);
            }
        }
    }

    getMedia(data){
        let medias = [];
        let mediaIndex = data.datasets.findIndex(dataset => dataset.label == 'MEDIA');
        if(mediaIndex && data.datasets[mediaIndex+1].label == 'DESV. TÍP.'){
            medias.push(data.datasets[mediaIndex])
            medias.push(data.datasets[mediaIndex+1])
        }
        return medias.length ? medias : undefined
    }

    addHeaderCell(row, contenido, anchor, secondfileLabel, colspan) {
        const headerCell = document.createElement('th');
        let cellText;
        if( secondfileLabel) {
            const paragraph = document.createElement(anchor ? 'a' : 'div');
            paragraph.insertAdjacentHTML('beforeend', `<div>${contenido}</div>`);
            paragraph.insertAdjacentHTML('beforeend', `<div class="secondFile">${secondfileLabel}</div>`);
            paragraph.classList.add('table_header_link');
            paragraph.href = anchor ? anchor : undefined;
            paragraph.target = "_blank";
            headerCell.appendChild(paragraph);
        } else {
            cellText = document.createTextNode(contenido);
            headerCell.appendChild(cellText);
        }
        headerCell.colSpan = colspan;
        row.appendChild(headerCell);
    }

    addCell(row, contenido, datasetLabel) {
        const cell = document.createElement('td');
        const cellText = document.createTextNode(contenido);
        cell.appendChild(cellText);
        cell.classList.add('td');
        let mediaRows = ['MEDIA', 'DESV. TÍP.'];
        let totalRows = ['N', '(N)'];
        if(mediaRows.includes(datasetLabel)){cell.classList.add('table_highlight_text')}
        if(totalRows.includes(datasetLabel)){cell.classList.add('table_highlight_background')}
        row.appendChild(cell);
    }

    addCellWithColumns(row, contenido, datasetLabel) {
        contenido.forEach(item => {
            const cell = document.createElement('td');
            const cellText = document.createTextNode(item);
            cell.appendChild(cellText);
            cell.classList.add('td');
            if(datasetLabel == '(N)'){cell.classList.add('table_highlight_background')}
            row.appendChild(cell);
        })
    }

    printChart(type, data, config){
        const table = document.getElementById(`graph_table`);
        let canvas = document.createElement("canvas");
        canvas.id = `graph_chart_${type}`;
        table.insertAdjacentElement('beforeend', canvas);
        new Chart(canvas, {
        type: config && config.type ? config.type : 'line',
        data: data,
        options: {
            pointRadius: 0,
            indexAxis: config && config.axis ? config.axis : 'x',
            plugins: {
                title: {
                    display: true,
                    text: data.titulo,
                    position: 'top',
                    color: '#005767',
                    font: {size: 16}
                },
                legend: {display: true, position: 'bottom'},
            },
            responsive: true,
            scales: {
                x: {stacked: config && config.stacked != undefined ? config.stacked : false, title: {display: true, text: type == 'default' ? 'Valores en porcentaje sobre total' : 'Media'}},
                y: {beginAtZero: true, stacked: config && config.stacked != undefined ? config.stacked : false},
            },
        },
        });
        const container = document.getElementById(`graph_container`);
        container.setAttribute('config', JSON.stringify(config));
        this.printChartSelectionButtons(type);
    }

    printChartSelectionButtons(type){
        const chart = document.getElementById(`graph_chart_${type}`);
        let buttonsContainer = document.createElement('div');
        buttonsContainer.id = `graph_chart_${type}_buttons`;

        let zoomButton = document.createElement('button');
        zoomButton.classList.add('graphic_btn', `graph_chart_button`);
        zoomButton.style.background = `url(${zoomButtonIcon}) no-repeat`;
        zoomButton.onclick = () => {
          showPopUp(`graph_chart_${type}`)
        }
        buttonsContainer.appendChild(zoomButton);
        buttonsContainer.classList.add('my-3'); 
        buttonsContainer.classList.add('d-flex');
        buttonsContainer.classList.add('justify-content-end');
        chart.insertAdjacentElement('afterend', buttonsContainer);
    }

    getSplitMediaData(rawData, medias){
        const data = JSON.parse(JSON.stringify(rawData));
        if(medias){
            data.datasets = medias;
        }else{
            let media = ['MEDIA', 'DESV. TÍP.', 'N'];
            let counter = 0;
            for(let i = 0; i < 3; i++){counter += data.datasets[(data.datasets.length - i) -1].label == media[(media.length - i) -1] ? 1 : 0;}
            if(counter == media.length){data.datasets = data.datasets.splice(0, data.datasets.length - media.length)}
            let lastRow = data.datasets[data.datasets.length -1];
            if(lastRow.label == '(N)'){data.datasets.pop()}
        }
        return data;
    }

    removeContainer() {
        let container = document.getElementById('graph_container');
        if(container){container.remove()}
    }

    exportExcel(){
        if(this.data){
            this._exportUtils.exportToExcel(this.data.ficha);
        }
    }
    
    exportPdf(){
        if(this.data){
            this._exportUtils.exportToPDF(this.data.ficha);
        }
    }

    getUrl(idEstudio, idPregunta, idVariable){
        let url = 'https://webserver-cis-dev.lfr.cloud/es/web/cis/detalle-ficha-estudio?origen=estudio'
        if(idEstudio || idPregunta || idVariable){
            url += idEstudio ? `&idEstudio=${idEstudio}` : '';
            url += idPregunta ? `&idPregunta=${idPregunta}` : '';
            url += idVariable ? `&idVariable=${idVariable}` : '';
            return url;
        }else{
            return null;
        }
    }

}