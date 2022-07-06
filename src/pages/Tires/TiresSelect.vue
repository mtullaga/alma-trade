<template>
  <div class="">
    <q-table
      title="Tire Select Items"
      :rows="rows"
      :columns="columns"
      row-key="uid"
      :filter="filter"
      flat
      selection="single"
      v-model:selected="selected"
      :visible-columns="visibleColumns"
    >
      <template v-slot:top-right>
        <q-input debounce="300" color="primary" v-model="filter">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
    </q-table>
  </div>
</template>

<script>
import { useQuasar } from "quasar";
import { defineComponent, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { collection, getFirestore, onSnapshot } from "firebase/firestore";
import { tireColumns } from "src/config/grids";

export default defineComponent({
  name: "TireSelectPage",
  setup(props, { emit }) {
    const router = useRouter();
    const $q = useQuasar();
    const rows = ref([]);
    const filter = ref("");
    const selected = ref([]);
    const visibleColumns = ref([
      "description",
      "patternCode",
      "type",
      "category",
      "model",
      "brand",
      "totalQuantity",
      "price",
      "agingPayable",
    ]);

    const columns = ref(tireColumns);

    watch(selected, (newVal) => {
      //   console.log("select run");
      emit("update:selectedItem", newVal);
    });

    const db = getFirestore();
    const currentUserId = localStorage.getItem("currentUserId");

    onSnapshot(collection(db, "item_tires"), (coll) => {
      rows.value = [];
      coll.forEach((doc) => {
        if (doc.data().active == "1") {
          rows.value.push({
            description: doc.data().description,
            patternCode: doc.data().patternCode,
            type: doc.data().type,
            category: doc.data().category,
            totalQuantity: doc.data().totalQuantity,
            price: doc.data().price,
            model: doc.data().model,
            brand: doc.data().brand,
            agingPayable: doc.data().agingPayable,
            updatedBy: doc.data().updatedBy,
            created: doc.data().created,
            updated: doc.data().updated,
            uid: doc.id,
          });
        }
      });
    });

    return {
      rows,
      columns,
      filter,
      selected,
      visibleColumns,
      filterFnPattern(val, update) {
        if (val === "") {
          update(() => {
            patternCodeOptions.value = patternCodeOpt;
          });
          return;
        }
        update(() => {
          const needle = val.toLowerCase();
          patternCodeOptions.value = patternCodeOpt.filter(
            (v) => v.toLowerCase().indexOf(needle) > -1
          );
        });
      },
    };
  },
});
</script>
