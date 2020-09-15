<template>
  <div id="app">
    <section v-if="errored">
      <p>We're sorry, we're not able to retrieve this information at the moment, please try back later</p>
    </section>

    <section v-else>
      <b-container>
        <div v-if="loading">Loading...</div>
        <div v-else>
          <b-form-input
            id="range-1"
            v-model="cardsPerRow"
            type="range"
            min="1"
            max="4"
            @input="changeSize"
          ></b-form-input>

          <b-row class="text-center" cols="1" cols-sm="2" :cols-lg="cardsPerRow">
            <b-col v-for="section in sections" :key="section.id" class="mb-5">
              <b-card
                class="chart-placeholder text-center"
                header-text-variant="white"
                header-bg-variant="secondary"
              >
                <template v-slot:header>
                  <h3 class="mb-0">{{section.name}}</h3>
                </template>
                <b-tabs content-class="mt-1" fill>
                  <b-tab title="Diagramm" @click="changeView('chart', section.id)"></b-tab>
                  <b-tab title="Tabelle" @click="changeView('table', section.id)"></b-tab>
                  <WeigthChart
                    :ref="`chart${section.id}`"
                    :sectionId="section.id"
                    :name="section.name"
                  />
                </b-tabs>

                <template v-slot:footer>
                  <b-button
                    v-b-modal.modal-center
                    @click="weigh(section.id, section.name)"
                  >Messung hinzufügen</b-button>
                </template>
              </b-card>

            </b-col>
          </b-row>
          <b-row class="mb-5">
            <b-col>
             <ScatterChart
                  />
                  </b-col>
          </b-row>

          <b-modal id="modal-center" scrollable centered hide-footer size="lg">
            <template v-slot:modal-title>Neue Messung für {{currentName}}</template>
            <AddMeasurement
              :sectionId="currentSection"
              :name="currentName"
              @newValue="newValue"
              @done="$bvModal.hide('modal-center')"
            ></AddMeasurement>
            <b-button class="mt-3" block @click="$bvModal.hide('modal-center')">Abbrechen</b-button>
          </b-modal>
        </div>
      </b-container>
    </section>
  </div>
</template>

<script>
import WeigthChart from "./components/WeightChart.vue";
import AddMeasurement from "./components/AddMeasurement.vue";
import ScatterChart from "./components/ScatterChart.vue";
import { Host } from "./common/consts.js";

//import HelloWorld from './components/HelloWorld.vue'

export default {
  name: "App",
  components: {
    AddMeasurement,
    WeigthChart,
    ScatterChart
  },
  data() {
    return {
      sections: null,
      loading: true,
      errored: false,
      currentSection: 0,
      currentName: "",
      cardsPerRow: 2
      // dataComponent: [WeigthChart],
      // selectedComponent: 0
    };
  },
  computed: {
    colSize() {
      return parseInt(12 / this.cardsPerRow);
    },
    groupedSections() {
      return this._.chunk(this.sections, this.cardsPerRow);
      // returns a nested array:
      // [[article, article, article], [article, article, article], ...]
    }
  },
  mounted() {
    this.$http
      .get(`http://${Host.ADDRESS}:${Host.PORT}/weight?cmd=getSections`)
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
    weigh(id, name) {
      // this.$refs[`chart${id}`][0].addEvent(new Date(), 80.2)
      this.currentSection = id;
      this.currentName = name;
      console.log("starte messung für: " + id);
    },
    newValue(sectionId, time, value) {
      console.log("time", time, "value", value);
      this.$refs[`chart${sectionId}`][0].addEvent(time, value);
    },
    changeView(mode, sectionId) {
      console.log("change", mode, sectionId);
      this.$refs[`chart${sectionId}`][0].changeView(mode);
    },
    changeSize(value) {
      console.log("CHANGEE", value);
      this.$nextTick().then(() => {
        for (let section of this.sections) {
          let refName = `chart${section.id}`;
          this.$refs[refName][0].resize();
        }
      });
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
.chart-placeholder {
  width: 100%;
  height: 500px;
}

</style>
