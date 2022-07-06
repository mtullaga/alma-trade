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

        <q-toolbar-title> </q-toolbar-title>

        <div>
          <q-btn
            flat
            color="light"
            :label="loggedUser"
            icon-right="account_circle"
          >
            <q-menu>
              <q-list style="width: 180px">
                <q-item
                  clickable
                  v-close-popup
                  @click="showChangePassDialog = true"
                >
                  <q-item-section>Change Password</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="logout">
                  <q-item-section class="text-negative"
                    ><b>Logout</b></q-item-section
                  >
                </q-item>
                <q-separator />
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>
          <q-img
            src="../assets/logo.png"
            spinner-color="white"
            style="height: 120px; max-width: 270px"
          />
        </q-item-label>

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

  <q-dialog v-model="showChangePassDialog" persistent>
    <q-card style="width: 400px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">
          Change User Password
          <q-icon
            name="close"
            class="float-right q-mt-sm"
            @click="showChangePassDialog = false"
            style="cursor: pointer; font-weight: bold"
          />
        </div>
      </q-card-section>

      <q-separator />
      <q-card-section class="q-pt-none q-mt-sm scroll" style="max-height: 55vh">
        <q-input
          type="password"
          v-model="oldPassword"
          label="Old Password"
          :rules="[(val) => !!val || 'Field is required']"
          lazy-rules
        />

        <q-input
          type="password"
          v-model="newPassword"
          label="New Password"
          :rules="[(val) => !!val || 'Field is required']"
          lazy-rules
        />

        <q-input
          type="password"
          v-model="rePassword"
          label="Retype Password"
          :rules="[(val) => !!val || 'Field is required']"
          lazy-rules
        />

        <div
          class="fit row wrap justify-center items-start content-start q-mt-md"
        >
          <q-btn
            class="q-ml-lg"
            color="primary"
            :disable="false"
            label="Update Password"
            @click="saveChangePass"
          >
            <q-spinner-puff color="light" size="1.5em" v-if="showLoading" />
          </q-btn>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { useQuasar } from "quasar";
import { defineComponent, ref, onMounted } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import { getAuth, signOut, updatePassword } from "firebase/auth";
import { useRouter, useRoute } from "vue-router";
import {
  collection,
  getDocs,
  query,
  where,
  getFirestore,
} from "firebase/firestore";

const linksList = [
  {
    title: "Dashboard",
    icon: "dashboard",
    link: "/",
  },
  {
    title: "Tires",
    icon: "tire_repair",
    link: "/tires",
  },
  {
    title: "M Tubes",
    icon: "donut_large",
    link: "/m-tubes",
  },
  {
    title: "Bikes",
    icon: "pedal_bike",
    link: "/bikes",
  },
  {
    title: "Motor Parts",
    icon: "settings_input_composite",
    link: "/motor-parts",
  },
  {
    title: "Stock In",
    icon: "login",
    link: "/stock-in",
  },
  {
    title: "Stock Out",
    icon: "logout",
    link: "/stock-out",
  },
  {
    title: "User Management",
    icon: "people",
    link: "/users",
  },
];

export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink,
  },

  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const leftDrawerOpen = ref(false);
    const loggedUser = ref("");
    const db = getFirestore();
    const showChangePassDialog = ref(false);
    const oldPassword = ref("");
    const newPassword = ref("");
    const rePassword = ref("");
    const showLoading = ref(false);

    onMounted(async () => {
      const auth = getAuth();
      const snapCurrentUser = await getDocs(
        query(
          collection(db, "users"),
          where("email", "==", auth.currentUser.email)
        )
      ).catch((err) => {
        console.log(err);
        return;
      });

      snapCurrentUser.forEach((el) => {
        loggedUser.value = el.data().firstName;
        localStorage.setItem(
          "currentUserName",
          el.data().firstName + " " + el.data().lastName
        );
        localStorage.setItem("currentUserId", el.id);
      });
    });

    function logout() {
      console.log(localStorage.getItem("currentPass"));

      const auth = getAuth();
      signOut(auth)
        .then(() => {
          localStorage.setItem("activeUserEmail", "");
          localStorage.setItem("currentPass", "");
          localStorage.setItem("currentUserId", "");

          console.log("Sign Out successful.");
          router.push({ path: "/login" });
        })
        .catch((error) => {
          console.log(error);
        });
    }

    function saveChangePass() {
      if (localStorage.getItem("currentPass") != oldPassword.value) {
        $q.dialog({
          title: "<font color=red>Error</font>",
          message: "Invalid old password.",
          html: true,
        });
        oldPassword.value = "";
      } else if (newPassword.value.length < 6) {
        $q.dialog({
          title: "<font color=red>Error</font>",
          message: "Password should be at least 6 character.",
          html: true,
        });
        newPassword.value = "";
      } else if (newPassword.value != rePassword.value) {
        $q.dialog({
          title: "<font color=red>Error</font>",
          message: "New password not match.",
          html: true,
        });
      } else {
        showLoading.value = true;
        const auth = getAuth();
        const user = auth.currentUser;
        updatePassword(user, newPassword.value)
          .then(() => {
            showChangePassDialog.value = false;
            setTimeout(() => {
              localStorage.setItem("currentPass", newPassword.value);
              showLoading.value = false;
              $q.dialog({
                title: "<font color=green>Success</font>",
                message: "New password successfully saved.",
                html: true,
              });
            }, 100);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      logout,
      loggedUser,
      showChangePassDialog,
      saveChangePass,
      oldPassword,
      newPassword,
      rePassword,
      showLoading,
    };
  },
});
</script>
