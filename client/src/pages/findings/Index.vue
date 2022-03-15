<template>
  <div class="min-w-0 w-full">
    <div class="d-flex align-center mb-1">
      <div class="display-1">
        <v-icon size="25" color="primary">{{ icon }}</v-icon> {{ title }}
      </div>
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
          show-expand
        >
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length" style="padding: 10px">
              <div>File: {{ item.file_path }}</div>
              <div>Line Number: {{ item.line_number }}</div>
              <div>Last Commit: {{ item.line_commit_subject }} by {{ item.line_commit_by }} on {{ item.line_commit_date }}</div>
              <div>Line Preview:</div>
              <pre>{{ item.line_preview }}</pre>
            </td>
          </template>
          <template v-slot:[`item.row_icon`]="{}">
            <v-icon color="#E84D31" small>mdi-ladybug</v-icon>
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
        </arch-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";

@Component
export default class Index extends Vue {
  title: string = "Findings";
  icon: string = "mdi-ladybug";
  ownerId: number = 0;
  $refs: any;
  item: any = null;
  url: string = `/crud/vw_finding/v1`;
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
      text: "Repository",
      value: "repository_name",
      sortable: true,
      hide: false,
      dataType: "string",
    },
    {
      text: "Repository URL",
      value: "repository_url",
      sortable: false,
      hide: true,
      dataType: "string",
    },
    {
      text: "File",
      value: "file_path",
      sortable: false,
      hide: true,
      dataType: "string",
    },
    {
      text: "Line Number",
      value: "line_number",
      sortable: true,
      width: "150px",
      hide: false,
      dataType: "string",
    },
    {
      text: "Rule",
      value: "rule_name",
      sortable: true,
      width: "180px",
      hide: false,
      dataType: "string",
    },
    {
      text: "Severity",
      value: "rule_severity",
      sortable: true,
      width: "180px",
      hide: false,
      dataType: "string",
    },
    {
      text: "Branch",
      value: "branch",
      width: "180px",
      sortable: true,
      hide: false,
      dataType: "string",
    },
    {
      text: "Found At",
      value: "created",
      width: "180px",
      sortable: true,
      hide: false,
      dataType: "string",
    }
  ];
  async created() {
    this.ownerId = Number(this.$route.query.oui);
  }
  New() {
    this.$router.push(`/rules/new`);
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