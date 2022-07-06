<template>
  <div class="q-pa-md">
    <div class="text-h5">Stock In</div>
    <div class="q-gutter-y-md">
      <q-tabs v-model="currentTab" class="text-teal">
        <q-tab name="tires" icon="tire_repair" label="Tires" />
        <q-tab name="mtubes" icon="donut_large" label="M Tubes" />
        <q-tab name="bikes" icon="pedal_bike" label="Bikes" />
        <q-tab
          name="motor-parts"
          icon="settings_input_composite"
          label="Motor Parts"
        />
      </q-tabs>

      <q-tab-panels v-model="currentTab" animated>
        <q-tab-panel name="tires">
          <div class="row">
            <div class="col-12 col-md-12 q-pr-md">
              <StockInTiresPage />
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="mtubes">
          <div class="row">
            <div class="col-12 col-md-6 q-pr-md">22222</div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="bikes">
          <div class="row">
            <div class="col-12 col-md-6 q-pr-md">333</div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="bikes">
          <div class="row">
            <div class="col-12 col-md-6 q-pr-md">444</div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter, useRoute } from "vue-router";
import StockInTiresPage from "pages/StockIn/StockInTires.vue";

export default defineComponent({
  name: "StockInPage",
  components: {
    StockInTiresPage,
  },
  setup() {
    const router = useRouter();

    return {
      currentTab: ref("tires"),
    };
  },
});
</script>
