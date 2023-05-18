/**
 * This is the main entry point of the portlet.
 *
 * See https://tinyurl.com/js-ext-portlet-entry-point for the most recent 
 * information on the signature of this function.
 *
 * @param  {Object} params a hash with values of interest to the portlet
 * @return {void}
 */
import Chart from 'chart.js/auto';
import mock from './mono_var.json';

export default function main({portletNamespace, contextPath, portletElementId}) {
    // fetch('./assets/mock.json')
    //     .then((response) => response.json())
    //     .then((json) => console.log(json));
    console.log(mock);

    let data_extract = {};
    data_extract.filas = mock.filas;

    const node = document.getElementById(portletElementId);

    node.innerHTML =`<canvas id="chart" width="400" height="400"></canvas>`;

        const ctx = document.getElementById('chart');
        const labels = ['Enero','Febrero','Marzo'];
        const myChart = new Chart(ctx, {
            type: 'bar',
            data :{
            labels: labels,
            datasets: [
                {
                label: 'Dataset 1',
                data: [1,5,8],
                backgroundColor: 'yellow',
                },
                {
                label: 'Dataset 2',
                data: [1,5,8],
                backgroundColor: 'red',
                },
                {
                label: 'Dataset 3',
                data: [1,5,8],
                backgroundColor: 'green',
                },
            ]
            },
            options: {
                plugins: {
                title: {
                    display: true,
                    text: 'Chart.js Bar Chart - Stacked'
                },
                },
                responsive: true,
                scales: {
                x: {
                    stacked: true,
                },
                y: {
                    min: 0,
                    max: 25,
                    stacked: true
                }
                }
            }
        });
        
    
}