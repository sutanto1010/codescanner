<template>
  <div class="min-w-0 w-full">
    <div class="d-flex align-center mb-1">
      <div class="display-1">
        <v-icon size="25" color="primary">{{ icon }}</v-icon> {{ title }}
      </div>
      <v-spacer></v-spacer>
      <v-btn color="primary" dark text @click="New()">
        <v-icon>mdi-plus</v-icon> New
      </v-btn>
    </div>
    <v-card>
      <v-card-text>
        <arch-data-table
          ref="table"
          :url="itemsUrl"
          :headers="headers"
          :multi-sort="true"
          :single-select="true"
          :show-refresh="true"
          @click:row="onItemSelected"
          @dblclick:row="onItemDoubleClicked"
          :server-side="true"
        >
          <template v-slot:[`item.row_icon`]="{}">
            <v-icon color="#E84D31">mdi-git</v-icon>
          </template>
          <template v-slot:[`item.url`]="{ item }">
            <a :href="item.url" target="_blank">{{ item.url }}</a>
          </template>
          <template v-slot:[`item.last_scan`]="{ item }">
            {{ item.last_scan | formatDate }}
          </template>
          <template v-slot:[`item.created`]="{ item }">
            {{ item.created | formatDate }}
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn
              text
              small
              color="primary"
              class="mr-1"
              @click="RequestToScan(item)"
            >
              <v-icon small color="primary" class="mr-1">mdi-target</v-icon>Scan
            </v-btn>
            <v-btn icon :to="`/repositories/${item.id}`" class="mr-1">
              <v-icon color="primary">mdi-pencil-box-outline</v-icon>
            </v-btn>
            <v-btn icon @click="Delete(item)">
              <v-icon color="red">mdi-delete</v-icon>
            </v-btn>
          </template>
        </arch-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";

@Component
export default class Index extends Vue {
  title: string = "Repositories";
  icon: string = "mdi-github";
  ownerId: number = 0;
  $refs: any;
  item: any = null;
  url: string = `/crud/repository/v1`;
  headers: any[] = [
    {
      text: "ID",
      value: "id",
      width: "100px",
      sortable: true,
      hide: true,
      dataType: "string",
    },
    {
      text: "",
      value: "row_icon",
      width: "30px",
      sortable: false,
      dataType: "number",
    },
    {
      text: "Name",
      value: "name",
      sortable: true,
      hide: false,
      dataType: "string",
    },
    {
      text: "URL",
      value: "url",
      sortable: false,
      hide: true,
      dataType: "string",
    },
    {
      text: "Last Scan",
      value: "last_scan",
      width: "180px",
      sortable: true,
      hide: false,
      dataType: "string",
    },
    {
      text: "Created At",
      value: "created",
      width: "180px",
      sortable: true,
      hide: false,
      dataType: "string",
    },
    {
      text: "Status",
      value: "status",
      width: "130px",
      sortable: true,
      hide: false,
      dataType: "string",
    },
    {
      text: "",
      value: "actions",
      width: "200px",
      sortable: false,
      dataType: "number",
      class: "sticky",
      cellClass: "sticky",
      align: "right",
    },
  ];
  async created() {
    this.ownerId = Number(this.$route.query.oui);
  }
  New() {
    this.$router.push(`/repositories/new`);
  }
  @Watch("$route", { immediate: true, deep: true })
  onSubChange(newVal) {
    if (newVal.params) {
      this.$setTitle(this.title);
    }
  }

  get itemsUrl() {
    return this.url;
  }
  ShowHistory(item) {
    this.$refs.masterAccountList.showHistory(item);
  }
  Delete(item) {
    let self = this;
    this.$confirm(
      `Are you sure you want to delete this repository?<br /><strong>${item.name}</strong>`,
      "Delete Repository",
      "info",
      () => {
        this.$http.del(this.url, item).then(() => {
          self.refresh();
        });
      }
    );
  }
  onItemSelected(item, theRow) {
    theRow.select();
    this.item = item;
  }
  onItemDoubleClicked(event, theRow) {}
  refresh() {
    this.$refs.table.refresh();
  }
  RequestToScan(item) {
    this.$confirm(
      `Are you sure you want to scan this repository?<br /><strong>${item.name}</strong>`,
      "Request To Scan",
      "info",
      () => {
        this.$http.post(`/request-to-scan/v1`, item).then(() => {
          this.refresh();
        });
      }
    );
  }
}
</script>

<style>
span[broadcast-status-id="1"] {
  background-color: rgb(92, 89, 89);
}
span[broadcast-status-id="2"] {
  background-color: #216231;
}
.broadcast-status {
  display: inline-block;
  padding: 3px 6px;
  color: white;
  border-radius: 5px;
  font-size: x-small;
  letter-spacing: 2px;
}
</style>