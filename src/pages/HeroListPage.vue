<template>
  <q-page class="row items-center justify-evenly">
    <q-table title="Treats" :rows="heroes" :columns="columns" row-key="name">
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
            @click="onRemoveHeroClick(props.row)"
          ></q-btn>
        </q-td>
      </template>
    </q-table>
    <suspense-router-view />
  </q-page>
</template>

<script setup lang="ts">
import { useDatabase } from 'src/boot/database';
import { RxHeroDocument } from 'src/types/hero';
import { computed, ref } from 'vue';
import { tap } from 'rxjs/operators';
import { QTableColumn } from 'quasar';
import { useObservable, useSubscription } from '@vueuse/rxjs';
import SuspenseRouterView from 'src/components/SuspenseRouterView';

const database = useDatabase();
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
      { name: 'hp', field: 'hp', label: 'HP', align: 'right', sortable: true },
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

const query = database.heroes.find({
  selector: {},
  sort: [{ name: 'asc' }],
});

const observable = query.$.pipe(
  tap(() => {
    setTimeout(() => (loading.value = false), 1000);
  })
);

const subscription = observable.subscribe((result: RxHeroDocument[]) => {
  heroes.value = result;
});

// useObservable(observable);
// useSubscription(subscription);

const onRemoveHeroClick = (hero: RxHeroDocument) => {
  hero.remove();
};
</script>
