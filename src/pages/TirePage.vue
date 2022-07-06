<template>
  <div class="q-pa-md">
    <div class="text-h5">Tire Item Management</div>
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="uid"
      :filter="filter"
      flat
      selection="multiple"
      v-model:selected="selected"
      :visible-columns="visibleColumns"
    >
      <template v-slot:top>
        <q-btn
          color="secondary"
          :disable="false"
          label="Add New Item"
          @click="
            clearFields();
            dialogLabel = 'Add New Item';
            showItemDialog = true;
          "
        />
        <q-btn
          class="q-ml-lg"
          color="primary"
          :disable="false"
          label="Update"
          v-if="selected.length == 1"
          @click="openUpdate"
        />
        <q-btn
          class="q-ml-lg"
          color="negative"
          :disable="false"
          label="Delete"
          @click="deleteItem"
          v-if="selected.length > 0"
        />
        <q-space />

        <q-input debounce="300" color="primary" v-model="filter">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
    </q-table>

    <q-dialog v-model="showItemDialog" persistent>
      <q-card style="width: 400px; max-width: 80vw">
        <q-card-section>
          <div class="text-h6">
            {{ dialogLabel }}
            <q-icon
              name="close"
              class="float-right q-mt-sm"
              @click="showItemDialog = false"
              style="cursor: pointer; font-weight: bold"
            />
          </div>
        </q-card-section>

        <q-separator />
        <q-card-section
          class="q-pt-none q-mt-sm scroll"
          style="max-height: 55vh"
        >
          <q-input
            type="text"
            v-model="description"
            label="Description"
            :rules="[(val) => !!val || 'Field is required']"
            lazy-rules
            ref="desciptionRef"
          />

          <q-select
            v-model="patternCode"
            use-input
            input-debounce="0"
            label="Pattern Code"
            :options="patternCodeOptions"
            @filter="filterFnPattern"
            :rules="[(val) => !!val || 'Field is required']"
            lazy-rules
            ref="patternCodeRef"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No results </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-select
            v-model="tireType"
            :options="tireTypeOptions"
            label="Type"
            :rules="[(val) => !!val || 'Field is required']"
            lazy-rules
            ref="typeRef"
          />

          <q-select
            v-model="category"
            :options="categoryOptions"
            label="Category"
            :rules="[(val) => !!val || 'Field is required']"
            lazy-rules
            ref="categoryRef"
          />

          <q-input type="text" v-model="model" label="Model" hint="" />

          <q-input type="text" v-model="brand" label="Brand" hint="" />

          <q-input
            type="number"
            v-model="price"
            label="Price"
            :rules="[(val) => !!val || 'Field is required']"
            lazy-rules
            ref="priceRef"
          />

          <q-input
            type="number"
            v-model="agingPayable"
            label="Aging Payable (Month)"
            :rules="[(val) => !!val || 'Field is required']"
            lazy-rules
            ref="agingPayableRef"
          />

          <div
            class="fit row wrap justify-center items-start content-start q-mt-md"
          >
            <q-btn
              class="q-ml-lg"
              color="primary"
              :disable="false"
              label="Save"
              @click="saveItem"
            />

            <q-btn
              class="q-ml-lg"
              color="negative"
              :disable="false"
              label="Clear"
              @click="clearFields"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { useQuasar } from "quasar";
import { defineComponent, ref } from "vue";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter, useRoute } from "vue-router";
import {
  collection,
  getDocs,
  getDoc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import {
  tireTypeOpt,
  patternCodeOpt,
  categoryOpt,
} from "src/config/optionsValue";
import { tireColumns } from "src/config/grids";

export default defineComponent({
  name: "TirePage",
  setup() {
    const router = useRouter();
    const $q = useQuasar();
    const rows = ref([]);
    const filter = ref("");
    const selected = ref([]);
    const dialogLabel = ref("");
    const showItemDialog = ref(false);
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
    const description = ref("");
    const columns = ref(tireColumns);
    const patternCode = ref(null);
    const tireType = ref(null);
    const category = ref(null);
    const model = ref("");
    const brand = ref("");
    const price = ref(0);
    const agingPayable = ref(0);
    const desciptionRef = ref();
    const patternCodeRef = ref();
    const typeRef = ref();
    const categoryRef = ref();
    const priceRef = ref();
    const agingPayableRef = ref();

    const patternCodeOptions = ref(patternCodeOpt);
    const tireTypeOptions = ref(tireTypeOpt);
    const categoryOptions = ref(categoryOpt);

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

    async function saveItem() {
      desciptionRef.value.validate();
      patternCodeRef.value.validate();
      typeRef.value.validate();
      categoryRef.value.validate();
      priceRef.value.validate();
      agingPayableRef.value.validate();

      if (
        description.value &&
        patternCode.value &&
        tireType.value &&
        category.value &&
        price.value &&
        agingPayable.value
      ) {
        if (dialogLabel.value == "Update Item") {
          try {
            await updateDoc(doc(db, "item_tires", selected.value[0].uid), {
              agingPayable: agingPayable.value,
              category: category.value,
              description: description.value,
              patternCode: patternCode.value,
              model: model.value,
              brand: brand.value,
              price: price.value,
              type: tireType.value,
              updated: serverTimestamp(),
              updatedBy: currentUserId,
            });
          } catch (err) {
            console.log(err);
            return;
          }

          $q.dialog({
            title: "Success",
            message: "Item successfully updated.",
          });
          showItemDialog.value = false;
          selected.value = [];
          clearFields();
        } else {
          try {
            await addDoc(collection(db, "item_tires"), {
              active: "1",
              agingPayable: agingPayable.value,
              category: category.value,
              description: description.value,
              patternCode: patternCode.value,
              model: model.value,
              brand: brand.value,
              price: price.value,
              totalQuantity: 0,
              type: tireType.value,
              updated: serverTimestamp(),
              created: serverTimestamp(),
              updatedBy: currentUserId,
            });
          } catch (err) {
            console.log(err);
            return;
          }

          $q.dialog({
            title: "Success",
            message: "New item successfully created.",
          });
          showItemDialog.value = false;
          selected.value = [];
          clearFields();
        }
      }
    }

    function deleteItem() {
      $q.dialog({
        title: "Confirm",
        message: "Are you sure you want to delete item/s?",
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        const batch = writeBatch(db);

        selected.value.forEach(async (el) => {
          batch.update(doc(db, "item_tires", el.uid), {
            active: "0",
            updated: serverTimestamp(),
            updatedBy: currentUserId,
          });
        });

        try {
          await batch.commit();
        } catch (err) {
          console.log(err);
          return;
        }

        $q.dialog({
          title: "Success",
          message: "Item/s successfully deleted.",
          persistent: true,
        });
        selected.value = [];
      });
    }

    function openUpdate() {
      clearFields();
      dialogLabel.value = "Update Item";
      showItemDialog.value = true;

      agingPayable.value = selected.value[0].agingPayable;
      category.value = selected.value[0].category;
      description.value = selected.value[0].description;
      patternCode.value = selected.value[0].patternCode;
      price.value = selected.value[0].price;
      tireType.value = selected.value[0].type;
      model.value = selected.value[0].model;
      brand.value = selected.value[0].brand;
    }

    function clearFields() {
      agingPayable.value = 0;
      category.value = "";
      description.value = "";
      patternCode.value = "";
      price.value = 0;
      tireType.value = "";
      model.value = "";
      brand.value = "";
    }

    return {
      rows,
      columns,
      filter,
      selected,
      dialogLabel,
      showItemDialog,
      visibleColumns,
      description,
      patternCode,
      tireType,
      category,
      price,
      agingPayable,
      desciptionRef,
      patternCodeRef,
      typeRef,
      categoryRef,
      priceRef,
      model,
      brand,
      agingPayableRef,
      patternCodeOptions,
      tireTypeOptions,
      categoryOptions,
      saveItem,
      clearFields,
      openUpdate,
      deleteItem,
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
