<template>
  <div class="q-pa-md">
    <div class="text-h5">User Management</div>
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="email"
      :filter="filter"
      flat
      selection="multiple"
      v-model:selected="selected"
    >
      <template v-slot:top>
        <q-btn
          color="secondary"
          :disable="false"
          label="Add New User"
          @click="
            email = '';
            role = '';
            showInvitationDialog = true;
          "
        />
        <q-btn
          class="q-ml-lg"
          color="primary"
          :disable="false"
          label="Update"
          v-if="selected.length == 1"
          @click="showUserDialogUpdate"
        />
        <q-btn
          class="q-ml-lg"
          color="negative"
          :disable="false"
          label="Delete"
          @click="deleteUser"
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

    <q-dialog v-model="showUserDialog" persistent>
      <q-card style="width: 400px; max-width: 80vw">
        <q-card-section>
          <div class="text-h6">
            Update User
            <q-icon
              name="close"
              class="float-right q-mt-sm"
              @click="showUserDialog = false"
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
          <q-select
            v-model="role"
            :options="['admin', 'editor']"
            label="Role"
          />
          <q-input type="email" v-model="email" label="Email" readonly />
          <div
            class="fit row wrap justify-center items-start content-start q-mt-md"
          >
            <q-btn
              class="q-ml-lg"
              color="primary"
              :disable="false"
              label="Save"
              @click="saveUser"
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

    <q-dialog v-model="showInvitationDialog" persistent>
      <q-card style="width: 400px; max-width: 80vw">
        <q-card-section>
          <div class="text-h6">
            Invite User
            <q-icon
              name="close"
              class="float-right q-mt-sm"
              @click="showInvitationDialog = false"
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
            type="email"
            v-model="email"
            label="Email"
            :rules="[(val) => !!val || 'Field is required', isValidEmail]"
            lazy-rules
            ref="emailRef"
          />

          <q-select
            v-model="role"
            :options="['admin', 'editor']"
            label="Role"
            :rules="[(val) => !!val || 'Field is required']"
            lazy-rules
            ref="roleRef"
          />
          <div
            class="fit row wrap justify-center items-start content-start q-mt-md"
          >
            <q-btn
              class="q-ml-lg"
              color="primary"
              :disable="false"
              label="Send Invitation"
              @click="saveUserInvite"
            >
              <q-spinner-puff color="light" size="1.5em" v-if="showLoading" />
            </q-btn>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>

  <form ref="emailForm" style="display: none">
    <input type="text" name="from_name" v-model="from_name" />
    <input type="text" name="to_name" v-model="to_name" />
    <input type="text" name="link_to" v-model="link_to" />
    <input type="text" name="reply_to" v-model="reply_to" />
    <input type="text" name="email_to" v-model="email_to" />
  </form>
</template>

<script>
import {
  defineComponent,
  ref,
  onMounted,
  computed,
  watchEffect,
  watch,
  inject,
} from "vue";
import { useQuasar } from "quasar";
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
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter, useRoute } from "vue-router";
import emailjs from "@emailjs/browser";

export default defineComponent({
  name: "UserPage",
  setup(props, { emit }) {
    const $q = useQuasar();
    const router = useRouter();
    const rows = ref([]);
    const filter = ref("");
    const selected = ref([]);
    const authUid = ref("");
    const uid = ref("");
    const firstName = ref("");
    const lastName = ref("");
    const contact = ref("");
    const address = ref("");
    const role = ref("");
    const email = ref("");
    const showUserDialog = ref(false);
    const showInvitationDialog = ref(false);
    const columns = ref([
      {
        name: "uid",
        label: "uid",
        field: "uid",
        classes: "hidden",
        headerClasses: "hidden",
      },
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
        name: "role",
        label: "Role",
        field: "role",
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
        field: "created",
        align: "left",
        format: (val) => {
          if (val) {
            let ret = new Date(val.toDate());
            return ret.toLocaleDateString() + ", " + ret.toLocaleTimeString();
          } else {
            return "";
          }
        },
        sortable: true,
        classes: "hidden",
        headerClasses: "hidden",
      },
      {
        name: "updated",
        label: "Updated At",
        field: "updated",
        align: "left",
        format: (val) => {
          if (val) {
            let ret = new Date(val.toDate());
            return ret.toLocaleDateString() + ", " + ret.toLocaleTimeString();
          } else {
            return "";
          }
        },
        sortable: true,
      },
      {
        name: "updatedBy",
        label: "Updated By",
        field: "updatedBy",
        classes: "hidden",
        headerClasses: "hidden",
      },
    ]);

    const firstNameRef = ref(null);
    const lastNameRef = ref(null);
    const contactRef = ref(null);
    const addressRef = ref(null);
    const roleRef = ref(null);
    const emailRef = ref(null);
    const passwordRef = ref(null);
    const showLoading = ref(false);

    const emailForm = ref();
    const from_name = ref("AMPT Inventory Mngt.");
    const to_name = ref("");
    const link_to = ref("");
    const reply_to = ref("al.trading022@gmail.com");
    const email_to = ref("");

    const db = getFirestore();

    onSnapshot(collection(db, "users"), (coll) => {
      rows.value = [];
      coll.forEach((doc) => {
        if (doc.data().active == "1") {
          rows.value.push({
            firstName: doc.data().firstName,
            lastName: doc.data().lastName,
            contact: doc.data().contact,
            address: doc.data().address,
            role: doc.data().role,
            email: doc.data().email,
            updated: doc.data().updated,
            created: doc.data().created,
            updatedBy: doc.data().updatedBy,
            uid: doc.id,
          });
        }
      });
    });

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
        authUid.value = el.id;
      });
    });

    async function saveUserInvite() {
      emailRef.value.validate();
      roleRef.value.validate();

      if (email.value && role.value) {
        showLoading.value = true;

        const auth = getAuth();
        const querySnapCheckEmail = await getDocs(
          query(collection(db, "emails"), where("email", "==", email.value))
        ).catch((err) => {
          console.log(err);
          return;
        });

        const querySnapCurrentUser = await getDocs(
          query(
            collection(db, "users"),
            where("email", "==", auth.currentUser.email)
          )
        ).catch((err) => {
          console.log(err);
          return;
        });

        let currentUserId = "";
        querySnapCurrentUser.forEach((el) => {
          currentUserId = el.id;
        });

        let emailStatus = "";
        let emailUser = "";
        let emailId = "";

        querySnapCheckEmail.forEach((el) => {
          emailStatus = el.data().status;
          emailUser = el.data().user;
          emailId = el.id;
        });

        if (querySnapCheckEmail.size == 0) {
          let inviteToken = randomString();

          try {
            let userData = await addDoc(collection(db, "users"), {
              firstName: "",
              lastName: "",
              contact: "",
              address: "",
              role: role.value,
              email: email.value,
              active: "1",
              updated: serverTimestamp(),
              created: serverTimestamp(),
              updatedBy: currentUserId,
            });

            await addDoc(collection(db, "emails"), {
              email: email.value,
              status: "2",
              user: userData.id,
              regToken: inviteToken,
              updated: serverTimestamp(),
            });
          } catch (err) {
            console.log(err);
            return;
          }

          await sendEmailInvite(email.value, inviteToken);
        } else if (emailStatus == "2") {
          let inviteToken = randomString();
          try {
            await updateDoc(doc(db, "users", emailUser), {
              updated: serverTimestamp(),
            });

            await updateDoc(doc(db, "emails", emailId), {
              updated: serverTimestamp(),
              regToken: inviteToken,
            });
          } catch (err) {
            console.log(err);
            return;
          }

          await sendEmailInvite(email.value, inviteToken);
        } else {
          $q.dialog({
            title: "<font color=red>Error</font>",
            message: "Email already exist.",
            html: true,
          });
        }
      }
    }

    async function sendEmailInvite(emailTo, token) {
      to_name.value = emailTo.split("@")[0];
      link_to.value = token;
      email_to.value = emailTo;

      setTimeout(() => {
        emailjs
          .sendForm(
            "service_qu1u1js",
            "template_xk97hnn",
            emailForm.value,
            "sRqSrJtUY_iYb2S6f"
          )
          .then(
            (result) => {
              $q.dialog({
                title: "Success",
                message: "User invitation successfully sent.",
              });

              email.value = "";
              role.value = "";
              showInvitationDialog.value = false;
              showLoading.value = false;
              console.log("SUCCESS!", result.text);
            },
            (error) => {
              console.log("FAILED...", error.text);
            }
          )
          .catch((err) => {
            console.log(err);
            return;
          });
      }, 100);
    }

    async function saveUser() {
      // roleRef.value.validate();
      firstNameRef.value.validate();
      lastNameRef.value.validate();
      contactRef.value.validate();
      addressRef.value.validate();

      if (
        firstName.value &&
        lastName.value &&
        contact.value &&
        address.value &&
        role.value
      ) {
        try {
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
            role: role.value,
            updated: serverTimestamp(),
            updatedBy: authUid.value,
          });
        } catch (err) {
          console.log(err);
          return;
        }

        showUserDialog.value = false;
        selected.value = [];
        $q.dialog({
          title: "Success",
          message: "User account successfully updated.",
        });
      }
    }

    async function deleteUser() {
      $q.dialog({
        title: "Confirm",
        message: "Are you sure you want to delete user/s?",
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        const batch = writeBatch(db);

        selected.value.forEach(async (el) => {
          batch.update(doc(db, "users", el.uid), {
            active: "0",
            updated: serverTimestamp(),
            updatedBy: authUid.value,
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
          message: "User/s successfully deleted.",
          persistent: true,
        });
        selected.value = [];
      });
    }

    function showUserDialogUpdate() {
      uid.value = selected.value[0].uid;
      firstName.value = selected.value[0].firstName;
      lastName.value = selected.value[0].lastName;
      contact.value = selected.value[0].contact.substring(
        2,
        selected.value[0].contact.length
      );
      address.value = selected.value[0].address;
      role.value = selected.value[0].role;
      email.value = selected.value[0].email;

      showUserDialog.value = true;
    }

    function randomString() {
      var result = "";
      var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      var charactersLength = characters.length;
      for (var i = 0; i < 20; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }
      return result;
    }

    function clearFields() {
      firstName.value = "";
      lastName.value = "";
      contact.value = "";
      address.value = "";
      email.value = "";
    }

    function isValidEmail(val) {
      const emailPattern =
        /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
      return emailPattern.test(val) || "Invalid email";
    }

    return {
      $q,
      columns,
      rows,
      filter,
      selected,
      showUserDialog,
      showInvitationDialog,
      isPwd: ref(true),
      firstName,
      lastName,
      contact,
      address,
      role,
      email,
      firstNameRef,
      lastNameRef,
      contactRef,
      addressRef,
      emailRef,
      roleRef,
      passwordRef,
      isValidEmail,
      saveUserInvite,
      saveUser,
      showUserDialogUpdate,
      clearFields,
      showLoading,
      deleteUser,

      emailForm,
      from_name,
      to_name,
      link_to,
      reply_to,
      email_to,
    };
  },
});
</script>
