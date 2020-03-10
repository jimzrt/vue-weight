<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <div v-if="unknownValues.length > 0" class="mb-5">
        <p>Noch nicht zugewiesene Werte:</p>
        <b-list-group>
          <b-list-group-item
            v-for="value in unknownValues"
            :key="value.id"
            class="d-flex justify-content-between align-items-center py-0 pr-0"
          >
            {{value.date}} - {{value.weight}}
            <b-button-group>
              <b-button variant="outline-success">
                <b-icon-plus @click="addEvent(value.id)" style="width: 24px; height: 24px;"></b-icon-plus>
              </b-button>
              <b-button variant="outline-danger">
                <b-icon-x-octagon @click="removeEvent(value.id)" style="width: 24px; height: 24px;"></b-icon-x-octagon>
              </b-button>
            </b-button-group>
          </b-list-group-item>
        </b-list-group>
      </div>
      <div v-if="waiting" class="text-center">
        <p>Warte auf neue Werte...</p>
        <b-spinner type="grow" label="Spinning"></b-spinner>
      </div>
      <div v-else class="text-center">
        <p>Neuer Wert hinzugefügt!</p>
        <p>Gewicht: {{foundEvent.weight}}</p>
      </div>
      <!-- Hallo {{sectionId}} {{unknownValues}} -->
    </div>
  </div>
</template>

<script>
import { BIconPlus, BIconXOctagon } from "bootstrap-vue";

export default {
  name: "AddMeasurement",
  props: {
    sectionId: Number
  },
  components: {
    BIconPlus,
    BIconXOctagon
  },
  data() {
    return {
      polling: null,
      loading: true,
      waiting: true,
      currentDateInMs: Date.now(),
      foundEvent: null,
      unknownValues: []
    };
  },
  mounted() {
    console.log("mounted");
    // get old events
    this.$http
      .get("http://localhost:8383/weight?cmd=getUnknownValues")
      .then(response => {
        this.unknownValues = response.data;
      })
      .catch(error => {
        console.log(error);
        this.errored = true;
      })
      .finally(() => (this.loading = false));

    this.polling = setInterval(() => {
      this.checkForNewEvents();
    }, 5000);
  },
  beforeDestroy() {
    clearInterval(this.polling);
  },
  methods: {
    checkForNewEvents() {
      this.$http
        .get(
          "http://localhost:8383/weight?cmd=getNewValue&time=" +
            this.currentDateInMs + "&sectionId=" + this.sectionId
        )
        .then(response => {
          if (response.data) {
            this.foundEvent = response.data;
            this.waiting = false;
          }
        })
        .catch(error => {
          console.log(error);
          this.errored = true;
        });
    }
  }
};
</script>

