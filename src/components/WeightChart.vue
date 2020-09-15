<template>
  <div>
    <b-spinner v-if="loading" label="Spinning"></b-spinner>

    <b-card-text>
      <div v-if="chartData.length > 0">
        <transition name="fade" mode="out-in">
          <v-chart v-if="mode === 'chart'" ref="chart" :options="chartOptions" />
          <b-table v-else striped hover :items="chartData" :fields="fields" sticky-header small>
            <template v-slot:table-busy>
              <div class="text-center text-danger my-2">
                <b-spinner class="align-middle"></b-spinner>
                <strong>Loading...</strong>
              </div>
            </template>
            <template v-slot:cell(0)="data">{{ data.value | formatDateObject }}</template>
          </b-table>
        </transition>
      </div>
      <div class="mt-5" v-else>Keine Messung vorhanden</div>
    </b-card-text>

    <!-- <div class="chart-placeholder" v-else>
        <p>no data...</p>
    </div>-->
  </div>
</template>
<script>
import { isoToDate, sortedIndex } from "../common/helpers.js";
import { Host } from "../common/consts.js";
import ECharts from "vue-echarts";
import "echarts/lib/chart/line";
import "echarts/lib/component/title";
import "echarts/lib/component/tooltip";
import "echarts/lib/component/grid";
import "echarts/lib/component/dataZoom";
import "echarts/lib/component/dataZoomSlider"


export default {
  name: "WeigthChart",
  props: {
    name: String,
    sectionId: Number
  },
  components: {
    "v-chart": ECharts
  },
  computed: {
    chartOptions: function() {
      return {
        title: {
          text: this.name,
          left: "center",
          show: false
        },
        dataZoom: [
          // {
          //   type: "inside",
          //   // start: 0,
          //   // end: 100
          // },
          {
            type: "slider",
            filterMode: "none",
            start: 70,
            end: 100,
            realtime: true
            // start: 0,
            // end: 100,
            // handleIcon:
            //   "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
            // handleSize: "80%",
            // handleStyle: {
            //   color: "#fff",
            //   shadowBlur: 3,
            //   shadowColor: "rgba(0, 0, 0, 0.6)",
            //   shadowOffsetX: 2,
            //   shadowOffsetY: 2
            // }
          }
        ],
        grid: {
          bottom: 80
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            animation: false,
            label: {
              backgroundColor: "#505765"
            }
          }
        },
        xAxis: {
          type: "time",
          boundaryGap: false
        },
        yAxis: {
          type: "value"
        },
        series: [
          {
            data: this.chartData,
            type: "line",

            //animationDuration: 100,
            smooth: false,
            lineStyle: {
              width: 3,
              color: "#00a2ff"
            }
          }
        ],
        animationDuration: 1000
      };
    },
    tableData: function() {
      let that = this;
      return this.chartData.map(function(x) {
        return {
          Datum: that.$options.filters.formatDateObject(x[0]),
          "Gewicht in kg": x[1]
        };
      });
    }
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
      mode: "chart",
      chartData: [],
      sectionData: [],
      loading: true,
      fields: [
        // A virtual column that doesn't exist in items
        //'index',
        // A column that needs custom formatting
        { key: "0", label: "Datum" },
        { key: "1", label: "Gewicht in kg" }
      ]
    };
  },
  mounted() {
    console.log("mounted weightchart");
    //let now = new Date()
    //let dayStr = [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-');
    this.$http
      .get(
        `http://${Host.ADDRESS}:${Host.PORT}/weight?cmd=getSectionData&sectionId=${this.sectionId}`
      )
      .then(response => {
        this.sectionData = response.data;
        for (const section of this.sectionData) {
          this.chartData.push([isoToDate(section.date), section.weight]);
        }
      })
      .catch(error => {
        console.log(error);
        this.errored = true;
      })
      .finally(() => (this.loading = false));

    //this.chartData.push([new Date(), 100]);
    // this.chartOptions.series[0].data = this.chartData;
  },
  methods: {
    addEvent(time, value) {
      console.log("new event: " + time + " - " + value);
      let newDate = isoToDate(time);
      let newIndex = sortedIndex(this.chartData, newDate);
      this.chartData.splice(newIndex, 0, [newDate, value]);
      //  this.chartData.push([isoToDate(time), value]);
    },
    changeView(mode) {
      this.mode = mode;
    },
    resize() {
      console.log("resize boy");
      if (this.mode === "chart" && this.$refs.chart) {
        this.$refs.chart.resize();
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.1s ease;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0.5;
  transform: translateX(10px);
}
.echarts {
  width: 100%;
  height: 300px;
}
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
