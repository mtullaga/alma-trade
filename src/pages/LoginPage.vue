<template>
  <q-layout view="lHh Lpr fff">
    <q-page
      class="window-height window-width row justify-center items-center"
      style="background: white"
    >
      <div class="column q-pa-lg">
        <div class="row">
          <q-card square class="shadow-24" style="width: 400px; height: 540px">
            <q-card-section class="bg-deep-purple-7">
              <h4 class="text-h6 text-white q-my-md">
                Almanon Motor Parts and Trading
              </h4>
            </q-card-section>
            <q-card-section>
              <q-form class="q-px-sm q-pt-xl">
                <q-input
                  ref="emailRef"
                  square
                  clearable
                  v-model="email"
                  type="email"
                  lazy-rules
                  :rules="[(val) => !!val || 'Field is required']"
                  label="Email"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>

                <q-input
                  ref="passwordRef"
                  square
                  clearable
                  v-model="password"
                  :type="passwordFieldType"
                  lazy-rules
                  :rules="[(val) => !!val || 'Field is required']"
                  label="Password"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" />
                  </template>
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

            <q-card-actions class="q-px-lg">
              <q-btn
                unelevated
                size="lg"
                color="secondary"
                @click="login"
                class="full-width text-white"
                label="Login"
              />
            </q-card-actions>
            <q-card-section class="text-center q-pa-sm">
              <p class="text-grey-6">Forgot Passwords?</p>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-page>
  </q-layout>
</template>

<script>
import { useQuasar } from "quasar";
import { defineComponent, ref } from "vue";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter, useRoute } from "vue-router";

export default defineComponent({
  name: "LoginPage",
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const email = ref("mtullaga@gmail.com");
    const password = ref("admin123");
    const emailRef = ref();
    const passwordRef = ref();
    const visibilityIcon = ref("visibility");
    const visibility = ref(false);
    const passwordFieldType = ref("password");

    function switchVisibility() {
      visibility.value = !visibility.value;
      passwordFieldType.value = visibility.value ? "text" : "password";
      visibilityIcon.value = visibility.value ? "visibility_off" : "visibility";
    }

    function login() {
      const auth = getAuth();
      signInWithEmailAndPassword(auth, email.value, password.value)
        .then((userCredential) => {
          localStorage.setItem("activeUserEmail", userCredential.user.email);
          localStorage.setItem("currentPass", password.value);
          console.log("Logged In");
          router.push({ path: "/" });
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(error.message);
          $q.dialog({
            title: "<font color=red>Error</font>",
            message: "Credential invalid. Please try again.",
            html: true,
          });
        });
    }

    return {
      email,
      password,
      emailRef,
      passwordRef,
      switchVisibility,
      visibilityIcon,
      passwordFieldType,
      login,
    };
  },
});
</script>
