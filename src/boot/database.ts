import { boot } from 'quasar/wrappers';
import { createDatabase, Database } from 'src/database';
import { inject, InjectionKey } from 'vue';

const databaseKey: InjectionKey<Database> = Symbol('database-key');
export function useDatabase() {
  const database = inject(databaseKey);
  if (!database) {
    throw 'database not injected';
  }
  return database;
}
export default boot(async ({ app }) => {
  const database = await createDatabase();
  app.provide(databaseKey, database);
});
