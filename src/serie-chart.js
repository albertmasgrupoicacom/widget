import Chart from 'chart.js/auto';
import { serieButtons, colors } from './utils/utils';
import { SerieExport } from './utils/serie-export';
import { HttpClient } from './utils/http-client';
import { base_url } from './environments/environment.prod';
import { DataService } from './services/data.service';

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
        
        let filas = data.ficha.filas; //.slice(0, -1);
        let columnas = data.ficha.columnas;
        let datasets = [];
        let colorIndex = 0;
        if ( multiVariable) { //MULTIVARIABLE

            filas.forEach(fila => {
                datasets.push({label: fila, data: [], backgroundColor: colors[colorIndex], borderColor: colors[colorIndex],subLabels: []});
                colorIndex == 6 ? colorIndex = 0 : colorIndex++;
            });

            
            data.ficha.serie_temporal.map(x => {
                filas.map ((fila, index) => {
                    let variable = [];
                    // columnas.slice(0,-1).map( (columna ,index_col) => {
                    columnas.map( (columna ,index_col) => {
                        variable.push(x.datos[index][index_col]);
                        // datasets[index].data.push(x.datos[index][index_col])
                    })
                    datasets[index].data.push(variable);
                    // datasets[index].subLabels = (columnas.slice(0,-1)) //TODO: (N) falta al quitar la ultima
                });
            })

        } else {
            filas.forEach(fila => {
                datasets.push({label: fila, data: [], backgroundColor: colors[colorIndex], borderColor: colors[colorIndex]});
                colorIndex == 6 ? colorIndex = 0 : colorIndex++;
            });

            data.ficha.serie_temporal.map(x => {
                filas.map ((fila, index) => {datasets[index].data.push(x.datos[index])});
            })
        }

        return {titulo: data.ficha.titulo, labels: labels, secondfileLabels: secondfileLabels, datasets: datasets, subLabels: columnas };
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
        data.labels.forEach((label,index) => this.addHeaderCell(headerrow, label , data.secondfileLabels[index], data.subLabels ? data.subLabels.length : 0))

        tThead.appendChild(headerrow);


        //SUBHEADER
        if ( multivariable ) {
            const subHeaderrow = document.createElement('tr');
            this.addHeaderCell(subHeaderrow, '' , 0);
            data.datasets[0].data.map((dataset,index) => {
                // console.log(index)
                data.subLabels.forEach(item => {
                    this.addHeaderCell(subHeaderrow, item , 0);
                })
            });
            tThead.appendChild(subHeaderrow);
        }

        tblTable.appendChild(tThead);

        
        
        const tblBody = document.createElement('tbody');

        if ( multivariable ) {  // MULTIVARIABLE

            data.datasets.forEach(dataset => {
                const row = document.createElement('tr');
                this.addCell(row, dataset.label);
                dataset.data.forEach(item => this.addCellWithColumns(row, item))
                tblBody.appendChild(row);
            })

        }else{
            data.datasets.forEach(dataset => {
                const row = document.createElement('tr');
                this.addCell(row, dataset.label);
                dataset.data.forEach(item => this.addCell(row, item))
                tblBody.appendChild(row);
            })
        }
       

        tblTable.appendChild(tblBody);
        tbl.appendChild(tblTable);
        container.appendChild(tbl);
        let chartConfig = container.getAttribute('config')
        if(!multivariable) {
            this.printChart(data, chartConfig ? JSON.parse(chartConfig) : serieButtons[0]);
        }
    }

    addHeaderCell(row, contenido, secondfileLabel, colspan) {
        const headerCell = document.createElement('th');
        let cellText;
        if( secondfileLabel) {
            const paragraph = document.createElement('div');
            paragraph.insertAdjacentHTML('beforeend', `<div>${contenido}</div>`);
            paragraph.insertAdjacentHTML('beforeend', `<div class="secondFile">${secondfileLabel}</div>`);
            headerCell.appendChild(paragraph);
        } else {
            cellText = document.createTextNode(contenido);
            headerCell.appendChild(cellText);
        }
        headerCell.colSpan = colspan;
        row.appendChild(headerCell);
    }

    addCell(row, contenido) {
        const cell = document.createElement('td');
        const cellText = document.createTextNode(contenido);
        cell.appendChild(cellText);
        cell.classList.add('td');
        row.appendChild(cell);
    }

    addCellWithColumns(row, contenido) {
        contenido.forEach(item => {
            const cell = document.createElement('td');
            const cellText = document.createTextNode(item);
            cell.appendChild(cellText);
            cell.classList.add('td');
            row.appendChild(cell);
        })
    }

    printChart(data, config){
        const table = document.getElementById(`graph_table`);
        let canvas = document.createElement("canvas");
        canvas.id = `graph_chart`;
        table.insertAdjacentElement('beforeend', canvas);
        new Chart(canvas, {
        type: config && config.type ? config.type : 'line',
        data: data,
        options: {
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
                x: {stacked: config && config.stacked != undefined ? config.stacked : false},
                y: {beginAtZero: true, stacked: config && config.stacked != undefined ? config.stacked : false},
            },
        },
        });
        const container = document.getElementById(`graph_container`);
        container.setAttribute('config', JSON.stringify(config));
        this.printChartSelectionButtons(data);
    }

    printChartSelectionButtons(data){
        const chart = document.getElementById(`graph_chart`);
        let buttonsContainer = document.createElement('div');
        buttonsContainer.id = `graph_chart_buttons`;
        serieButtons.forEach(config => {
        let button = document.createElement('button');
        button.classList.add('graphic_btn', `graph_chart_button`);
        button.style.background = `url(${config.icon}) no-repeat`;
        button.onclick = () => {
            this.removeChart();
            this.printChart(data, config);
        }
        buttonsContainer.appendChild(button);
        });
        buttonsContainer.classList.add('my-3'); 
        buttonsContainer.classList.add('d-flex');
        buttonsContainer.classList.add('justify-content-end');
        chart.insertAdjacentElement('afterend', buttonsContainer);
    }

    removeContainer() {
        let container = document.getElementById('graph_container');
        if(container){container.remove()}
    }

    removeTable() {
        document.getElementById(`graph_table`).remove();
    }

    removeChart() {
        document.getElementById(`graph_chart`).remove();
        document.getElementById(`graph_chart_buttons`).remove();
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

}