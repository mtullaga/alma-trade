<template>
  <div class="q-pa-md">
    <div class="q-gutter-y-md">
      <q-tabs v-model="currentTab" class="text-teal">
        <q-tab name="stock_in" icon="login" label="STOCK IN" />
        <q-tab name="stock_out" icon="logout" label="STOCK OUT" />
      </q-tabs>

      <q-tab-panels v-model="currentTab" animated>
        <q-tab-panel name="stock_in">
          <div class="row">
            <div class="col-12 col-md-6 q-pr-md">1111</div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="stock_out">
          <div class="row">
            <div class="col-12 col-md-6 q-pr-md">22222</div>
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

export default defineComponent({
  name: "DashboardPage",
  setup() {
    const router = useRouter();

    return {
      currentTab: ref("stock_in"),
    };
  },
});
</script>
