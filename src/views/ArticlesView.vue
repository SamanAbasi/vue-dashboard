<template>
  <div>
    <h1 class="text-left mb-4">
      All Posts
    </h1>
    <BaseTable
      :loading="loading"
      :articles="articles"
      :fields="fields"
      :total-rows="totalRows"
      @fetch-articles="fetchArticles"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseTable from "@/components/AppTable.vue";
import { fields } from "@/constants/articles";
import { getAllArticles } from "@/api/articles";
import type { ArticlesData } from "@/types/articles";
import useAPI from "@/hooks/useApi";
export default defineComponent({
  name: "ArticlesView",
  components: {
    BaseTable,
  },
  data(): ArticlesData {
    return {
      articles: [],
      loading: true,
      fields: fields,
      totalRows: 0,
    };
  },
  created() {
    this.fetchArticles();
  },
  methods: {
    async fetchArticles() {
      this.loading = true;
      const { request } = useAPI({
        apiMethod: () => getAllArticles(),
        successCallback: (data) => {
          this.articles = data.articles;
          this.totalRows = data.articles.length;
        },
      });
      await request();
      this.loading = false;
    },
  },
});
</script>
