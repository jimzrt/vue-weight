<template>
  <div id="app">
    <section v-if="errored">
      <p>We're sorry, we're not able to retrieve this information at the moment, please try back later</p>
    </section>

    <section v-else>
      <b-container>
        <div v-if="loading">Loading...</div>

        <b-row
          class="text-center mb-5"
          v-else
          v-for="(_sections, index) in groupedSections"
          :key="`sections-${index}`"
        >
          <b-col v-for="section in _sections" :key="section.id">
            {{ section.id }}
            <WeigthChart :sectionId="section.id" :name="section.name" />
            <b-button v-b-modal.modal-center @click="weigh(section.id)">Messung hinzufügen!</b-button>

            <!-- <span class="lighten">
        <span v-html="currency.symbol"></span>{{ currency.rate_float}}
            </span>-->
          </b-col>
        </b-row>
        <b-modal id="modal-center" scrollable centered title="Neue Messung">
          <!-- <component v-bind:is="currentModalComponent"></component> -->
          <AddMeasurement :sectionId="currentSection"></AddMeasurement>
        </b-modal>
      </b-container>
    </section>
  </div>
</template>

<script>
import WeigthChart from "./components/WeightChart.vue";
import AddMeasurement from "./components/AddMeasurement.vue";


//import HelloWorld from './components/HelloWorld.vue'

export default {
  name: "App",
  components: {
    WeigthChart,
    AddMeasurement
  },
  data() {
    return {
      sections: null,
      loading: true,
      errored: false,
      currentSection: 0
    };
  },
  computed: {
    groupedSections() {
      return this._.chunk(this.sections, 2);
      // returns a nested array:
      // [[article, article, article], [article, article, article], ...]
    }
  },
  mounted() {
    this.$http
      .get("http://localhost:8383/weight?cmd=getSections")
      .then(response => {
        this.sections = response.data;
      })
      .catch(error => {
        console.log(error);
        this.errored = true;
      })
      .finally(() => (this.loading = false));
  },
  methods: {
    weigh(id) {
      this.currentSection = id;
      console.log("starte messung für: " + id);
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.echarts {
  width: 100%;
  height: 300px;
}
</style>
