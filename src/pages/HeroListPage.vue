<template>
  <q-page class="row items-center justify-evenly">
    <q-table
      title="Treats"
      :rows="heroes"
      :loading="loading"
      :columns="columns"
      row-key="name"
    >
      <template v-slot:top>
        <q-btn
          :to="{ name: 'hero-create' }"
          label="Create"
          icon="add"
          color="primary"
        ></q-btn>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="q-gutter-x-sm">
          <q-btn
            :to="{ name: 'hero-edit', params: { slug: props.value } }"
            round
            icon="edit"
            color="primary"
          ></q-btn>
          <q-btn
            round
            icon="delete"
            color="negative"
            @click="remove(props.row)"
          ></q-btn>
        </q-td>
      </template>
    </q-table>
    <router-view />
  </q-page>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { preFetch } from 'quasar/wrappers';
import { RxHeroDocument } from 'src/types/hero';
import { tap } from 'rxjs/operators';
import { QTableColumn } from 'quasar';
import { defineStore } from 'pinia';
import { Subscription } from 'rxjs';

var useHeroStore = defineStore('hero-list', () => {
  const loading = ref(false);
  const heroes = ref<RxHeroDocument[]>();

  const columns = computed(
    () =>
      [
        {
          name: 'name',
          field: 'name',
          label: 'Name',
          align: 'left',
          sortable: true,
        },
        {
          name: 'color',
          field: 'color',
          label: 'Color',
          align: 'center',
          sortable: true,
        },
        {
          name: 'hp',
          field: 'hp',
          label: 'HP',
          align: 'right',
          sortable: true,
        },
        {
          name: 'maxHP',
          field: 'maxHP',
          label: 'Max HP',
          align: 'right',
          sortable: true,
        },
        { name: 'actions', field: 'slug', align: 'center' },
      ] as QTableColumn[]
  );

  let subscription: Subscription;
  function fetch(this: HeroStore) {
    const query = this.database.heroes.find({
      selector: {},
      sort: [{ name: 'asc' }],
    });

    subscription = query.$.pipe(
      tap(() => {
        setTimeout(() => (loading.value = false), 1000);
      })
    ).subscribe((result: RxHeroDocument[]) => {
      heroes.value = result;
    });
  }

  function remove(hero: RxHeroDocument) {
    hero.remove();
  }

  function dispose(this: HeroStore) {
    if (subscription) {
      subscription.unsubscribe();
    }
    this.$dispose;
  }

  return {
    loading,
    columns,
    heroes,
    fetch,
    dispose,
    remove,
  };
});
type HeroStore = ReturnType<typeof useHeroStore>;

export default defineComponent({
  preFetch: preFetch(({ store }) => {
    const heroStore = useHeroStore(store);
    return heroStore.fetch();
  }),
});
</script>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onScopeDispose } from 'vue';

const heroStore = useHeroStore();
const { loading, heroes } = storeToRefs(heroStore);
const { remove } = heroStore;
const columns = computed(() => heroStore.columns);

onScopeDispose(async () => {
  heroStore.dispose();
});
</script>
