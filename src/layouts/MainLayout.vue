<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> Almanon Trading </q-toolbar-title>

        <div>
          <q-btn
            color="white"
            text-color="black"
            @click="logout"
            label="Logout"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> </q-item-label>

        <q-separator />

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import { getAuth, signOut } from "firebase/auth";
import { useRouter, useRoute } from "vue-router";

const linksList = [
  {
    title: "Dashboard",
    icon: "dashboard",
    link: "/",
  },
  {
    title: "Tires",
    icon: "tire_repair",
    link: "tires",
  },
  {
    title: "M Tubes",
    icon: "donut_large",
    link: "m-tubes",
  },
  {
    title: "Bikes",
    icon: "pedal_bike",
    link: "bikes",
  },
];

export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink,
  },

  setup() {
    const router = useRouter();
    const leftDrawerOpen = ref(false);

    function logout() {
      const auth = getAuth();
      signOut(auth)
        .then(() => {
          console.log("Sign Out successful.");
          router.push({ path: "/login" });
        })
        .catch((error) => {
          console.log(error);
        });
    }

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      logout,
    };
  },
});
</script>
