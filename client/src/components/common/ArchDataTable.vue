<template>
  <div
    style="outline: none"
    tabindex="-1"
    v-on:mousemove="
      (e) => {
        OnColResizer('move', null, e);
      }
    "
    v-on:mouseup="
      (e) => {
        OnColResizer('up', null, e);
      }
    "
    v-on:keydown="onKeyDown"
  >
    <v-row v-if="enableHistory">
      <v-col>
        <v-switch
          v-model="highlightChanges"
          dense
          hide-details
          label="Highlight changed values"
          style="width: 230px; margin-top: 5px"
        ></v-switch>
      </v-col>
    </v-row>
    <div>
      <div style="display: flex">
        <div style="flex-grow: 1">
          <v-text-field
            v-model="searchQuery"
            placeholder="Search"
            prepend-inner-icon="mdi-magnify"
            hide-details
            dense
            solo
            v-on:keydown="DoSearch"
            flat
          ></v-text-field>
        </div>
        <div style="display: flex">
          <v-tooltip bottom open-delay="500" transition="v-slide-y-transition">
            <template v-slot:activator="{ on }">
              <v-btn
                v-if="showUpload"
                v-on="on"
                icon
                @click="
                  () => {
                    dialogImport = true;
                    importFile = null;
                    importDataStep = 1;
                    importDone = false;
                    importSaving = false;
                  }
                "
              >
                <v-icon>mdi-cloud-upload</v-icon>
              </v-btn>
            </template>
            <span>Upload</span>
          </v-tooltip>
          <v-tooltip bottom open-delay="500" transition="v-slide-y-transition">
            <template v-slot:activator="{ on }">
              <v-btn
                v-if="!hideDownloadCsv"
                v-on="on"
                icon
                @click="Download('csv')"
              >
                <v-icon>mdi-cloud-download</v-icon>
              </v-btn>
            </template>
            <span>Download</span>
          </v-tooltip>
          <v-tooltip bottom open-delay="500" transition="v-slide-y-transition">
            <template v-slot:activator="{ on }">
              <v-btn v-if="showRefresh" v-on="on" icon @click="loadData()">
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </template>
            <span>Refresh</span>
          </v-tooltip>
          <v-menu
            v-if="!disableFilter"
            v-model="filterMenu"
            :close-on-click="false"
            :close-on-content-click="false"
            :nudge-width="400"
            offset-x
            transition="slide-y-transition"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-tooltip
                bottom
                open-delay="500"
                transition="v-slide-y-transition"
              >
                <template v-slot:activator="{ on: showTooltip }">
                  <v-btn
                    v-bind="attrs"
                    v-on="showTooltip"
                    icon
                    @click="filterMenu = !filterMenu"
                  >
                    <v-icon>mdi-filter-variant</v-icon>
                    <span v-if="filters.length > 0" class="filter-badge">{{
                      filters.length
                    }}</span>
                  </v-btn>
                </template>
                <span>Filters</span>
              </v-tooltip>
            </template>
            <v-card style="padding: 3px; border: solid 1px #d6d0d0">
              <div style="padding: 10px">
                <div style="font-weight: bold; margin-bottom: 5px">
                  <v-icon>mdi-filter-variant</v-icon> Filters
                </div>
              </div>
              <v-divider></v-divider>
              <div
                style="
                  max-height: 400px;
                  overflow: auto !important;
                  padding: 10px 10px 10px 10px;
                "
              >
                <div v-for="(filter, i) in filters" :key="`filter-${i}`">
                  <div style="display: flex">
                    <v-btn
                      color="error"
                      icon
                      small
                      @click="removeFilter(filter)"
                    >
                      <v-icon small>mdi-close</v-icon>
                    </v-btn>
                    <div
                      style="
                        line-height: 27px;
                        margin-left: 5px;
                        font-size: small;
                      "
                    >
                      {{ filter.text }}
                    </div>
                  </div>
                  <div class="custom-component">
                    <v-select
                      v-if="getFilterOperators(filter).length > 0"
                      v-model="filter.filter_operator"
                      :items="getFilterOperators(filter)"
                      class="operator"
                      dense
                      item-text="text"
                      item-value="value"
                      small
                    ></v-select>
                    <component
                      :is="getFilterComponent(filter)"
                      v-model="filter.filter_value"
                      :ripple="false"
                      dense
                      hide-details
                      @keypress="
                        (ev) => {
                          if (ev.code == 'Enter') {
                            loadData(true);
                          }
                        }
                      "
                    />
                  </div>
                  <v-divider style="margin: 10px 0 10px 0"></v-divider>
                </div>
                <div
                  v-if="filters.length == 0"
                  style="text-align: center; font-style: italic"
                >
                  -- no filter selected--
                </div>
                <div style="text-align: center">
                  <v-menu
                    v-model="filterMenuOptions"
                    :close-on-content-click="false"
                    :nudge-width="300"
                    offset-x
                    transition="slide-y-transition"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        small
                        style="margin-top: 5px"
                        text
                        @click="filterMenuOptions = true"
                      >
                        <v-icon small>mdi-plus</v-icon> Add filter
                      </v-btn>
                    </template>
                    <v-card
                      style="
                        padding: 3px;
                        border: solid 1px #d6d0d0;
                        margin-right: 45px;
                      "
                    >
                      <div style="padding: 10px">
                        <v-text-field
                          v-model="searchFilter"
                          class="flex-grow-1"
                          clearable
                          dense
                          hide-details
                          placeholder="Search filter..."
                          solo
                        ></v-text-field>
                      </div>
                      <v-list max-height="400" style="overflow: auto">
                        <v-list-item
                          v-for="filter in getAvailableFilters()"
                          :key="filter.value"
                          dense
                          link
                          style="font-size: small"
                          @click="onFilterPicked(filter)"
                          v-text="filter.text"
                        ></v-list-item>
                      </v-list>
                    </v-card>
                  </v-menu>
                </div>
              </div>
              <v-divider></v-divider>
              <v-card-actions>
                <v-btn text @click="resetFilter()"> Reset </v-btn>
                <v-spacer></v-spacer>
                <v-btn @click="filterMenu = false"> Close </v-btn>
                <v-btn
                  v-if="serverSide"
                  color="primary"
                  @click="loadData(true)"
                >
                  Apply
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
          <v-menu
            v-model="menu"
            :close-on-content-click="false"
            :nudge-width="200"
            offset-x
            transition="slide-y-transition"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-tooltip
                bottom
                open-delay="500"
                transition="v-slide-y-transition"
              >
                <template v-slot:activator="{ on: showTooltip }">
                  <v-btn
                    v-bind="attrs"
                    v-on="showTooltip"
                    icon
                    @click="menu = !menu"
                  >
                    <v-icon>mdi-view-column-outline</v-icon>
                  </v-btn>
                </template>
                <span>Choose Columns</span>
              </v-tooltip>
            </template>
            <v-card style="padding: 3px; border: solid 1px #d6d0d0">
              <div style="padding: 10px">
                <div style="font-weight: bold; margin-bottom: 5px">
                  <v-icon>mdi-view-column-outline</v-icon> Choose Columns
                </div>
                <v-text-field
                  v-model="columnFilter"
                  class="flex-grow-1"
                  dense
                  hide-details
                  placeholder="Search column..."
                  solo
                ></v-text-field>
              </div>
              <v-divider></v-divider>
              <div
                style="
                  max-height: 400px;
                  overflow: auto;
                  padding: 10px 0 10px 0;
                "
              >
                <div
                  v-for="(header, i) in getHeaders()"
                  class="column"
                  :key="`header-${i}`"
                >
                  <v-checkbox
                    v-model="header.show"
                    :label="header.text"
                    color="primary"
                    dense
                    hide-details
                  ></v-checkbox>
                </div>
              </div>
              <v-divider></v-divider>
              <v-card-actions>
                <v-btn text @click="resetColumnsToDefault()">
                  Reset to default
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn text @click="menu = false"> Close </v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </div>
      </div>
    </div>
    <v-data-table
      ref="itemsTable"
      mobile-breakpoint="1"
      v-bind="customPropsBind()"
      v-on="$listeners"
      :footer-props="{
        'items-per-page-options': [5, 10, 20, 30, 40, 50, 100],
      }"
      :headers="geSelectedHeaders() || []"
      :item-key="itemKey"
      :items="getItemsFiltered() || []"
      :loading="theLoading"
      :multi-sort="multiSort"
      :search="search"
      :item-class="itemClass"
      :items-per-page="itemsPerPage"
      :class="getTableClass()"
      hide-default-header
      style="border-top: solid 1px #d6d4d4; border-radius: 0 !important"
      v-on:update:options="onUpdateOptions"
      v-on:item-selected="onItemSelected"
      v-model="inputVal"
    >      
      <slot v-for="slot in Object.keys($slots)" :slot="slot" :name="slot" />
      <template
        v-for="slot in Object.keys($scopedSlots)"
        :slot="slot"
        slot-scope="scope"
      >
        <slot v-bind="scope" :name="slot" />
      </template>
      <template v-slot:header="{ props }">
        <tr>
          <th
            class="arch-col-header"
            :class="getTableHeaderClass(head, props.headers)"
            :title="head.text"
            @click="SortByColumn(head)"
            :style="{ width: head.width, minWidth: head.width }"
            v-for="(head, i) in props.headers"
            :key="`column-${i}`"
          >
            <div style="display: flex">
              <div class="arch-col-text">
                {{ head.text }}
                <v-icon size="16" v-if="head.isSortActive">{{
                  head.sortByDesc ? "mdi-arrow-up" : "mdi-arrow-down"
                }}</v-icon>
              </div>
              <div
                class="arch-col-resizer"
                v-if="head.text && head.text.length > 0"
                v-on:mouseup="
                  (e) => {
                    OnColResizer('up', head, e);
                  }
                "
                v-on:mousemove="
                  (e) => {
                    OnColResizer('move', head, e);
                  }
                "
                v-on:mousedown="
                  (e) => {
                    OnColResizer('down', head, e);
                  }
                "
              ></div>
            </div>
          </th>
        </tr>
      </template>
    </v-data-table>
    <v-dialog v-model="dialogImport" max-width="1080" persistent>
      <v-card>
        <v-card-title class="grey lighten-2">
          <v-icon style="margin-right: 10px">mdi-cloud-upload</v-icon> Upload
          Data
          <v-spacer></v-spacer>
          <v-icon
            @click="
              () => {
                $confirm('Are you sure?', '', 'question', () => {
                  dialogImport = false;
                });
              }
            "
            >mdi-close-circle-outline</v-icon
          >
        </v-card-title>
        <v-card-text v-modal-content>
          <v-stepper v-model="importDataStep">
            <v-stepper-header>
              <v-stepper-step step="1"> Choose File </v-stepper-step>

              <v-divider></v-divider>

              <v-stepper-step step="2"> Data Mapping </v-stepper-step>

              <v-divider></v-divider>

              <v-stepper-step step="3"> Save </v-stepper-step>
            </v-stepper-header>

            <v-stepper-items>
              <v-stepper-content step="1">
                <v-card align="center">
                  <div
                    style="
                      text-align: center;
                      max-width: 500px;
                      margin: 0 auto !important;
                    "
                  >
                    <v-file-input
                      v-model="importFile"
                      show-size
                      label="Choose File"
                    ></v-file-input>
                  </div>
                </v-card>
              </v-stepper-content>

              <v-stepper-content step="2">
                <v-card>
                  <v-simple-table>
                    <tbody>
                      <tr>
                        <th>Source</th>
                        <td
                          v-for="(col, i) in importSourceColumns"
                          :key="`source-${i}`"
                        >
                          {{ col }}
                        </td>
                      </tr>
                      <tr>
                        <th>Target</th>
                        <td
                          v-for="(col, i) in importSourceColumns"
                          :key="`target-${i}`"
                        >
                          <v-combobox
                            dense
                            v-model="importTargetColumns[i]"
                            :items="importHeaders"
                          ></v-combobox>
                        </td>
                      </tr>
                    </tbody>
                  </v-simple-table>
                </v-card>
              </v-stepper-content>

              <v-stepper-content step="3">
                <v-card>
                  <v-data-table
                    :headers="importItemsHeader"
                    items-per-page="5"
                    :items="importItems"
                  >
                  </v-data-table>
                  <div style="margin-left: 10px">
                    <v-switch
                      dense
                      v-model="importUseTransaction"
                      hide-details
                      label="Allow partial success"
                    ></v-switch>
                    <div style="font-style: italic">
                      No data will be proceed if this option is disabled and
                      there is one or more invalid data.
                    </div>
                  </div>
                </v-card>
              </v-stepper-content>
            </v-stepper-items>
            <div style="text-align: center; margin-bottom: 10px">
              <v-btn
                style="margin-right: 10px"
                color="primary"
                :disabled="importDone || importSaving"
                v-if="importDataStep > 1"
                @click="importDataStep--"
              >
                &larr; Back
              </v-btn>
              <v-btn
                color="primary"
                :disabled="!importFile"
                v-if="importDataStep < 3"
                @click="
                  () => {
                    if (importDataStep == 1) {
                      importReadFile();
                    } else {
                      importPreviewData();
                    }
                  }
                "
              >
                Next &rarr;
              </v-btn>
              <v-btn
                color="primary"
                :disabled="importDone || importSaving"
                :loading="importSaving"
                @click="importSave()"
                v-if="importDataStep == 3"
              >
                Save
              </v-btn>
              <span
                v-if="importSaving"
                style="margin-left: 10px; font-style: italic"
              >
                Uploading, please wait...
              </span>
            </div>
          </v-stepper>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogHistory" persistent>
      <v-card>
        <v-card-title class="grey lighten-2">
          Data History
          <v-spacer></v-spacer>
          <v-btn icon @click="dialogHistory = false">
            <v-icon size="25">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-progress-linear
          v-if="loadingHistory"
          color="primary"
          indeterminate
        ></v-progress-linear>
        <v-card-text v-modal-content>
          <arch-data-table
            ref="historyTable"
            :disable-filter="true"
            :enable-history="true"
            :headers="headerHistory"
            :items="historyItems"
            itemid="history_id"
            no-data-text="No data changes available yet"
            v-bind:class="{ history: highlightChanges }"
            v-on:onHighlightChanges="onHighlightChangesReceiver"
            v-on:onHistorySummary="onHistorySummary"
          >
            <template
              v-for="(header, i) in headerHistory"
              v-slot:[`item.${header.value}`]="{ item }"
            >
              <div
                :class="{
                  'changed-cell': isHighlightChanges(item, header.value),
                }"
                :key="`header-${i}`"
              >
                {{ item[header.value] }}
              </div>
            </template>
            <template
              v-for="(index, name) in $scopedSlots"
              v-slot:[name]="data"
            >
              <div
                :class="{
                  'changed-cell': isHighlightChanges(
                    data.item,
                    name.split('.')[1]
                  ),
                }"
                :key="`header-${name}`"
              >
                <slot v-bind="data" :name="name"></slot>
              </div>
            </template>
            <template v-slot:[`item.user_name`]="{ item }">
              <div style="padding: 2px">
                <div style="font-size: 11px; font-weight: bold; color: black">
                  {{ item.timestamp | formatDate }}
                  <v-icon
                    size="18"
                    style="float: right"
                    @click="HistorySummary($event, item)"
                    >mdi-message-text-outline</v-icon
                  >
                </div>
                <div style="font-size: 10px; color: grey; font-style: italic">
                  by {{ item.user_name }}
                </div>
              </div>
            </template>
          </arch-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
    <div
      v-if="showHistorySummary"
      :style="{ left: bubble.left + 'px', top: bubble.top + 'px' }"
      class="bubble"
      style="padding: 10px"
    >
      <div :style="bubbleParam" class="caret"></div>
      <div style="text-align: right">
        <v-icon
          size="28"
          style="
            border-radius: 50%;
            top: -11px;
            right: -11px;
            position: absolute;
            background: white;
            z-index: 99;
          "
          @click="showHistorySummary = false"
          >mdi-close-circle-outline</v-icon
        >
      </div>
      <div class="summary-wrapper">
        <table v-if="summaryItems.length > 0" class="summarry-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Old Value</th>
              <th>New Value</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in summaryItems" :key="`row-${i}`">
              <td>{{ item.field }}</td>
              <td>{{ item.from }}</td>
              <td>{{ item.to }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else style="text-align: center; margin-top: 10px">
          <span
            style="
              background: #d6d6d6;
              color: green;
              font-weight: bold;
              padding: 5px;
              border-radius: 5px;
            "
            >Data Created</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { VDatePicker, VSwitch, VTextField } from "vuetify/lib";
import ArchDatePicker from "@/components/common/ArchDatePickerV2.vue";
import ArchTimePicker from "@/components/common/ArchTimePicker.vue";
import dayjs from "dayjs";
import { FilterOperator } from "@/models/FilterOperator";
import storage from "@/storage/storage";
import downloadjs from "downloadjs";
import Papa from "papaparse";
import { ApiRuntimeSize } from "@/services/Api";

let _serverSide = false;
@Component({
  components: {
    VSwitch,
    VTextField,
    VDatePicker,
    ArchDatePicker,
    ArchTimePicker,
  },
})
export default class ArchDataTable extends Vue {
  bubble: any = {
    top: 400,
    left: 197,
  };
  searchQuery: string = "";
  importUseTransaction: boolean = false;
  importSaving: boolean = false;
  importDone: boolean = false;
  importSourceColumns: string[] = [];
  importTargetColumns: any[] = [];
  importFile: any = null;
  importDataStep: number = 1;
  importItemsTemp: any = [];
  importItems: any = [];
  importItemsHeader: any = [];
  dialogImport: boolean = false;
  showHistorySummary: boolean = false;
  highlightChanges: boolean = false;
  menu: boolean = false;
  filterMenu: boolean = false;
  filterMenuOptions: boolean = false;
  columnFilter: string = "";
  filters: any[] = [];
  firstItem: any = {};
  public theItems: any[] = [];
  theHeaders: any[] = [];
  headerHistory: any[] = [];
  loadingHistory: boolean = false;
  sortBy: string[] = [];
  sortByDesc: boolean[] = [];
  sortByCustom: string[] = [];
  sortByDescCustom: boolean[] = [];
  page: number = 1;
  pageSize: number = 10;
  total: number = 10;
  historyItems: any[] = [];
  theLoading: boolean = false;
  dialogHistory: boolean = false;
  isMounted: boolean = false;
  summaryHeader: any[] = [
    { text: "Field", value: "field", sortable: false },
    { text: "Old Value", value: "from", sortable: false },
    { text: "New Value", value: "to", sortable: false },
  ];
  itemsSelected: any[] = [];
  searchFilter: string = "";
  @Prop({ required: false })
  loading: boolean;
  @Prop({ type: String, default: "id" })
  itemKey: string;
  @Prop({ required: false })
  items: any[];
  @Prop({ required: false })
  headers: any[];
  @Prop({ default: () => [] })
  prependedFilter: string[];
  @Prop({ default: () => [] })
  prependedFilterOperator: any[];
  @Prop({ default: () => [] })
  prependedFilterValue: any[];
  @Prop({ required: false })
  url: string;
  @Prop({ required: false })
  itemsFiltered: any[];
  @Prop()
  search: string;
  @Prop()
  serverSide: boolean;
  @Prop()
  disableFilter: boolean;
  @Prop()
  multiSort: boolean;
  @Prop()
  showRefresh: boolean;
  @Prop()
  enableHistory: boolean;
  @Prop()
  itemsPerPage: number;
  @Prop()
  fileName: string;
  @Prop()
  hideDownloadCsv: boolean;
  @Prop()
  showUpload: boolean;
  @Prop()
  skipCancellation: boolean;
  @Prop()
  itemClass: string | ((row: any) => string);
  @Prop()
  tableData: any[];
  @Prop()
  value: any[];
  $refs: any;
  $parent: any;
  bubbleParam: any;
  summaryItems: any[] = [];
  colResizerHeader: any;
  colResizerStarted: boolean = false;
  colResizerStartEvent: any;
  colResizerPrevX: any;
  colResizing: boolean = false;
  private get childData() {
    return this.items;
  }
  private set childData(val) {
    this.$emit("update:tableData", val);
  }
  private get inputVal() {
    return this.value;
  }
  private set inputVal(val) {
    this.$emit("input", val);
  }
  getTableClass() {
    let lastHeader = this.headers[this.headers.length - 1];
    let hasActions =
      (lastHeader.text == "" || lastHeader.text == null) &&
      lastHeader.value == "actions";
      return {
        "has-actions": hasActions,
      }
  }
  getTableHeaderClass(header, headers) {
    let theClass = {}
    if(header.class && header.class.length > 0){
      let names = header.class.split(" ");
      for(let name of names){
        theClass[name] = true;
      }
    }
    let temp = {
      ...theClass,
      sortable: header.sortable !== false,
    };
    return temp;
  }
  SortByColumn(header: any) {
    if (header.sortable === false || this.colResizing) {
      return;
    }
    let current = this.headers.filter((i) => i.isSortActive);
    if (current.length > 0) {
      let firstCurrent = current[0];
      if (firstCurrent.value != header.value) {
        firstCurrent.isSortActive = false;
        firstCurrent.sortByDesc = undefined;
      }
    }
    if (header.isSortActive && header.sortByDesc) {
      header.isSortActive = false;
    } else {
      if (header.sortByDesc !== undefined) {
        header.sortByDesc = !header.sortByDesc;
      } else {
        header.sortByDesc = false;
      }
      header.isSortActive = true;
    }
    let temp = this.headers.filter((i) => i.isSortActive);
    this.sortByCustom = temp.map((i) => i.value);
    this.sortByDescCustom = temp.map((i) => i.sortByDesc);
    this.loadData(true);
  }
  OnColResizer(state: string, header: any, event: any) {
    if (state == "down") {
      this.colResizing = true;
      this.colResizerStarted = true;
      this.colResizerStartEvent = event;
      this.colResizerHeader = header;
      this.colResizerPrevX = event.screenX;
      let cols = document.querySelectorAll(".arch-col-header");
      cols.forEach((col) => {
        let header = this.headers.find(
          (i) => i.text == col.getAttribute("title")
        );
        if (header && !header.width) {
          this.$set(header, "width", col.clientWidth + "px");
        }
      });
    } else if (state == "up") {
      this.colResizerStarted = false;
      setTimeout(() => {
        this.colResizing = false;
      }, 100);
    } else if (state == "move" && this.colResizerStarted) {
      let td = this.colResizerStartEvent.target.parentNode.parentNode;
      let theHeader = this.colResizerHeader;
      if (!theHeader.widthOriginal) {
        if (theHeader.width) {
          theHeader.widthOriginal = theHeader.width;
        } else {
          theHeader.widthOriginal = td.clientWidth + "px";
        }
      }
      let delta = event.screenX - this.colResizerPrevX;
      let width = td.clientWidth;
      let newWidth = Number(width) + delta;
      this.colResizerPrevX += delta;
      this.$set(theHeader, "width", newWidth + "px");
    }
  }

  onHighlightChangesReceiver(val) {
    this.highlightChanges = val;
  }

  @Watch("url")
  onUrlChanged() {
    this.loadData(false);
  }

  @Watch("highlightChanges")
  onHighlightChanges(newValue) {
    this.$emit("onHighlightChanges", newValue);
    //this.$parent.$refs.historyTable.highlightChanges=newValue
  }

  getIndex(items: any[], item: any) {
    for (let i = 0; i < (items || []).length; i++) {
      if (items[i] == item) {
        return i;
      }
    }
    return -1;
  }

  isHighlightChanges(item, headerValue) {
    return this.getIndex(item.changed_fields, headerValue) != -1;
  }

  created() {
    this.theHeaders = this.headers;
    _serverSide = this.serverSide;
  }

  mounted() {
    this.isMounted = true;
    this.setupColumnChoices();
    this.theItems = this.items;
    this.pageSize = this.itemsPerPage;
    if (this.serverSide) {
      this.loadData(false);
    }
  }

  customPropsBind() {
    let attrs = this.$attrs;
    if (!this.serverSide) {
      return attrs;
    }
    let theProp = {
      ...attrs,
      serverItemsLength: this.total,
    };
    return theProp;
  }

  geSelectedHeaders() {
    let temp = this.theHeaders || [];
    let selected = temp.filter((i) => i.show);
    return selected;
  }

  getItemsFiltered() {
    return this.tableData || this.theItems;
  }

  @Watch("items")
  onItemsChanges(newValue) {
    this.theItems = newValue;
  }

  @Watch("theItems")
  onTheItemsChanges(newValue) {
    this.$emit("loaded-items", newValue);
  }

  @Watch("loading")
  onLoadingChanges(newValue) {
    this.theLoading = newValue;
  }

  getHeaders() {
    let keyword = this.columnFilter.toLowerCase();
    let temp = this.theHeaders || [];
    return temp.filter(
      (i) => i.text && i.text.toLowerCase().indexOf(keyword) != -1
    );
  }

  resetColumnsToDefault() {
    this.theHeaders.forEach((header) => {
      this.$set(header, "show", !header.hide);
    });
  }

  resetFilter() {
    this.$confirm("Are you sure?", "Reset Filters", "info", () => {
      this.filters = [];
    });
  }

  onFilterPicked(header) {
    if (header.dataType == "date") {
      header.filter_value = null;
    }
    this.filters.push({ ...header });
    this.filterMenuOptions = false;
  }

  removeFilter(filter) {
    let temp: any[] = [];
    this.filters.forEach((f) => {
      if (f != filter) {
        temp.push(f);
      }
    });

    this.filters = temp;
  }

  getAvailableFilters() {
    let keyword = (this.searchFilter || "").toLowerCase();
    let temp: any[] = [];
    let temp2 = this.theHeaders || [];
    temp2.forEach((h) => {
      if (h.text != "") {
        if (h.text.toLowerCase().indexOf(keyword) != -1) {
          temp.push(h);
        }
      }
    });

    return temp;
  }

  getFilterComponent(filter) {
    let temp: any = null;
    if (this.items && this.items.length > 0) {
      this.firstItem = this.items[0];
    }
    let dataType = filter.dataType || typeof this.firstItem[filter.value];
    if (dataType == "string" || !dataType) {
      if (filter.text.toLowerCase().indexOf("date") != -1) {
        dataType = "date";
      }
    }
    switch (dataType) {
      case "bool":
      case "boolean":
        temp = VSwitch;
        break;
      case "date":
        temp = ArchDatePicker;
        break;
      case "time":
        temp = ArchTimePicker;
        break;
      default:
        temp = VTextField;
        break;
    }
    filter.dataType = dataType;
    return temp;
  }

  applyFilters() {
    let temp: any[] = [];
    if (!this.serverSide) {
      let theItems = this.items || [];
      theItems.forEach((item) => {
        let match = true;
        for (let i = 0; i < this.filters.length && match; i++) {
          let filter = this.filters[i];
          match = match && this.isMatch(filter, "", item);
        }
        if (match) {
          temp.push(item);
        }
        this.theItems = temp;
      });
    }
  }

  @Watch("loading")
  onLoading(newValue) {
    this.theLoading = newValue;
  }

  @Watch("filters", { deep: !_serverSide })
  onFiltersChanges() {
    this.applyFilters();
  }

  customFilter(value, search, item) {
    let match = true;
    if (!this.serverSide) {
      for (let i = 0; i < this.filters.length && match; i++) {
        let filter = this.filters[i];
        match = match && this.isMatch(filter, search, item);
      }
    }
    return match;
  }

  isMatch(filter, search, item) {
    let match = true;
    let stringValue = "";
    let filterValueString = "";
    switch (filter.dataType) {
      case "number":
      case "string":
        stringValue = (item[filter.value] || "").toString().toLowerCase();
        filterValueString = (filter.filter_value || "")
          .toString()
          .toLowerCase();
        if (filterValueString.length > 0) {
          match = stringValue.indexOf(filterValueString) != -1;
        } else {
          match = true;
        }
        break;
      case "boolean":
        match = item[filter.value] == filter.filter_value;
        break;
      case "date":
        stringValue = item[filter.value].toString().toLowerCase();
        filterValueString = (filter.filter_value || "")
          .toString()
          .toLowerCase();
        if (filterValueString.length > 0) {
          match = dayjs(stringValue).isSame(filterValueString, "day");
        } else {
          match = true;
        }

        break;
    }
    return match;
  }

  setupHeaders(item) {
    let temp: any[] = [];
    let keys = Object.keys(item);
    keys.forEach((i) => {
      let text = i.replaceAll("_", " ").toUpperCase();
      temp.push({
        text,
        value: i,
      });
    });
    this.theHeaders = temp;
    this.setupColumnChoices();
  }

  async loadData(isApplyFilter, format = null) {
    if (!this.isMounted) {
      return;
    }
    this.theLoading = true;
    let self = this;
    let filterCacheKey = `filters-${this.url}`;
    if (!isApplyFilter) {
      this.filters = (await storage.getItem(filterCacheKey)) || [];
    } else {
      await storage.setItem(filterCacheKey, this.filters);
    }
    let allCols = "";
    this.headers.forEach((h) => {
      if (h.text && h.text.length > 0 && h.value && h.value.length > 0) {
        allCols += h.value + ",";
      }
    });

    this.filters.forEach((f) => {
      if (f.dataType == "boolean") {
        if (f.filter_value === undefined) {
          f.filter_value = false;
        }
      }
    });
    const param = {
      q: this.searchQuery,
      all_cols: allCols.substring(0, allCols.length - 1),
      page_size: this.pageSize || 10,
      page: this.page || 1,
      sort_by: this.sortBy.concat(this.sortByCustom),
      sort_by_desc: this.sortByDesc.concat(this.sortByDescCustom),
      filter_by: this.filters.map((i) => i.value).concat(this.prependedFilter),
      filter_by_value: this.filters
        .map((i) => i.filter_value)
        .concat(this.prependedFilterValue),
      filter_by_operator: this.filters
        .map((i) => i.filter_operator || 0)
        .concat(this.prependedFilterOperator),
    };

    this.$http
      .get(this.url, param,null, ApiRuntimeSize.Small, this.skipCancellation)
      .then((res) => {
        let data = res.data;
        let items = data.Data || [];
        if (
          items.length > 0 &&
          (self.theHeaders == null || self.theHeaders.length == 0)
        ) {
          let item = items[0];
          self.firstItem = item;
          self.setupHeaders(item);
        }
        self.theItems = items;
        this.childData = items;
        self.total = data.Total;
      })
      .finally(() => {
        self.theLoading = false;
      });
  }
  onUpdateOptions(opts) {
    this.sortBy = opts.sortBy;
    this.sortByDesc = opts.sortDesc;
    this.pageSize = opts.itemsPerPage;
    this.page = opts.page;
    if (this.serverSide) {
      this.loadData(false);
    }
  }

  refresh() {
    if (this.serverSide) {
      this.loadData(false);
    }
  }
  showHistory(item) {
    this.historyItems = [];
    this.dialogHistory = true;
    if (this.headerHistory.length == 0) {
      this.headerHistory.push({
        text: "",
        value: "user_name",
        width: "180px",
        hide: false,
        sortable: false,
      });
      this.headers.forEach((h) => {
        if (h.text != "") {
          let header = {
            ...h,
          };
          header.sortable = false;
          this.headerHistory.push(header);
        }
      });
    }
    this.loadingHistory = true;
    let self = this;
    this.$http.get(this.url, { id: item.id, history: true }).then((res) => {
      let diffs = res.data.History;
      let latest = {
        ...item,
        id: 0,
        timestamp: item.created,
        user_name: item.last_modified_by_name,
      };
      let i = 1;
      let lastDiff: any = {};
      let prevFrom: any = {};
      if (diffs != null && diffs.length > 0) {
        diffs.forEach((d) => {
          let diff = JSON.parse(d.diff);
          lastDiff = diff;
          latest = {
            ...latest,
            ...diff.to,
            id: i,
            timestamp: d.timestamp,
            user_name: d.user_name,
            changed_fields: Object.keys(diff.to),
            ...prevFrom,
            __from: diff.from,
            __to: diff.to,
          };
          self.historyItems.push(latest);
          prevFrom = {
            ...diff.from,
          };
          i++;
        });
      }

      if (self.historyItems.length > 0) {
        latest = {
          ...latest,
          ...lastDiff.from,
          id: i + 1,
          changed_fields: Object.keys(item),
          user_name: item.created_by_name,
          timestamp: item.created,
          __from: null,
        };
        self.historyItems.push(latest);
      }
      self.loadingHistory = false;
    });
  }

  onHistorySummary(event, item) {
    this.summaryItems = [];
    let { innerHeight } = window;
    this.bubble.left = event.x + 32;
    let top = event.y;
    if (top + 400 > innerHeight) {
      top = top - (400 - 38);

      this.$set(this.bubble, "caret_top", 345);
    } else {
      top -= 38;
      this.$set(this.bubble, "caret_top", 26);
    }
    this.bubble.top = top;
    this.showHistorySummary = true;
    this.bubbleParam = {
      "--top": this.bubble.caret_top + "px",
    };
    let keys = Object.keys(item.__from || {});

    for (let i = 0; i < keys.length; i++) {
      let field = keys[i];
      let temp = this.headers.filter((j) => j.value == field);
      if (temp.length > 0) {
        this.summaryItems.push({
          field: temp[0].text,
          from: item.__from[field],
          to: item.__to[field],
        });
      }
    }
  }

  HistorySummary(event, item) {
    this.$refs.historyTable.onHistorySummary(event, item);
  }

  getFilterOperators(filter) {
    let dataType = filter.dataType || typeof filter.value;
    let temp: any[] = [];
    if (dataType == "string") {
      temp.push({ text: "Contains", value: FilterOperator.Contains });
    }
    switch (dataType) {
      case "number":
      case "date":
      case "time":
        temp.push({ text: "Equal", value: FilterOperator.Equal });
        temp.push({ text: "Not Equal", value: FilterOperator.NotEqual });
        temp.push({ text: "Less than", value: FilterOperator.LessThan });
        temp.push({
          text: "Less than or equal",
          value: FilterOperator.LessThanOrEqual,
        });
        temp.push({ text: "Greater than", value: FilterOperator.GreaterThan });
        temp.push({
          text: "Greater than or equal",
          value: FilterOperator.GreaterThanOrEqual,
        });
        break;
    }
    if (temp.length > 0 && filter.filter_operator == null) {
      filter.filter_operator = temp[0].value;
    }
    return temp;
  }

  onKeyDown(ev: KeyboardEvent) {
    let isUp = ev.code == "ArrowUp";
    let isDown = ev.code == "ArrowDown";
    let table = this.$refs.itemsTable;
    if (table.singleSelect && (isDown || isUp)) {
      let nextIndex = isDown ? 0 : table.items.length - 1;
      let length = table.items.length;
      if (this.itemsSelected.length > 0) {
        let length = table.items.length;
        let item = this.itemsSelected[0];
        let found = false;
        if (isDown) {
          for (let i = 0; i < length && !found; i++) {
            if (item == table.items[i]) {
              found = true;
              nextIndex = i + 1;
            }
          }
        } else {
          for (let i = length - 1; i >= 0 && !found; i--) {
            if (item == table.items[i]) {
              found = true;
              nextIndex = i - 1;
            }
          }
        }
      }
      if (nextIndex >= length) {
        if (length >= table.itemsPerPage) {
          table.page++;
        }
      }
      if (nextIndex == -1) {
        if (table.page > 0) {
          table.page--;
        }
      } else {
        table.select(table.items[nextIndex]);
      }
    }
  }

  onItemSelected({ item }) {
    if (this.$refs.itemsTable.singleSelect) {
      this.itemsSelected = [];
    }
    this.itemsSelected.push(item);
  }

  beforeDestroy() {
    storage.setItem(`filters-${this.url}`, this.filters);
  }

  Download(format) {
    switch (format) {
      case "csv":
        this.DownloadCsv();
        break;
    }
  }

  DownloadCsv() {
    let csv: any[] = [];
    let rows = this.$refs.itemsTable.$el.querySelectorAll("table tr");
    for (let i = 0; i < rows.length; i++) {
      let row: any[] = [];
      let rowElement = rows[i];
      let columnSelector = i == 0 ? "th" : "td";
      let columns = rowElement.querySelectorAll(columnSelector);
      columns.forEach((c) => {
        let value = `"${c.innerText}"`;
        row.push(value);
      });
      csv.push(row.join(","));
    }
    let csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
    let fileName = document.title;
    if (this.fileName && this.fileName.length > 0) {
      fileName = this.fileName;
    }
    fileName += "-" + dayjs(Date.now()).format("YYYY-MM-DD-HHmmss") + ".csv";
    downloadjs(csvFile, fileName, "text/csv");
  }

  private setupColumnChoices() {
    let temp = this.theHeaders || [];
    temp.forEach((header) => {
      this.$set(header, "show", !header.hide);
    });
  }
  importReadFile() {
    let self = this;
    Papa.parse(this.importFile, {
      complete(results: any, file?: File) {
        self.importItemsTemp = results.data;
        self.importSourceColumns = results.data[0];
        self.importTargetColumns = [];
        self.importSourceColumns.forEach((i) => {
          let target = { text: "-- Ignore --", value: null };
          let temp = self.headers.filter(
            (h) => h.text && h.text.length > 0 && h.text == i
          );
          if (temp.length > 0) {
            target = temp[0];
          }
          self.importTargetColumns.push(target);
        });
        self.importDataStep++;
      },
    });
  }
  importPreviewData() {
    let self = this;
    this.importItemsHeader = this.importTargetColumns.filter((i) => i.value);
    this.importItems = [];
    let totalItems = this.importItemsTemp.length;
    let targetLength = this.importTargetColumns.length;
    for (let i = 1; i < totalItems; i++) {
      let temp = this.importItemsTemp[i];
      let item = {};
      let valid = false;
      for (let j = 0; j < targetLength; j++) {
        let target = this.importTargetColumns[j];
        if (target && target.value) {
          let tempValue = temp[j];
          item[target.value] = tempValue;
          valid = valid || (tempValue && tempValue.toString().length > 0);
        }
      }
      if (valid) {
        this.importItems.push(item);
      }
    }
    self.importDataStep++;
  }
  importSave() {
    let self = this;
    this.$confirm(
      "Are you sure want to save data?",
      "Save Data",
      "info",
      () => {
        this.importSaving = true;
        let url = this.url;
        let temp = url.split("/arch/");
        let importUrl = temp[0];
        temp = temp[1].split("/");
        importUrl +=
          "/arch/" +
          temp[0] +
          "/import/v1?use-transaction=" +
          (this.importUseTransaction ? 1 : 0);
        let data = self.importItems;
        this.$http.post(importUrl, data).then((res) => {
          self.importSaving = false;
          self.importDone = true;
          self.dialogImport=false
          self.refresh()
        });
      }
    );
  }
  get importHeaders() {
    let temp = [{ text: "-- Ignore --", value: null }];

    this.headers.forEach((h) => {
      if (
        h.text &&
        h.text.length > 0 &&
        this.importTargetColumns.filter((i) => i && i.value == h.value)
          .length == 0
      ) {
        temp.push(h);
      }
    });

    return temp;
  }
  DoSearch(e) {
    if (e.keyCode == 13) {
      this.loadData(false);
    }
  }
}
</script>
<style scoped>
.sortable {
  cursor: pointer;
}
.arch-col-header {
  padding: 8px 16px;
  font-size: small;
  border-bottom: 1px solid #d7d5d5;
}
.arch-col-text {
  flex-grow: 1;
  display: flex;
}
.arch-col-resizer {
  height: 13px;
  cursor: col-resize;
  background: white;
  display: flex;
  border-right: 2px dotted #ccc;
  margin-top: 3px;
}
.summarry-table {
  width: 100%;
  border-collapse: collapse;
}

.summarry-table th,
.summarry-table td {
  padding: 8px;
  color: black;
}

.summarry-table th {
  text-align: left;
  background: #eee;
  position: sticky;
  top: 0px;
}

.summary-wrapper {
  border: 1px solid #ddd;
  width: 100%;
  height: 380px;
  overflow-y: auto;
}
.bubble {
  position: fixed;
  width: 500px;
  min-height: 400px;
  padding: 0px;
  top: 0;
  left: 0;
  background: #fff;
  -webkit-border-radius: 6px;
  -moz-border-radius: 6px;
  border-radius: 6px;
  border: #d6d2d2 solid 1px;
  box-shadow: rgba(255, 255, 255, 0.1) 0px 1px 1px 0px inset,
    rgba(50, 50, 93, 0.25) 0px 50px 100px -20px,
    rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;
}

.bubble .caret:after {
  content: "";
  position: absolute;
  border-style: solid;
  border-width: 13px 17px 13px 0;
  border-color: transparent #fff;
  display: block;
  width: 0;
  z-index: 1;
  top: var(--top);
  left: -17px;
}

.bubble .caret:before {
  content: "";
  position: absolute;
  border-style: solid;
  border-width: 13px 17px 13px 0;
  border-color: transparent #d6d2d2;
  display: block;
  width: 0;
  z-index: 0;
  top: var(--top);
  left: -18px;
}
.custom-component .operator {
  max-width: 135px;
  font-size: 11px;
  margin-right: 10px;
}
.custom-component {
  display: flex;
}
.custom-component div {
  margin-top: 0 !important;
  padding-top: 0 !important;
}
.filter-badge {
  padding: 7px;
  border-radius: 50%;
  background: #0096c7;
  position: absolute;
  top: -10px;
  left: 18px;
  color: white;
  font-size: 10px;
  border: solid 1px white;
  line-height: 3px;
}
.column {
  padding: 0 10px 0 10px;
}
.column .v-input--selection-controls {
  padding: 0 !important;
  margin-top: 10px !important;
}
.autocomplete-headers * {
  font-size: 9px !important;
}
.history .changed-cell {
  background: yellow;
  display: inline-block;
}
.v-data-table >>> td.sticky,
.v-data-table >>> th.sticky {
  position: sticky !important;
  right: 0;
  background: #fff !important;
}
</style>
