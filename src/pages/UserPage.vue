<template>
  <div class="q-pa-md">
    <q-table
      title="User Management"
      :rows="rows"
      :columns="columns"
      row-key="name"
    />
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { useRouter, useRoute } from "vue-router";

export default defineComponent({
  name: "UserPage",
  setup(props, { emit }) {
    const router = useRouter();
    const rows = ref([]);
    const columns = ref([
      {
        name: "firstName",
        label: "First Name",
        field: "firstName",
        align: "left",
        sortable: true,
      },
      {
        name: "lastName",
        label: "Last Name",
        field: "lastName",
        align: "left",
        sortable: true,
      },
      {
        name: "contact",
        label: "Contact",
        field: "contact",
        align: "left",
        sortable: false,
      },
      {
        name: "address",
        label: "Address",
        field: "address",
        align: "left",
        sortable: true,
      },
      {
        name: "email",
        label: "Email",
        field: "email",
        align: "left",
        sortable: true,
      },
      {
        name: "created",
        label: "Created At",
        field: "create",
        align: "left",
        sortable: true,
      },
      {
        name: "updated",
        label: "Updated At",
        field: "updated",
        align: "left",
        sortable: true,
      },
      {
        name: "updatedBy",
        label: "Updated At",
        field: "updatedBy",
        align: "left",
        sortable: true,
      },
    ]);

    onMounted(async () => {
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, "users"));
      querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${doc.data().firstName}`);
        console.log(`${doc.id} => ${doc.data().lastName}`);
        console.log(`${doc.id} => ${doc.data().contact}`);
        console.log(`${doc.id} => ${doc.data().address}`);
        console.log(`${doc.id} => ${doc.data().created}`);
      });
    });

    return {
      columns,
      rows,
    };
  },
});
</script>
