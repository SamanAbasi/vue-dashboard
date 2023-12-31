<template>
  <b-container
    fluid
    class="px-0"
  >
    <!-- Skeleton loading state -->
    <b-skeleton-table
      v-if="loading"
      :rows="5"
      :columns="5"
    />
    <!-- Main table element -->
    <template v-else-if="articles && articles.length > 0">
      <b-table
        :items="articles"
        :fields="fields"
        :current-page="currentPage"
        :per-page="perPage"
        stacked="md"
        tbody-tr-class="tr-classes"
        small
        head-variant="light"
      >
        <template #cell(#)="data">
          {{ data.index + 1 }}
        </template>
        <template #cell(actions)="row">
          <b-dropdown
            class="mx-1 my-0 p-0"
            variant="info"
            right
            text="..."
          >
            <b-dropdown-item>
              <router-link
                class="edit-btn text-dark"
                :to="`/articles/${row.item.slug}`"
              >
                Edit
              </router-link>
            </b-dropdown-item>
            <b-dropdown-divider />
            <b-dropdown-item @click="info(row.item, $event.target)">
              Delete
            </b-dropdown-item>
          </b-dropdown>
        </template>
      </b-table>
    </template>
    <!-- Empty state -->
    <template v-else>
      <div class="text-center my-2">
        <p>No articles found.</p>
      </div>
    </template>
    <!-- User Interface controls -->
    <b-row align-h="center">
      <b-col
        sm="6"
        md="6"
        class="my-1"
      >
        <template v-if="!loading && articles && articles.length > 0">
          <b-pagination
            v-model="currentPage"
            :total-rows="totalRows"
            :per-page="perPage"
            align="fill"
            size="sm"
            class=""
            first-number
            last-number
          />
        </template>
        <template v-else-if="loading">
          <div class="d-flex flex-row">
            <b-skeleton type="button" />
            <b-skeleton type="button" />
            <b-skeleton type="button" />
            <b-skeleton type="button" />
          </div>
        </template>
      </b-col>
    </b-row>
    <!-- Info modal -->
    <AppTableInfoModal
      :info-modal="infoModal"
      :loading="loading"
      :loading-delete="loadingDelete"
      @delete-article-action="deleteArticleAction"
      @reset-info-modal="resetInfoModal"
    />
  </b-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";
import { deleteArticle } from "@/api/articles";
import useAPI from "@/hooks/useApi";
import type { ArticleType } from "@/types/article";
import store from "@/store";
import AppTableInfoModal from "@/components/AppTableInfoModal.vue"
import type { FieldType } from "@/types/articles";
type DataShape = {
  infoModal: {
    id: string;
    slug: string;
  };
  loadingDelete: boolean,
  showToast: boolean,
  toastVariant: string,
  currentPage: number,
  perPage: number,
}
export default defineComponent({
  name: 'AppTable',
  components: {
    AppTableInfoModal,
  },
  props: {
    articles: {
      type: Array as PropType<ArticleType[]>,
      default: () => [],
    },
    fields: {
      type: Array as PropType<FieldType[]>,
      default: () => [],
    },
    totalRows: {
      type: Number,
      default: 0,
    },
    loading: {
      type: Boolean,
      required: true,
    },
  },
  data(): DataShape {
    return {
      infoModal: {
        id: "delete-modal",
        slug: "",
      },
      loadingDelete: false,
      showToast: false,
      toastVariant: "default",
      currentPage: 1,
      perPage: 5,
    };
  },
  methods: {
    async deleteArticleAction(slug: string) {
      this.loadingDelete = true;
      const { request } = useAPI({
        apiMethod: () => deleteArticle(slug),
        successCallback: () => {
          this.hideModal();
          this.$emit("fetch-articles");
        },
        failedCallback: (error) => {
          this.loadingDelete = false;
          this.hideModal();
          store.dispatch("addToast", {
            message: error,
            variant: "danger",
          });
        },
      });
      await request();
      this.loadingDelete = false;
    },
    info(item: ArticleType, button: Event) {
      this.infoModal.slug = item.slug || "";
      this.$root.$emit("bv::show::modal", this.infoModal.id, button);
    },
    resetInfoModal() {
      this.infoModal.slug = "";
    },
    hideModal() {
      this.resetInfoModal();
      this.$root.$emit("bv::hide::modal", this.infoModal.id);
    },
  },
});
</script>
<style lang="scss" scoped>
.edit-btn:hover {
  text-decoration: none;
  color: #000;
}
</style>
