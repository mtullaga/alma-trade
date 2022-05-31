<template>
  <div class="q-pa-md">Bikes</div>
</template>

<script>
import { defineComponent, ref } from "vue";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter, useRoute } from "vue-router";

export default defineComponent({
  name: "BikePage",
  setup() {
    const router = useRouter();

    return {};
  },
});
</script>
