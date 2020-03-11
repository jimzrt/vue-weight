<template>
  <div class="p-3">
    <div v-if="loading">Loading...</div>
    <div v-else>
      <div class="text-center">
        <p>Warte auf neue Werte...</p>
        <b-spinner type="grow" label="Spinning"></b-spinner>
      </div>
      <div v-if="unknownValues.length > 0" class="mt-5">
        <p>Noch nicht zugewiesene Werte:</p>
        <b-list-group class="list-group-flush">
          <transition-group name="slide-fade">
            <b-list-group-item
              v-for="(value, index) in unknownValues"
              :key="value.id"
              class="d-flex justify-content-between align-items-center py-0 pr-0"
            >
              <b-badge variant="secondary" pill>
                <p class="mb-2 pr-2">
                  <b-icon-clock style="width: 18px; height: 18px;" shift-v="-2"></b-icon-clock>
                  {{value.date | formatDate}} Uhr
                </p>
              </b-badge>
              <b-badge variant="info" pill>
                <p class="m-2">{{value.weight.toFixed(2)}}kg</p>
              </b-badge>

              <b-button-group>
                <b-button @click="addEvent(index, value.id)" variant="success">
                  <b-icon-plus class="mr-1"></b-icon-plus>Hinzufügen
                </b-button>
                <b-button @click="removeEvent(index, value.id)" variant="danger">
                  <b-icon-x-octagon class="mr-1"></b-icon-x-octagon>Löschen
                </b-button>
              </b-button-group>
            </b-list-group-item>
          </transition-group>
        </b-list-group>
      </div>

      <!-- Hallo {{sectionId}} {{unknownValues}} -->
    </div>
  </div>
</template>

<script>
import { BIconPlus, BIconXOctagon, BIconClock } from "bootstrap-vue";
import { Host } from "../common/consts.js";

export default {
  name: "AddMeasurement",
  props: {
    sectionId: Number,
    name: String
  },
  components: {
    BIconPlus,
    BIconXOctagon,
    BIconClock
  },
  data() {
    return {
      polling: null,
      loading: true,
      currentDateInMs: Date.now(),
      unknownValues: []
    };
  },
  mounted() {
    console.log("mounted");
    // get old events
    this.$http
      .get(`http://${Host.ADDRESS}:${Host.PORT}/weight?cmd=getUnknownValues`)
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
    }, 3000);
  },
  beforeDestroy() {
    clearInterval(this.polling);
  },
  methods: {
    checkForNewEvents() {
      this.$http
        .get(
          `http://${Host.ADDRESS}:${Host.PORT}/weight?cmd=getNewValue&time=${this.currentDateInMs}&sectionId=${this.sectionId}`
        )
        .then(response => {
          if (response.data) {
            clearInterval(this.polling);
            this.$swal
              .fire(
                "Hinzugefügt!",
                `Messung von ${response.data.weight}kg hinzugefügt`,
                "success"
              )
              .then(() => {
                this.$emit(
                  "newValue",
                  this.sectionId,
                  response.data.date,
                  response.data.weight
                );
                this.$emit("done");
              });
          }
        })
        .catch(error => {
          console.log(error);
          this.errored = true;
        });
    },
    addEvent(index, id) {
      console.log("add " + id);
      this.$swal
        .fire({
          title: "Bestätigen",
          text: `Möchten Sie diese Messung ${this.name} zuordnen?`,
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Ja",
          cancelButtonText: "Nein",
          reverseButtons: false
        })
        .then(result => {
          if (result.value) {
            return this.$http.get(
              `http://${Host.ADDRESS}:${Host.PORT}/weight?cmd=addEventToSection&eventId=${id}&sectionId=${this.sectionId}`
            );
          } else {
            return Promise.reject(new Error("dismissed"));
          }
        })
        .then(response => {
          console.log(response);
          return this.$swal.fire(
            "Hinzugefügt!",
            "Messung wurde hinzugefügt",
            "success"
          );
        })
        .then(() => {
          let event = this.unknownValues[index];
          this.$emit("newValue", this.sectionId, event.date, event.weight);
          this.$delete(this.unknownValues, index);
          //emit this shit
        })
        .catch(error => {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log("Netzwerkfehler");
            this.$swal.fire({
              icon: "error",
              title: "Error",
              text: "Netzwerkfehler"
            });
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log("Netzwerkfehler");
            this.$swal.fire({
              icon: "error",
              title: "Error",
              text: "Netzwerkfehler"
            });
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log("Error", error.message);
          }
        });
    },
    removeEvent(index, id) {
      console.log("remove " + id);
      this.$swal
        .fire({
          title: "Bestätigen",
          text: "Möchten Sie diese Messung vollständig löschen?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Ja",
          cancelButtonText: "Nein",
          reverseButtons: false
        })
        .then(result => {
          if (result.value) {
            return this.$http.get(
              `http://${Host.ADDRESS}:${Host.PORT}/weight?cmd=removeEvent&eventId=${id}`
            );
          } else {
            return Promise.reject(new Error("dismissed"));
          }
        })
        .then(response => {
          console.log(response);
          return this.$swal.fire(
            "Gelöscht!",
            "Messung wurde gelöscht",
            "success"
          );
        })
        .then(() => {
          this.$delete(this.unknownValues, index);
        })
        .catch(error => {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log("Netzwerkfehler");
            this.$swal.fire({
              icon: "error",
              title: "Error",
              text: "Netzwerkfehler"
            });
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log("Netzwerkfehler");
            this.$swal.fire({
              icon: "error",
              title: "Error",
              text: "Netzwerkfehler"
            });
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log("Error", error.message);
          }
        });
    },
    showConfirm(
      title = "Bestätigen",
      text = "Möchten Sie diese Messung vollständig entfernen?",
      danger = false
    ) {
      return this.$bvModal
        .msgBoxConfirm(text, {
          title: title,
          size: "sm",
          buttonSize: "sm",
          okVariant: danger ? "danger" : "info",
          okTitle: "YES",
          cancelTitle: "NO",
          footerClass: "p-2",
          hideHeaderClose: false,
          centered: true
        })
        .catch(err => {
          // An error occurred
          console.log(err);
        });
    }
  }
};
</script>

<style>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
</style>