<template>
  <div class="q-pa-md">
    <div class="text-h6">Tires Stock In History</div>
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="uid"
      :filter="filter"
      flat
      :visible-columns="visibleColumns"
    >
      <template v-slot:top>
        <q-btn
          color="secondary"
          label="Add New Stock"
          @click="showStockInDialog = true"
        />

        <q-space />

        <q-input
          class="q-mr-xl"
          debounce="300"
          color="primary"
          v-model="filter"
          label="Search"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-checkbox v-model="showDeleted" label="Show Deleted" />
      </template>

      <template v-slot:body="props">
        <q-tr
          :props="props"
          :class="
            props.row.active == '0'
              ? 'bg-red-7 text-white'
              : 'bg-white text-black'
          "
        >
          <q-td key="uid" :props="props">{{ props.row.uid }}</q-td>
          <q-td key="itemId" :props="props">{{ props.row.itemId }}</q-td>
          <q-td key="itemDesc" :props="props">{{ props.row.itemDesc }}</q-td>
          <q-td key="itemType" :props="props">{{ props.row.itemType }}</q-td>
          <q-td key="itemPattern" :props="props">{{
            props.row.itemPattern
          }}</q-td>
          <q-td key="recentQty" :props="props">{{ props.row.recentQty }}</q-td>
          <q-td key="addedQty" :props="props">{{ props.row.addedQty }}</q-td>
          <q-td key="totalQty" :props="props">{{ props.row.totalQty }}</q-td>
          <q-td key="addedBy" :props="props">{{ props.row.addedBy }}</q-td>
          <q-td key="created" :props="props">{{
            formatDate(props.row.created)
          }}</q-td>
          <q-td key="deletedBy" :props="props">{{ props.row.deletedBy }}</q-td>
          <q-td key="deleted" :props="props">{{
            formatDate(props.row.deleted)
          }}</q-td>
          <q-td key="action" :props="props" v-if="props.row.active == '1'">
            <q-btn
              color="red"
              icon="delete_outline"
              @click="deleteStock(props.row)"
            >
              <q-tooltip
                anchor="center right"
                self="center left"
                :offset="[10, 0]"
              >
                Remove Item
              </q-tooltip>
            </q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <q-dialog v-model="showStockInDialog" persistent>
      <q-card style="width: 900px; max-width: 160vw">
        <q-card-section>
          <div class="text-h6">
            Add Tires Stocks
            <q-icon
              name="close"
              class="float-right q-mt-sm"
              @click="
                currentTab = 'selectItem';
                showStockInDialog = false;
              "
              style="cursor: pointer; font-weight: bold"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-none scroll">
          <q-tabs v-model="currentTab" class="text-teal">
            <q-tab
              name="selectItem"
              icon="touch_app"
              label="Select Item"
              @click="goPrev"
            />
            <q-tab
              name="setQty"
              icon="app_registration"
              label="Set Add Qty"
              :disable="disableNext"
              @click="goNext"
            />
          </q-tabs>

          <q-tab-panels v-model="currentTab" animated>
            <q-tab-panel name="selectItem">
              <TireSelect v-model:selectedItem="selectedItem"></TireSelect>

              <div
                class="fit row wrap justify-center items-start content-start q-mt-md"
              >
                <q-btn
                  class="q-ml-lg"
                  color="primary"
                  :disable="disableNext"
                  label="Next"
                  @click="goNext"
                  icon-right="navigate_next"
                />
              </div>
            </q-tab-panel>
            <q-tab-panel name="setQty">
              <q-input
                type="text"
                v-model="description"
                label="Description"
                readonly
                hint=""
              />

              <q-input
                type="text"
                v-model="patternCode"
                label="Pattern Code"
                hint=""
                readonly
              />
              <q-input
                type="text"
                v-model="type"
                label="Tire Type"
                hint=""
                readonly
              />

              <q-input
                type="text"
                v-model="model"
                label="Model"
                readonly
                hint=""
              />

              <q-input
                type="number"
                v-model="price"
                label="Price"
                readonly
                hint=""
              />

              <q-input
                type="number"
                v-model="recentQty"
                label="Recent Quantity"
                hint=""
                readonly
              />

              <q-input
                type="number"
                v-model="addQty"
                label="Additional Stock"
                :rules="[
                  (val) => Number(val) >= 1 || 'Please input 1 or higher.',
                ]"
                lazy-rules
              />

              <q-input
                class="text-bold"
                type="number"
                v-model="totalQty"
                label="Total Quantity"
                hint=""
                readonly
              />

              <div
                class="fit row wrap justify-center items-start content-start q-mt-md"
              >
                <q-btn
                  class="q-ml-lg"
                  color="primary"
                  :disable="false"
                  label="Back"
                  icon="navigate_before"
                  @click="goPrev"
                />

                <q-btn
                  class="q-ml-lg"
                  color="secondary"
                  :disable="Number(addQty) <= 0"
                  label="Save"
                  @click="saveItem"
                />
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { useQuasar } from "quasar";
import { defineComponent, onMounted, ref, watch } from "vue";
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
import { stockInTireColumns } from "src/config/grids";
import TireSelect from "pages/Tires/TiresSelect.vue";

export default defineComponent({
  name: "StockInTiresPage",
  components: {
    TireSelect,
  },
  setup() {
    const router = useRouter();
    const $q = useQuasar();
    const rows = ref([]);
    const filter = ref("");
    const dialogLabel = ref("");
    const showStockInDialog = ref(false);
    const visibleColumns = ref([
      "itemDesc",
      "itemType",
      "itemPattern",
      "recentQty",
      "addedQty",
      "totalQty",
      "addedBy",
      "created",
      "action",
    ]);

    const columns = ref(stockInTireColumns);

    const description = ref("");
    const patternCode = ref("");
    const type = ref("");
    const category = ref("");
    const model = ref("");
    const price = ref(0);
    const recentQty = ref(0);
    const addQty = ref(0);
    const totalQty = ref(0);

    const disableNext = ref(true);
    const selectedItem = ref([]);
    const currentTab = ref("selectItem");
    const showDeleted = ref(false);

    const db = getFirestore();
    const currentUserId = localStorage.getItem("currentUserId");

    onMounted(() => {
      loadStockItems("1");
    });

    async function loadStockItems(isActive) {
      let rowTires = [];
      let rowStockIn = [];
      let rowUsers = [];

      try {
        const queryTires = await getDocs(
          query(collection(db, "item_tires"), where("active", "==", "1"))
        );

        let queryStockIn = await getDocs(collection(db, "stock_in"));

        const queryUsers = await getDocs(collection(db, "users"));

        queryTires.forEach((doc) => {
          rowTires.push({
            description: doc.data().description,
            patternCode: doc.data().patternCode,
            type: doc.data().type,
            uid: doc.id,
          });
        });

        queryUsers.forEach((doc) => {
          rowUsers.push({
            fullName: doc.data().firstName + " " + doc.data().lastName,
            uid: doc.id,
          });
        });

        queryStockIn.forEach((doc) => {
          let filtTires = rowTires.filter((x) => x.uid == doc.data().item);
          let filtUsersAdd = rowUsers.filter(
            (x) => x.uid == doc.data().addedBy
          );
          let filtUsersDelete = "";

          if (isActive == "0") {
            let filtUsersDeleted = rowUsers.filter(
              (x) => x.uid == doc.data().deletedBy
            );
            if (filtUsersDeleted.length > 0) {
              filtUsersDelete = filtUsersDeleted[0].fullName;
            }
          }

          rowStockIn.push({
            itemId: filtTires[0].uid,
            itemDesc: filtTires[0].description,
            itemType: filtTires[0].type,
            itemPattern: filtTires[0].patternCode,
            recentQty: doc.data().recentQty,
            addedQty: doc.data().addedQty,
            totalQty:
              Number(doc.data().addedQty) + Number(doc.data().recentQty),
            addedBy: filtUsersAdd[0].fullName,
            deletedBy: filtUsersDelete,
            created: doc.data().created,
            deleted: doc.data().updated,
            uid: doc.id,
            active: doc.data().active,
          });
        });

        setTimeout(() => {
          rowStockIn.sort((dt1, dt2) => {
            return dt2.created.toDate() - dt1.created.toDate();
          });

          rows.value = rowStockIn;

          console.log(rows.value);
        }, 50);
      } catch (err) {
        console.log(err);
        return;
      }
    }

    async function saveItem() {
      $q.dialog({
        title: "Confirm",
        message: "Would you like to save new stock/s?",
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await addDoc(collection(db, "stock_in"), {
            active: "1",
            addedBy: currentUserId,
            item: selectedItem.value[0].uid,
            recentQty: selectedItem.value[0].totalQuantity,
            addedQty: Number(addQty.value),
            deletedBy: "",
            updated: serverTimestamp(),
            created: serverTimestamp(),
            updatedBy: currentUserId,
          });

          await updateDoc(doc(db, "item_tires", selectedItem.value[0].uid), {
            totalQuantity:
              Number(selectedItem.value[0].totalQuantity) +
              Number(addQty.value),
            updated: serverTimestamp(),
            updatedBy: currentUserId,
          });
        } catch (err) {
          console.log(err);
          return;
        }

        $q.dialog({
          title: "Success",
          message: "New stock successfully saved.",
        });

        showStockInDialog.value = false;
        currentTab.value = "selectItem";
        selectedItem.value = [];
        loadStockItems("1");
      });
    }

    function deleteStock(row) {
      // console.log(row);

      $q.dialog({
        title: "Confirm",
        message: "Are you sure you want to delete stock/s?",
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          const docSnap = await getDoc(doc(db, "item_tires", row.itemId));

          await addDoc(collection(db, "stock_in"), {
            active: "0",
            addedBy: currentUserId,
            item: row.itemId,
            recentQty: docSnap.data().totalQuantity,
            addedQty: Number(-row.addedQty),
            deletedBy: currentUserId,
            updated: serverTimestamp(),
            created: serverTimestamp(),
            updatedBy: currentUserId,
          });

          await updateDoc(doc(db, "item_tires", row.itemId), {
            totalQuantity:
              Number(docSnap.data().totalQuantity) - Number(row.addedQty),
            updated: serverTimestamp(),
            updatedBy: currentUserId,
          });
        } catch (err) {
          console.log(err);
          return;
        }
        $q.dialog({
          title: "Success",
          message: "Succesfully deleted",
        });
        loadStockItems("1");
      });
    }

    function formatDate(valdt) {
      if (valdt) {
        let ret = new Date(valdt.toDate());
        return ret.toLocaleDateString() + ", " + ret.toLocaleTimeString();
      } else {
        return "";
      }
    }

    watch(selectedItem, (newval) => {
      if (newval.length > 0) {
        disableNext.value = false;
      } else {
        disableNext.value = true;
      }
    });

    watch(addQty, (newval) => {
      totalQty.value = Number(recentQty.value) + Number(newval);
    });

    watch(showDeleted, (newval) => {
      if (!newval) {
        visibleColumns.value = [
          "itemDesc",
          "itemType",
          "itemPattern",
          "recentQty",
          "addedQty",
          "totalQty",
          "addedBy",
          "created",
          "action",
        ];

        loadStockItems("1");
      } else {
        visibleColumns.value = [
          "itemDesc",
          "itemType",
          "itemPattern",
          "recentQty",
          "addedQty",
          "totalQty",
          "addedBy",
          "created",
          "deletedBy",
          "deleted",
        ];

        loadStockItems("0");
      }
    });

    function goNext() {
      addQty.value = 0;
      currentTab.value = "setQty";
      description.value = selectedItem.value[0].description;
      patternCode.value = selectedItem.value[0].patternCode;
      type.value = selectedItem.value[0].type;
      model.value = selectedItem.value[0].model;
      price.value = selectedItem.value[0].price;
      recentQty.value = selectedItem.value[0].totalQuantity;
      totalQty.value = selectedItem.value[0].totalQuantity;
    }

    function goPrev() {
      currentTab.value = "selectItem";
      selectedItem.value = [];
    }

    return {
      rows,
      columns,
      filter,
      dialogLabel,
      showStockInDialog,
      visibleColumns,

      description,
      patternCode,
      type,
      model,
      price,
      recentQty,
      addQty,
      totalQty,

      currentTab,
      selectedItem,
      disableNext,
      showDeleted,
      goNext,
      goPrev,
      saveItem,
      deleteStock,
      formatDate,
    };
  },
});
</script>
