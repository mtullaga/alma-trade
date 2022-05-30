<template>
    <div class="q-pa-md">
        <div class="q-gutter-y-md" style="max-width: 600px">
            <q-tabs
                v-model="tab"
                class="text-teal"
            >
                <q-tab name="mails" icon="mail" label="Mails" />
                <q-tab name="alarms" icon="alarm" label="Alarms" />
                <q-tab name="movies" icon="movie" label="Movies" />
            </q-tabs>
        </div>
    </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter, useRoute } from "vue-router";

export default defineComponent({
  name: 'TirePage',
  setup () {
    const router = useRouter();
    

    return {
        
    }
  }
})
</script>
