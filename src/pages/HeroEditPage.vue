<template>
  <q-dialog @hide="onHide" persistent :model-value="true">
    <q-card class="my-card" style="min-width: 360px">
      <q-banner v-if="!synced" class="bg-warning">
        <span class="text-h5 text-uppercase">Warning:</span>
        <p>
          Someone else has
          <span class="text-bold">changed</span> this document. If you click
          save, you will overwrite the changes.
        </p>
        <template v-slot:action>
          <q-btn flat label="resync" @click="onResyncClick" />
        </template>
      </q-banner>
      <q-banner v-if="deleted" class="bg-negative">
        <span class="text-h5 text-uppercase">Error:</span>
        <p>
          Someone else has
          <span class="text-bold">deleted</span> this document. You can not save
          anymore.
        </p>
      </q-banner>

      <q-card-section v-if="hero">
        <q-form ref="form" class="row q-col-gutter-sm" @submit="onFormSubmit">
          <div class="col col-12">
            <rx-input v-model="hero.name" label="Name" readonly />
          </div>
          <div class="col col-12">
            <rx-color-input v-model="hero.color" label="Color" readonly />
          </div>
          <div class="col col-12">
            <rx-input
              type="number"
              v-model="hp"
              label="Current HP"
              :rules="[(val: number) => val >= 0 || 'HP would be equal or greater than zero']"
            />
          </div>
        </q-form>
      </q-card-section>
      <q-separator />

      <q-card-actions align="right">
        <q-btn v-close-popup color="primary" label="Close" icon="close" flat />
        <q-btn
          :disable="deleted"
          type="submit"
          color="primary"
          label="Save"
          icon="save"
          @click="onFormSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { RxHeroDocument } from 'src/types/hero';
import { useRouter } from 'vue-router';
import RxInput from 'src/components/RxInput.vue';
import RxColorInput from 'src/components/RxColorInput.vue';
import { useDatabase } from 'src/boot/database';
import { QForm, useQuasar } from 'quasar';
import { useSubscription } from '@vueuse/rxjs';
import { ref } from 'vue';

interface HeroEditPageProps {
  slug: string;
}

const database = useDatabase();
const router = useRouter();
const quasar = useQuasar();
const props = defineProps<HeroEditPageProps>();

const form = ref<QForm>();
const hero = ref<RxHeroDocument>();
const hp = ref(0);
const deleted = ref(false);
const synced = ref(true);

const data = await database.heroes.findOne(props.slug).exec();
hero.value = data as RxHeroDocument;
hp.value = hero.value.hp;

const subscription = hero.value.$.subscribe((_hero) => {
  hero.value = _hero;
  synced.value = _hero.hp === hp.value;
  deleted.value = _hero.deleted;
});

// useSubscription(subscription);

function onHide() {
  router.push({ name: 'hero-list' });
}

function onResyncClick() {
  hp.value = hero.value?.hp || 0;
  synced.value = true;
}

async function onFormSubmit() {
  const isValid = await form.value?.validate();
  if (!isValid) {
    return quasar.notify({
      message: 'Verify all the fields',
      color: 'warning',
    });
  }

  try {
    await hero.value?.incrementalPatch({ hp: parseInt(hp.value + '') });
    onHide();
  } catch (err) {
    quasar.notify({ message: 'Something is wrong', color: 'negative' });
  }
}
</script>