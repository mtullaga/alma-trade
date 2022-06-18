<template>
  <q-layout view="lHh Lpr fff">
    <q-page
      class="window-height window-width row justify-center items-center"
      style="background: white"
    >
      <div class="column q-pa-lg">
        <div class="row">
          <q-card square class="shadow-24" style="width: 400px">
            <q-card-section class="bg-deep-purple-7">
              <h4 class="text-h5 text-white q-my-md">
                Almanon Motor Parts and Trading
              </h4>
            </q-card-section>
            <q-card-section>
              <q-form class="q-px-sm">
                <q-input
                  type="text"
                  v-model="firstName"
                  label="First name"
                  :rules="[(val) => !!val || 'Field is required']"
                  lazy-rules
                  ref="firstNameRef"
                />
                <q-input
                  type="text"
                  v-model="lastName"
                  label="Last Name"
                  :rules="[(val) => !!val || 'Field is required']"
                  lazy-rules
                  ref="lastNameRef"
                />
                <q-input
                  type="text"
                  v-model="contact"
                  label="Contact"
                  mask="## ### ####"
                  prefix="( 09 ) "
                  :rules="[(val) => !!val || 'Field is required']"
                  lazy-rules
                  ref="contactRef"
                />
                <q-input
                  type="text"
                  v-model="address"
                  label="Address"
                  :rules="[(val) => !!val || 'Field is required']"
                  lazy-rules
                  ref="addressRef"
                />
                <q-input
                  ref="emailRef"
                  v-model="email"
                  type="email"
                  lazy-rules
                  :rules="[(val) => !!val || 'Field is required']"
                  label="Email"
                  readonly
                />

                <q-input
                  ref="passwordRef"
                  v-model="password"
                  :type="passwordFieldType"
                  lazy-rules
                  :rules="[(val) => !!val || 'Field is required']"
                  label="Password"
                >
                  <template v-slot:append>
                    <q-icon
                      :name="visibilityIcon"
                      @click="switchVisibility"
                      class="cursor-pointer"
                    />
                  </template>
                </q-input>
              </q-form>
            </q-card-section>

            <q-card-actions class="q-px-lg q-mb-md justify-center">
              <q-btn
                unelevated
                size="lg"
                color="secondary"
                @click="createLogin"
                class="full-width text-white"
                label="Create & Login"
              />

              <router-link
                :to="'/login'"
                class="text-h6 q-mt-md"
                style="text-decoration: none"
                >Back to Login</router-link
              >
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </q-page>
  </q-layout>
</template>

<script>
import { useQuasar } from "quasar";
import { defineComponent, ref, onMounted } from "vue";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter, useRoute } from "vue-router";
import moment from "moment";
import {
  collection,
  getDocs,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

export default defineComponent({
  name: "LoginPage",
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const uid = ref("");
    const firstName = ref("");
    const lastName = ref("");
    const contact = ref("");
    const address = ref("");
    const email = ref("");
    const password = ref("");
    const emailRef = ref();
    const passwordRef = ref();
    const firstNameRef = ref(null);
    const lastNameRef = ref(null);
    const contactRef = ref(null);
    const addressRef = ref(null);
    const visibilityIcon = ref("visibility");
    const visibility = ref(false);
    const passwordFieldType = ref("password");

    const emailId = ref("");

    const db = getFirestore();

    function switchVisibility() {
      visibility.value = !visibility.value;
      passwordFieldType.value = visibility.value ? "text" : "password";
      visibilityIcon.value = visibility.value ? "visibility_off" : "visibility";
    }

    onMounted(async () => {
      let token = window.location.href;
      token = token.substring(token.length - 20, token.length);

      const querySnapCurrentEmail = await getDocs(
        query(
          collection(db, "emails"),
          where("regToken", "==", token),
          where("status", "==", "2")
        )
      ).catch((err) => {
        console.log(err);
        return;
      });

      let updatedUserEmail = "";

      querySnapCurrentEmail.forEach((el) => {
        email.value = el.data().email;
        updatedUserEmail = el.data().updated;
        uid.value = el.data().user;
        emailId.value = el.id;
      });

      if (!email.value) {
        $q.dialog({
          title: "Alert",
          message: "Your URL is invalid, maybe expired.",
          persistent: true,
        }).onOk(() => {
          router.push({ path: "/login" });
        });
      } else {
        let ret = new Date(updatedUserEmail.toDate());
        var a = moment(ret);
        var b = moment();
        var d = b.diff(a, "days");

        if (d >= 3) {
          $q.dialog({
            title: "Alert",
            message: "Your URL is invalid, maybe expired.",
            persistent: true,
          }).onOk(() => {
            router.push({ path: "/login" });
          });
        }
      }
    });

    async function createLogin() {
      emailRef.value.validate();
      passwordRef.value.validate();
      firstNameRef.value.validate();
      lastNameRef.value.validate();
      contactRef.value.validate();
      addressRef.value.validate();

      if (
        firstName.value &&
        lastName.value &&
        contact.value &&
        address.value &&
        password.value
      ) {
        contact.value = contact.value.replace(" ", "");
        contact.value = contact.value.replace(" ", "");
        contact.value = contact.value.replace(" ", "");
        contact.value = contact.value.replace(" ", "");
        contact.value = "09" + contact.value;

        await updateDoc(doc(db, "users", uid.value), {
          firstName: firstName.value,
          lastName: lastName.value,
          contact: contact.value,
          address: address.value,
          updated: serverTimestamp(),
        }).catch((error) => {
          console.log(error);
          return;
        });

        await updateDoc(doc(db, "emails", emailId.value), {
          status: "1",
        }).catch((error) => {
          console.log(error);
          return;
        });

        const auth = getAuth();
        createUserWithEmailAndPassword(auth, email.value, password.value)
          .then((userCredential) => {
            const user = userCredential.user;
            console.log("successfully created");
            $q.dialog({
              title: "Success",
              message: "Your account successfully created.",
              persistent: true,
            }).onOk(() => {
              router.push({ path: "/" });
            });
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage);
            return;
          });
      }
    }

    return {
      email,
      password,
      emailRef,
      passwordRef,
      firstName,
      lastName,
      contact,
      address,
      firstNameRef,
      lastNameRef,
      contactRef,
      addressRef,
      switchVisibility,
      visibilityIcon,
      passwordFieldType,
      createLogin,
    };
  },
});
</script>
