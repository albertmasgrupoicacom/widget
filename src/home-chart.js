import Chart from 'chart.js/auto';

export class HomeChart {

  constructor(base_url, details) {

    const ctx = document.getElementById("graph_chart");
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['PSOE', 'PP', 'UP', 'VOX'],
        datasets: [
          {
            data: [50, 40, 5, 5],
            backgroundColor: ['#ED2B2A', '#533E85', '#9336B4', '#3EC70B'],
            circumference: 180,
            borderWidth: 1,
            rotation: 270,
            cutout: '50%'
          },
        ],
      }
    })
  }

}