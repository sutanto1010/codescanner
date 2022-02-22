<template>
  <div class="py-3 min-w-0 w-full">
    <div>
      <div class="display-1">{{ title }}</div>
      <v-breadcrumbs :items="breadcrumbs" class="pa-0 py-2"></v-breadcrumbs>
    </div>
    <v-card>
      <v-card-text>
        <v-row>
          <v-col cols="12" lg="12">
            <v-text-field
              v-model="item.name"
              placeholder="Type repository name..."
              label="Name"
              :rules="[(v) => !!v || 'Name is required.']"
            />
            <v-text-field
              v-model="item.url"
              placeholder="Type repository URL..."
              label="URL"
              :rules="[(v) => !!v || 'URL is required.']"
            />
            <v-textarea
              v-model="item.description"
              placeholder="Type the description..."
              label="Description"
            ></v-textarea>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" lg="12">
            <v-spacer></v-spacer>
            <v-btn @click="Save()" color="primary"
              >Save</v-btn
            >
            <v-btn class="ml-2" @click="Cancel()"
              >Cancel</v-btn
            >
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import DatetimePicker from "vuetify-datetime-picker";
@Component({
  components: {
    DatetimePicker,
  },
})
export default class Form extends Vue {
  now: string = (new Date()).toISOString();
  $refs: any;
  url:string="/crud/repository/v1";
  get breadcrumbs() {
    return [
      { text: "Repositories", to: "/repositories", exact: true },
      { text: this.title },
    ];
  }

  get title(): string {
    return this.isNew ? "New Repository" : "" + this.state.item.name;
  }
  get item() {
    return this.state.item;
  }
  get state() {
    return this.$store.state.repository;
  }
  mounted() {
    if (!this.isNew) {
      this.load();
    }
  }
  get isNew() {
    return this.$route.params.id == "new";
  }
  Cancel() {
    this.$confirm("Are you sure you want to cancel?", "Cancel", "info", () => {
      this.$router.back();
    });
  }
  Save() {
    this.$confirm(
      "Are you sure you want to save this repository?",
      "Save Repository",
      "info",
      () => {
        this.DoSave();
      }
    );
  }
  DoSave() {
    let data = {
      ...this.item,
    };
    this.$http.post(this.url, data).then((res) => {
      this.$router.push("/repositories");
    });
  }
  OnPreviewClicked() {
    open(this.item.link, "_blank");
  }
  get showPreview() {
    return (
      this.item.web_id != null &&
      this.item.title != null &&
      this.item.title.length > 0
    );
  }
  load() {
    let self = this;
    this.state.item = {};
    let param = {
      id: this.$route.params.id,
    };
    this.$http.get(this.url, param).then((r) => {
      let item = r.data.Data;
      this.state.item = item;
    });
  }
}
</script>
