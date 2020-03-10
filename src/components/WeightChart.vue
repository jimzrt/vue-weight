<template>
  <div>
    
    <v-chart ref="chart" :options="polar" />
  </div>
</template>
<script>
import ECharts from "vue-echarts";
import "echarts/lib/chart/line";
import "echarts/lib/component/title";
import "echarts/lib/component/tooltip";

export default {
  name: "WeigthChart",
  props: {
    name: String,
    sectionId: Number
  },
  components: {
    "v-chart": ECharts
  },
  data() {
    // let data = [];
    // let now = new Date(1997, 9, 3);
    // let oneDay = 24 * 3600 * 1000;
    // let value = Math.random() * 100;
    // for (var i = 0; i < 100; i++) {
    //   data.push(randomData());
    // }

    // function randomData() {
    //   now = new Date(+now + oneDay);
    //   value = value + Math.random() * 21 - 10;
    //   return {
    //     name: now.toString(),
    //     value: [
    //       [now.getFullYear(), now.getMonth() + 1, now.getDate()].join("/"),
    //       Math.round(value)
    //     ]
    //   };
    // }

    return {
      chartData: [],
      sectionData: [],
      polar: {
        title: {
          text: this.name
        },
        tooltip: {
          trigger: "axis"
        },
        xAxis: {
          type: "time"
        },
        yAxis: {
          type: "value"
        },
        series: [
          {
            data: null,
            type: "line"
          }
        ]
      }
    };
  },
  mounted() {
    //let now = new Date()
    //let dayStr = [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-');
    this.$refs.chart.showLoading();
    this.$http
      .get(
        "http://localhost:8383/weight?cmd=getSectionData&sectionId=" +
          this.sectionId
      )
      .then(response => {
        this.sectionData = response.data;
        for (const section of this.sectionData) {
          this.chartData.push([new Date(section.date), section.weight]);
        }
      })
      .catch(error => {
        console.log(error);
        this.errored = true;
      })
      .finally(() => this.$refs.chart.hideLoading());

    //this.chartData.push([new Date(), 100]);
    this.polar.series[0].data = this.chartData;

    //this.polar.title.text = "hallo";
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
} */
</style>
