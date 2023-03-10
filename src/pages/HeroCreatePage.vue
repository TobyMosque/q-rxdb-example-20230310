<template>
  <q-dialog @hide="onHide" persistent :model-value="true">
    <q-card class="my-card" style="min-width: 360px">
      <q-card-section v-if="hero">
        <q-form ref="form" class="row q-col-gutter-sm" @submit="onFormSubmit">
          <div class="col col-12">
            <rx-input
              v-model="hero.name"
              label="Name"
              :rules="[(val) => !!val || 'Name is required']"
            />
          </div>
          <div class="col col-12">
            <rx-color-input
              v-model="hero.color"
              label="Color"
              :rules="[(val) => !!val || 'Color is required']"
            />
          </div>
        </q-form>
      </q-card-section>
      <q-separator />

      <q-card-actions align="right">
        <q-btn v-close-popup color="primary" label="Close" icon="close" flat />
        <q-btn
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
import { RxHeroDocumentType } from 'src/types/hero';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import RxInput from 'src/components/RxInput.vue';
import RxColorInput from 'src/components/RxColorInput.vue';
import { faker } from '@faker-js/faker';
import { useDatabase } from 'src/boot/database';
import { QForm, useQuasar } from 'quasar';

const database = useDatabase();
const router = useRouter();
const quasar = useQuasar();

const form = ref<QForm>();
const hero = ref<Partial<RxHeroDocumentType>>({});
function onHide() {
  router.push({ name: 'hero-list' });
}

async function onFormSubmit() {
  const isValid = await form.value?.validate();
  if (!isValid) {
    return quasar.notify({
      message: 'Verify all the fields',
      color: 'warning',
    });
  }
  const name = hero.value.name || '';
  const slug = faker.helpers.slugify(name).toLocaleLowerCase();
  const obj: RxHeroDocumentType = {
    name: name,
    slug: slug,
    color: hero.value.color || '',
    hp: 100,
    maxHP: faker.datatype.number({ min: 100, max: 1000 }),
    skills: [],
  };
  try {
    await database.heroes.insert(obj);
    quasar.notify({ message: 'Hero Created', color: 'positive' });
    onHide();
  } catch {
    quasar.notify({ message: 'Something is wrong', color: 'negative' });
  }
}
</script>
